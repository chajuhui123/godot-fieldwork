from pathlib import Path
import json,html
rows=json.loads(Path('work/content-review/lessons.json').read_text())
sources={}
for row in rows:
 ref=row['docs'].replace('/ko/','/en/').replace('/stable/','/4.5/')
 ref=ref.replace('/engine_api/custom_godot_servers.html','/architecture/custom_godot_servers.html').replace('/engine_details/engine_api/gdextension/index.html','/tutorials/scripting/gdextension/index.html')
 sources[row['id']]={'title':row['title'],'docs':row['docs'],'reference':ref}
Path('src/data/sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')
notice='''Godot Fieldwork — 출처 및 권리 안내

독립적으로 제작한 비공식 학습 서비스입니다. Godot Engine 개발팀의 제작·후원·승인을 의미하지 않습니다.
서비스 코드·디자인과 직접 창작한 콘텐츠: © 2026 Juhee Cha
https://github.com/chajuhui123
라이선스: 소스 코드 MIT, 직접 작성한 수업 콘텐츠 CC BY 4.0 (https://github.com/chajuhui123/godot-fieldwork)
이 표시는 아래 원문·로고·엔진·외부 구성 요소의 권리를 포함하거나 대체하지 않습니다.

Godot Engine documentation
원저자: Juan Linietsky, Ariel Manzur, and the Godot Engine community
한국어 번역: Godot 문서 번역 커뮤니티 (https://github.com/godotengine/godot-docs-l10n)
원문: https://docs.godotengine.org/ko/4.x/
버전별 기술 참고: https://docs.godotengine.org/en/4.5/
라이선스: Creative Commons Attribution 3.0 Unported (CC BY 3.0)
https://creativecommons.org/licenses/by/3.0/
변경: 원문 개념을 한국어로 요약·재서술하고, 학습 순서를 재구성했습니다. 퀴즈·시작 코드·참고 코드·채점 조건·웹 실행 환경을 추가했습니다. 원문 인용 또는 각색 부분에 원문 라이선스가 적용되며, 원문에 대한 권리를 추가로 제한하지 않습니다.
배포물의 editor-guide 이미지 세 개는 공식 에디터 소개 자료에서 가져온 화면 예시입니다. 크기·형식 변환 또는 일부 영역 발췌가 포함될 수 있습니다.
이미지 출처: https://docs.godotengine.org/en/stable/getting_started/introduction/first_look_at_the_editor.html
홈의 Godot 3D/Script 에디터 화면과 2D/3D 게임 예시: Godot Engine documentation 4.5 (동일 저자, CC BY 3.0). 원본 파일 수정 없음. 웹 페이지에서 크기 조절 및 애니메이션 정지 화면 표시.
출처 목록: assets/home/ATTRIBUTION.txt
서비스 실습 화면 스크린샷: © 2026 Juhee Cha. 포함된 Godot 로고·엔진 및 외부 구성 요소는 각각의 라이선스 유지.
수업별 원문 링크는 수업 화면과 credits.html의 목록에서 확인할 수 있습니다.

Godot Engine 4.5.1
Copyright (c) 2014-present Godot Engine contributors.
Copyright (c) 2007-2014 Juan Linietsky, Ariel Manzur.
MIT License: runtime/GODOT-LICENSE.txt
Third-party notices: runtime/GODOT-COPYRIGHT.txt
https://godotengine.org/license/

Godot Engine Logo
Copyright (c) 2017 Andrea Calabró
CC BY 4.0 International: https://creativecommons.org/licenses/by/4.0/
홈 애니메이션 아이콘: https://raw.githubusercontent.com/godotengine/godot/4.5.1-stable/icon.svg
아이콘 원본은 수정하지 않고 CSS로 위치와 회전을 애니메이션 처리했습니다.
출처: https://godotengine.org/press/
원저작권 고지: assets/GODOT-LOGO-LICENSE.txt
Godot 엔진을 나타내기 위해 사용하며, Fieldwork의 자체 로고나 공식 인증으로 사용하지 않습니다.
헤더와 파비콘의 Fieldwork 표식은 Godot 로고와 별개로 직접 만든 것입니다.

Pretendard
Copyright (c) 2021 Kil Hyung-jin, with Reserved Font Name Pretendard.
SIL Open Font License 1.1: fonts/OFL.txt
https://github.com/orioncactus/pretendard

React, React DOM 및 Scheduler
각 원저자의 MIT 라이선스: REACT-LICENSES.txt

CodeMirror 및 번들 구성 요소
각 원저자의 저작권과 MIT 라이선스: EDITOR-LICENSES.txt
'''
Path('public/ATTRIBUTION.txt').write_text(notice)
# Bundled downloads retain source credits without requiring a network request.
Path('src/data/attribution.json').write_text(json.dumps(notice,ensure_ascii=False)+'\n')
items='\n'.join('<li><a href="index.html#'+html.escape(k)+'">'+html.escape(v['title'])+'</a> · <a href="'+html.escape(v['docs'])+'">원문</a> · <a href="'+html.escape(v['reference'])+'">4.5 기술 참고</a></li>' for k,v in sources.items())
page='''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>출처와 라이선스 - Godot Fieldwork</title><link rel="icon" type="image/svg+xml" href="favicon.svg"><link rel="stylesheet" href="credits.css"></head><body>
<main><nav><a href="index.html">← 학습으로 돌아가기</a></nav><h1>출처와 라이선스</h1>
<p>Godot Fieldwork는 Juhee Cha가 제작한 <strong>비공식 한국어 학습 서비스</strong>입니다. Godot Engine 개발팀의 제작·후원·승인을 의미하지 않습니다.</p>
<section><h2>Godot 공식 문서</h2><p>원저자: Juan Linietsky, Ariel Manzur, and the Godot Engine community. 한국어 번역은 <a href="https://github.com/godotengine/godot-docs-l10n">Godot 문서 번역 커뮤니티</a>의 작업을 참고했습니다.</p><p><a href="https://docs.godotengine.org/ko/4.x/">Godot Engine documentation</a>은 <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>으로 제공됩니다. <a href="assets/editor-guide/LICENSE.txt">라이선스 전문</a></p><p>원문 개념을 요약·재서술하고 학습 순서를 바꾸어 퀴즈·실습 코드·채점 조건을 추가했습니다. 원문 인용·각색 부분의 권리는 원저자에게 있으며 원문 라이선스가 적용됩니다. 에디터 소개 이미지에는 크기·형식 변환이나 영역 발췌가 포함될 수 있습니다. <a href="https://docs.godotengine.org/en/stable/getting_started/introduction/first_look_at_the_editor.html">이미지 출처</a></p></section>
<section><h2>홈 이미지</h2><p>Godot 4.5 공식 문서의 <a href="https://docs.godotengine.org/en/4.5/getting_started/introduction/first_look_at_the_editor.html">3D·Script 에디터 화면</a>, <a href="https://docs.godotengine.org/en/4.5/getting_started/first_2d_game/index.html">Dodge the Creeps!</a>, <a href="https://docs.godotengine.org/en/4.5/getting_started/first_3d_game/index.html">Squash the Creeps</a> 플레이 이미지. 원저자: Juan Linietsky, Ariel Manzur, and the Godot Engine community. <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>. 원본 파일은 수정하지 않았으며 웹에서 크기를 조절하고 애니메이션의 정지 화면을 표시합니다. <a href="assets/home/ATTRIBUTION.txt">개별 이미지 출처</a></p><p>서비스 실습 화면 스크린샷은 © 2026 Juhee Cha. 포함된 로고와 외부 구성 요소의 권리는 각 원저자에게 있습니다.</p></section>
<section><h2>엔진·로고·편집기·글꼴</h2><ul>
<li>Godot Engine 4.5.1 — Godot Engine contributors; Juan Linietsky, Ariel Manzur. <a href="runtime/GODOT-LICENSE.txt">MIT 라이선스</a> · <a href="runtime/GODOT-COPYRIGHT.txt">엔진 구성 요소</a></li>
<li>Godot Engine Logo — © 2017 Andrea Calabró. <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · <a href="https://godotengine.org/press/">공식 배포처</a> · <a href="assets/GODOT-LOGO-LICENSE.txt">원저작권 고지</a>. Godot 엔진을 나타내기 위해서만 사용하며 서비스 로고로 쓰지 않습니다. 홈의 <a href="assets/home/godot-icon.svg">Godot 아이콘</a>은 <a href="https://github.com/godotengine/godot/blob/4.5.1-stable/icon.svg">공식 저장소</a>에서 가져왔으며 같은 저자와 라이선스가 적용됩니다. 원본 수정 없이 CSS 애니메이션을 추가했습니다.</li>
<li>React, React DOM, Scheduler — <a href="REACT-LICENSES.txt">원저자 및 라이선스 전문</a></li>
<li>CodeMirror 및 번들 구성 요소 — <a href="EDITOR-LICENSES.txt">원저자 및 라이선스 전문</a></li>
<li>Pretendard — © 2021 Kil Hyung-jin. <a href="https://github.com/orioncactus/pretendard">배포처</a> · <a href="fonts/OFL.txt">SIL OFL 1.1</a></li></ul></section>
<section><h2>Fieldwork 제작물</h2><p>서비스 코드·디자인과 직접 창작한 콘텐츠: © 2026 <a href="https://github.com/chajuhui123">Juhee Cha</a>. 소스 코드는 <a href="https://github.com/chajuhui123/godot-fieldwork/blob/main/LICENSE">MIT</a>, 직접 작성한 퀴즈·실습 과제·채점 조건·설명 글은 <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>으로 공개합니다. 공식 문서를 요약·재구성한 부분은 원문의 CC BY 3.0을 따릅니다. 이 표시는 Godot 문서·엔진·로고와 외부 구성 요소의 권리를 포함하거나 대체하지 않습니다.</p><p><a href="ATTRIBUTION.txt">출처 안내 텍스트 받기</a></p></section>
<section><h2>학습 범위와 검수 기준</h2><p>실행 엔진은 Godot 4.5.1입니다. 한국어 문서는 stable 버전이 갱신될 수 있어 수업별로 영어 4.5 기술 참고 링크도 제공합니다. 65개 수업의 개념·퀴즈·시작 코드·참고 코드·자동 검사 조건을 대조했습니다. 검수 기록: 2026년 11월 5일.</p><p>자동 검사는 표시된 실행 상태를 확인합니다. 코드의 모든 구현 과정, 셰이더 픽셀 결과, 실제 성능 향상이나 전체 주제 숙련도를 보장하지 않습니다. 웹에서 지원하지 않는 기능은 각 과제의 실행 범위에 관련 기초 실습임을 표시합니다.</p><p>이 검수는 프로젝트 내부 검수이며 Godot 문서팀의 검수·승인이 아닙니다.</p></section>
<section><h2>수업별 참고 문서</h2><ol class="source-list">'''+items+'''</ol></section></main></body></html>'''
Path('public/credits.html').write_text(page)
Path('public/credits.css').write_text('''@font-face{font-family:Pretendard;src:url("fonts/PretendardVariable.woff2") format("woff2");font-weight:100 900;font-display:swap}*{box-sizing:border-box}body{margin:0;background:#fbfcfe;color:#25344b;font:16px/1.7 Pretendard,sans-serif}main{max-width:864px;margin:auto;padding:48px 32px 96px}h1{font-size:32px;line-height:1.3;margin:40px 0 24px}h2{font-size:20px;line-height:1.4;margin:0 0 16px}section{margin-top:48px}p{margin:16px 0}ul,ol{padding-left:24px}li{margin:12px 0}a{color:#344f74;text-underline-offset:4px;transition:color 160ms ease}a:hover{color:#17263d}a:focus-visible{outline:2px solid #577ba8;outline-offset:4px}::selection{background:#dce6f4}.source-list{font-size:14px}@media(max-width:600px){main{padding:32px 24px 64px}h1{font-size:28px}section{margin-top:40px}}
''')
