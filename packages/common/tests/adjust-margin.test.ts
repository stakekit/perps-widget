import { describe, expect, test } from "vitest";
import {
  getEstimatedLiquidationPriceForProjectedMargin,
  getSignedUpdateMarginAmount,
} from "../src/lib";

describe("adjust margin helpers", () => {
  test("lower long liquidation price when adding margin", () => {
    const position = {
      markPrice: 4_000,
      side: "long" as const,
      size: "1",
    };

    const lowerRiskPrice = getEstimatedLiquidationPriceForProjectedMargin({
      position,
      projectedMargin: 800,
    });
    const higherRiskPrice = getEstimatedLiquidationPriceForProjectedMargin({
      position,
      projectedMargin: 400,
    });

    expect(lowerRiskPrice).not.toBeNull();
    expect(higherRiskPrice).not.toBeNull();

    if (lowerRiskPrice === null || higherRiskPrice === null) {
      throw new Error("Expected liquidation price estimates");
    }

    expect(lowerRiskPrice).toBeLessThan(higherRiskPrice);
  });

  test("raise short liquidation price when adding margin", () => {
    const position = {
      markPrice: 4_000,
      side: "short" as const,
      size: "1",
    };

    const lowerRiskPrice = getEstimatedLiquidationPriceForProjectedMargin({
      position,
      projectedMargin: 800,
    });
    const higherRiskPrice = getEstimatedLiquidationPriceForProjectedMargin({
      position,
      projectedMargin: 400,
    });

    expect(lowerRiskPrice).not.toBeNull();
    expect(higherRiskPrice).not.toBeNull();

    if (lowerRiskPrice === null || higherRiskPrice === null) {
      throw new Error("Expected liquidation price estimates");
    }

    expect(lowerRiskPrice).toBeGreaterThan(higherRiskPrice);
  });

  test("return null for invalid projected margin", () => {
    const position = {
      markPrice: 4_000,
      side: "long" as const,
      size: "1",
    };

    expect(
      getEstimatedLiquidationPriceForProjectedMargin({
        position,
        projectedMargin: 0,
      }),
    ).toBeNull();
  });

  test("format update margin amounts for add and remove flows", () => {
    expect(getSignedUpdateMarginAmount({ amount: "125.5", mode: "add" })).toBe(
      "125.5",
    );
    expect(getSignedUpdateMarginAmount({ amount: 125.5, mode: "remove" })).toBe(
      "-125.5",
    );
  });
});
