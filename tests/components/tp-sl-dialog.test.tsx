import { beforeEach, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import {
  getTPOrSLConfigurationFromPosition,
  TPOrSLDialog,
  type TPOrSLSettings,
} from "@/components/molecules/tp-sl-dialog";
import { TestWrapper } from "./wrapper";

const defaultSettings: TPOrSLSettings = {
  takeProfit: {
    option: null,
    triggerPrice: null,
    percentage: null,
  },
  stopLoss: {
    option: null,
    triggerPrice: null,
    percentage: null,
  },
};

const defaultProps = {
  settings: defaultSettings,
  onSettingsChange: vi.fn(),
  entryPrice: 100,
  currentPrice: 105,
  liquidationPrice: 80,
};

describe("TPOrSLDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders trigger button", async () => {
    const screen = await render(
      <TPOrSLDialog {...defaultProps}>
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await expect.element(screen.getByText("Open Dialog")).toBeVisible();
  });

  test("opens dialog when trigger is clicked", async () => {
    const screen = await render(
      <TPOrSLDialog {...defaultProps}>
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));

    await expect
      .element(screen.getByText("Take profit and stop loss"))
      .toBeVisible();
  });

  test("displays entry price, current price, and liquidation price", async () => {
    const screen = await render(
      <TPOrSLDialog {...defaultProps}>
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));

    await expect.element(screen.getByText("Entry price")).toBeVisible();
    await expect.element(screen.getByText("Current price")).toBeVisible();
    await expect.element(screen.getByText("Liquidation price")).toBeVisible();
    await expect.element(screen.getByText("$100")).toBeVisible();
    await expect.element(screen.getByText("$105")).toBeVisible();
    await expect.element(screen.getByText("$80")).toBeVisible();
  });

  test('shows "Est. liquidation price" when isLiquidationPriceEstimate is true', async () => {
    const screen = await render(
      <TPOrSLDialog {...defaultProps} isLiquidationPriceEstimate>
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));

    await expect
      .element(screen.getByText("Est. liquidation price"))
      .toBeVisible();
  });

  test("renders take profit section with option buttons", async () => {
    const screen = await render(
      <TPOrSLDialog {...defaultProps}>
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));

    // Dialog title contains both "Take profit" and "Stop loss"
    await expect
      .element(screen.getByText("Take profit and stop loss"))
      .toBeVisible();
    // Check for take profit options
    await expect.element(screen.getByText("Off").first()).toBeVisible();
    await expect.element(screen.getByText("+10%")).toBeVisible();
    await expect.element(screen.getByText("+25%")).toBeVisible();
    await expect.element(screen.getByText("+50%")).toBeVisible();
    await expect.element(screen.getByText("+100%")).toBeVisible();
  });

  test("renders stop loss section with option buttons", async () => {
    const screen = await render(
      <TPOrSLDialog {...defaultProps}>
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));

    // Dialog title contains both "Take profit" and "Stop loss"
    await expect
      .element(screen.getByText("Take profit and stop loss"))
      .toBeVisible();
    // Check for stop loss options
    await expect.element(screen.getByText("-10%")).toBeVisible();
    await expect.element(screen.getByText("-25%")).toBeVisible();
    await expect.element(screen.getByText("-50%")).toBeVisible();
    await expect.element(screen.getByText("-100%")).toBeVisible();
  });

  test("selects take profit percentage option and calculates trigger price", async () => {
    const onSettingsChange = vi.fn();
    const screen = await render(
      <TPOrSLDialog {...defaultProps} onSettingsChange={onSettingsChange}>
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));
    await userEvent.click(screen.getByText("+25%"));
    await userEvent.click(screen.getByText("Done"));

    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        takeProfit: {
          option: 25,
          triggerPrice: 125,
          percentage: 25,
        },
      }),
    );
  });

  test("selects stop loss percentage option and calculates trigger price", async () => {
    const onSettingsChange = vi.fn();
    const screen = await render(
      <TPOrSLDialog {...defaultProps} onSettingsChange={onSettingsChange}>
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));
    await userEvent.click(screen.getByText("-25%"));
    await userEvent.click(screen.getByText("Done"));

    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stopLoss: {
          option: 25,
          triggerPrice: 75,
          percentage: 25,
        },
      }),
    );
  });

  test('selects "Off" option to clear configuration', async () => {
    const onSettingsChange = vi.fn();
    const settingsWithTakeProfit: TPOrSLSettings = {
      ...defaultSettings,
      takeProfit: {
        option: 25,
        triggerPrice: 125,
        percentage: 25,
      },
    };
    const screen = await render(
      <TPOrSLDialog
        {...defaultProps}
        settings={settingsWithTakeProfit}
        onSettingsChange={onSettingsChange}
      >
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));
    // Click the first "Off" button (take profit section)
    const offButton = screen.getByText("Off").first();
    await userEvent.click(offButton);
    await userEvent.click(screen.getByText("Done"));

    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        takeProfit: {
          option: 0,
          triggerPrice: null,
          percentage: null,
        },
      }),
    );
  });

  test("renders only take profit section in takeProfit mode", async () => {
    const screen = await render(
      <TPOrSLDialog {...defaultProps} mode="takeProfit">
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));

    // In takeProfit mode, there are two "Take profit" elements: title and section label
    await expect.element(screen.getByText("Take profit").first()).toBeVisible();
    // Check that stop loss section is not present (no stop loss options)
    await expect.element(screen.getByText("-10%")).not.toBeInTheDocument();
  });

  test("renders only stop loss section in stopLoss mode", async () => {
    const screen = await render(
      <TPOrSLDialog {...defaultProps} mode="stopLoss">
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));

    // In stopLoss mode, there are two "Stop loss" elements: title and section label
    await expect.element(screen.getByText("Stop loss").first()).toBeVisible();
    // Check that take profit section is not present (no take profit options)
    await expect.element(screen.getByText("+10%")).not.toBeInTheDocument();
  });

  test("shows correct dialog title for takeProfit mode", async () => {
    const screen = await render(
      <TPOrSLDialog {...defaultProps} mode="takeProfit">
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));

    // In takeProfit mode, title should be just "Take profit" (first element is the title)
    const titleElement = screen.getByText("Take profit").first();
    await expect.element(titleElement).toBeVisible();
    // Verify it's not the combined title
    await expect
      .element(screen.getByText("Take profit and stop loss"))
      .not.toBeInTheDocument();
  });

  test("shows correct dialog title for stopLoss mode", async () => {
    const screen = await render(
      <TPOrSLDialog {...defaultProps} mode="stopLoss">
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));

    // In stopLoss mode, title should be just "Stop loss" (first element is the title)
    const titleElement = screen.getByText("Stop loss").first();
    await expect.element(titleElement).toBeVisible();
    // Verify it's not the combined title
    await expect
      .element(screen.getByText("Take profit and stop loss"))
      .not.toBeInTheDocument();
  });

  test("closes dialog when X button is clicked", async () => {
    const screen = await render(
      <TPOrSLDialog {...defaultProps}>
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));
    await expect
      .element(screen.getByText("Take profit and stop loss"))
      .toBeVisible();

    // Click the close button
    const closeButton = screen.getByRole("button", { name: "" }).nth(0);
    await userEvent.click(closeButton);

    await expect
      .element(screen.getByText("Take profit and stop loss"))
      .not.toBeInTheDocument();
  });

  test("closes dialog when Done is clicked", async () => {
    const screen = await render(
      <TPOrSLDialog {...defaultProps}>
        <span>Open Dialog</span>
      </TPOrSLDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Open Dialog"));
    await expect
      .element(screen.getByText("Take profit and stop loss"))
      .toBeVisible();

    await userEvent.click(screen.getByText("Done"));

    await expect
      .element(screen.getByText("Take profit and stop loss"))
      .not.toBeInTheDocument();
  });
});

