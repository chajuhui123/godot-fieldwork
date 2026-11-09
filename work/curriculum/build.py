from pathlib import Path
import json
OUT={}
def check_entry(label,expr,expected=None,actual=None,hint=None):
    """A check is (label, expr) or (label, expr, expected, actual, hint).
    expected and hint are Korean text; actual is a GDScript expression shown as text,
    so it must not fail when the learner's node is missing or has another type."""
    entry='{"name":'+json.dumps(label,ensure_ascii=False)+',"pass":bool('+expr+')'
    if expected is not None:
        entry+=',"expected":'+json.dumps(expected,ensure_ascii=False)+',"actual":str('+actual+'),"hint":'+json.dumps(hint,ensure_ascii=False)
    return entry+'}'
def node_value(path,expr,missing='노드 없음'):
    """GDScript expression that evaluates expr (with @ standing for the node at path) only when the node exists."""
    return '('+expr.replace('@','s.get_node('+json.dumps(path)+')')+' if s.has_node('+json.dumps(path)+') else '+json.dumps(missing,ensure_ascii=False)+')'
STATUS_TEXT=node_value('Status','@.text')
_mobs='["Mob0","Mob1","Mob2"].filter(func(n): return s.has_node(n))'
MOBS_FOUND='(", ".join(PackedStringArray('+_mobs+'))+" ("+str('+_mobs+'.size())+"개)" if '+_mobs+'.size()>0 else "Mob 노드 없음")'
def add(id,title,goal,body,checks,*,stage='2d',preamble='',scope='',challenge='',hint='',setup='',substitute=False):
    prefix='extends Node2D\n'
    if stage=='3d':prefix+='\n@onready var mesh: MeshInstance3D = $Preview/World/Stage/Mesh\n@onready var camera: Camera3D = $Preview/World/Stage/Camera\n@onready var stage: Node3D = $Preview/World/Stage\n'
    prefix+='\n'+preamble+'\nfunc _ready() -> void:\n'
    body='\n'.join('\t'+line if line else '' for line in body.splitlines())+'\n'
    solution=prefix+body
    starter=prefix+'\t# TODO: '+goal+'\n\tpass\n'
    checker='extends RefCounted\nfunc verify(s: Node) -> Array:\n\treturn [\n'+',\n'.join('\t\t'+check_entry(*check) for check in checks)+'\n\t]\n'
    OUT[id]={'expanded':True,'stage':stage,'title':title,'goal':goal,'starter':starter,'solution':solution,'checker':checker,'scope':scope,**({'substitute':True} if substitute else {}),'setup':setup,'expected':' · '.join(check[0] for check in checks),'bug':hint or 'Console의 첫 오류 줄부터 확인하세요. 노드 이름은 대소문자를 구분합니다.','challenge':challenge or '완성 코드의 수치나 대상을 바꿔 다시 실행하고, 결과가 달라지는 이유를 설명해 보세요.','steps':[['준비된 씬 확인','실행 중 노드와 값에서 실제 노드 구조를 확인합니다.'],['코드 작성',goal],['실행 결과 비교','게임 화면·Console·검사 결과를 비교하고 코드를 고칩니다.'],['응용','같은 API에 다른 값을 넣고 다시 실행합니다.']]}
P='s.get_node("Player")'
S='s.get_node("Status")'
M='s.get_node("Preview/World/Stage/Mesh")'
C='s.get_node("Preview/World/Stage/Camera")'
add('project-manager','프로젝트 설정 읽고 바꾸기','ProjectSettings로 viewport_width를 800으로 설정하고 Status에 설정값을 출력하세요.', '''ProjectSettings.set_setting("display/window/size/viewport_width", 800)
var width = ProjectSettings.get_setting("display/window/size/viewport_width")
$Status.text = "설정 너비: " + str(width)
print("Renderer: ", RenderingServer.get_current_rendering_method())''',[('프로젝트 설정 너비 800','ProjectSettings.get_setting("display/window/size/viewport_width")==800'),('Status에 800 출력',S+'.text.contains("800")')],scope='프로젝트 설정 API를 실제로 실행합니다. 프로젝트 생성 창과 렌더러 변경은 설치형 에디터에서 진행하며, 이 값만 바꿔 실행 중 캔버스 크기가 바뀌지는 않습니다.')
add('instancing','같은 씬에서 두 인스턴스 만들기','token.tscn을 PackedScene으로 불러와 A와 B를 만들고 (240,180), (400,180)에 배치하세요.', '''var packed: PackedScene = load("res://fixtures/token.tscn")
for i in range(2):
	var token = packed.instantiate()
	token.name = ["A", "B"][i]
	token.position = Vector2(240 + i * 160, 180)
	add_child(token)
$Status.text = "같은 씬, 서로 다른 인스턴스"''',[('A와 B 노드가 존재','s.has_node("A") and s.has_node("B")','A, B 모두 있음','("A 있음" if s.has_node("A") else "A 없음")+", "+("B 있음" if s.has_node("B") else "B 없음")','instantiate()로 만든 노드의 name을 "A"와 "B"로 정하고 add_child()로 Main에 추가했는지 확인하세요. add_child()를 빼먹으면 노드가 씬 트리에 나타나지 않아요.'),
 ('B X=400','s.has_node("B") and s.get_node("B") is Node2D and s.get_node("B").position.x==400','400.0 px',node_value('B','(str(@.position.x)+" px" if @ is Node2D else "Node2D가 아님")'),'B는 두 번째 인스턴스라 240 + 1 × 160 = 400이어야 해요. 반복문의 i로 X를 계산했는지, A와 B의 이름이나 좌표가 뒤바뀌지 않았는지 확인하세요.')])
add('first-2d-loop','타이머로 적 세 개 생성하기','0.3초마다 token.tscn을 하나씩 생성하고 세 개 뒤에 멈추세요. Mob0~Mob2로 이름을 지정하세요.', '''for i in range(3):
	await get_tree().create_timer(0.3).timeout
	var mob = load("res://fixtures/token.tscn").instantiate()
	mob.name = "Mob" + str(i)
	mob.position = Vector2(240 + i * 90, 180)
	add_child(mob)
$Status.text = "스폰 완료: 3"''',[('세 적이 생성됨','s.has_node("Mob0") and s.has_node("Mob1") and s.has_node("Mob2")','Mob0, Mob1, Mob2 (3개)',MOBS_FOUND,'반복문에서 mob.name = "Mob" + str(i)로 이름을 정하고 add_child(mob)를 호출했는지 확인하세요. range(3)의 i는 0, 1, 2이고, 0.3초씩 세 번 기다려도 약 0.9초면 끝나요.'),
 ('스폰 결과 출력',S+'.text.contains("3")','3이 들어간 문구 (예: 스폰 완료: 3)',STATUS_TEXT,'반복문이 끝난 뒤 $Status.text = "스폰 완료: 3"처럼 생성한 개수를 표시하세요. 반복문 안에서 i를 출력하면 마지막 값이 3이 아니라 2가 돼요.')])
