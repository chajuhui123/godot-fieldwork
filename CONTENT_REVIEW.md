# 출처·교육 콘텐츠 내부 검수 기록

검수일: 2026-11-05 (Asia/Seoul). 실행 기준: Godot 4.5.1, Web Compatibility.

## 범위

65개 수업의 핵심 개념·주의점·기본 퀴즈·심화 정답을 읽고, 실습 목표와 시작/참고 코드·채점 조건을 대조했다. 공식 문서의 버전별 API와 웹 제약을 확인했다. 링크 접근 확인은 사실 검증과 별도로 기록한다. 이 기록은 프로젝트 내부 검수이며 Godot 팀의 승인이나 모든 구현에 대한 정확성 보증이 아니다.

## 수정 사항

- 문서 원저자·한국어 번역 커뮤니티·CC BY 3.0·요약/각색 사실을 명시했다.
- Godot 로고 Andrea Calabró/CC BY 4.0, 엔진 MIT/외부 구성 요소, CodeMirror, Pretendard OFL을 안내했다.
- Juhee Cha의 서비스 제작물과 제3자 권리를 구분하고 비공식 서비스임을 헤더와 출처 페이지에 표시했다.
- 사이드바와 수업에서 출처에 접근하며 다운로드 프로젝트에 ATTRIBUTION.txt를 동봉한다.
- 한국어 stable 자료를 유지하면서 실제 엔진 버전에 맞는 영어 4.5 기술 참고를 65개 수업에 추가했다. 4.5에서 다른 위치에 있는 서버/GDExtension 경로를 바로잡았다.
- @export 과제 설명에 누락된 Player 이동을 추가하고 실제 내보낸 속성인지 검사한다.
- 인스턴스 좌표·원본 경로, 3D 회전, 모든 그룹 멤버 숨김, 타일 셀 위치, 버튼 문구/타입, PBR 색상, 환경광 모드/색상, 오클루더 리소스, MultiMesh 위치, 파티클 방출, 로딩 노드, 보간 경계값, 버퍼 경계 입력, Space 매핑, PlaneMesh 분할 검사를 보강했다.
- 회피 예제의 고정 1/60초 이동을 실제 physics delta 사용으로 바꿨다. 단일 에이전트 속도 콜백 과제임을 명시했다.
- 리소스 경로 및 내보낸 속성 퀴즈를 각 수업 주제에 맞췄다. 노드 트리 심화 답안에는 충돌체의 부모 관계를 명시했다.
- 디졸브 설명에서 노이즈만으로 한정한 표현을 고쳤다. 수동 LOD와 샘플 보간을 모의 실행으로 오해할 표현을 고쳤다.
- 자동 검사 통과 문구를 검사 범위에 한정했다. 픽셀 결과·정확한 타이밍·API 호출 과정·성능 등 확인하지 못하는 항목은 실습 범위에 표시했다.

## 검증 결과

- 기존/확장 테스트 23개 통과. 신규 59개 수업의 참고/미완성 118건과 부분 오답 10건, 합계 128건을 실제 네이티브 엔진에서 대조했다.
- 추가 출처 테스트 3개 통과: 65개 출처 매핑, 라이선스 파일 링크, 기본 프로젝트 다운로드의 출처 보존.
- 네이티브 headless의 dummy 렌더러는 MultiMesh 인스턴스 좌표를 반환하지 않으므로 해당 검사 한 항목은 headless 판정에서 제외한다. 브라우저의 실제 WebGL 렌더러에서 올바른 배치 통과/간격을 바꾼 배치 미통과를 모두 확인했다. 브라우저 수업에서는 이 검사를 제외하지 않는다.
- 브라우저에서 @export·회피 physics delta·분할 메시 참고 코드를 실행하고 모든 조건 통과 및 Console 오류 없음을 확인했다.
- 65개 기존 원문 링크와 65개 영어 4.5 링크에 HTTP 200 응답을 확인했다. 중복 URL을 포함한 수업별 항목 수다.
- 저장 테스트의 네이티브 경로는 호스트 사용자 데이터 권한 때문에 임시 프로젝트 경로로 대체한다. 웹 user:// 저장은 이전 브라우저 검증으로 확인했고 이번 변경에서 저장 구현은 수정하지 않았다.

## 남아 있는 검수 한계

