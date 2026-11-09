import { useRef, useState } from "react";
import type { ResumeTarget } from "../resume";

function GameDemo({ src, alt }: { src: string; alt: string }) {
  const image = useRef<HTMLImageElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false),
    [captured, setCaptured] = useState(false);
  function freeze() {
    const img = image.current,
      still = canvas.current;
    if (!img?.naturalWidth || !still) return;
    still.width = img.naturalWidth;
    still.height = img.naturalHeight;
    still.getContext("2d")?.drawImage(img, 0, 0);
    setCaptured(true);
  }
  return (
    <>
      <div className="home-demo">
        <canvas
          ref={canvas}
          hidden={playing || !captured}
          role="img"
          aria-label={alt + " (정지 화면)"}
        />
        <img
          ref={image}
          src={src}
          alt={alt}
          hidden={!playing}
          onLoad={() => {
            if (!playing) freeze();
          }}
        />
        <p className="home-demo-paused" hidden={playing || captured}>
          재생 버튼을 눌러 게임 장면을 보세요.
        </p>
      </div>
      <button
        className="home-demo-toggle"
        type="button"
        aria-pressed={playing}
        onClick={() => {
          if (playing) freeze();
          setPlaying(!playing);
        }}
      >
        {playing ? "재생 멈추기" : "플레이 장면 재생"}
      </button>
    </>
  );
}
export function Home({ resume }: { resume: ResumeTarget | null }) {
  const [paused, setPaused] = useState(false);
  return (
    <main id="home" className="home" tabIndex={-1}>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-stage" aria-label="Godot 아이콘 애니메이션">
          <div
            className={
              "home-godot-asset is-playing" + (paused ? " is-paused" : "")
            }
          >
            <img
              src="assets/home/godot-icon.svg"
              width="176"
              height="176"
              alt="Godot 엔진 아이콘"
              fetchPriority="high"
            />
            <span className="home-asset-shadow" aria-hidden="true"></span>
          </div>
          <button
            className="home-replay"
            type="button"
            aria-label={
              paused
                ? "Godot 아이콘 애니메이션 재생"
                : "Godot 아이콘 애니메이션 일시정지"
            }
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={paused ? "M8 5l11 7-11 7Z" : "M8 5v14M16 5v14"} />
            </svg>
          </button>
        </div>
        <div className="home-intro home-width">
          <h1 id="home-title">Godot Fieldwork</h1>
          <p className="home-lead">
            GDScript를 직접 쓰고, 실행하며 배우는 Godot.
          </p>
          {resume ? (
            <div className="home-resume">
              <a className="home-primary" href={"#" + resume.lesson.id}>
                이어하기{" "}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 12h15m-6-6 6 6-6 6" />
                </svg>
              </a>
              <p className="home-resume-note">
                {resume.source === "last" ? "마지막 수업" : "다음 수업"} ·{" "}
                {String(resume.number).padStart(2, "0")} {resume.lesson.title}
                {resume.done ? " (완료)" : ""}
              </p>
              <a className="home-text-link" href="#editor">
                처음부터 보기
              </a>
            </div>
          ) : (
            <a className="home-primary" href="#editor">
              학습 바로가기{" "}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15m-6-6 6 6-6 6" />
              </svg>
            </a>
          )}
        </div>
      </section>

      <section
        id="home-method"
        className="home-method"
        aria-labelledby="method-title"
      >
        <div className="home-width">
          <div className="home-section-intro">
            <h2 id="method-title">직접 해보는 학습</h2>
            <p className="home-subtitle">
              코드를 고치면, 실행 결과도 달라집니다.
            </p>
            <p>
              짧게 개념을 확인한 뒤 시작 코드를 수정합니다. 실행 화면과 검사
              결과를 보며 무엇이 달라졌는지 확인하세요.
            </p>
          </div>
          <figure className="home-service-image">
            <a
              href="assets/home/fieldwork-workspace.png"
              target="_blank"
              rel="noopener"
              aria-label="Godot Fieldwork 화면 크게 보기 (새 탭)"
            >
              <img
                src="assets/home/fieldwork-workspace.png"
                width="1280"
                height="720"
                alt="Godot Fieldwork에서 GDScript로 카메라의 직교 투영을 설정하고 오른쪽 게임 화면에서 파란 큐브를 확인하는 모습"
                loading="lazy"
              />
            </a>
            <figcaption>카메라 투영 실습 화면</figcaption>
          </figure>
          <ol className="home-learning-flow">
            <li>
              <b>과제 읽기</b>
              <p>설명을 읽고 수정할 노드와 속성을 확인합니다.</p>
            </li>
            <li>
              <b>코드 실행하기</b>
              <p>
                코드를 작성한 뒤 실행 버튼을 누릅니다. 오류는 Console에서
                확인합니다.
              </p>
            </li>
            <li>
              <b>결과 확인하기</b>
              <p>
                검사 결과를 보고 수정합니다. 막히면 수업에 있는 힌트를
                열어보세요.
              </p>
            </li>
          </ol>
          <p className="home-method-note">
            자동 검사는 과제에 명시된 조건을 확인합니다. 화면의 변화도 함께
            살펴보세요.
          </p>
        </div>
      </section>

      <section
        className="home-editor home-width"
        aria-labelledby="editor-intro-title"
      >
        <div className="home-section-intro">
          <h2 id="editor-intro-title">에디터 살펴보기</h2>
          <p className="home-subtitle">
            노드와 씬, 그리고 화면을 만드는 도구들.
          </p>
          <p>
            Godot 공식 문서를 바탕으로 에디터 사용법부터 2D, 3D, 셰이더까지 65개
            수업을 구성했습니다. 에디터 지도에서 각 영역의 역할을 먼저
            익혀보세요.
          </p>
        </div>
        <figure>
          <a
            href="assets/home/godot-3d-editor.webp"
            target="_blank"
            rel="noopener"
            aria-label="Godot 3D 에디터 이미지 크게 보기 (새 탭)"
          >
            <img
              src="assets/home/godot-3d-editor.webp"
              width="1920"
              height="1017"
              alt="노드 목록과 Inspector, 중앙 3D 뷰포트로 구성된 Godot 에디터 화면"
              loading="lazy"
            />
          </a>
          <figcaption>
            설치형 Godot 3D 에디터{" "}
            <a href="https://docs.godotengine.org/en/4.5/getting_started/introduction/first_look_at_the_editor.html">
              공식 문서 이미지
            </a>
          </figcaption>
        </figure>
        <div className="home-image-note">
          <p>
            Scene에서 노드를 선택하고 Inspector에서 속성을 바꿉니다.
            서비스에서는 관련 개념을 코드와 작은 실행 과제로 연습합니다.
          </p>
          <a className="home-text-link" href="#editor">
            에디터 지도 보기 →
          </a>
        </div>
      </section>

      <section
        className="home-script home-width"
        aria-labelledby="script-title"
      >
        <div className="home-section-intro">
          <h2 id="script-title">GDScript 연습</h2>
          <p className="home-subtitle">움직임과 입력을 코드로 다룹니다.</p>
        </div>
        <div className="home-script-layout">
          <figure>
            <a
              href="assets/home/gdscript-editor.webp"
              target="_blank"
              rel="noopener"
              aria-label="Godot GDScript 편집 화면 크게 보기 (새 탭)"
            >
              <img
                src="assets/home/gdscript-editor.webp"
                width="904"
                height="701"
                alt="Godot의 Script 작업 화면에서 GDScript 코드를 편집하는 모습"
                loading="lazy"
              />
            </a>
            <figcaption>
              Godot Script 작업 화면{" "}
              <a href="https://docs.godotengine.org/en/4.5/getting_started/introduction/first_look_at_the_editor.html">
                공식 문서 이미지
              </a>
            </figcaption>
          </figure>
          <div className="home-script-copy">
            <h3>변수부터 시그널까지</h3>
            <p>
              노드의 위치를 바꾸고, 키보드 입력을 읽고, 시그널에 반응하는 코드를
              작성합니다.
            </p>
            <p>변수와 자료형부터 시작하려면 GDScript 수업을 참고하세요.</p>
            <a className="home-text-link" href="#gdscript-data">
              GDScript 수업 보기 →
            </a>
          </div>
        </div>
      </section>

      <section
        className="home-showcase home-width"
        aria-labelledby="showcase-title"
      >
        <div className="home-section-intro">
          <h2 id="showcase-title">게임으로 이어가기</h2>
          <p className="home-subtitle">
            연습한 개념으로 이런 게임을 만들 수 있습니다.
          </p>
          <p>
            Godot 공식 튜토리얼에서 만드는 2D·3D 게임입니다. 개별 실습을 마친 뒤
            전체 게임을 만들어보고 싶을 때 참고할 수 있습니다.
          </p>
        </div>
        <article className="home-example">
          <figure>
            <GameDemo
              src="assets/home/dodge-the-creeps.gif"
              alt="Dodge the Creeps!에서 캐릭터가 사방에서 오는 적들을 피하는 2D 게임 플레이"
            />
            <figcaption>
              Dodge the Creeps!{" "}
              <a href="https://docs.godotengine.org/en/4.5/getting_started/first_2d_game/index.html">
                공식 2D 게임 튜토리얼
              </a>
            </figcaption>
          </figure>
          <div>
            <h3>Dodge the Creeps! (2D)</h3>
            <p>
              사방에서 오는 적을 피하는 게임입니다. 캐릭터 이동, 적 생성, 충돌
              감지와 점수 표시를 다룹니다.
            </p>
            <a className="home-text-link" href="#first-2d-loop">
              2D 게임 구조 실습 →
            </a>
          </div>
        </article>
        <article className="home-example">
          <figure>
            <GameDemo
              src="assets/home/squash-the-creeps.gif"
              alt="Squash the Creeps의 3D 공간에서 캐릭터가 점프해 적을 밟고 점수를 얻는 게임 플레이"
            />
            <figcaption>
              Squash the Creeps{" "}
              <a href="https://docs.godotengine.org/en/4.5/getting_started/first_3d_game/index.html">
                공식 3D 게임 튜토리얼
              </a>
            </figcaption>
          </figure>
          <div>
            <h3>Squash the Creeps (3D)</h3>
            <p>
              3D 공간에서 점프해 적을 밟는 게임입니다. 캐릭터 이동과 점프, 충돌
              처리, 애니메이션을 다룹니다.
            </p>
            <a className="home-text-link" href="#first-3d-loop">
              3D 장면 실습 →
            </a>
          </div>
        </article>
        <p className="home-showcase-note">
          위 게임의 전체 제작 과정은 연결된 공식 튜토리얼에서 볼 수 있습니다.
          다른 게임과 도구는{" "}
          <a href="https://godotengine.org/showcase/">공식 쇼케이스</a>에서 볼
          수 있습니다.
        </p>
      </section>

      <footer className="home-footer home-width">
        <div className="home-footer-top">
          <strong>Godot Fieldwork</strong>
          <dl className="home-colophon">
            <div>
              <dt>제작</dt>
              <dd>
                <a href="https://github.com/chajuhui123">Juhee Cha</a>
              </dd>
            </div>
            <div>
              <dt>서비스 저장소</dt>
              <dd>공개 준비 중</dd>
            </div>
            <div>
              <dt>참고한 자료</dt>
              <dd>
                <a href="https://docs.godotengine.org/ko/4.x/">
                  Godot 한국어 공식 문서
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <div className="home-footer-bottom">
          <p>
            독립적으로 제작한 학습 서비스입니다. Godot 개발팀의 공식 서비스나
            승인된 교육 과정이 아닙니다.
          </p>
          <a href="credits.html">문서와 이미지 출처</a>
          <p>© 2026 Juhee Cha</p>
        </div>
      </footer>
    </main>
  );
}
