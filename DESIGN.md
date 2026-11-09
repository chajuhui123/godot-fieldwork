# Godot Fieldwork UI

The learning workspace follows the user's Anti-Slop Implementation constraints.

- Mode: operate and read; start with an exercise, then explain the distinction.
- Typography: self-hosted Pretendard Variable throughout, including controls and the simulation. No Inter. Heading 32px/1.25 (28px/1.3 on mobile), section 20px/1.4, body 16px/1.6, supporting text 14px, metadata 12px.
- Colors: page #FAFAF7, navigation #F0F1ED, text #242925, secondary #5A625B, rule #D6DAD3, action #345B48, selected #E5ECE5, error #983E32.
- Spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96px. Desktop sections 64px; wide screens 96px; mobile 48px.
- Composition: 248px navigation and one reading column, capped at 1040px including padding. Reference information appears inline; hints use native details disclosure.
- Choices and quizzes are rows separated by rules, without surrounding cards. Signal connections retain two columns because the connection is the exercise itself.
- No decorative logo tile, completion stamp, A/B/C section badge, marketing filler, gradients, or large shadows. Dark chrome is limited to the simulated Godot editor.
- Corners: square content, 4px interactive controls. Hover changes background or text over 160ms; reduced-motion disables transitions. Focus uses a 2px green outline; the dark simulator uses a light green outline.
- Responsive: every reference and exercise control remains available on narrow screens, including Inspector. Navigation scrolls independently; the document must not overflow horizontally.

The refinement layer is dist/refined.css; the original stylesheet retains the simulation's base structure. Content, completion IDs, and localStorage progress are unchanged.

## SEED-inspired content refinement

Only `.lesson-workspace` is restyled by `dist/seed-content.css`. Header, navigation, breakpoints, and outer column geometry are preserved. This is a vanilla HTML adaptation, not an installation of SEED React or a claim of exact token equivalence.

Sources: https://seed-design.io/react/components/action-button, https://seed-design.io/react/components/select-box, https://seed-design.io/react/components/typography/text.

The user's subsequent direction overrides the orange palette: content uses navy actions (#28364D), blue-gray selection borders (#496585), pale selection surfaces (#E8EEF6), positive feedback (#237345), and critical feedback (#B12E34). Controls have 4px corners, 48px minimum action height, subtle interaction backgrounds, and blue keyboard focus. Choice buttons expose pressed state. Existing 4/8px spacing and no-shadow constraints continue to apply.

The final layer, dist/godot-content.css, adds restrained editor details: thin section separators, property-panel surfaces, and navy simulation docks and tabs. Header/navigation geometry and colors remain unchanged; the font is updated globally. The navy palette is an adaptation, not an exact copy of every Godot theme token. Reference: https://github.com/godotengine/godot/blob/master/editor/themes/editor_theme_manager.cpp.

Pretendard v1.3.9 is included locally under dist/fonts, with its SIL Open Font License. Source: https://github.com/orioncactus/pretendard.

## Expanded learning content

The main reading column now includes a brief concept, additional lab, advanced question and real-editor transfer task. The course scope is available in a disclosure, explicitly distinguishing selected coverage from the full official documentation. Three capstones appear at the end of their respective parts.

The advanced expansion adds three sidebar groups (six lessons each) and a compact native course selector. Prerequisite links appear beside concepts. The shell dimensions remain unchanged. All six groups now end in a self-reported capstone. Diagram-only shader and 3D models use the same navy preview surface and clearly distinguish illustrative calculations from actual Godot rendering.

Content separators now appear only before practice, assessment and real-editor transfer. Title rows, introductory disclosures, concept sections, hints and the footer use spacing instead of extra rules. Functional simulator boundaries and control outlines remain. Native selects share a 48px height, reserved chevron space and explicit light/dark color schemes. Truncated selected text is repeated in a wrapping description below the field, recalculated on resize. Disclosures share a single aligned chevron and retain native keyboard behavior.