add('collision-areas','겹치는 Area2D 감지하기','같은 위치의 Area2D 두 개를 만들고 감지한 영역 수를 Status에 출력하세요.', '''var areas: Array[Area2D] = []
for i in range(2):
	var area = Area2D.new()
	area.name = "Area" + str(i)
	area.position = Vector2(120,180)
	var collider = CollisionShape2D.new()
	collider.shape = CircleShape2D.new()
	collider.shape.radius = 24
	area.add_child(collider)
	add_child(area)
	areas.append(area)
await get_tree().physics_frame
await get_tree().physics_frame
$Status.text = "겹친 영역: " + str(areas[0].get_overlapping_areas().size())''',[('Area0에서 Area1 감지','s.has_node("Area0") and s.get_node("Area0") is Area2D and s.get_node("Area0").get_overlapping_areas().size()==1','겹친 영역 1개',node_value('Area0','("겹친 영역 "+str(@.get_overlapping_areas().size())+"개" if @ is Area2D else "Area2D가 아님")'),'두 Area2D 모두 shape를 지정한 CollisionShape2D 자식이 있어야 겹침을 감지해요. 이름을 Area0, Area1로 정하고 같은 위치에 둔 뒤 add_child()로 씬에 추가하세요.'),
 ('감지 결과 출력',S+'.text.contains("1")','1이 들어간 문구 (예: 겹친 영역: 1)',STATUS_TEXT,'add_child() 직후에는 물리 엔진이 아직 겹침을 계산하지 않아 0이 나와요. await get_tree().physics_frame을 두 번 기다린 뒤 get_overlapping_areas().size()를 Status에 표시하세요.')])
add('first-3d-loop','3D 장면의 카메라 설정하기','준비된 3D 장면에서 카메라를 (0,0,5)에 놓고 Mesh를 Y축으로 45도 회전하세요.', '''camera.position = Vector3(0,0,5)
camera.make_current()
mesh.rotation_degrees.y = 45
$Status.text = "카메라 앞의 3D 큐브"''',[('Y축 45도 회전','absf('+M+'.rotation_degrees.y-45)<0.1'),('현재 카메라 활성화',C+'.current')],stage='3d')
add('run-debug','없는 노드를 안전하게 검사하기','get_node_or_null로 Missing을 검사하고, 없으면 Status에 Missing: null을 출력하세요. 실제 트리도 print_tree_pretty로 출력하세요.', '''var target = get_node_or_null("Missing")
if target == null:
	$Status.text = "Missing: null"
print_tree_pretty()''',[('없는 노드를 확인한 결과',S+'.text=="Missing: null"')],scope='실제 노드 조회와 Console 출력을 연습합니다. 중단점·Remote 디버거는 설치형 에디터에서 사용합니다.')
add('paths','res:// 리소스를 불러오기','res://fixtures/token.tscn을 load하여 Token이라는 노드로 배치하세요.', '''var scene: PackedScene = load("res://fixtures/token.tscn")
var token = scene.instantiate()
token.name = "Token"
token.position = Vector2(320,180)
add_child(token)
$Status.text = "res://fixtures/token.tscn"''',[('리소스에서 Token 생성','s.has_node("Token/Shape")'),('중앙에 배치','s.has_node("Token") and s.get_node("Token").position.x==320')])
add('input','새 Input Map 액션 등록하기','dash 액션에 Space 키를 연결하세요. 엔진이 보내는 Space 입력을 받으면 Player X를 200으로 바꾸세요.', '''InputMap.add_action("dash")
var key = InputEventKey.new()
key.physical_keycode = KEY_SPACE
InputMap.action_add_event("dash", key)
$Status.text = "Space → dash"
var press = InputEventKey.new()
press.physical_keycode = KEY_SPACE
press.pressed = true
Input.parse_input_event(press)
await get_tree().process_frame
if Input.is_action_pressed("dash"):
	$Player.position.x = 200
press.pressed = false
Input.parse_input_event(press)''',[('dash 액션 등록','InputMap.has_action("dash")'),('입력으로 X=200',P+'.position.x==200')])
add('ui','오른쪽 위에 Label 고정하기','HUD(Control)와 Score(Label)를 만들고 Score의 오른쪽 앵커를 1, 오른쪽 offset을 -24로 설정하세요.', '''var hud = Control.new()
hud.name = "HUD"
hud.size = Vector2(640,360)
add_child(hud)
var score = Label.new()
score.name = "Score"
score.text = "Score: 10"
hud.add_child(score)
score.anchor_left = 1
score.anchor_right = 1
score.offset_left = -140
score.offset_right = -24
score.offset_top = 24
score.offset_bottom = 56
$Status.text = "오른쪽 여백 24px"''',[('Score 생성','s.has_node("HUD/Score")','HUD 아래 Score 있음','("HUD 아래 Score 있음" if s.has_node("HUD/Score") else ("Score가 HUD 밖에 있음" if s.has_node("Score") else ("HUD는 있지만 Score 없음" if s.has_node("HUD") else "HUD 없음")))','Control의 name을 "HUD"로 정해 add_child(hud)하고, Label의 name을 "Score"로 정해 hud.add_child(score)로 넣으세요. add_child(score)로 Main에 바로 넣으면 경로가 HUD/Score가 아니에요.'),
 ('오른쪽 앵커와 여백','s.has_node("HUD/Score") and s.get_node("HUD/Score") is Control and s.get_node("HUD/Score").anchor_right==1 and s.get_node("HUD/Score").offset_right==-24','anchor_right 1.0, offset_right -24.0',node_value('HUD/Score','("anchor_right %s, offset_right %s" % [@.anchor_right, @.offset_right] if @ is Control else "Control이 아님")'),'anchor_right = 1은 부모의 오른쪽 끝을 기준으로 삼아요. 여백 24px은 기준선보다 왼쪽이므로 offset_right = -24로 쓰세요. +24로 쓰면 오른쪽 밖으로 나가고, anchor_right가 0이면 왼쪽 끝 기준이 돼요.')])
