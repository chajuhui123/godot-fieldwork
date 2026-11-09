extends Node

var callback: JavaScriptObject
var bridge: JavaScriptObject
var scene: Node2D
var lesson: String = ""
var elapsed: float = 0.0
var report_elapsed: float = 0.0
var checking: bool = false
var run_id: int = 0
var input_start: Vector2
var config: Dictionary = {}
var mid_state: Dictionary = {}
var task_checker: RefCounted


func send(data: Dictionary) -> void:
	data["run"] = run_id
	if bridge:
		bridge.fieldworkEmit(JSON.stringify(data))

func _ready() -> void:
	if OS.has_feature("web"):
		bridge = JavaScriptBridge.get_interface("window")
		callback = JavaScriptBridge.create_callback(receive)
		bridge.fieldworkRun = callback
		send({"type": "ready"})

func receive(args: Array) -> void:
	var data = JSON.parse_string(str(args[0]))
	if data is Dictionary:
		start(data)

func start(data: Dictionary) -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	get_tree().paused = false
	task_checker = null
	if is_instance_valid(scene):
		scene.free()
	Input.action_release("ui_right")
	Input.action_release("ui_down")
	run_id = int(data.get("run", 0))
	lesson = str(data.get("lesson", "editor"))
	checking = bool(data.get("check", false))
	config = data.get("config", {})
	elapsed = 0.0
	report_elapsed = 0.0
	mid_state = {}
	var script = GDScript.new()
	script.source_code = str(data.get("code", ""))
	var error = script.reload()
	if error != OK:
		checking = false
		send({"type": "compile_error", "message": "GDScript 컴파일 오류 · Console에서 줄 번호를 확인하세요."})
		return
	if not ClassDB.is_parent_class(script.get_instance_base_type(), "Node2D"):
		checking = false
		send({"type": "compile_error", "message": "이 수업의 main.gd는 extends Node2D로 시작해야 합니다."})
		return
	scene = Node2D.new()
	scene.name = "Main"
	scene.process_mode = Node.PROCESS_MODE_PAUSABLE
	var player = Node2D.new()
	player.name = "Player"
	player.position = Vector2(float(config.get("x",120)), float(config.get("y",180)))
	scene.add_child(player)
	var shape = Polygon2D.new()
	shape.name = "Shape"
	shape.polygon = PackedVector2Array([Vector2(-20,-20),Vector2(20,-20),Vector2(20,20),Vector2(-20,20)])
	shape.color = Color("#ade580")
	shape.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	shape.texture = frog_texture()
	shape.uv = PackedVector2Array([Vector2.ZERO, Vector2(16,0), Vector2(16,16), Vector2(0,16)])
	player.add_child(shape)
	if bool(config.get("beacon", false)):
		var beacon = Marker2D.new()
		beacon.name = "Beacon"
		beacon.position = Vector2(float(config.get("beacon_x",80)),0)
		player.add_child(beacon)
	var status = Label.new()
	status.name = "Status"
	status.position = Vector2(24,24)
	status.text = "Godot Fieldwork"
	status.add_theme_font_size_override("font_size",18)
	if ResourceLoader.exists("res://fonts/PretendardVariable.woff2"):
		status.add_theme_font_override("font",load("res://fonts/PretendardVariable.woff2"))
	status.z_index = 20
	scene.add_child(status)
	if str(data.get("stage","2d")) == "3d":
		build_3d(scene)
		player.visible = false
	if not str(data.get("checker", "")).is_empty():
		var check_script = GDScript.new()
		check_script.source_code = str(data.checker)
		if check_script.reload() != OK:
			send({"type":"compile_error","message":"검사 스크립트 로딩 오류"})
			return
		task_checker = check_script.new()
	if lesson == "signals":
		var timer = Timer.new()
		timer.name = "Timer"
		timer.wait_time = clampf(float(config.get("wait",1)),0.1,10.0)
		timer.autostart = bool(config.get("autostart",false))
		scene.add_child(timer)
	if bool(config.get("attached",true)):
		scene.set_script(script)
		if lesson == "exported-properties":
			for property in scene.get_property_list():
				if property.name == "speed" and (property.usage & PROPERTY_USAGE_EDITOR):
					scene.set("speed",float(config.get("speed",90)))
	if lesson == "signals" and bool(config.get("connected",false)):
		if scene.has_method("_on_timer_timeout"):
			scene.get_node("Timer").timeout.connect(scene._on_timer_timeout)
		else:
			send({"type":"log", "message":"연결할 _on_timer_timeout 메서드가 없습니다."})
	add_child(scene)
	input_start = player.position
	if checking and lesson == "input-events":
		Input.action_press("ui_right")
	send({"type":"started"})