Labs use navy editor-like chrome with labeled native controls and an adjacent result model; below 780px, controls and preview stack. They are labeled simulations, never presented as actual engine execution. Real-editor task completion is explicitly self-reported. Existing global typography and shell geometry stay intact. See CONTENT.md for the curriculum and validation scope.

## Direct-making workshops

The first six selected core lessons use real Godot project files and replace their two simulation blocks. A single-column workshop pairs concrete GUI instructions with attributed official screenshots, a navy editable GDScript textarea, ZIP/copy actions and observed-result notes. No fake run button or JS interpretation is used. Code execution happens in the official web editor (separate tab) or native Godot. Starter and reference projects differ in deliberate GUI assembly steps. Keyboard Tab indentation includes Esc-to-exit guidance; the layout collapses to one column on narrow screens. Completion is explicitly self-reported and is separate from prior simulator completion.

## Embedded code and game workspace

The six core workshops now place a CodeMirror editor beside a real Godot game canvas and compact course-specific Scene/Inspector controls. A single toolbar exposes Run, Run and check, Stop and engine loading/error states. Console and tests appear below the workspace. The incumbent sidebar, page shell, navy palette and Pretendard are preserved. Code highlighting uses pale blue/cyan/green/orange tokens on #202A3B with readable contrast. Narrow layouts stack the editor and game without document overflow. The native Godot reference workflow is optional disclosure content. No external editor or ZIP transfer is required for the core exercise.


## 전체 수업 실행 확장
전체 65개 레슨을 CodeMirror + 실제 Godot WASM 실행 과제로 연결했습니다. 59개 신규 과제는 개별 시작 코드·참고 코드·실제 노드 상태 검사기를 갖습니다. 3D 뷰포트와 셰이더도 실제 엔진에서 렌더링합니다. 웹 미지원 주제는 범위를 표시한 관련 기초 과제로 제공합니다. FE에서 건너오기 섹션은 제거했습니다. 기존 학습 기록은 유지합니다.
네이티브 테스트는 저장 경로만 임시 프로젝트로 바꾸어 호스트 사용자 데이터 쓰기를 피합니다. 브라우저에서는 user:// 저장을 별도로 확인합니다.


## Intro home — 2026-11-05
- Empty hash and #home open an introductory home; existing lesson hashes remain deep links. The header brand returns home and disposes the live runtime.
- Home extends the navy/Pretendard system: flat, asymmetric image/text sections; 48px desktop gutters, 24px mobile gutters; 96px section spacing. No nested cards.
- Official editor and tutorial images are explicitly distinguished from the service's own screenshot; source/license entries are in assets/home/ATTRIBUTION.txt and credits.html. Gameplay starts paused with an accessible play/stop control.
- Repository is not public yet: a non-interactive “GitHub 저장소 · 공개 준비 중” label, separate from the active creator link.

Home copy refinement: use descriptive headings (“Godot 실습 노트”, “코드 작성과 실행”, “만든 이유”) and concrete lesson examples instead of slogans or reassurance. Preserve source images, navy controls and the existing layout. Use a pale reading surface around the workshop screenshot, with numbered instruction rows instead of three promotional columns.

Brand name is Godot Fieldwork in the header, page title, home heading and footer. Avoid decorative middle dots; use spacing or natural phrasing for metadata, while retaining useful grouping in lesson content. Favicon: white uppercase G on #252d3e, assets served as favicon.svg.

## Softer game-service theme — 2026-11-05
User requested a cute, rounder game-service feel and an unmistakable footer. The final playful.css layer preserves Pretendard and the Godot navy, replaces cold gray-blue reading backgrounds with warm paper #fffaf0 and oat #f3ecdc, and uses muted gold #f0c875 for the primary action and selected lesson. Buttons use 12–14px radii, previews 16–20px; editor text/layout remain unchanged. Footer is now full-width navy, separated by 80px desktop/64px mobile from the final content, with small creator/repository/source information inside it. No gradients, mascots, promotional copy or decorative cards added.

