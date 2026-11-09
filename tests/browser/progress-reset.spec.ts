import { test, expect } from "@playwright/test";

test("progress reset lives in the course drawer and still asks first", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "godot-fieldwork-progress-v1",
      JSON.stringify({ editor: { engineWorkshop: true, quiz: true } }),
    );
  });
  await page.goto("/#nodes");
  await page.reload();
  await expect(page.locator("#progress-label")).toHaveText("기본 1 / 65 완료");
  await expect(
    page.locator(".app-header").getByRole("button", { name: "진도 초기화" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "학습 목차" }).click();
  await page.getByRole("button", { name: "진도 초기화" }).click();
  const confirm = page.locator("#reset-dialog");
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "취소" }).click();
  await expect(page.locator("#progress-label")).toHaveText("기본 1 / 65 완료");
  await page.getByRole("button", { name: "진도 초기화" }).click();
  await confirm.getByRole("button", { name: "초기화" }).click();
  await expect(page.locator("#progress-label")).toHaveText("기본 0 / 65 완료");
});
