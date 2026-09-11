import { test, expect } from "@playwright/test";

const image = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800'%3E%3Crect width='600' height='800' fill='%23d4ddc9'/%3E%3C/svg%3E";
const categories = [
  { _id: "c1", name: "Ready to Wear", slug: "ready-to-wear", productCount: 102, image: { url: image } },
  { _id: "c2", name: "Silk Edit", slug: "silk-edit", productCount: 1, image: { url: image } },
  { _id: "c3", name: "Coming Soon", slug: "coming-soon", productCount: 0, image: { url: image } },
];
const products = Array.from({ length: 103 }, (_, index) => ({
  _id: `p${index}`, title: `Design ${String(index + 1).padStart(3, "0")}`, description: "An embroidered wardrobe essential", price: 1000 + index * 100,
  discountPrice: index === 0 ? 800 : null, stock: 10, fabric: index === 102 ? "Raw Silk" : "Cambric", stitchingType: index === 102 ? "unstitched" : "stitched",
  images: [{ url: image, isDefault: true }], sizes: ["S", "M", "L"], sizeVariants: [{ size: "S", stock: 0, isAvailable: false }, { size: "M", stock: 5 }, { size: "L", stock: 5, isAvailable: true }],
  category: categories[index === 102 ? 1 : 0], isActive: true, createdAt: "2026-09-10T12:00:00.000Z",
}));
async function fixture(page, { admin = false, failProducts = false } = {}) {
  const errors = [];
  const catalog = [...products];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/socket.io/**", (route) => route.abort());
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const reply = (data, status = 200) => route.fulfill({ status, json: { success: status < 400, data, message: status < 400 ? "OK" : "Service unavailable" } });
    if (path === "/api/v1/auth/me") return admin ? reply({ user: { _id: "admin1", fullname: "Store Manager", role: "admin", email: "admin@example.com" } }) : reply(null, 401);
    if (path === "/api/v1/auth/refresh-token") return reply(null, 401);
    if (path === "/api/v5/cart") return reply({ items: [] });
    if (path === "/api/v4/category") return reply(categories);
    if (path === "/api/v3/product/fabrics") return reply(["All Fabrics", "Cambric", "Raw Silk"]);
    if (path === "/api/v3/product/admin/low-stock") return reply({ lowStock: [], outOfStock: [] });
    if (path === "/api/v3/product/create") {
      const body = route.request().postData() || "";
      const value = (name) => body.match(new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]+)`))?.[1];
      const category = categories.find((item) => item._id === value("category"));
      if (!category || !value("title")) return reply(null, 400);
      const product = { ...products[0], _id: "new-product", title: value("title"), category, price: Number(value("price")) };
      catalog.push(product);
      return reply(product, 201);
    }
    if (path === "/api/v3/product" || path === "/api/v3/product/admin/all") {
      if (failProducts) return reply(null, 503);
      let result = catalog;
      const category = url.searchParams.get("category");
      if (category) result = result.filter((item) => [item.category._id, item.category.slug].includes(category));
      const search = url.searchParams.get("search");
      if (search) result = result.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
      const fabric = url.searchParams.get("fabric");
      if (fabric) result = result.filter((item) => item.fabric === fabric);
      if (url.searchParams.has("maxPrice")) result = result.filter((item) => item.price <= Number(url.searchParams.get("maxPrice")));
      const limit = Number(url.searchParams.get("limit")) || 12;
      const currentPage = Number(url.searchParams.get("page")) || 1;
      return reply({ products: result.slice((currentPage - 1) * limit, currentPage * limit), totalProducts: result.length, totalPages: Math.ceil(result.length / limit), currentPage });
    }
    return reply([]);
  });
  return errors;
}

test("Products loads every server page; categories and sidebar filters compose", async ({ page }) => {
  const errors = await fixture(page);
  await page.goto("/products");
  await expect(page.locator(".shop-product-reveal")).toHaveCount(103);
  await page.screenshot({ path: "test-results/catalog-desktop.png", fullPage: false });
  await page.getByRole("combobox", { name: "Category", exact: true }).selectOption("silk-edit");
  await expect(page.locator(".shop-product-reveal")).toHaveCount(1);
  await expect(page.locator(".shop-product-reveal")).toContainText("Design 103");
  await page.locator(".shop-desktop-filters").getByRole("button", { name: "Cambric", exact: true }).click();
  await expect(page.locator(".shop-product-reveal")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "A little room to explore." })).toBeVisible();
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await expect(page.locator(".shop-product-reveal")).toHaveCount(103);
  await page.locator(".shop-desktop-filters").getByRole("button", { name: "S", exact: true }).click();
  await expect(page.locator(".shop-product-reveal")).toHaveCount(0);
  await page.locator(".shop-desktop-filters").getByRole("button", { name: "M", exact: true }).click();
  await expect(page.locator(".shop-product-reveal")).toHaveCount(103);
  expect(errors).toEqual([]);
});

test("search, price, sorting and browser history stay in sync", async ({ page }) => {
  await fixture(page);
  await page.goto("/products");
  await expect(page.locator(".shop-product-reveal")).toHaveCount(103);
  await page.getByRole("combobox", { name: "Sort products" }).selectOption("price-desc");
  await expect(page.locator(".shop-product-reveal").first()).toContainText("Design 103");
  await page.getByRole("textbox", { name: "Search products", exact: true }).fill("Design 101");
  await expect(page.locator(".shop-product-reveal")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(page.locator(".shop-product-reveal")).toHaveCount(103);
  await page.getByRole("combobox", { name: "Category", exact: true }).selectOption("coming-soon");
  await expect(page.locator(".shop-product-reveal")).toHaveCount(0);
  await page.goBack();
  await expect(page.getByRole("combobox", { name: "Category", exact: true })).toHaveValue("");
  await expect(page.locator(".shop-product-reveal")).toHaveCount(103);
  await page.getByRole("spinbutton", { name: "Maximum price" }).fill("1500");
  await expect(page.locator(".shop-product-reveal")).toHaveCount(6);
});

test("failed API shows a retry state and never sample products", async ({ page }) => {
  const errors = await fixture(page, { failProducts: true });
  await page.goto("/products");
  await expect(page.getByRole("button", { name: "Reload collection" })).toBeVisible();
  await expect(page.locator(".shop-product-reveal")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("mobile drawer exposes all filters and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await fixture(page);
  await page.goto("/products");
  await expect(page.locator(".shop-product-reveal")).toHaveCount(103);
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Filter collection" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Raw Silk", exact: true }).click();
  await expect(page.locator(".shop-product-reveal")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page.screenshot({ path: "test-results/catalog-mobile.png", fullPage: false });
  const overflow = await page.evaluate(() => [...document.querySelectorAll("body *")].filter((element) => { const box = element.getBoundingClientRect(); return box.width > 0 && box.right > innerWidth + 1 && getComputedStyle(element).position !== "absolute"; }).slice(0, 8).map((element) => ({ tag: element.tagName, className: element.className, width: element.getBoundingClientRect().width })));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), JSON.stringify(overflow)).toBe(true);
});

test("admin publishes a product into the chosen category and the shop displays it", async ({ page }) => {
  const errors = await fixture(page, { admin: true });
  await page.goto("/admin/products/create?category=c2");
  await expect(page.getByRole("combobox", { name: "category", exact: true })).toHaveValue("c2");
  await page.getByRole("textbox", { name: "title", exact: true }).fill("New silk celebration");
  await page.getByRole("textbox", { name: "description", exact: true }).fill("A beautifully crafted silk collection for special occasions.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("spinbutton", { name: "price", exact: true }).fill("9900");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: "product.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfK0AAAAASUVORK5CYII=", "base64") });
  await expect(page.getByText("1 Photos", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: /Publish/ }).click();
  await expect(page).toHaveURL(/\/admin\/products\?category=c2/);
  await expect(page.locator("tbody")).toContainText("New silk celebration");
  await page.goto("/products?category=silk-edit");
  await expect(page.locator(".shop-product-reveal")).toHaveCount(2);
  await expect(page.locator(".shop-product-grid")).toContainText("New silk celebration");
  expect(errors).toEqual([]);
});

test("admin category opens its own inventory with a preselected add-product action", async ({ page }) => {
  const errors = await fixture(page, { admin: true });
  await page.goto("/admin/categories");
  await page.getByRole("link", { name: "View Silk Edit products" }).click();
  await expect(page).toHaveURL(/\/admin\/products\?category=c2/);
  await expect(page.getByRole("combobox", { name: "Product category" })).toHaveValue("c2");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("Design 103");
  await page.getByRole("main").getByRole("link", { name: "Add product", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/products\/create\?category=c2/);
  expect(errors).toEqual([]);
});