Palette override requested by user: #142755 (navy text/sidebar/footer), #5C8AFF (learning introduction panel, selected lesson and interactive accents), #F1F1E6 (page background), #F9CA42 (primary actions and dark-surface focus). Secondary text, borders and hover colors are mixtures of these four colors. Keep semantic error colors and syntax highlighting where they communicate state. The earlier warm palette is superseded; rounded shape and layout remain. Favicon/theme-color use #142755.

Shape correction: user reverted the round treatment while retaining the four-color palette. Controls return to 4px radii; section backgrounds, footer and preview images have square corners. Remove raised button borders and press translation. Full-width navy footer remains distinct from the content.

## Visual rollback — 2026-11-05
User requested reverting to before the palette/rounded-design review. Remove playful.css from page entry points; incumbent styles through home.css are again authoritative. Restore navy/light reading surfaces, 4px controls and the compact integrated footer. Preserve Godot Fieldwork naming, G favicon, removed introduction, small metadata, learning content and the responsive visibility fix. The later warm and four-color experiments above are historical, not active design guidance.

## Editorial home — 2026-11-05
The user's reference is [SNOW careers](https://recruit.snowcorp.com/main.do): a simple animated asset and learning CTA at the top, followed by clean title/subtitle/image/content sections. This section supersedes earlier homepage styling guidance only; existing lesson interiors, learning styles and runtime behavior remain authoritative and unchanged.

- `dist/home-editorial.css` is the final homepage layer, scoped through `.home` and unique home classes. Use white sections, a pale #E8F1F7 hero stage, #243449 text and a navy #293D58 primary action with 4px corners and a 48px minimum height. Retain local Pretendard.
- The official Godot icon performs one 3.6-second greeting animation. `dist/home-hero.js` supports explicit replay; reduced-motion shows the static asset and hides replay. Preserve icon source/license attribution in the credits generator.
- Home title: 40px desktop, 32px mobile. Section headings: 32px/28px; body: 16px. Main content width: 1200px including 48px desktop or 24px mobile gutters. Main sections use 64px top/96px bottom padding, changing to 48px/64px at 780px and below.
- Keep large images and clear text hierarchy without decorative cards. Stack image/text layouts on mobile. The home footer uses a quiet #F3F5F7 surface; this does not redefine lesson chrome or navigation.

Home hero follow-up: the Godot icon now loops seamlessly over 4.8 seconds; the former replay control is a pause/resume control. Reduced-motion remains static. Intro space grows to 80px/96px desktop and 64px/80px mobile padding, with a 48px/36px title and 56px primary action. Other sections and lessons remain unchanged.

## Learning spacing refinement — 2026-11-05
lesson-spacing.css is the scoped final layer for lesson spacing. Normalize 16px related text, 24–32px groups and 40–56px stage separation. Remove accumulated workshop-bottom/quiz-top whitespace and empty feedback gaps. Align heading/status rows; grid the runtime toolbar, with equal-width action buttons on mobile. Results and console share heading spacing; hints have consistent native disclosure arrows and padding. No palette, curriculum, grading or runtime changes. Verified editor lesson hints and 390px toolbar alignment without horizontal overflow.

Learning reading refinement: reference https://careers.daangn.com/blog/post/workshop-vertical-cpg/ uses left-aligned 16px/32px paragraphs with 32px paragraph margins and centered three-dot breaks. Adapt those values to lesson prose with max-width 728px; preserve wide code/game workspace. Replace only stage rules (workshop, practice, quiz, transfer) with decorative three-dot SVG pseudo-elements and 48px spacing on each side (32px mobile). Keep functional editor/input/choice borders.

Follow-up spacing: increase lesson prose paragraph margins to 40px, heading-to-copy gaps to 32px, and dot-break spacing to 64px per side on desktop / 48px on mobile. Deep exercise separation is 80px desktop / 64px mobile. Preserve compact editor controls.

Latest requested spacing step: prose margins 48px; title-to-body spacing 40px; dot breaks 80px per side on desktop / 64px mobile; deep exercise separation 96px desktop / 80px mobile.
