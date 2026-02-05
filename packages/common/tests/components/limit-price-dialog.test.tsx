import { beforeEach, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { LimitPriceDialog } from "../../src/components/molecules/limit-price-dialog";
import { TestWrapper } from "./wrapper";

const defaultProps = {
  limitPrice: null as number | null,
  onLimitPriceChange: vi.fn(),
  currentPrice: 100,
};

describe("LimitPriceDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders trigger button", async () => {
    const screen = await render(
      <LimitPriceDialog {...defaultProps}>
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await expect.element(screen.getByText("Set Limit Price")).toBeVisible();
  });

  test("opens dialog when trigger is clicked", async () => {
    const screen = await render(
      <LimitPriceDialog {...defaultProps}>
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));

    await expect
      .element(screen.getByText("Set limit price", { exact: true }))
      .toBeVisible();
  });

  test("displays quick adjustment buttons", async () => {
    const screen = await render(
      <LimitPriceDialog {...defaultProps}>
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));

    await expect.element(screen.getByText("Unset")).toBeVisible();
    await expect.element(screen.getByText("-1%")).toBeVisible();
    await expect.element(screen.getByText("-2%")).toBeVisible();
    await expect.element(screen.getByText("-5%")).toBeVisible();
    await expect.element(screen.getByText("-10%")).toBeVisible();
  });

  test("displays input field with placeholder", async () => {
    const screen = await render(
      <LimitPriceDialog {...defaultProps}>
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));

    await expect.element(screen.getByPlaceholder("Enter value")).toBeVisible();
    await expect.element(screen.getByText("USD")).toBeVisible();
  });

  test("displays Done button", async () => {
    const screen = await render(
      <LimitPriceDialog {...defaultProps}>
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));

    await expect.element(screen.getByText("Done")).toBeVisible();
  });

  test("initializes input with existing limit price", async () => {
    const screen = await render(
      <LimitPriceDialog {...defaultProps} limitPrice={95}>
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));

    const input = screen.getByPlaceholder("Enter value");
    await expect.element(input).toHaveValue("95");
  });

  test("quick adjust -1% calculates correct price", async () => {
    const onLimitPriceChange = vi.fn();
    const screen = await render(
      <LimitPriceDialog
        {...defaultProps}
        currentPrice={100}
        onLimitPriceChange={onLimitPriceChange}
      >
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    await userEvent.click(screen.getByText("-1%"));
    await userEvent.click(screen.getByText("Done"));

    expect(onLimitPriceChange).toHaveBeenCalledWith(99);
  });

  test("quick adjust -2% calculates correct price", async () => {
    const onLimitPriceChange = vi.fn();
    const screen = await render(
      <LimitPriceDialog
        {...defaultProps}
        currentPrice={100}
        onLimitPriceChange={onLimitPriceChange}
      >
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    await userEvent.click(screen.getByText("-2%"));
    await userEvent.click(screen.getByText("Done"));

    expect(onLimitPriceChange).toHaveBeenCalledWith(98);
  });

  test("quick adjust -5% calculates correct price", async () => {
    const onLimitPriceChange = vi.fn();
    const screen = await render(
      <LimitPriceDialog
        {...defaultProps}
        currentPrice={100}
        onLimitPriceChange={onLimitPriceChange}
      >
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    await userEvent.click(screen.getByText("-5%"));
    await userEvent.click(screen.getByText("Done"));

    expect(onLimitPriceChange).toHaveBeenCalledWith(95);
  });

  test("quick adjust -10% calculates correct price", async () => {
    const onLimitPriceChange = vi.fn();
    const screen = await render(
      <LimitPriceDialog
        {...defaultProps}
        currentPrice={100}
        onLimitPriceChange={onLimitPriceChange}
      >
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    await userEvent.click(screen.getByText("-10%"));
    await userEvent.click(screen.getByText("Done"));

    expect(onLimitPriceChange).toHaveBeenCalledWith(90);
  });

  test("Unset button clears the input and submits null", async () => {
    const onLimitPriceChange = vi.fn();
    const screen = await render(
      <LimitPriceDialog
        {...defaultProps}
        limitPrice={95}
        onLimitPriceChange={onLimitPriceChange}
      >
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    await userEvent.click(screen.getByText("Unset"));
    await userEvent.click(screen.getByText("Done"));

    expect(onLimitPriceChange).toHaveBeenCalledWith(null);
  });

  test("manual input submits entered value", async () => {
    const onLimitPriceChange = vi.fn();
    const screen = await render(
      <LimitPriceDialog
        {...defaultProps}
        onLimitPriceChange={onLimitPriceChange}
      >
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    const input = screen.getByPlaceholder("Enter value");
    await userEvent.type(input, "85.5");
    await userEvent.click(screen.getByText("Done"));

    expect(onLimitPriceChange).toHaveBeenCalledWith(85.5);
  });

  test("closes dialog when X button is clicked", async () => {
    const screen = await render(
      <LimitPriceDialog {...defaultProps}>
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    await expect
      .element(screen.getByText("Set limit price", { exact: true }))
      .toBeVisible();

    // Click the close button (first button with no accessible name)
    const closeButton = screen.getByRole("button", { name: "" }).nth(0);
    await userEvent.click(closeButton);

    await expect
      .element(screen.getByText("Set limit price", { exact: true }))
      .not.toBeInTheDocument();
  });

  test("closes dialog when Done is clicked after submitting", async () => {
    const screen = await render(
      <LimitPriceDialog {...defaultProps}>
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    await expect
      .element(screen.getByText("Set limit price", { exact: true }))
      .toBeVisible();

    await userEvent.click(screen.getByText("Done"));

    await expect
      .element(screen.getByText("Set limit price", { exact: true }))
      .not.toBeInTheDocument();
  });

  test("quick adjustment works with different current price", async () => {
    const onLimitPriceChange = vi.fn();
    const screen = await render(
      <LimitPriceDialog
        {...defaultProps}
        currentPrice={250}
        onLimitPriceChange={onLimitPriceChange}
      >
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    await userEvent.click(screen.getByText("-10%"));
    await userEvent.click(screen.getByText("Done"));

    // 250 - 10% = 250 - 25 = 225
    expect(onLimitPriceChange).toHaveBeenCalledWith(225);
  });

  test("quick adjustment updates input value visually", async () => {
    const screen = await render(
      <LimitPriceDialog {...defaultProps} currentPrice={100}>
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    await userEvent.click(screen.getByText("-5%"));

    const input = screen.getByPlaceholder("Enter value");
    await expect.element(input).toHaveValue("95");
  });

  test("empty input submits null", async () => {
    const onLimitPriceChange = vi.fn();
    const screen = await render(
      <LimitPriceDialog
        {...defaultProps}
        onLimitPriceChange={onLimitPriceChange}
      >
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    // Input is already empty by default
    await userEvent.click(screen.getByText("Done"));

    expect(onLimitPriceChange).toHaveBeenCalledWith(null);
  });

  test("can clear existing value and submit null", async () => {
    const onLimitPriceChange = vi.fn();
    const screen = await render(
      <LimitPriceDialog
        {...defaultProps}
        limitPrice={95}
        onLimitPriceChange={onLimitPriceChange}
      >
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    const input = screen.getByPlaceholder("Enter value");
    await userEvent.clear(input);
    await userEvent.click(screen.getByText("Done"));

    expect(onLimitPriceChange).toHaveBeenCalledWith(null);
  });

  test("displays Set price label", async () => {
    const screen = await render(
      <LimitPriceDialog {...defaultProps}>
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));

    await expect.element(screen.getByText("Set price")).toBeVisible();
  });

  test("multiple quick adjustments update input correctly", async () => {
    const screen = await render(
      <LimitPriceDialog {...defaultProps} currentPrice={100}>
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));

    // First click -5%
    await userEvent.click(screen.getByText("-5%"));
    const input = screen.getByPlaceholder("Enter value");
    await expect.element(input).toHaveValue("95");

    // Then click -10% (should use currentPrice, not the input value)
    await userEvent.click(screen.getByText("-10%"));
    await expect.element(input).toHaveValue("90");
  });

  test("decimal values in input are submitted correctly", async () => {
    const onLimitPriceChange = vi.fn();
    const screen = await render(
      <LimitPriceDialog
        {...defaultProps}
        onLimitPriceChange={onLimitPriceChange}
      >
        <span>Set Limit Price</span>
      </LimitPriceDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Limit Price"));
    const input = screen.getByPlaceholder("Enter value");
    await userEvent.type(input, "99.99");
    await userEvent.click(screen.getByText("Done"));

    expect(onLimitPriceChange).toHaveBeenCalledWith(99.99);
  });
});
