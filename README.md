# Godot Fieldwork

Godot 4.x 공식 문서를 바탕으로 만든 한국어 학습 서비스입니다. 시작하기·설명서·엔진 상세 정보·3D 심화·셰이더·VFX·시스템 심화에 총 65개 레슨이 있습니다.

전체 65개 레슨에서 GDScript를 직접 작성하고 실제 Godot 실행 화면·콘솔·자동 검사를 확인합니다. 각 과제에는 시작 코드, 작성 힌트와 참고 코드, 프로젝트 다운로드가 있습니다.

## 실행하기

React 19, TypeScript, Vite로 만든 한국어 Godot 실습 사이트입니다. Node.js 22.12 이상(또는 20.19 이상)이 필요합니다.

```sh
npm ci
npm run dev
```

기본 주소는 http://127.0.0.1:4175/ 입니다. Vite가 앱과 Godot 실행 파일을 함께 제공하므로 개발 중에는 별도 엔진 서버가 필요하지 않습니다. 같은 주소에 이미 정적 서버가 실행 중이면 해당 서버를 종료한 뒤 개발 서버를 켜세요. 다른 포트는 `npm run dev -- --port 5173`로 지정합니다. 브라우저 저장소는 주소와 포트별로 나뉘므로 기존 학습 기록을 이어가려면 원래 주소를 사용하세요.

```sh
npm run build    # TypeScript 검사 및 dist/ 생성
npm run preview  # 빌드한 사이트 확인
```

배포할 폴더는 `dist/`입니다. 호스팅 서버는 `runtime/` 파일에 `Access-Control-Allow-Origin: *`를 설정하고 WASM을 `application/wasm`으로 제공해야 합니다. 별도 런타임 호스트를 쓰려면 빌드 전에 `VITE_GODOT_RUNTIME_URL`을 지정하세요(예: `https://example.org/runtime/`). 기존 4175 정적 서버에 CORS 설정이 없으면 로컬에서만 포트 4176의 `python3 runtime-src/server.py --port 4176` 서버를 사용합니다.

## 프로젝트 구조

- `src/components/`: 홈, 헤더, 목차, 레슨, 퀴즈, 심화 문제
- `src/data/`: 6개 과정의 수업 순서, 개념, 실습 코드·채점 조건, 출처
- `src/workshop/`: CodeMirror 편집기, Scene/Inspector, 실행 세션, 프로젝트 ZIP 다운로드
- `src/styles/`: 기존 디자인과 반응형 레이아웃
- `public/`: Pretendard, 이미지, 출처 안내, 배포 가능한 Godot 4.5.1 WASM 런타임
- `runtime-src/`: 게임을 구성하고 실제 노드 상태를 채점하는 Godot 프로젝트

홈은 기본 URL과 `#home`, 수업은 `#editor`처럼 기존 해시 주소로 엽니다. 진도는 `godot-fieldwork-progress-v1`, 코드와 Inspector 설정은 `godot-workshop-v1:<수업 ID>`에 기존 형식 그대로 저장합니다.

## 엔진 및 수업 검증

모든 실습은 WebGL 2를 지원하는 브라우저에서 실제 GDScript를 실행합니다. 첫 실행에 약 40MB의 엔진·프로젝트 파일을 불러옵니다. 실행 세션은 sandbox iframe, 송신 창 확인, 세션 토큰으로 분리하고, 수업을 떠나거나 정지하면 정리합니다. 실습용 검사이며 사용자의 코드를 신뢰하는 보안 경계로 쓰지는 않습니다.

```sh
npm test
FIELDWORK_GODOT=/path/to/Godot npm test  # 실제 엔진에서 참고 코드와 미완성 코드 대조
npx playwright install chromium
npm run test:browser                    # 작성 → 실행 → 채점 → 수업 이동
```

확장 수업을 수정한 뒤 `python3 work/curriculum/build.py`로 JSON을 다시 생성하세요. 출처 안내는 `python3 work/content-review/build-credits.py`로 생성합니다. 엔진을 다시 내보낼 때만 Godot 4.5.1과 동일 버전 Web 템플릿이 필요합니다.

```sh
python3 runtime-src/build.py --godot /path/to/Godot --templates /path/to/templates
```

### 출처 및 교육 내용 검수 (2026-11-05)

서비스의 `credits.html`에 문서·로고·엔진·글꼴·편집기 출처와 라이선스를 표시합니다. 수업별 영어 4.5 기술 참고 링크를 추가했으며, 다운로드 프로젝트도 출처 안내를 포함합니다. 자세한 수정·검증 범위와 남은 한계는 [CONTENT_REVIEW.md](CONTENT_REVIEW.md)를 참고하세요. 자체 제작 코드 전체의 오픈소스 라이선스를 새로 부여한 것은 아닙니다.


### 소개 홈
기본 URL과 `#home`은 소개 홈을 엽니다. 수업 URL(예: `#editor`)은 그대로 사용할 수 있습니다. 헤더 로고로 홈으로 돌아오면 실행 중인 Godot 런타임을 정리합니다. 홈 구성은 `src/components/Home.tsx`, 스타일은 `src/styles/home.css`와 `src/styles/home-editorial.css`에 있습니다. 저장소 공개 시 “서비스 저장소”의 준비 중 문구를 실제 GitHub 링크로 교체하세요. 홈 이미지의 출처는 `public/assets/home/ATTRIBUTION.txt`에 있습니다.
