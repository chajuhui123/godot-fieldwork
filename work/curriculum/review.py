"""Editorial corrections and outcome checks, reviewed against Godot 4.5 (2026-11-05)."""
def apply(out):
 def check(id,label,expr,requires_rendering=False):
  import json
  l=out[id]; l['checker']=l['checker'].replace('\n\t]\n',',\n\t\t'+json.dumps({'name':label,'requires_rendering':requires_rendering},ensure_ascii=False)[:-1]+',"pass":bool('+expr+')}\n\t]\n');l['expected']+=' · '+label
 def scope(id,text):out[id]['scope']=' '.join(filter(None,[out[id]['scope'],text]))
 P='s.get_node("Player")'; M='s.get_node("Preview/World/Stage/Mesh")'
 check('instancing','두 인스턴스의 좌표와 원본 씬','s.has_node("A") and s.has_node("B") and s.get_node("A").position==Vector2(240,180) and s.get_node("B").position==Vector2(400,180) and s.get_node("A").scene_file_path=="res://fixtures/token.tscn" and s.get_node("B").scene_file_path=="res://fixtures/token.tscn"')
 check('first-3d-loop','카메라 위치 (0,0,5)','s.get_node("Preview/World/Stage/Camera").position.is_equal_approx(Vector3(0,0,5))')
 check('3d-transforms','Y축 45도 회전','absf('+M+'.rotation_degrees.y-45)<0.1')
 check('paths','중앙 Y=180 및 씬 경로','s.has_node("Token") and s.get_node("Token").position.y==180 and s.get_node("Token").scene_file_path=="res://fixtures/token.tscn"')
 check('groups-autoload','세 적 모두 숨김','s.get_tree().get_nodes_in_group("enemies").all(func(n): return not n.visible)')
 check('tilemaps','지정한 두 셀의 타일','s.has_node("Tiles") and s.get_node("Tiles") is TileMapLayer and s.get_node("Tiles").get_cell_source_id(Vector2i(0,0))==0 and s.get_node("Tiles").get_cell_source_id(Vector2i(1,0))==0')
 check('containers','세 버튼 문구와 타입','s.has_node("Menu") and s.get_node("Menu") is VBoxContainer and s.get_node("Menu").get_child_count()==3 and s.get_node("Menu").get_children().all(func(n): return n is Button) and s.get_node("Menu").get_children().map(func(n): return n.text)==["Play","Settings","Quit"]')
 check('pbr-material','구리색 Albedo',M+'.material_override is StandardMaterial3D and '+M+'.material_override.albedo_color.is_equal_approx(Color(0.8,0.4,0.2))')
 check('global-illumination','흰색 환경광 모드','s.get_node("Preview/World/Stage/Environment").environment.ambient_light_source==Environment.AMBIENT_SOURCE_COLOR and s.get_node("Preview/World/Stage/Environment").environment.ambient_light_color.is_equal_approx(Color.WHITE)')
 check('occlusion-culling','QuadOccluder3D 리소스','s.has_node("Preview/World/Stage/Occluder") and s.get_node("Preview/World/Stage/Occluder") is OccluderInstance3D and s.get_node("Preview/World/Stage/Occluder").occluder is QuadOccluder3D')
 check('multimesh','세 인스턴스의 위치','s.has_node("Preview/World/Stage/Batch") and s.get_node("Preview/World/Stage/Batch").multimesh.instance_count==3 and [0,1,2].all(func(i): return s.get_node("Preview/World/Stage/Batch").multimesh.get_instance_transform(i).origin.is_equal_approx(Vector3((i-1)*1.5,0,0)))',requires_rendering=True)
 check('gpu-particles','CPU 파티클 방출 중','s.has_node("Preview/World/Stage/Particles") and s.get_node("Preview/World/Stage/Particles") is CPUParticles3D and s.get_node("Preview/World/Stage/Particles").emitting')
 check('async-loading','네 인스턴스 모두 존재','[0,1,2,3].all(func(i): return s.has_node("Loaded"+str(i)))')
 check('network-snapshots','음수·중간 비율과 다른 좌표','s.has_method("sample_position") and s.sample_position(Vector2(2,4),Vector2(10,12),-1)==Vector2(2,4) and s.sample_position(Vector2(2,4),Vector2(10,12),0.25).is_equal_approx(Vector2(4,6))')
 check('compute-shaders','빈 배열·음수·소수 입력','s.has_method("double_buffer") and s.double_buffer(PackedFloat32Array()).is_empty() and s.double_buffer(PackedFloat32Array([-2,0.5]))==PackedFloat32Array([-4,1])')
 # The old goal omitted movement even though the checker required it.
 l=out['exported-properties'];old=l['goal'];l['goal']='@export speed의 기본값을 200으로 선언하세요. Inspector가 전달한 speed를 Status에 출력하고, Player의 X에 한 번 더하세요. 기본 Inspector 값 90에서는 X=210입니다.';l['starter']=l['starter'].replace(old,l['goal']);l['steps'][1][1]=l['goal']
 check('exported-properties','speed가 내보낸 속성','s.get_property_list().any(func(p): return p.name=="speed" and (p.usage & PROPERTY_USAGE_EDITOR)!=0)')
 # Delta must not assume 60 physics ticks per second.
 out['navigation-avoidance']['solution']=out['navigation-avoidance']['solution'].replace('safe_velocity / 60.0','safe_velocity * get_physics_process_delta_time()')
 scope('navigation-avoidance','이 과제는 장애물이 없는 단일 에이전트의 회피 속도 콜백을 연결합니다. 목적지까지의 경로 추종이나 여러 장애물 회피를 검증하지 않습니다.')
 scope('first-2d-loop','검사는 약 2초 뒤 생성된 노드와 문구를 확인합니다. 0.3초 간격과 세 개 뒤 생성 중지는 실행 화면에서 직접 확인하세요.')
 scope('run-debug','자동 검사는 Status 문구를 확인합니다. print_tree_pretty의 실제 트리 출력은 Console에서 직접 확인하세요.')
 scope('input','Space 입력은 참고 코드에서 Input.parse_input_event로 주입합니다. 자동 검사는 액션 설정과 최종 위치를 확인하며, 사용자가 키를 누르는 이벤트 루프 과제는 아닙니다.')
 check('input','Space 키가 dash에 연결됨','InputMap.has_action("dash") and InputMap.action_get_events("dash").any(func(e): return e is InputEventKey and e.physical_keycode==KEY_SPACE)')
 scope('object-memory','자동 검사는 노드 제거와 출력 결과를 확인합니다. 해제된 Node 변수는 null이 아닐 수 있으므로 is_instance_valid 또는 WeakRef로 생존 여부를 검사하세요.')
 scope('rendering-rid','자동 검사는 RID 생성만 확인합니다. 사각형의 위치·크기·색상과 종료 시 RID 해제 코드는 직접 확인하세요.')
 scope('thread-safety','자동 검사는 Result 노드의 존재를 확인합니다. call_deferred 사용과 호출 순서는 코드를 함께 확인하세요.')
 scope('export-profile','여기서는 노드 생성·해제와 개수를 관찰합니다. Profiler의 CPU·GPU 시간 측정이나 내보낸 빌드 성능 검증은 하지 않습니다.')
 scope('runtime-state','자동 검사는 재개 후 상태와 문구를 확인합니다. 실제로 0.4초 동안 정지하는 과정은 화면에서 확인하세요.')
 scope('mesh-lod','검사는 기본 카메라의 먼 거리 결과만 확인합니다. 가까운 거리로 이동한 결과는 직접 비교하세요.')
 scope('shader-uv','이번 과제는 텍스처 파일 대신 UV로 줄무늬를 계산합니다. 텍스처 sampler의 repeat/filter 설정은 별도 응용입니다.')
 scope('shader-dissolve','노이즈 디졸브의 기초로 UV.x 임계값을 사용합니다. 노이즈 텍스처를 사용하는 효과는 응용 단계입니다.')
 for id in ['shaders','shader-uv','shader-dissolve','vertex-displacement','shader-fresnel','screen-shaders']:
  scope(id,'자동 검사는 재질·uniform 설정을 확인하며 셰이더 수식이나 렌더링된 픽셀의 정답까지 판정하지 않습니다. 화면에서 효과를 비교하세요.')
 check('vertex-displacement','분할된 PlaneMesh',M+'.mesh is PlaneMesh and '+M+'.mesh.subdivide_width>=32 and '+M+'.mesh.subdivide_depth>=32')
 # get_shader_parameter is safe only after checking the material type.
 out['screen-shaders']['checker']=out['screen-shaders']['checker'].replace('s.has_node("Effect") and s.get_node("Effect").material.get_shader_parameter','s.has_node("Effect") and s.get_node("Effect").material is ShaderMaterial and s.get_node("Effect").material.get_shader_parameter')
 for l in out.values():l['assessment']='자동 검사는 아래에 표시된 실행 상태를 확인합니다. 같은 결과를 만드는 모든 코드의 구현 과정이나 개념 이해까지 판정하지는 않습니다.'
