import { describe, expect, it } from "vitest";
import { products } from "@/lib/data";
import { getCartItemPrice, getCartLineId, getProductVariants, MINIMUM_ORDER_TOTAL } from "./product-variants";

describe("product pack sizes", () => {
  it("offers common smaller packs at prices proportional to the catalog unit", () => {
    const radish = products.find((product) => product.name === "Fresh Radish")!;
    const variants = getProductVariants(radish);

    expect(variants.map((variant) => variant.unit)).toEqual(["500g", "100 g", "200 g", "300 g"]);
    expect(variants.find((variant) => variant.unit === "100 g")).toMatchObject({ price: 9, discountPrice: 7, stock: 250 });
  });

  it("allows admin prices to override a generated size", () => {
    const radish = products.find((product) => product.name === "Fresh Radish")!;
    const variants = getProductVariants({
      ...radish,
      variants: [{ id: "100-g", unit: "100 g", price: 12, stock: 20 }],
    });

    expect(variants.find((variant) => variant.unit === "100 g")).toMatchObject({ price: 12, stock: 20 });
  });

  it("keeps separate pack sizes as separate cart lines and calculates member prices", () => {
    const radish = products.find((product) => product.name === "Fresh Radish")!;
    const smallPack = getProductVariants(radish).find((variant) => variant.unit === "100 g")!;
    const largePack = getProductVariants(radish)[0];

    expect(getCartLineId({ product: radish, variant: smallPack, quantity: 1 })).not.toBe(
      getCartLineId({ product: radish, variant: largePack, quantity: 1 }),
    );
    expect(getCartItemPrice({ product: radish, variant: smallPack, quantity: 1 }, true)).toBe(6);
    expect(MINIMUM_ORDER_TOTAL).toBe(500);
  });
});