describe("getTPOrSLConfigurationFromPosition", () => {
  test("returns empty configuration when amount is undefined", () => {
    const result = getTPOrSLConfigurationFromPosition({
      entryPrice: 100,
      amount: undefined,
      tpOrSl: "takeProfit",
    });

    expect(result).toEqual({
      option: null,
      triggerPrice: null,
      percentage: null,
    });
  });

  test("calculates take profit configuration correctly", () => {
    const result = getTPOrSLConfigurationFromPosition({
      entryPrice: 100,
      amount: 125,
      tpOrSl: "takeProfit",
    });

    expect(result.triggerPrice).toBe(125);
    expect(result.percentage).toBe(25);
    expect(result.option).toBe(25);
  });

  test("calculates stop loss configuration correctly", () => {
    const result = getTPOrSLConfigurationFromPosition({
      entryPrice: 100,
      amount: 75,
      tpOrSl: "stopLoss",
    });

    expect(result.triggerPrice).toBe(75);
    expect(result.percentage).toBe(25);
    expect(result.option).toBe(25);
  });

  test("returns null option for non-matching percentage", () => {
    const result = getTPOrSLConfigurationFromPosition({
      entryPrice: 100,
      amount: 115,
      tpOrSl: "takeProfit",
    });

    expect(result.triggerPrice).toBe(115);
    expect(result.percentage).toBe(15);
    expect(result.option).toBeNull();
  });

  test("matches option when percentage is within 0.5 tolerance", () => {
    const result = getTPOrSLConfigurationFromPosition({
      entryPrice: 100,
      amount: 110.4, // 10.4% is within 0.5 of 10
      tpOrSl: "takeProfit",
    });

    expect(result.option).toBe(10);
  });
});