자동 검사는 결과 상태의 일부를 검사하며 소스코드 의미 분석이나 부정행위 방지용 채점기가 아니다. 셰이더 식/픽셀·성능·실제 네트워크·GPU 컴퓨트·엔진 컴파일·EditorPlugin 전체 기능을 검증했다고 표현하지 않는다. 제한된 심화 과제는 관련 기초 실습으로 표시한다. 전체 공식 문서/API를 포괄하지 않는다. 모바일·모든 브라우저 조합의 엔진 호환성과 초보 학습자의 교육 효과는 이번 검수 범위 밖이다. 외부 제안 전 공개 배포와 별도의 Godot 경험자/학습자 사용 검토가 권장된다.

## 수업별 대조 목록

각 행은 개념/퀴즈/목표/참고 코드/채점 조건의 내부 대조를 마쳤음을 뜻한다. 별도 범위가 없는 항목도 자동 채점은 표시한 조건만 확인한다.

| 수업 | 실제 과제 및 범위 | Godot 4.5 참고 |
| --- | --- | --- |
| 에디터 지도 | 핵심 GUI 설정·GDScript 실행 과제. 자동 검사 조건 외 동작은 직접 비교. | [공식 문서](https://docs.godotengine.org/en/4.5/getting_started/introduction/first_look_at_the_editor.html) |
| 노드와 씬 | 핵심 GUI 설정·GDScript 실행 과제. 자동 검사 조건 외 동작은 직접 비교. | [공식 문서](https://docs.godotengine.org/en/4.5/getting_started/step_by_step/nodes_and_scenes.html) |
| 시그널 연결 | 핵심 GUI 설정·GDScript 실행 과제. 자동 검사 조건 외 동작은 직접 비교. | [공식 문서](https://docs.godotengine.org/en/4.5/getting_started/step_by_step/signals.html) |
| 프로젝트 매니저 | 프로젝트 설정 읽고 바꾸기 — 프로젝트 설정 API를 실제로 실행합니다. 프로젝트 생성 창과 렌더러 변경은 설치형 에디터에서 진행하며, 이 값만 바꿔 실행 중 캔버스 크기가 바뀌지는 않습니다. | [공식 문서](https://docs.godotengine.org/en/4.5/getting_started/introduction/first_look_at_the_editor.html) |
| 씬 인스턴스 | 같은 씬에서 두 인스턴스 만들기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/getting_started/step_by_step/instancing.html) |
| 스크립트 붙이기 | 핵심 GUI 설정·GDScript 실행 과제. 자동 검사 조건 외 동작은 직접 비교. | [공식 문서](https://docs.godotengine.org/en/4.5/getting_started/step_by_step/scripting_first_script.html) |
| 델타와 이동 | 핵심 GUI 설정·GDScript 실행 과제. 자동 검사 조건 외 동작은 직접 비교. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/scripting/idle_and_physics_processing.html) |
| 입력 이벤트 | 핵심 GUI 설정·GDScript 실행 과제. 자동 검사 조건 외 동작은 직접 비교. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/inputs/inputevent.html) |
| 첫 2D 게임 구조 | 타이머로 적 세 개 생성하기 — 검사는 약 2초 뒤 생성된 노드와 문구를 확인합니다. 0.3초 간격과 세 개 뒤 생성 중지는 실행 화면에서 직접 확인하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/getting_started/first_2d_game/index.html) |
| 충돌체와 Area | 겹치는 Area2D 감지하기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html) |
| 첫 3D 게임 구조 | 3D 장면의 카메라 설정하기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/getting_started/first_3d_game/index.html) |
| 실행과 디버그 | 없는 노드를 안전하게 검사하기 — 실제 노드 조회와 Console 출력을 연습합니다. 중단점·Remote 디버거는 설치형 에디터에서 사용합니다. 자동 검사는 Status 문구를 확인합니다. print_tree_pretty의 실제 트리 출력은 Console에서 직접 확인하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/scripting/debug/overview_of_debugging_tools.html) |
| 리소스와 경로 | res:// 리소스를 불러오기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/scripting/resources.html) |
| Input Map | 새 Input Map 액션 등록하기 — Space 입력은 참고 코드에서 Input.parse_input_event로 주입합니다. 자동 검사는 액션 설정과 최종 위치를 확인하며, 사용자가 키를 누르는 이벤트 루프 과제는 아닙니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/inputs/inputevent.html) |
| Control과 앵커 | 오른쪽 위에 Label 고정하기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/ui/size_and_anchors.html) |
| 에셋 가져오기 | 이미지에서 실제 Texture 만들기 — 런타임 이미지→텍스처 변환 실습입니다. PNG Import 독의 압축·재가져오기는 전체 에디터에서 진행합니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/assets_pipeline/import_process.html) |
| 커스텀 Resource | Resource 복제와 공유 비교하기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/scripting/resources.html) |
| GDScript 기본 문법 | 배열을 함수로 집계하기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/scripting/gdscript/gdscript_basics.html) |
| 내보낸 속성 | 내보낸 속성을 인스턴스에서 바꾸기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/scripting/gdscript/gdscript_exports.html) |
| 그룹과 Autoload | 그룹 전체를 찾아 변경하기 — 실제 Group 일괄 변경 실습입니다. Autoload 등록은 프로젝트 설정에서 별도로 진행합니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/scripting/singletons_autoload.html) |
| 2D 좌표계 | 로컬과 전역 좌표 변환하기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/2d/2d_transforms.html) |
| TileMap과 TileSet | 실제 TileMapLayer에 타일 칠하기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/2d/using_tilemaps.html) |
| 2D 물리 바디 | CharacterBody2D 실제 이동시키기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html) |
| 3D Transform | 3D Transform 바꾸기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/3d/using_transforms.html) |
| Control 컨테이너 | VBoxContainer로 메뉴 만들기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/ui/gui_containers.html) |
| UI 테마 | Theme 리소스로 Label 꾸미기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/ui/gui_skinning.html) |
| AnimationPlayer | 애니메이션 트랙 재생하기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/animation/introduction.html) |
| AnimationTree | AnimationTree로 애니메이션 구동하기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/animation/animation_tree.html) |
| 오디오 버스 | 오디오 버스 음량 조절하기 — 실제 오디오 버스 설정을 검사합니다. 이 과제에는 음원 파일이 없어 소리는 재생하지 않습니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/audio/audio_buses.html) |
| 셰이더와 Material | 셰이더 uniform으로 색 바꾸기 — 자동 검사는 재질·uniform 설정을 확인하며 셰이더 수식이나 렌더링된 픽셀의 정답까지 판정하지 않습니다. 화면에서 효과를 비교하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/shaders/introduction_to_shaders.html) |
| 내비게이션 | 내비게이션 맵에서 경로 얻기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/navigation/navigation_introduction_2d.html) |
| 게임 저장 | 파일에 저장하고 다시 읽기 — 실제 가상 파일 시스템에 저장합니다. 정지하거나 새 엔진을 띄우면 지워지는 연습용 저장 공간이며 영구 게임 저장은 아닙니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/io/saving_games.html) |
| 고수준 멀티플레이어 | 멀티플레이어 권한 확인하기 — 실제 MultiplayerAPI의 권한 분기를 오프라인 피어에서 실행합니다. 두 브라우저 간 네트워크 연결·RPC 전송은 이 과제에서 수행하지 않습니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/networking/high_level_multiplayer.html) |
| 현지화 | Translation 리소스로 번역하기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/i18n/internationalizing_games.html) |
| 내보내기와 프로파일링 | 노드 수를 측정하고 줄이기 — 런타임 메모리·노드 계측 과제입니다. 플랫폼별 실행 파일 내보내기와 에디터 Profiler는 설치형 에디터에서 진행합니다. 여기서는 노드 생성·해제와 개수를 관찰합니다. Profiler의 CPU·GPU 시간 측정이나 내보낸 빌드 성능 검증은 하지 않습니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/scripting/debug/the_profiler.html) |
| 메인 루프 | 콜백 횟수 직접 관찰하기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/scripting/idle_and_physics_processing.html) |
| 렌더링 흐름 | 그리기 순서 바꾸기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/engine_details/architecture/internal_rendering_architecture.html) |
| 편집기와 내보내기 | 에디터와 게임 실행 구분하기 — 현재 실행 바이너리의 실제 특성을 확인합니다. 에디터 빌드·내보내기 템플릿 제작 자체는 설치형 개발 환경이 필요합니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_dedicated_servers.html) |
| Object와 메모리 | queue_free 이후 참조 검사하기 — 자동 검사는 노드 제거와 출력 결과를 확인합니다. 해제된 Node 변수는 null이 아닐 수 있으므로 is_instance_valid 또는 WeakRef로 생존 여부를 검사하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/best_practices/node_alternatives.html) |
| SceneTree 알림 | 노드 수명주기 시그널 받기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/scripting/scene_tree.html) |
| 서버 아키텍처 | PhysicsServer의 바디 RID 확인하기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/engine_details/architecture/custom_godot_servers.html) |
| 렌더러 선택 | 현재 렌더러를 조회하기 — 브라우저는 Compatibility(gl_compatibility)로 실행됩니다. Forward+와 Mobile로 전환하는 실습은 설치형 Godot이 필요합니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/rendering/renderers.html) |
| RenderingServer와 RID | RenderingServer로 사각형 그리기 — 자동 검사는 RID 생성만 확인합니다. 사각형의 위치·크기·색상과 종료 시 RID 해제 코드는 직접 확인하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/engine_details/architecture/internal_rendering_architecture.html) |
| 스레드 안전성 | 노드 변경을 지연 실행하기 — 단일 스레드 Web 엔진에서 실제 deferred 호출을 연습합니다. Worker Thread와 스레드 간 안전성 검증은 설치형 엔진에서 별도 수행합니다. 자동 검사는 Result 노드의 존재를 확인합니다. call_deferred 사용과 호출 순서는 코드를 함께 확인하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/performance/thread_safe_apis.html) |
| 엔진 컴파일 | 실행 중인 엔진 빌드 정보 읽기 — 엔진 소스 컴파일 자체는 브라우저에서 실행할 수 없습니다. 여기서는 실행된 엔진의 실제 빌드 메타데이터를 검사합니다. 소스·SCons 빌드는 별도 개발 환경 과제입니다. | [공식 문서](https://docs.godotengine.org/en/4.5/engine_details/development/compiling/index.html) |
| 모듈과 GDExtension | ClassDB에서 타입 기능 확인하기 — 실제 ClassDB 리플렉션을 연습합니다. C++ 모듈 컴파일과 GDExtension 바이너리 로딩은 이 Web 런타임에서 지원하지 않습니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/scripting/gdextension/index.html) |
| 에디터 플러그인 | 도구 패널의 등록과 해제 — 실행 중 Control 패널의 수명 관리를 실습합니다. EditorPlugin 등록·에디터 독 확장은 전체 Godot 에디터 전용이며 여기서는 실행하지 않습니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/plugins/editor/making_plugins.html) |
| 카메라 투영과 클리핑 | 직교 카메라로 바꾸기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/classes/class_camera3d.html) |
| PBR 재질과 색 공간 | PBR 재질의 거칠기 바꾸기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/3d/standard_material_3d.html) |
| 간접광과 GI (환경광 대체) | 환경광으로 어두운 면 밝히기 — Compatibility에서 실제 환경광을 조절합니다. SDFGI·VoxelGI의 간접광 계산을 대체하거나 실행하는 과제는 아닙니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/3d/global_illumination/introduction_to_global_illumination.html) |
| 메시 LOD와 화면 크기 | 거리로 메시 해상도 바꾸기 — 실제 메시를 바꾸는 수동 LOD 과제입니다. 가져온 메시의 자동 LOD 생성·화면 픽셀 오차 기반 선택은 에디터 Import 실습에서 별도로 확인합니다. 검사는 기본 카메라의 먼 거리 결과만 확인합니다. 가까운 거리로 이동한 결과는 직접 비교하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/3d/mesh_lod.html) |
| 가려진 물체와 오클루전 | 가림 객체와 뷰포트 설정하기 — 가림 객체와 컬링 설정을 실제 엔진에 등록합니다. 검사 통과는 프레임 성능 향상이나 특정 GPU 드로 콜 감소를 보장하지 않습니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/3d/occlusion_culling.html) |
| MultiMesh와 공간 분할 | MultiMesh로 세 큐브 그리기 — 표시된 노드·속성 결과 검사 | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/performance/using_multimesh.html) |
| UV와 텍스처 샘플링 | UV 반복으로 줄무늬 만들기 — 이번 과제는 텍스처 파일 대신 UV로 줄무늬를 계산합니다. 텍스처 sampler의 repeat/filter 설정은 별도 응용입니다. 자동 검사는 재질·uniform 설정을 확인하며 셰이더 수식이나 렌더링된 픽셀의 정답까지 판정하지 않습니다. 화면에서 효과를 비교하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/shaders/shader_reference/shading_language.html) |
| 정점 변위와 메시 밀도 | 정점 셰이더로 표면 흔들기 — 자동 검사는 재질·uniform 설정을 확인하며 셰이더 수식이나 렌더링된 픽셀의 정답까지 판정하지 않습니다. 화면에서 효과를 비교하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/shaders/your_first_shader/your_first_3d_shader.html) |
| 디졸브와 임계값 | discard로 표면 절반 없애기 — 노이즈 디졸브의 기초로 UV.x 임계값을 사용합니다. 노이즈 텍스처를 사용하는 효과는 응용 단계입니다. 자동 검사는 재질·uniform 설정을 확인하며 셰이더 수식이나 렌더링된 픽셀의 정답까지 판정하지 않습니다. 화면에서 효과를 비교하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/shaders/shader_reference/spatial_shader.html) |
| Fresnel과 시선 방향 | 시선 방향으로 가장자리 밝히기 — 자동 검사는 재질·uniform 설정을 확인하며 셰이더 수식이나 렌더링된 픽셀의 정답까지 판정하지 않습니다. 화면에서 효과를 비교하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/shaders/shader_reference/spatial_shader.html) |
| 화면 텍스처와 후처리 | 화면 텍스처 후처리하기 — 자동 검사는 재질·uniform 설정을 확인하며 셰이더 수식이나 렌더링된 픽셀의 정답까지 판정하지 않습니다. 화면에서 효과를 비교하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/shaders/screen-reading_shaders.html) |
| GPU 파티클 (CPU 파티클 대체) | CPU 파티클 수명과 발생량 조절하기 — 이 웹 과제는 CPU 파티클을 실제로 실행합니다. GPU 파티클·particle shader·GPU 성능은 설치형 렌더러에서 별도로 확인해야 합니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/3d/particles/properties.html) |
| 비동기 로딩 (동기 로드 대체) | 동기 로드 후 프레임마다 씬 배치하기 — 프레임별 인스턴스 배치를 실제로 실행합니다. 파일 읽기 자체는 load()로 동기 처리하며, 별도 스레드 I/O를 수행하는 실습은 아닙니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/io/background_loading.html) |
| 물리 보간 (부드러움 미채점) | 보간 모드 켜고 순간이동하기 — 노드의 실제 보간 설정과 순간이동 API를 실행합니다. 이 정지 장면의 검사는 보간 이력 초기화 호출 여부나 화면의 부드러움을 자동 판정하지 않습니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/physics/interpolation/using_physics_interpolation.html) |
| 내비게이션 회피와 이동 | 회피 서버 응답으로 이동하기 — 이 과제는 장애물이 없는 단일 에이전트의 회피 속도 콜백을 연결합니다. 목적지까지의 경로 추종이나 여러 장애물 회피를 검증하지 않습니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/navigation/navigation_using_navigationagents.html) |
| 게임 상태와 일시 정지 | 일시 정지와 재개 연결하기 — 자동 검사는 재개 후 상태와 문구를 확인합니다. 실제로 0.4초 동안 정지하는 과정은 화면에서 확인하세요. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/scripting/pausing_games.html) |
| 네트워크 스냅샷 (좌표 보간 모델) | 주어진 두 좌표 사이를 보간하기 — GDScript로 실제 좌표 보간 함수를 실행합니다. 네트워크 패킷이나 서버 지연은 발생시키지 않고 입력 스냅샷을 코드로 제공합니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/networking/high_level_multiplayer.html) |
| 컴퓨트 셰이더 (CPU 배열 모델) | CPU 배열로 버퍼 값 두 배 만들기 — Web Compatibility는 컴퓨트 셰이더를 지원하지 않습니다. 이 과제는 CPU에서 버퍼 변환·범위 처리를 실행합니다. GPU dispatch·동기화·성능은 설치형 Forward+/Mobile 실습이 필요합니다. | [공식 문서](https://docs.godotengine.org/en/4.5/tutorials/shaders/compute_shaders.html) |