func frog_texture() -> ImageTexture:
	var rows = JSON.parse_string(FileAccess.get_file_as_string("res://frog.json"))
	var shades = {".":Color.TRANSPARENT, "#":Color("#263346"), "e":Color.WHITE, "s":Color("#94a5a0"), "b":Color("#e1dfb9")}
	var pixels = Image.create(16,16,false,Image.FORMAT_RGBA8)
	for y in range(16):
		for x in range(16):
			pixels.set_pixel(x,y,shades[rows[y][x]])
	return ImageTexture.create_from_image(pixels)

func snapshot() -> Dictionary:
	if not is_instance_valid(scene):
		return {}
	var tree: Array = []
	collect_tree(scene,"Main",tree)
	var player = scene.get_node_or_null("Player")
	var status = scene.get_node_or_null("Status")
	if not player or not status:
		return {"missing":true,"tree":tree}
	var result = {"x":player.position.x,"y":player.position.y,"text":status.text,"nodes":node_names(scene),"tree":tree}
	var beacon = scene.get_node_or_null("Player/Beacon")
	if beacon:
		result["beacon_global_x"] = beacon.global_position.x
	return result

func _process(delta: float) -> void:
	if not is_instance_valid(scene):
		return
	elapsed += delta
	if mid_state.is_empty() and elapsed >= 0.5:
		mid_state = snapshot()
	report_elapsed += delta
	if report_elapsed >= 0.25:
		report_elapsed = 0.0
		send({"type":"snapshot", "state":snapshot()})
	if checking and elapsed >= 2.2:
		checking = false
		Input.action_release("ui_right")
		check_result()

func observation(label: String, expected: String, actual: Variant, passed: bool, hint: String) -> Dictionary:
	return {"name":label, "pass":passed, "expected":expected, "actual":str(actual), "hint":hint}

