import { describe, expect, it } from "vitest";
import { ShopifyService, isLocalShopifyRail } from "./shopify-service";

describe("local Shopify rail", () => {
  it("treats missing tokens as the local rail", () => {
    expect(isLocalShopifyRail("")).toBe(true);
    expect(isLocalShopifyRail("placeholder")).toBe(true);
    expect(isLocalShopifyRail("shpat_live_secret")).toBe(false);
  });

  it("creates a course product and enrolls from a paid local order", async () => {
    const shopify = new ShopifyService({ accessToken: "" });
    const product = await shopify.createCourseProduct(
      8,
      "Advanced Treatments",
      "Playable SkinTwin module",
      "120.00"
    );
    expect(product.id.startsWith("prod_")).toBe(true);
    expect(shopify.getProductMapping(product.id)?.moduleId).toBe(8);

    const settled = await shopify.createPaidCourseOrder({
      email: "demo@skintwin.ai",
      userId: 1,
      moduleId: 8,
      title: "Advanced Treatments",
    });
    expect(settled.order.financialStatus).toBe("paid");
    expect(settled.enrollments).toHaveLength(1);
    expect(shopify.hasModuleAccess(1, 8)).toBe(true);
  });
});