add('import-pipeline','이미지에서 실제 Texture 만들기','32×32 Image를 주황색으로 채우고 ImageTexture로 만들어 Sprite2D에 지정하세요.', '''var image = Image.create(32,32,false,Image.FORMAT_RGBA8)
image.fill(Color(1,0.5,0.1))
var sprite = Sprite2D.new()
sprite.name = "Imported"
sprite.texture = ImageTexture.create_from_image(image)
sprite.position = Vector2(320,180)
sprite.scale = Vector2(3,3)
add_child(sprite)
$Status.text = "Image → ImageTexture → Sprite2D"''',[('실제 텍스처 크기 32×32','s.has_node("Imported") and s.get_node("Imported").texture.get_size()==Vector2(32,32)')],scope='런타임 이미지→텍스처 변환 실습입니다. PNG Import 독의 압축·재가져오기는 전체 에디터에서 진행합니다.')
add('custom-resource','Resource 복제와 공유 비교하기','WeaponData를 공유하는 a/b와 duplicate한 c를 만들고 원본 damage를 20으로 바꾸세요. b=20, c=10을 출력하세요.', '''var a = WeaponData.new()
var b = a
var c = a.duplicate()
a.damage = 20
set_meta("shared",b)
set_meta("copy",c)
$Status.text = "b=%d / c=%d" % [b.damage,c.damage]''',[('공유 Resource는 20','s.has_meta("shared") and s.get_meta("shared").damage==20'),('복제 Resource는 10','s.has_meta("copy") and s.get_meta("copy").damage==10')],preamble='class WeaponData extends Resource:\n\t@export var damage: int = 10\n')
add('gdscript-data','배열을 함수로 집계하기','prices 배열의 합계를 sum_prices 함수로 구해 Status에 Total: 60을 출력하세요.', '''var total = sum_prices([10,20,30])
$Status.text = "Total: " + str(total)''',[('다른 입력에도 합계 계산','s.has_method("sum_prices") and s.sum_prices([2,3,7])==12','sum_prices([2, 3, 7]) = 12','("sum_prices([2, 3, 7]) = "+str(s.sum_prices([2,3,7])) if s.has_method("sum_prices") else "sum_prices 함수 없음")','함수 안에서 60이나 [10,20,30]을 직접 쓰지 말고 매개변수 prices를 for price in prices:로 순회해 total에 더한 뒤 return total 하세요. 시작 코드의 return 0이 남아 있으면 항상 0이 나와요.'),
 ('화면 합계 60',S+'.text=="Total: 60"','Total: 60',STATUS_TEXT,'_ready()에서 sum_prices([10,20,30])의 결과를 "Total: " + str(total)로 Status에 넣으세요. 대소문자와 콜론 뒤 공백 한 칸까지 같아야 해요.')],preamble='func sum_prices(prices: Array) -> int:\n\tvar total: int = 0\n\tfor price in prices:\n\t\ttotal += price\n\treturn total\n')
add('exported-properties','내보낸 속성을 인스턴스에서 바꾸기','@export speed의 기본값을 200으로 선언하고, _ready에서 현재 speed를 Status에 출력하세요. Inspector는 90을 전달합니다.', '''$Status.text = "Speed: %.0f" % speed
$Player.position.x += speed''',[('인스턴스 속성값 90','s.get("speed")==90'),('속성으로 X=210',P+'.position.x==210'),('출력 Speed: 90',S+'.text=="Speed: 90"')],preamble='@export var speed: float = 200\n')
add('groups-autoload','그룹 전체를 찾아 변경하기','적 세 개를 enemies 그룹에 넣고 set_group으로 모두 숨기세요.', '''for i in range(3):
	var enemy = load("res://fixtures/token.tscn").instantiate()
	enemy.name = "Enemy" + str(i)
	enemy.position = Vector2(240+i*90,180)
	add_child(enemy)
	enemy.add_to_group("enemies")
get_tree().set_group("enemies","visible",false)
$Status.text = "그룹 크기: " + str(get_tree().get_nodes_in_group("enemies").size())''',[('enemies 그룹 3개','s.get_tree().get_nodes_in_group("enemies").size()==3'),('Enemy0 숨김','s.has_node("Enemy0") and not s.get_node("Enemy0").visible')],scope='실제 Group 일괄 변경 실습입니다. Autoload 등록은 프로젝트 설정에서 별도로 진행합니다.')
add('canvas-coordinates','로컬과 전역 좌표 변환하기','Player를 (100,180)에 놓고 자식 Child의 로컬 좌표를 (40,0)으로 설정하세요. global X=140을 출력하세요.', '''$Player.position = Vector2(100,180)
var child = Node2D.new()
child.name = "Child"
child.position = Vector2(40,0)
$Player.add_child(child)
$Status.text = "global X: " + str(child.global_position.x)''',[('자식 전역 X=140','s.has_node("Player/Child") and s.get_node("Player/Child").global_position.x==140'),('로컬 역변환','s.has_node("Player/Child") and '+P+'.to_local(Vector2(140,180))==Vector2(40,0)')])
add('tilemaps','실제 TileMapLayer에 타일 칠하기','TileSetAtlasSource에 만든 텍스처를 등록하고 TileMapLayer의 (0,0), (1,0)에 타일을 배치하세요.', '''var image = Image.create(32,32,false,Image.FORMAT_RGBA8)
image.fill(Color(0.3,0.7,0.5))
var atlas = TileSetAtlasSource.new()
atlas.texture = ImageTexture.create_from_image(image)
atlas.texture_region_size = Vector2i(32,32)
atlas.create_tile(Vector2i.ZERO)
var tiles = TileSet.new()
tiles.tile_size = Vector2i(32,32)
tiles.add_source(atlas,0)
var layer = TileMapLayer.new()
layer.name = "Tiles"
layer.tile_set = tiles
layer.position = Vector2(280,160)
add_child(layer)
layer.set_cell(Vector2i(0,0),0,Vector2i.ZERO)
layer.set_cell(Vector2i(1,0),0,Vector2i.ZERO)
$Status.text = "타일 2개"''',[('TileMapLayer 두 셀 사용','s.has_node("Tiles") and s.get_node("Tiles").get_used_cells().size()==2')])
add('physics-bodies','CharacterBody2D 실제 이동시키기','Body라는 CharacterBody2D를 만들고 velocity=(100,0)으로 설정한 뒤 30 물리 틱 동안 move_and_slide를 호출하세요.', '''var body = CharacterBody2D.new()
body.name = "Body"
body.position = Vector2(120,240)
var shape = CollisionShape2D.new()
shape.shape = CircleShape2D.new()
shape.shape.radius = 16
body.add_child(shape)
var visual = $Player/Shape.duplicate()
body.add_child(visual)
add_child(body)
for i in range(30):
	await get_tree().physics_frame
	body.velocity = Vector2(100,0)
	body.move_and_slide()
$Status.text = "Body X: " + str(body.position.x)''',[('물리 바디가 오른쪽 이동','s.has_node("Body") and s.get_node("Body").position.x>160'),('Y좌표 유지','s.has_node("Body") and absf(s.get_node("Body").position.y-240)<1')])
add('3d-transforms','3D Transform 바꾸기','Mesh의 X를 1, Y 회전을 45도, 배율을 0.7로 바꾸세요.', '''mesh.position.x = 1
mesh.rotation_degrees.y = 45
mesh.scale = Vector3.ONE * 0.7
$Status.text = "이동 · 회전 · 배율"''',[('X=1',M+'.position.x==1'),('배율 0.7',M+'.scale.is_equal_approx(Vector3.ONE*0.7)')],stage='3d')
add('containers','VBoxContainer로 메뉴 만들기','Menu라는 VBoxContainer에 Play, Settings, Quit 버튼을 추가하세요. 버튼 간격은 12입니다.', '''var menu = VBoxContainer.new()
menu.name = "Menu"
menu.position = Vector2(260,100)
menu.add_theme_constant_override("separation",12)
add_child(menu)
for title in ["Play","Settings","Quit"]:
	var button = Button.new()
	button.text = title
	button.custom_minimum_size = Vector2(120,40)
	menu.add_child(button)
$Status.text = "VBoxContainer: 세로 메뉴"''',[('버튼 3개','s.has_node("Menu") and s.get_node("Menu").get_child_count()==3'),('컨테이너 간격 12','s.has_node("Menu") and s.get_node("Menu").get_theme_constant("separation")==12')])
add('themes','Theme 리소스로 Label 꾸미기','Theme에 Label 글자 크기 28과 주황색을 설정하고 Status에 적용하세요.', '''var theme = Theme.new()
theme.set_font_size("font_size","Label",28)
theme.set_color("font_color","Label",Color(1,0.6,0.2))
$Status.theme = theme
$Status.remove_theme_font_size_override("font_size")
$Status.text = "공유 Theme 적용"''',[('Theme 글자 크기28',S+'.get_theme_font_size("font_size")==28'),('Theme 색상 적용',S+'.get_theme_color("font_color").is_equal_approx(Color(1,0.6,0.2))')])
ANIM='''var player = AnimationPlayer.new()
player.name = "Animator"
add_child(player)
var animation = Animation.new()
animation.length = 1.0
var track = animation.add_track(Animation.TYPE_VALUE)
animation.track_set_path(track,NodePath("Player:position:x"))
animation.track_insert_key(track,0.0,120.0)
animation.track_insert_key(track,1.0,360.0)
var library = AnimationLibrary.new()
library.add_animation("move",animation)
player.add_animation_library("",library)'''
add('animation-player','애니메이션 트랙 재생하기','AnimationPlayer에 1초 동안 Player X가 120→360이 되는 move 트랙을 만들고 재생하세요.',ANIM+'\nplayer.play("move")\n$Status.text = "AnimationPlayer: 1초 이동"',[('move 애니메이션 등록','s.has_node("Animator") and s.get_node("Animator").has_animation("move")'),('최종 X=360','absf('+P+'.position.x-360)<1')])
add('animation-tree','AnimationTree로 애니메이션 구동하기','AnimationNodeAnimation을 루트로 하는 AnimationTree를 만들고 move 애니메이션을 활성화하세요.',ANIM+'''
var tree = AnimationTree.new()
tree.name = "Tree"
add_child(tree)
tree.anim_player = NodePath("../Animator")
var node = AnimationNodeAnimation.new()
node.animation = "move"
tree.tree_root = node
tree.active = true
$Status.text = "AnimationTree: move"''',[('Tree 활성화','s.has_node("Tree") and s.get_node("Tree").active'),('Tree를 통해 X=360','absf('+P+'.position.x-360)<1')])
add('audio-buses','오디오 버스 음량 조절하기','SFX 버스를 추가하고 -12dB로 설정한 뒤 AudioStreamPlayer의 bus를 SFX로 지정하세요.', '''AudioServer.add_bus()
var index = AudioServer.bus_count-1
AudioServer.set_bus_name(index,"SFX")
AudioServer.set_bus_volume_db(index,-12)
var sound = AudioStreamPlayer.new()
sound.name = "Sound"
sound.bus = "SFX"
add_child(sound)
$Status.text = "SFX: " + str(AudioServer.get_bus_volume_db(index)) + " dB"''',[('SFX -12dB','AudioServer.get_bus_index("SFX")>=0 and AudioServer.get_bus_volume_db(AudioServer.get_bus_index("SFX"))==-12'),('플레이어 라우팅','s.has_node("Sound") and s.get_node("Sound").bus=="SFX"')],scope='실제 오디오 버스 설정을 검사합니다. 이 과제에는 음원 파일이 없어 소리는 재생하지 않습니다.')
def shader2(id,title,goal,shader,params,scope=''):
    body='''var image = Image.create(64,64,false,Image.FORMAT_RGBA8)
image.fill(Color.WHITE)
var surface = Sprite2D.new()
surface.name = "Surface"
surface.texture = ImageTexture.create_from_image(image)
surface.position = Vector2(320,180)
surface.scale = Vector2(3,3)
var shader = Shader.new()
shader.code = '''+json.dumps(shader)+'''
var material = ShaderMaterial.new()
material.shader = shader
surface.material = material
add_child(surface)
$Player.visible = false
'''+ '\n'.join('material.set_shader_parameter('+json.dumps(k)+','+v+')' for k,v in params.items())+'\n$Status.text = '+json.dumps(title,ensure_ascii=False)
    checks=[('ShaderMaterial 생성','s.has_node("Surface") and s.get_node("Surface").material is ShaderMaterial')]+[(k+' 적용','s.has_node("Surface") and s.get_node("Surface").material is ShaderMaterial and s.get_node("Surface").material.get_shader_parameter('+json.dumps(k)+')=='+v) for k,v in params.items()]
    add(id,title,goal,body,checks,stage='shader',scope=scope)