func check_result() -> void:
	if task_checker:
		var tests = task_checker.verify(scene)
		send({"type":"result","tests":tests,"state":snapshot()})
		return
	var state = snapshot()
	if state.is_empty() or state.get("missing",false):
		send({"type":"result","tests":[observation("씬 구성", "Player와 Status", node_names(scene) if is_instance_valid(scene) else "씬 없음", false, "기본 노드를 삭제하거나 이름을 바꿨는지 확인하세요.")]})
		return
	var tests: Array = []
	match lesson:
		"editor":
			var initial_x = config.get("x",120)
			tests = [
				observation("Inspector에서 정한 시작 X", "320 px", str(initial_x)+" px", is_equal_approx(float(initial_x),320.0), "Inspector에서 Player의 Position X를 바꾼 뒤 다시 실행하세요."),
				observation("_ready() 실행 후 Player X", "480 px", str(state.x)+" px", is_equal_approx(state.x,480.0), "시작 X가 맞다면 main.gd에서 Player의 position을 어디로 옮기는지 확인하세요."),
				observation("_ready() 실행 후 Player Y", "180 px", str(state.y)+" px", is_equal_approx(state.y,180.0), "Vector2의 두 번째 값은 세로 위치예요.")]
		"nodes":
			var beacon = state.has("beacon_global_x")
			tests = [
				observation("Player의 자식 노드", "Beacon 있음", "Beacon 있음" if beacon else "Beacon 없음", beacon, "Inspector에서 Beacon을 Player 아래에 추가하세요."),
				observation("Beacon의 전역 X", "200 px", str(state.beacon_global_x)+" px" if beacon else "Beacon 없음", beacon and is_equal_approx(state.beacon_global_x,200.0), "부모의 위치에 Beacon의 로컬 위치가 더해져요."),
				observation("Status에 표시한 좌표", "80과 200 모두 포함", state.text, str(state.text).contains("80") and str(state.text).contains("200"), "position과 global_position을 각각 읽어 Status에 표시하세요.")]
		"signals":
			var timer = scene.get_node_or_null("Timer")
			var connected = timer != null and timer.timeout.is_connected(Callable(scene,"_on_timer_timeout"))
			tests = [
				observation("Timer의 timeout 신호", "연결됨", "연결됨" if connected else "연결되지 않음", connected, "Inspector의 신호 연결과 콜백 메서드 이름을 확인하세요."),
				observation("약 2초 뒤 Status", "Score: 2", state.text, str(state.text)=="Score: 2", "Timer가 시작되는지, 신호를 받을 때마다 점수가 1씩 오르는지 확인하세요.")]
		"attach-script":
			var attached = scene.get_script()!=null
			var shape = scene.get_node_or_null("Player/Shape") as Polygon2D
			tests = [
				observation("Main의 스크립트", "연결됨", "연결됨" if attached else "연결되지 않음", attached, "Inspector에서 Main에 스크립트를 연결하세요."),
				observation("Status 문구", "첫 스크립트 실행!", state.text, str(state.text)=="첫 스크립트 실행!", "_ready()에서 Status의 text를 설정하세요."),
				observation("Shape 색상 (RGBA)", "#ff9933ff", "#"+shape.color.to_html() if shape else "Shape 없음", shape != null and shape.color.is_equal_approx(Color(1.0,0.6,0.2)), "Player 아래 Shape의 color를 확인하세요.")]
		"delta-motion":
			tests = [
				observation("약 0.5초 뒤 Player X", "120 px 초과, 350 px 미만", str(mid_state.get("x","측정 안 됨")), mid_state.has("x") and mid_state.x>120.0 and mid_state.x<350.0, "도착 좌표를 한 번에 대입하지 않고 프레임마다 위치를 갱신하세요."),
				observation("이동 후 Player X", "360 px (오차 0.5 px 미만)", str(state.x)+" px", absf(float(state.x)-360.0)<0.5, "초당 속도에 delta를 곱하고 이동 시간을 확인하세요."),
				observation("이동 후 Player Y", "180 px", str(state.y)+" px", is_equal_approx(float(state.y),180.0), "가로로만 움직이도록 X 성분을 바꿔 보세요.")]
		"input-events":
			var dx = float(state.x)-input_start.x
			var dy = float(state.y)-input_start.y
			tests = [
				observation("오른쪽 입력 중 가로 변위", "100 px 초과", str(dx)+" px", dx>100, "ui_right 입력을 받았을 때 X가 증가하는지 확인하세요."),
				observation("같은 입력의 세로 변위", "0 px (오차 0.5 px 미만)", str(dy)+" px", absf(dy)<0.5, "오른쪽 입력이 Y 위치까지 바꾸고 있지 않은지 확인하세요.")]
	send({"type":"result","tests":tests,"state":state})

func collect_tree(node: Node, path: String, tree: Array) -> void:
	if tree.size() >= 128:
		return
	tree.append({"path":path, "type":node.get_class()})
	for child in node.get_children():
		collect_tree(child, path + "/" + str(child.name), tree)

func node_names(node: Node, depth: int = 0) -> Array:
	var names: Array = ["  ".repeat(depth) + str(node.name)]
	if depth < 8:
		for child in node.get_children():
			if names.size() > 100:
				names.append("…")
				break
			names.append_array(node_names(child,depth+1))
	return names

func build_3d(root: Node) -> void:
	var preview = SubViewportContainer.new()
	preview.name = "Preview"
	preview.size = Vector2(640,360)
	preview.stretch = true
	root.add_child(preview)
	var world = SubViewport.new()
	world.name = "World"
	world.size = Vector2i(640,360)
	world.own_world_3d = true
	world.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	preview.add_child(world)
	var stage = Node3D.new()
	stage.name = "Stage"
	world.add_child(stage)
	var mesh = MeshInstance3D.new()
	mesh.name = "Mesh"
	mesh.mesh = BoxMesh.new()
	mesh.rotation_degrees = Vector3(20,30,0)
	var material = StandardMaterial3D.new()
	material.albedo_color = Color(0.25,0.55,0.85)
	mesh.material_override = material
	stage.add_child(mesh)
	var camera = Camera3D.new()
	camera.name = "Camera"
	camera.position = Vector3(0,0,5)
	camera.current = true
	stage.add_child(camera)
	var light = DirectionalLight3D.new()
	light.name = "Light"
	light.rotation_degrees = Vector3(-35,-30,0)
	stage.add_child(light)
	var environment_node = WorldEnvironment.new()
	environment_node.name = "Environment"
	var environment = Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color(0.08,0.11,0.17)
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color.WHITE
	environment.ambient_light_energy = 0.25
	environment_node.environment = environment
	stage.add_child(environment_node)
