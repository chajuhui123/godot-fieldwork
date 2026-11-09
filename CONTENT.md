# Learning content scope

Updated 2026-11-03. This is a curated course, not complete coverage of the Godot documentation or class API. There are now 65 lessons: 12 getting-started, 23 manual, 12 engine-related, 6 advanced 3D, 6 shaders/VFX, and 6 advanced systems. Engine-related lessons also use relevant manual tutorials. XR, C#, platform-specific details, advanced rigging/animation and the full class reference remain outside this course's coverage.

Every lesson now contains a concise concept and misconception, the existing foundational practice and quiz, a two-condition scenario lab with feedback, an advanced multiple-response question, and a task for the real editor. Nine lessons have visual or calculated models (position, frame rate, anchors, coordinates, timeline, resource sharing, collision filtering, audio routing and tick frequency); the other labs are configuration or debugging scenarios. These do not execute Godot, GDScript, networking or audio.

Six end-of-part capstones combine concepts: a complete dodge-game round, a persistent responsive settings menu, an editor plugin with correct registration and cleanup, a 3D render-budget scene, a hit-to-dissolve effect, and a loading/interpolation test room. Their checklists are self-reported, not automatic certification.

## Advanced expansion

The 18 new lessons use the same concept, misconception, practice, scenario lab, quiz, advanced multiple-response and real-editor task structure. Prerequisite links are suggestions, not gates. Existing stored lesson IDs and progress are preserved; all progress denominators now come from the loaded curriculum. The sidebar exposes three new sections and a course jump selector.

- 3D: camera projection/clipping, PBR/color space, GI, mesh LOD, occlusion, MultiMesh partitioning.
- Shaders/VFX: UV sampling, vertex displacement, dissolve, Fresnel approximation, screen-reading shaders, GPU particles.
- Systems: threaded loading, physics interpolation, navigation avoidance, pause/state boundaries, network snapshot interpolation, compute dispatch.

Ten advanced topics include diagram or arithmetic models. Shader patterns are browser SVG/math models, not compiled Godot shaders. The LOD distances are deliberately artificial and are not Godot's automatic LOD algorithm. Triangle reduction is not a measured FPS improvement. Snapshot interpolation is an application policy built above networking, not a promise of automatic RPC behavior. Fresnel is explicitly labeled an artistic approximation. No CPU/GPU/network benchmark results are fabricated.

Official per-lesson URLs are stored in dist/curriculum-advanced.js. Sources include Camera3D, StandardMaterial3D, GI, mesh LOD, occlusion, MultiMesh, shader language/spatial shaders, screen-reading shaders, particles, threaded loading, physics interpolation, NavigationAgents, pausing, multiplayer, and compute shader documentation. The tutorials may carry version-specific notes; students should verify their installed engine, renderer and platform.

Advanced validation: all 18 lessons rendered in-browser without console errors; course-jump and prerequisite navigation were exercised. The test suite now has 15 passing tests over all 65 lesson records, including new checks for projection, dissolve monotonicity, Fresnel values, particle rates and compute bounds.

## Sources and version policy

The existing per-lesson official URLs are normalized from `/ko/4.x/` to `/ko/stable/`. The supplied 4.x documentation currently identifies itself as the latest unstable documentation, so links now explicitly follow stable. Stable is a moving version; students should compare their installed version and menu names. TileMapLayer requires a sufficiently recent Godot 4 release.

All 47 lesson links returned HTTP 200 during validation. This verifies reachability, not exhaustive editorial validation of all linked pages. High-risk distinctions were checked against official documentation:

- [CharacterBody movement and velocity](https://docs.godotengine.org/en/stable/tutorials/physics/using_character_body_2d.html): distinguish speed from displacement; move_and_slide handles timestep.
- [Anchors and offsets](https://docs.godotengine.org/en/stable/tutorials/ui/size_and_anchors.html): horizontal anchors and both edge offsets.
- [Resource sharing](https://docs.godotengine.org/en/stable/tutorials/scripting/resources.html): sharing, uniqueness and reference semantics.
- [Thread-safe APIs](https://docs.godotengine.org/en/stable/tutorials/performance/thread_safe_apis.html): active SceneTree and shared-data synchronization are separate concerns.
- [High-level multiplayer](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html): RPC authority, validation and platform constraints.
- [TileMaps](https://docs.godotengine.org/en/stable/tutorials/2d/using_tilemaps.html): TileMapLayer, shared TileSet and collision definitions.
- [AnimationTree](https://docs.godotengine.org/en/stable/tutorials/animation/animation_tree.html): animation source and state transitions.
- [Editor plugins](https://docs.godotengine.org/en/stable/tutorials/plugins/editor/making_plugins.html): tool script and registration/cleanup.

## Progress and assessment

Existing practice/quiz records keep their original meaning and still gate the next lesson. The header explicitly says basic completion. Additional lab, challenge, transfer and capstone states use separate properties in the same stored lesson object. A failed retry does not revoke an earned completion. A real-editor checkbox can be unchecked. Changing a form clears old result feedback; each successful submission explicitly validates the current settings. FPS and preview sliders are exploration variables.

Legacy choice arrays that accidentally combined three options were repaired. The main-loop activity no longer asserts one mandatory sequence for initialization, input, physics and rendering. Quiz explanations now remain visible until the learner retries; delayed resets can no longer replace another lesson's quiz.

## Validation

`node --test tests/learning-depth.test.cjs` checks 65-lesson completeness, answer reachability, varied deterministic choice order, frame-rate independence, anchor margins, interpolation, shared resources, collision conditions, audio routing, advanced models and legacy repairs. Fifteen tests passed.

Browser validation: all 47 lessons rendered with their new model; no console errors. Anchor wrong/correct submissions, resize, advanced retry and saved completion were exercised. At 390px, the model stacks vertically with no page overflow. Godot-editor tasks are authored assignments, not engine-run test results.


## Core making workshops (2026-11-03)

Six lessons now replace their basic simulator and extra lab with GUI assembly, editable GDScript, ZIP project delivery, actual execution in official web/native Godot, observations and extension tasks: editor, nodes, signals, attach-script, delta-motion, input-events. Other lessons retain their existing simulation format. The site does not execute or parse GDScript, emulate outcomes, or automatically grade Godot. Drafts and observations use a separate localStorage namespace. Completion requires a self-reported workshop record plus the existing quiz, preserving earlier progress data.

Each ZIP contains project.godot, main.tscn, main.gd and task README. Starter scenes deliberately omit Beacon, Timer connections or script attachment where the learner must perform those GUI actions. Reference ZIPs contain the finished scene and code. Downloaded current-code ZIPs do not contain changes made in a separate Godot editor; the UI explains copying code and backing up editor sources.

Verification: Godot 4.5.1 headless executed all 12 starter/reference projects. Assertions verified position, local/global coordinates, script attachment/color/text, actual timer signal increments, delta displacement and Input actions. Browser checks verify draft preservation across navigation, downloaded ZIP content, unfinished-record validation and legacy lesson visibility. No browser/GPU rendering equivalence is claimed by headless tests.

GUI reference images are unmodified Godot 4.5 documentation images, attributed in the interface and bundled under CC BY 3.0 with LICENSE.txt. They are explicitly reference screenshots, not captures of these exercise projects. Sources: https://docs.godotengine.org/en/4.5/getting_started/introduction/first_look_at_the_editor.html and https://docs.godotengine.org/en/stable/tutorials/editor/using_the_web_editor.html.

## Embedded execution update (2026-11-04)

The same six workshops now run edited GDScript inside the service using the official Godot 4.5.1 single-threaded debug Web export. CodeMirror provides syntax highlighting, line numbers, undo and indentation; the Godot runtime itself compiles code with GDScript.reload and instantiates the configured scene. Game rendering, print/error logs, node snapshots and target checks are live engine results. Scene/Inspector controls are a limited course-specific interface, not the complete native editor. Changes apply on the next run. The code executes locally in a sandboxed opaque-origin iframe; there is no server-side user-code execution.

The earlier download-only workflow and self-reported completion are replaced for those six lessons. engineWorkshop progress requires a successful runtime result; old practice/workshop records are preserved but not treated as runtime pass records. Other 59 lessons retain their earlier activities. Runtime checks are instructional outcome checks, not tamper-resistant assessment. The optional project download includes current scene properties and source.

Verification includes all six reference and six unfinished submissions through runtime.gd (positive and negative outcomes), browser compilation errors with actual line numbers, print output, Timer, input actions, script attachment and Korean rendering. Godot and bundled dependency license notices ship with the runtime. Official technical references: https://docs.godotengine.org/en/4.5/classes/class_javascriptbridge.html and https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html.


## 전체 수업 실행 확장
전체 65개 레슨을 CodeMirror + 실제 Godot WASM 실행 과제로 연결했습니다. 59개 신규 과제는 개별 시작 코드·참고 코드·실제 노드 상태 검사기를 갖습니다. 3D 뷰포트와 셰이더도 실제 엔진에서 렌더링합니다. 웹 미지원 주제는 범위를 표시한 관련 기초 과제로 제공합니다. FE에서 건너오기 섹션은 제거했습니다. 기존 학습 기록은 유지합니다.
네이티브 테스트는 저장 경로만 임시 프로젝트로 바꾸어 호스트 사용자 데이터 쓰기를 피합니다. 브라우저에서는 user:// 저장을 별도로 확인합니다.
