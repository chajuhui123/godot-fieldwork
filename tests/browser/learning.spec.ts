import { test, expect } from "@playwright/test";

test("a learner can edit, reload, run real GDScript, complete a quiz, and leave the game", async ({
  page,
}) => {
  await page.goto("/#editor");
  await page.getByRole("button", { name: "Inspector", exact: true }).click();
  await page
    .getByRole("spinbutton", { name: "Player · Position X" })
    .fill("320");
  const editor = page.getByRole("textbox", { name: "GDScript 코드 편집기" });
  const code =
    'extends Node2D\n\nfunc _ready() -> void:\n\t$Player.position = Vector2(480, 180)\n\tprint("fieldwork smoke test")\n';
  await editor.fill(code);
  await page.reload();
  await expect(editor).toContainText("fieldwork smoke test");
  await expect(page.locator("#live-x")).toHaveValue("320");
  await page.locator("#live-check").click();
  await expect(page.locator("#live-status")).toHaveText("검사 통과 · 실행 중", {
    timeout: 60000,
  });
  await expect(page.locator("#live-tests .passed")).toHaveCount(3);
  await expect(page.locator("#live-console")).toContainText(
    "fieldwork smoke test",
  );
  await expect(page.locator("#workshop #live-game iframe")).toBeVisible();
  await expect(page.locator(".reading-pane")).toBeVisible();
  await page
    .getByRole("button", { name: "디버그 출력과 애니메이션", exact: true })
    .click();
  await expect(page.locator("#progress-label")).toHaveText("기본 1 / 65 완료");
  await page.getByRole("button", { name: "다음 실습", exact: true }).click();
  await expect(page.locator("#lesson-title")).toHaveText("노드와 씬");
  await expect(page.locator("#live-game iframe")).toHaveCount(0);
  await page.goBack();
  await expect(editor).toContainText("fieldwork smoke test");
  await expect(page.locator("#next-lesson")).toBeEnabled();
});

test("existing progress and drafts survive the switch to React, including on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  // Use storage just as a returning visitor from the previous application would.
  await page.evaluate(() => {
    localStorage.setItem(
      "godot-fieldwork-progress-v1",
      JSON.stringify({
        editor: { practice: true, engineWorkshop: true, quiz: true },
      }),
    );
    localStorage.setItem(
      "godot-workshop-v1:editor",
      JSON.stringify({
        code: "extends Node2D\n# 이전 초안",
        config: { x: 321, y: 180 },
      }),
    );
  });
  await page.reload();
  // 이어하기 기록이 없던 기존 사용자는 첫 미완료 수업으로 안내된다.
  await expect(page.locator(".home-resume-note")).toHaveText(
    "다음 수업 · 02 노드와 씬",
  );
  await page.getByRole("link", { name: "처음부터 보기" }).click();
  await expect(page.locator("#progress-label")).toHaveText("기본 1 / 65 완료");
  await page.getByRole("button", { name: "코드", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "GDScript 코드 편집기" }),
  ).toContainText("이전 초안");
  await expect(page.locator("#live-x")).toHaveValue("321");
  await expect(page.locator("#next-lesson")).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("home offers to continue the last opened lesson", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".home-intro .home-primary")).toHaveText(
    /학습 바로가기/,
  );
  await page.goto("/#signals");
  await expect(page.locator("#lesson-title")).toHaveText("시그널 연결");
  await page.goto("/#home");
  const resume = page.locator(".home-intro .home-primary");
  await expect(resume).toHaveText(/이어하기/);
  await expect(page.locator(".home-resume-note")).toHaveText(
    "마지막 수업 · 03 시그널 연결",
  );
  await expect(page.locator(".home-nav-primary")).toHaveAttribute(
    "href",
    "#signals",
  );
  await resume.click();
  await expect(page.locator("#lesson-title")).toHaveText("시그널 연결");
});
