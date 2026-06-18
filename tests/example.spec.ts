import { test, expect } from "@playwright/test";

test("homepage hero video loads", async ({ page }) => {
  await page.goto("/");

  const video = page.getByTestId("hero-video");

  await expect(video).toHaveCount(1);

  await expect(video).toHaveAttribute("src", "/videos/hero-video.mp4");
  await expect(video).toHaveAttribute("autoplay", "");
  await expect(video).toHaveAttribute("loop", "");
  await expect(video).toHaveAttribute("playsinline", "");
  await expect(video).toHaveAttribute("preload", "metadata");

  const videoState = await video.evaluate((element) => {
    const videoElement = element as HTMLVideoElement;

    return {
      muted: videoElement.muted,
      controls: videoElement.controls,
      tabIndex: videoElement.tabIndex,
      pointerEvents: window.getComputedStyle(videoElement).pointerEvents,
      width: videoElement.getBoundingClientRect().width,
      height: videoElement.getBoundingClientRect().height,
    };
  });

  expect(videoState.muted).toBe(true);
  expect(videoState.controls).toBe(false);
  expect(videoState.tabIndex).toBe(-1);
  expect(videoState.pointerEvents).toBe("none");

  expect(videoState.width).toBeGreaterThan(0);
  expect(videoState.height).toBeGreaterThan(0);
});