shader2('shaders','셰이더 uniform으로 색 바꾸기','ShaderMaterial의 tint를 주황색으로 지정해 Surface를 바꾸세요.','shader_type canvas_item; uniform vec4 tint : source_color; void fragment(){ COLOR=tint; }',{'tint':'Color(1,0.6,0.2,1)'})
add('navigation','내비게이션 맵에서 경로 얻기','사각형 NavigationPolygon을 Region에 등록하고 (100,120)→(500,240) 경로를 Line2D로 표시하세요.', '''NavigationServer2D.set_active(true)
NavigationServer2D.map_set_active(get_world_2d().navigation_map,true)
var polygon = NavigationPolygon.new()
polygon.vertices = PackedVector2Array([Vector2(40,80),Vector2(600,80),Vector2(600,320),Vector2(40,320)])
polygon.add_polygon(PackedInt32Array([0,1,2,3]))
var region = NavigationRegion2D.new()
region.name = "Region"
region.navigation_polygon = polygon
add_child(region)
region.set_navigation_map(get_world_2d().navigation_map)
await get_tree().create_timer(0.2).timeout
NavigationServer2D.map_force_update(get_world_2d().navigation_map)
var path = NavigationServer2D.map_get_path(get_world_2d().navigation_map,Vector2(100,120),Vector2(500,240),true)
var line = Line2D.new()
line.name = "Path"
line.points = path
line.width = 4
add_child(line)
$Status.text = "경로 점: " + str(path.size())''',[('실제 서버 경로 반환','s.has_node("Path") and s.get_node("Path").points.size()>=2'),('경로 끝점','s.has_node("Path") and s.get_node("Path").points.size()>=2 and s.get_node("Path").points[-1].is_equal_approx(Vector2(500,240))')])
add('saving-games','파일에 저장하고 다시 읽기','ConfigFile로 score=42를 user://save.cfg에 저장한 뒤 새 ConfigFile로 읽고 Status에 출력하세요.', '''var save = ConfigFile.new()
save.set_value("player","score",42)
var error = save.save("user://save.cfg")
assert(error == OK)
var loaded = ConfigFile.new()
loaded.load("user://save.cfg")
$Status.text = "Loaded: " + str(loaded.get_value("player","score"))''',[('실제 저장 파일 생성','FileAccess.file_exists("user://save.cfg")'),('읽은 값 표시',S+'.text=="Loaded: 42"')],scope='실제 가상 파일 시스템에 저장합니다. 정지하거나 새 엔진을 띄우면 지워지는 연습용 저장 공간이며 영구 게임 저장은 아닙니다.')
add('multiplayer','멀티플레이어 권한 확인하기','OfflineMultiplayerPeer를 지정하고 Player의 authority를 2로 변경한 뒤 현재 피어가 권한을 갖는지 출력하세요.', '''multiplayer.multiplayer_peer = OfflineMultiplayerPeer.new()
$Player.set_multiplayer_authority(2)
$Status.text = "Authority: %d / Mine: %s" % [$Player.get_multiplayer_authority(),$Player.is_multiplayer_authority()]''',[('권한 ID2',P+'.get_multiplayer_authority()==2'),('로컬 피어에 권한 없음','not '+P+'.is_multiplayer_authority()')],scope='실제 MultiplayerAPI의 권한 분기를 오프라인 피어에서 실행합니다. 두 브라우저 간 네트워크 연결·RPC 전송은 이 과제에서 수행하지 않습니다.')
add('localization','Translation 리소스로 번역하기','ko 번역에 START→시작을 추가하고 locale을 ko로 바꿔 Status에 tr("START")를 출력하세요.', '''var translation = Translation.new()
translation.locale = "ko"
translation.add_message("START","시작")
TranslationServer.add_translation(translation)
TranslationServer.set_locale("ko")
$Status.text = tr("START")''',[('실제 번역 출력',S+'.text=="시작"'),('locale ko','TranslationServer.get_locale().begins_with("ko")')])
add('export-profile','노드 수를 측정하고 줄이기','동적으로 노드 100개를 만들고 이름을 Temp0~Temp99로 지정하세요. 절반을 queue_free한 뒤 남은 Temp 노드 수를 출력하세요.', '''for i in range(100):
	var node = Node.new()
	node.name = "Temp" + str(i)
	add_child(node)
for i in range(50):
	get_node("Temp"+str(i)).queue_free()
await get_tree().process_frame
var count = 0
for child in get_children():
	if str(child.name).begins_with("Temp"):
		count += 1
$Status.text = "Temp nodes: " + str(count)
print("전체 노드 수: ", Performance.get_monitor(Performance.OBJECT_NODE_COUNT))''',[('Temp0 제거','not s.has_node("Temp0")'),('Temp99 유지','s.has_node("Temp99")'),('50개 측정',S+'.text=="Temp nodes: 50"')],scope='런타임 메모리·노드 계측 과제입니다. 플랫폼별 실행 파일 내보내기와 에디터 Profiler는 설치형 에디터에서 진행합니다.')
add('loop','콜백 횟수 직접 관찰하기','_process와 _physics_process에서 각각 카운터를 늘리고 Status에 두 횟수를 출력하세요.', '''$Status.text = "프레임 콜백 계측 중"''',[('렌더 콜백 호출','s.get("frames")>10'),('물리 콜백 호출','s.get("ticks")>10')],preamble='var frames: int = 0\nvar ticks: int = 0\nfunc _process(_delta: float) -> void:\n\tframes += 1\n\t$Status.text = "process: %d / physics: %d" % [frames,ticks]\nfunc _physics_process(_delta: float) -> void:\n\tticks += 1\n')
add('rendering','그리기 순서 바꾸기','겹치는 빨강/파랑 Polygon2D를 만들고 Red의 z_index를 2로 설정해 앞에 보이게 하세요.', '''for name in ["Red","Blue"]:
	var shape = $Player/Shape.duplicate()
	shape.name = name
	shape.position = Vector2(320,180)
	shape.scale = Vector2(3,3)
	shape.color = Color.RED if name=="Red" else Color.BLUE
	add_child(shape)
$Red.z_index = 2
$Status.text = "Red가 앞에 표시됩니다"''',[('Red z_index=2','s.has_node("Red") and s.get_node("Red").z_index==2'),('Blue보다 높은 순서','s.has_node("Red") and s.has_node("Blue") and s.get_node("Red").z_index>s.get_node("Blue").z_index')])
add('builds','에디터와 게임 실행 구분하기','Engine.is_editor_hint()의 결과에 따라 Status에 Editor 또는 Game을 출력하세요.', '''if Engine.is_editor_hint():
	$Status.text = "Editor"
else:
	$Status.text = "Game"
print("debug build: ", OS.is_debug_build())''',[('런타임 분기 실행',S+'.text=="Game"')],scope='현재 실행 바이너리의 실제 특성을 확인합니다. 에디터 빌드·내보내기 템플릿 제작 자체는 설치형 개발 환경이 필요합니다.')
add('object-memory','queue_free 이후 참조 검사하기','Temp 노드를 만들고 weakref를 저장하세요. queue_free 후 한 프레임 기다려 참조가 해제됐는지 출력하세요.', '''var temp = Node.new()
temp.name = "Temp"
add_child(temp)
var reference = weakref(temp)
temp.queue_free()
await get_tree().process_frame
$Status.text = "Freed: " + str(reference.get_ref()==null)''',[('Temp 해제','not s.has_node("Temp")'),('약한 참조 null',S+'.text=="Freed: true"')])
add('tree-notifications','노드 수명주기 시그널 받기','Watch 노드의 tree_entered와 tree_exited를 연결하고 추가→제거해 이벤트 배열을 Status에 출력하세요.', '''var watched = Node.new()
watched.name = "Watch"
watched.tree_entered.connect(func(): events.append("entered"))
watched.tree_exited.connect(func(): events.append("exited"))
add_child(watched)
remove_child(watched)
watched.free()
$Status.text = ",".join(events)''',[('진입 후 퇴장 이벤트','s.get("events")==["entered","exited"]')],preamble='var events: Array[String] = []\n')
add('server-architecture','PhysicsServer의 바디 RID 확인하기','StaticBody2D에 CircleShape를 추가하고 get_rid()가 유효한지 Status에 출력하세요.', '''var body = StaticBody2D.new()
body.name = "ServerBody"
var shape = CollisionShape2D.new()
shape.shape = CircleShape2D.new()
shape.shape.radius = 20
body.add_child(shape)
add_child(body)
$Status.text = "RID valid: " + str(body.get_rid().is_valid())''',[('실제 물리 바디 RID','s.has_node("ServerBody") and s.get_node("ServerBody").get_rid().is_valid()'),('출력 확인',S+'.text=="RID valid: true"')])
add('renderers','현재 렌더러를 조회하기','RenderingServer.get_current_rendering_method()를 Status에 출력하고 반환값을 renderer 변수에 보관하세요.', '''renderer = RenderingServer.get_current_rendering_method()
$Status.text = "Renderer: " + renderer''',[('실제 렌더러 조회 결과','s.get("renderer")==RenderingServer.get_current_rendering_method()'),('화면에 이름 출력',S+'.text=="Renderer: "+RenderingServer.get_current_rendering_method()')],preamble='var renderer: String = ""\n',scope='브라우저는 Compatibility(gl_compatibility)로 실행됩니다. Forward+와 Mobile로 전환하는 실습은 설치형 Godot이 필요합니다.')
add('rendering-rid','RenderingServer로 사각형 그리기','CanvasItem RID를 만들고 자신의 캔버스 아래에 등록한 뒤 (280,140)에 80×80 사각형을 그리세요.', '''rid = RenderingServer.canvas_item_create()
RenderingServer.canvas_item_set_parent(rid,get_canvas_item())
RenderingServer.canvas_item_add_rect(rid,Rect2(280,140,80,80),Color(1,0.6,0.2))
$Status.text = "RenderingServer가 직접 그린 사각형"''',[('캔버스 RID 유효','s.get("rid").is_valid()')],preamble='var rid: RID\nfunc _exit_tree() -> void:\n\tif rid.is_valid():\n\t\tRenderingServer.free_rid(rid)\n')
add('thread-safety','노드 변경을 지연 실행하기','call_deferred로 install_node를 호출해 Result 노드를 다음 안전한 시점에 추가하세요.', '''call_deferred("install_node")
$Status.text = "deferred 노드 추가 예약"''',[('지연 호출로 Result 생성','s.has_node("Result")')],preamble='func install_node() -> void:\n\tvar result = Node.new()\n\tresult.name = "Result"\n\tadd_child(result)\n',scope='단일 스레드 Web 엔진에서 실제 deferred 호출을 연습합니다. Worker Thread와 스레드 간 안전성 검증은 설치형 엔진에서 별도 수행합니다.')
add('compile-engine','실행 중인 엔진 빌드 정보 읽기','Engine.get_version_info()에서 major와 minor를 읽어 Status에 출력하세요. info 변수에도 Dictionary를 보관하세요.', '''info = Engine.get_version_info()
$Status.text = "Godot %d.%d" % [info.major,info.minor]
print(info)''',[('실제 버전 major4','s.get("info").get("major",0)==4'),('버전 출력',S+'.text.begins_with("Godot 4.")')],preamble='var info: Dictionary = {}\n',scope='엔진 소스 컴파일 자체는 브라우저에서 실행할 수 없습니다. 여기서는 실행된 엔진의 실제 빌드 메타데이터를 검사합니다. 소스·SCons 빌드는 별도 개발 환경 과제입니다.')
add('modules-gdextension','ClassDB에서 타입 기능 확인하기','ClassDB로 Node2D 존재 여부와 position 속성을 조사해 Status에 결과를 출력하세요.', '''found_class = ClassDB.class_exists("Node2D")
for property in ClassDB.class_get_property_list("Node2D"):
	if property.name=="position":
		found_position = true
$Status.text = "Node2D: %s / position: %s" % [found_class,found_position]''',[('등록 클래스 확인','s.get("found_class")==true'),('등록 속성 확인','s.get("found_position")==true')],preamble='var found_class: bool = false\nvar found_position: bool = false\n',scope='실제 ClassDB 리플렉션을 연습합니다. C++ 모듈 컴파일과 GDExtension 바이너리 로딩은 이 Web 런타임에서 지원하지 않습니다.')
add('editor-plugins','도구 패널의 등록과 해제','ToolPanel이라는 PanelContainer와 Label을 만들고 old 패널은 queue_free하세요. 화면에 Tool ready를 표시하세요.', '''var old = PanelContainer.new()
old.name = "OldPanel"
add_child(old)
old.queue_free()
var panel = PanelContainer.new()
panel.name = "ToolPanel"
panel.position = Vector2(220,120)
var label = Label.new()
label.text = "Tool ready"
panel.add_child(label)
add_child(panel)
$Status.text = "패널 수명 관리"''',[('새 패널 등록','s.has_node("ToolPanel")'),('이전 패널 해제','not s.has_node("OldPanel")')],scope='실행 중 Control 패널의 수명 관리를 실습합니다. EditorPlugin 등록·에디터 독 확장은 전체 Godot 에디터 전용이며 여기서는 실행하지 않습니다.')
add('camera-projection','직교 카메라로 바꾸기','Camera3D를 직교 투영으로 바꾸고 size를 4로 설정하세요.', '''camera.projection = Camera3D.PROJECTION_ORTHOGONAL
camera.size = 4
$Status.text = "Orthogonal · size 4"''',[('직교 투영',C+'.projection==Camera3D.PROJECTION_ORTHOGONAL'),('size4',C+'.size==4')],stage='3d')
add('pbr-material','PBR 재질의 거칠기 바꾸기','StandardMaterial3D를 만들고 metallic=0.8, roughness=0.2, albedo를 구리색으로 설정하세요.', '''var material = StandardMaterial3D.new()
material.albedo_color = Color(0.8,0.4,0.2)
material.metallic = 0.8
material.roughness = 0.2
mesh.material_override = material
mesh.rotation_degrees = Vector3(20,35,0)
$Status.text = "metallic 0.8 / roughness 0.2"''',[('금속성0.8',M+'.material_override is StandardMaterial3D and is_equal_approx('+M+'.material_override.metallic,0.8)'),('거칠기0.2',M+'.material_override is StandardMaterial3D and is_equal_approx('+M+'.material_override.roughness,0.2)')],stage='3d')
add('global-illumination','환경광으로 어두운 면 밝히기','WorldEnvironment의 ambient_light_source를 COLOR로, ambient_light_color를 흰색, energy를 0.8로 설정하세요.', '''var environment: Environment = $Preview/World/Stage/Environment.environment
environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
environment.ambient_light_color = Color.WHITE
environment.ambient_light_energy = 0.8
$Status.text = "환경광 에너지 0.8"''',[('환경광 에너지0.8','is_equal_approx(s.get_node("Preview/World/Stage/Environment").environment.ambient_light_energy,0.8)')],stage='3d',scope='Compatibility에서 실제 환경광을 조절합니다. SDFGI·VoxelGI의 간접광 계산을 대체하거나 실행하는 과제는 아닙니다.',substitute=True)
add('mesh-lod','거리로 메시 해상도 바꾸기','카메라가 4보다 멀면 SphereMesh의 radial_segments를 8로, 가까우면 32로 정하세요.', '''var sphere = SphereMesh.new()
sphere.radial_segments = 8 if camera.position.length()>4 else 32
sphere.rings = 8
mesh.mesh = sphere
$Status.text = "radial_segments: " + str(sphere.radial_segments)''',[('실제 SphereMesh',''+M+'.mesh is SphereMesh'),('먼 거리 해상도8',M+'.mesh is SphereMesh and '+M+'.mesh.radial_segments==8')],stage='3d',scope='실제 메시를 바꾸는 수동 LOD 과제입니다. 가져온 메시의 자동 LOD 생성·화면 픽셀 오차 기반 선택은 에디터 Import 실습에서 별도로 확인합니다.')
add('occlusion-culling','가림 객체와 뷰포트 설정하기','OccluderInstance3D에 QuadOccluder3D를 넣고 서브뷰포트의 use_occlusion_culling을 켜세요.', '''var occluder = OccluderInstance3D.new()
occluder.name = "Occluder"
var quad = QuadOccluder3D.new()
quad.size = Vector2(2,2)
occluder.occluder = quad
occluder.position = Vector3(0,0,1)
stage.add_child(occluder)
$Preview/World.use_occlusion_culling = true
$Status.text = "가림 객체 등록 · CPU 컬링"''',[('실제 Occluder 등록','s.has_node("Preview/World/Stage/Occluder")'),('뷰포트 컬링 활성화','s.get_node("Preview/World").use_occlusion_culling')],stage='3d',scope='가림 객체와 컬링 설정을 실제 엔진에 등록합니다. 검사 통과는 프레임 성능 향상이나 특정 GPU 드로 콜 감소를 보장하지 않습니다.')
add('multimesh','MultiMesh로 세 큐브 그리기','MultiMeshInstance3D를 만들고 세 인스턴스를 X=-1.5, 0, 1.5에 배치하세요.', '''mesh.visible = false
var batch = MultiMeshInstance3D.new()
batch.name = "Batch"
var multi = MultiMesh.new()
multi.transform_format = MultiMesh.TRANSFORM_3D
multi.mesh = BoxMesh.new()
multi.instance_count = 3
for i in range(3):
	multi.set_instance_transform(i,Transform3D(Basis.IDENTITY.scaled(Vector3.ONE*0.5),Vector3((i-1)*1.5,0,0)))
batch.multimesh = multi
stage.add_child(batch)
$Status.text = "MultiMesh: 3 instances"''',[('인스턴스3개','s.has_node("Preview/World/Stage/Batch") and s.get_node("Preview/World/Stage/Batch").multimesh.instance_count==3')],stage='3d')
shader2('shader-uv','UV 반복으로 줄무늬 만들기','UV.x를 repeats=4로 반복하는 셰이더를 만들고 실제 표면의 줄무늬를 확인하세요.','shader_type canvas_item; uniform float repeats=1.0; void fragment(){float stripe=step(0.5,fract(UV.x*repeats));COLOR=vec4(vec3(stripe),1.0);}',{'repeats':'4.0'})
def shader3(id,title,goal,shader,params,meshcode='mesh.mesh = SphereMesh.new()'):
    body=meshcode+'\nvar shader = Shader.new()\nshader.code = '+json.dumps(shader)+'\nvar material = ShaderMaterial.new()\nmaterial.shader = shader\nmesh.material_override = material\n'+ '\n'.join('material.set_shader_parameter('+json.dumps(k)+','+v+')' for k,v in params.items())+'\n$Status.text = '+json.dumps(title,ensure_ascii=False)
    checks=[('실제 공간 셰이더 재질',M+'.material_override is ShaderMaterial')]+[(k+' 값 적용',M+'.material_override is ShaderMaterial and '+M+'.material_override.get_shader_parameter('+json.dumps(k)+')=='+v) for k,v in params.items()]
    add(id,title,goal,body,checks,stage='3d')
