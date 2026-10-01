import { describe, expect, it } from "vitest";
import { optimizeUnsplashImage } from "./image-url";

describe("optimizeUnsplashImage", () => {
  it("adds requested dimensions and compressed formats to Unsplash image URLs", () => {
    const optimized = new URL(optimizeUnsplashImage("https://images.unsplash.com/photo-abc?w=900", 600, 386));

    expect(optimized.searchParams.get("w")).toBe("600");
    expect(optimized.searchParams.get("h")).toBe("386");
    expect(optimized.searchParams.get("q")).toBe("70");
    expect(optimized.searchParams.get("fm")).toBe("webp");
    expect(optimized.searchParams.get("auto")).toBe("format");
  });

  it("leaves non-Unsplash image URLs untouched", () => {
    const image = "https://example.com/product.png";

    expect(optimizeUnsplashImage(image, 400, 400)).toBe(image);
  });
});
