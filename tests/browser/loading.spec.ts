import { test, expect } from "@playwright/test";

test("a lesson shows a layout skeleton while its code loads", async ({
  page,
}) => {
  await page.goto("/");
  await page.route(/LessonPage/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.goto("/#nodes");
  const skeleton = page.locator(".lesson-skeleton");
  await expect(skeleton).toBeVisible();
  await expect(skeleton).toHaveAttribute("aria-busy", "true");
  await expect(skeleton.getByRole("status")).toHaveText("수업을 불러오는 중…");
  await expect(page.locator("#lesson-title")).toHaveText("노드와 씬", {
    timeout: 15000,
  });
  await expect(skeleton).toHaveCount(0);
});

test("the first engine run shows staged progress until Godot is ready", async ({
  page,
}) => {
  await page.route(/engine\.wasm/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.goto("/#editor");
  await page.locator("#live-check").click();
  const panel = page.locator(".engine-loading");
  await expect(panel).toBeVisible();
  await expect(
    panel.getByRole("progressbar", { name: "Godot 엔진 불러오기" }),
  ).toBeVisible();
  await expect(panel.locator('[aria-current="step"]')).toHaveText(
    "엔진 내려받기",
  );
  await expect(page.locator("#live-status")).toHaveText(/검사/, {
    timeout: 60000,
  });
  await expect(panel).toHaveCount(0);
});