shader3('vertex-displacement','정점 셰이더로 표면 흔들기','분할된 PlaneMesh를 만들고 amplitude=0.3인 사인파 정점 변위를 적용하세요.','shader_type spatial; render_mode unshaded,cull_disabled; uniform float amplitude=0.0; void vertex(){VERTEX.z+=sin(VERTEX.x*8.0+TIME*3.0)*amplitude;} void fragment(){ALBEDO=vec3(0.2,0.65,0.9);}',{'amplitude':'0.3'},'var plane = PlaneMesh.new()\nplane.orientation = PlaneMesh.FACE_Z\nplane.subdivide_width = 32\nplane.subdivide_depth = 32\nmesh.mesh = plane')
shader2('shader-dissolve','discard로 표면 절반 없애기','UV.x가 threshold=0.5보다 작은 픽셀을 discard하고 나머지는 주황색으로 표시하세요.','shader_type canvas_item; uniform float threshold=0.0; void fragment(){if(UV.x<threshold){discard;}COLOR=vec4(1.0,0.6,0.2,1.0);}',{'threshold':'0.5'})
shader3('shader-fresnel','시선 방향으로 가장자리 밝히기','구체에 Fresnel 셰이더를 적용하고 power=3으로 조절하세요.','shader_type spatial; render_mode unshaded; uniform float power=1.0; void fragment(){float f=pow(1.0-clamp(dot(normalize(NORMAL),normalize(VIEW)),0.0,1.0),power);ALBEDO=mix(vec3(0.05,0.1,0.2),vec3(0.4,0.8,1.0),f);}',{'power':'3.0'})
add('screen-shaders','화면 텍스처 후처리하기','640×360 ColorRect에 screen_texture를 읽는 셰이더를 붙여 화면 색을 반전하세요.', '''var effect = ColorRect.new()
effect.name = "Effect"
effect.size = Vector2(640,360)
effect.mouse_filter = Control.MOUSE_FILTER_IGNORE
var shader = Shader.new()
shader.code = "shader_type canvas_item; uniform sampler2D screen_texture : hint_screen_texture, filter_nearest; uniform float strength=0.0; void fragment(){vec3 c=texture(screen_texture,SCREEN_UV).rgb;COLOR=vec4(mix(c,1.0-c,strength),1.0);}"
var material = ShaderMaterial.new()
material.shader = shader
material.set_shader_parameter("strength",1.0)
effect.material = material
add_child(effect)
$Status.text = "실제 화면 텍스처 반전"''',[('후처리 재질 생성','s.has_node("Effect") and s.get_node("Effect").material is ShaderMaterial'),('반전 강도1','s.has_node("Effect") and s.get_node("Effect").material.get_shader_parameter("strength")==1.0')])
add('gpu-particles','CPU 파티클 수명과 발생량 조절하기','CPUParticles3D를 만들고 amount=32, lifetime=1.5, emitting=true로 설정하세요.', '''mesh.visible = false
var particles = CPUParticles3D.new()
particles.name = "Particles"
particles.mesh = SphereMesh.new()
particles.amount = 32
particles.lifetime = 1.5
particles.initial_velocity_min = 1.0
particles.initial_velocity_max = 2.0
particles.scale_amount_min = 0.08
particles.scale_amount_max = 0.12
particles.gravity = Vector3(0,-1,0)
particles.emitting = true
stage.add_child(particles)
$Status.text = "CPU particles: 32 / 1.5s"''',[('실제 파티클 시스템','s.has_node("Preview/World/Stage/Particles")'),('수명과 발생량','s.has_node("Preview/World/Stage/Particles") and s.get_node("Preview/World/Stage/Particles").amount==32 and s.get_node("Preview/World/Stage/Particles").lifetime==1.5')],stage='3d',scope='이 웹 과제는 CPU 파티클을 실제로 실행합니다. GPU 파티클·particle shader·GPU 성능은 설치형 렌더러에서 별도로 확인해야 합니다.',substitute=True)
add('async-loading','동기 로드 후 프레임마다 씬 배치하기','token.tscn을 한 번 불러온 뒤 네 인스턴스를 한 프레임에 하나씩 배치하고 진행률을 표시하세요.', '''var packed: PackedScene = load("res://fixtures/token.tscn")
for i in range(4):
	await get_tree().process_frame
	var item = packed.instantiate()
	item.name = "Loaded" + str(i)
	item.position = Vector2(220+i*80,180)
	add_child(item)
	$Status.text = "Loaded: %d/4" % [i+1]''',[('네 인스턴스 배치','s.has_node("Loaded0") and s.has_node("Loaded3")'),('완료 진행률',S+'.text=="Loaded: 4/4"')],scope='프레임별 인스턴스 배치를 실제로 실행합니다. 파일 읽기 자체는 load()로 동기 처리하며, 별도 스레드 I/O를 수행하는 실습은 아닙니다.',substitute=True)
