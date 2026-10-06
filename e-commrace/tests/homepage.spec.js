import { test, expect } from "@playwright/test";

test.describe("Homepage Luxury Redesign Verification", () => {
  test("Homepage loads with high-fashion hero, categories, products and zero errors", async ({ page }) => {
    test.setTimeout(60000);
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("http://127.0.0.1:5173/");
    await page.waitForLoadState("networkidle");

    // Check Hero title is visible
    const heroHeading = page.locator("h1");
    await expect(heroHeading.first()).toBeVisible();
    console.log("Hero heading:", await heroHeading.first().textContent());

    // Check marquee ribbon
    const marquee = page.locator(".animate-marquee");
    await expect(marquee).toBeVisible();

    // Check category section
    const categoryHeading = page.getByRole("heading", { name: /Explore By Category/i });
    await expect(categoryHeading).toBeVisible();

    // Check New Arrivals & Signatures section
    const showcaseHeading = page.getByRole("heading", { name: /New Arrivals & Signatures/i });
    await expect(showcaseHeading).toBeVisible();

    // Test Category filter tabs
    const pretTab = page.getByRole("button", { name: "Ready to Wear" });
    if (await pretTab.isVisible()) {
      await pretTab.click();
      await page.waitForTimeout(300);
    }

    const allTab = page.getByRole("button", { name: "All Outfits" });
    if (await allTab.isVisible()) {
      await allTab.click();
      await page.waitForTimeout(300);
    }

    // Check Lookbook spotlight
    const spotlightHeading = page.getByRole("heading", { name: /Raw Silk Zari Kurta/i });
    await expect(spotlightHeading).toBeVisible();

    // Check Heritage section
    const heritageHeading = page.getByRole("heading", { name: /Honoring Pakistan's Textile Heritage/i });
    await expect(heritageHeading).toBeVisible();

    // Take Desktop Screenshot
    await page.screenshot({ path: "test-results/homepage-desktop.png", fullPage: true });

    // Set mobile viewport and take mobile screenshot
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "test-results/homepage-mobile.png", fullPage: true });

    console.log("Logged errors:", errors.filter(e => !e.includes("socket.io") && !e.includes("favicon")));
    expect(errors.filter(e => !e.includes("socket.io") && !e.includes("favicon") && !e.includes("Failed to load resource"))).toHaveLength(0);
  });
});