add('physics-interpolation','보간 모드 켜고 순간이동하기','Player의 physics_interpolation_mode를 ON으로 설정하고 (400,180)으로 옮긴 뒤 reset_physics_interpolation을 호출하세요.', '''$Player.physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
$Player.position = Vector2(400,180)
$Player.reset_physics_interpolation()
$Status.text = "Teleport: (400, 180)"''',[('보간 모드 ON',P+'.physics_interpolation_mode==Node.PHYSICS_INTERPOLATION_MODE_ON'),('순간이동 도착점',P+'.position==Vector2(400,180)')],scope='노드의 실제 보간 설정과 순간이동 API를 실행합니다. 이 정지 장면의 검사는 보간 이력 초기화 호출 여부나 화면의 부드러움을 자동 판정하지 않습니다.',substitute=True)
add('navigation-avoidance','회피 서버 응답으로 이동하기','Player 아래 Agent를 만들고 velocity_computed로 받은 안전 속도를 이동에 사용하세요.', '''NavigationServer2D.set_active(true)
NavigationServer2D.map_set_active(get_world_2d().navigation_map,true)
var agent = NavigationAgent2D.new()
agent.name = "Agent"
agent.avoidance_enabled = true
agent.max_speed = 100
$Player.add_child(agent)
agent.target_position = Vector2(600,180)
agent.velocity_computed.connect(func(safe_velocity: Vector2):
	$Player.position += safe_velocity / 60.0
	set_meta("safe_velocity",safe_velocity)
)
$Status.text = "회피 서버 응답으로 이동"''',[('회피 기능 활성화','s.has_node("Player/Agent") and s.get_node("Player/Agent").avoidance_enabled'),('실제 safe_velocity 수신','s.has_meta("safe_velocity") and s.get_meta("safe_velocity").length()>0'),('Player 이동',P+'.position.x>130')],preamble='func _physics_process(_delta: float) -> void:\n\tvar agent = get_node_or_null("Player/Agent")\n\tif agent:\n\t\tagent.velocity = Vector2(100,0)\n')
add('runtime-state','일시 정지와 재개 연결하기','SceneTree를 정지하고 process_always 타이머로 0.4초 뒤 재개하세요.', '''get_tree().paused = true
$Status.text = "Paused"
await get_tree().create_timer(0.4,true).timeout
get_tree().paused = false
$Status.text = "Resumed"''',[('SceneTree 재개','not s.get_tree().paused'),('재개 문구',S+'.text=="Resumed"')])
add('network-snapshots','주어진 두 좌표 사이를 보간하기','sample_position 함수에서 0~1로 제한한 비율로 lerp하세요. (100,180)과 (300,180)의 중간점을 Player에 적용하세요.', '''$Player.position = sample_position(Vector2(100,180),Vector2(300,180),0.5)
$Status.text = "Snapshot X: " + str($Player.position.x)''',[('중간 좌표 X200',P+'.position.x==200'),('다른 샘플의 경계도 제한','s.has_method("sample_position") and s.sample_position(Vector2.ZERO,Vector2(10,0),2.0)==Vector2(10,0)')],preamble='func sample_position(a: Vector2, b: Vector2, ratio: float) -> Vector2:\n\treturn a.lerp(b,clampf(ratio,0.0,1.0))\n',scope='GDScript로 실제 좌표 보간 함수를 실행합니다. 네트워크 패킷이나 서버 지연은 발생시키지 않고 입력 스냅샷을 코드로 제공합니다.',substitute=True)
add('compute-shaders','CPU 배열로 버퍼 값 두 배 만들기','double_buffer 함수로 모든 float를 두 배로 바꾸고 to_byte_array로 변환한 실제 바이트 길이를 출력하세요.', '''var result = double_buffer(PackedFloat32Array([1,2,3,4]))
var bytes = result.to_byte_array()
set_meta("bytes",bytes)
$Status.text = "Float32 bytes: " + str(bytes.size())
print(result)''',[('버퍼 결과16바이트','s.has_meta("bytes") and s.get_meta("bytes").size()==16'),('다른 배열도 두 배 계산','s.has_method("double_buffer") and s.double_buffer(PackedFloat32Array([3,7]))==PackedFloat32Array([6,14])')],preamble='func double_buffer(values: PackedFloat32Array) -> PackedFloat32Array:\n\tvar output = values.duplicate()\n\tfor i in range(output.size()):\n\t\toutput[i] *= 2.0\n\treturn output\n',scope='Web Compatibility는 컴퓨트 셰이더를 지원하지 않습니다. 이 과제는 CPU에서 버퍼 변환·범위 처리를 실행합니다. GPU dispatch·동기화·성능은 설치형 Forward+/Mobile 실습이 필요합니다.',substitute=True)
# Function lessons start with deliberately incomplete helpers, not solved functions.
for id,old,new in [
 ('gdscript-data','\tvar total: int = 0\n\tfor price in prices:\n\t\ttotal += price\n\treturn total','\t# TODO: 배열을 순회해 합계를 반환하세요.\n\treturn 0'),
 ('loop','\tframes += 1','\t# TODO: frames를 증가시키세요.\n\tpass'),
 ('network-snapshots','\treturn a.lerp(b,clampf(ratio,0.0,1.0))','\t# TODO: ratio를 제한하고 lerp하세요.\n\treturn a'),
 ('compute-shaders','\tvar output = values.duplicate()\n\tfor i in range(output.size()):\n\t\toutput[i] *= 2.0\n\treturn output','\t# TODO: 입력을 복제한 뒤 각 값을 두 배로 만드세요.\n\treturn values')]:
 OUT[id]['starter']=OUT[id]['starter'].replace(old,new)
from review import apply
apply(OUT)
assert len(OUT)==59,len(OUT)
Path('src/data/expanded-workshops.json').write_text(json.dumps(OUT,ensure_ascii=False,indent=2)+chr(10))
print('Generated',len(OUT),'workshops')
