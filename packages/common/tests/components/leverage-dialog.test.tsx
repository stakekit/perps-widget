import { beforeEach, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import {
  LeverageDialog,
  LeverageDialogContent,
} from "../../src/components/molecules/leverage-dialog";
import { TestWrapper } from "./wrapper";

const defaultProps = {
  leverage: 10,
  onLeverageChange: vi.fn(),
  currentPrice: 50000,
  maxLeverage: 40,
  side: "long" as const,
};

describe("LeverageDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders trigger button", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await expect.element(screen.getByText("Set Leverage")).toBeVisible();
  });

  test("opens dialog when trigger is clicked", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    await expect.element(screen.getByTestId("leverage-title")).toBeVisible();
  });

  test("displays current leverage value", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps} leverage={15}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    await expect
      .element(screen.getByTestId("leverage-display"))
      .toHaveTextContent("15x");
  });

  test("displays warning banner for long position", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps} side="long">
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    await expect
      .element(screen.getByText(/You will be liquidated if price drops by/))
      .toBeVisible();
  });

  test("displays warning banner for short position", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps} side="short">
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    await expect
      .element(screen.getByText(/You will be liquidated if price rises by/))
      .toBeVisible();
  });

  test("displays estimated liquidation price", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    await expect
      .element(screen.getByText("Est. Liquidation Price"))
      .toBeVisible();
  });

  test("displays current price", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    await expect.element(screen.getByText("Current price")).toBeVisible();
    await expect.element(screen.getByText("50,000")).toBeVisible();
  });

  test("displays leverage buttons for maxLeverage 40", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps} maxLeverage={40}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    // generateLeverageButtons(40) returns [2, 5, 10, 20, 40]
    await expect.element(screen.getByLabelText("2x")).toBeVisible();
    await expect.element(screen.getByLabelText("5x")).toBeVisible();
    await expect.element(screen.getByLabelText("10x")).toBeVisible();
    await expect.element(screen.getByLabelText("20x")).toBeVisible();
    await expect.element(screen.getByLabelText("40x")).toBeVisible();
  });

  test("displays confirm button with correct leverage", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps} leverage={10}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    await expect.element(screen.getByText("Set 10x")).toBeVisible();
  });

  test("clicking leverage button updates display", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps} leverage={10}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    // Click the 20x button
    await userEvent.click(screen.getByLabelText("20x"));

    // Large display should update
    await expect
      .element(screen.getByTestId("leverage-display"))
      .toHaveTextContent("20x");
    // Confirm button should update
    await expect.element(screen.getByText("Set 20x")).toBeVisible();
  });

  test("confirm button calls onLeverageChange with selected leverage", async () => {
    const onLeverageChange = vi.fn();
    const screen = await render(
      <LeverageDialog
        {...defaultProps}
        leverage={10}
        onLeverageChange={onLeverageChange}
      >
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));
    await userEvent.click(screen.getByLabelText("20x"));
    await userEvent.click(screen.getByText("Set 20x"));

    expect(onLeverageChange).toHaveBeenCalledWith(20);
  });

  test("closes dialog when X button is clicked", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));
    await expect.element(screen.getByTestId("leverage-title")).toBeVisible();

    // Click the close button
    const closeButton = screen.getByRole("button", { name: "" }).nth(0);
    await userEvent.click(closeButton);

    await expect
      .element(screen.getByTestId("leverage-title"))
      .not.toBeInTheDocument();
  });

  test("closes dialog after confirmation", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));
    await expect.element(screen.getByTestId("leverage-title")).toBeVisible();

    await userEvent.click(screen.getByText("Set 10x"));

    await expect
      .element(screen.getByTestId("leverage-title"))
      .not.toBeInTheDocument();
  });

  test("selected leverage button is highlighted", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps} leverage={10}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    const selectedButton = screen.getByLabelText("10x");
    await expect
      .element(selectedButton)
      .toHaveAttribute("aria-pressed", "true");
  });

  test("different max leverage generates correct buttons", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps} maxLeverage={20}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    // generateLeverageButtons(20) returns [2, 5, 10, 20]
    await expect.element(screen.getByLabelText("2x")).toBeVisible();
    await expect.element(screen.getByLabelText("5x")).toBeVisible();
    await expect.element(screen.getByLabelText("10x")).toBeVisible();
    await expect.element(screen.getByLabelText("20x")).toBeVisible();
  });

  test("low max leverage shows limited buttons", async () => {
    const screen = await render(
      <LeverageDialog {...defaultProps} leverage={2} maxLeverage={5}>
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    // generateLeverageButtons(5) returns [2, 5]
    await expect.element(screen.getByLabelText("2x")).toBeVisible();
    await expect.element(screen.getByLabelText("5x")).toBeVisible();
  });

  test("calculates correct liquidation price for long position", async () => {
    // For long: liquidationPrice = currentPrice * (1 - 1/leverage)
    // currentPrice = 50000, leverage = 10
    // liquidationPrice = 50000 * (1 - 1/10) = 50000 * 0.9 = 45000
    const screen = await render(
      <LeverageDialog
        {...defaultProps}
        currentPrice={50000}
        leverage={10}
        side="long"
      >
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    await expect.element(screen.getByText("45,000")).toBeVisible();
  });

  test("calculates correct liquidation price for short position", async () => {
    // For short: liquidationPrice = currentPrice * (1 + 1/leverage)
    // currentPrice = 50000, leverage = 10
    // liquidationPrice = 50000 * (1 + 1/10) = 50000 * 1.1 = 55000
    const screen = await render(
      <LeverageDialog
        {...defaultProps}
        currentPrice={50000}
        leverage={10}
        side="short"
      >
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    await expect.element(screen.getByText("55,000")).toBeVisible();
  });

  test("updates liquidation price when leverage changes", async () => {
    const screen = await render(
      <LeverageDialog
        {...defaultProps}
        currentPrice={50000}
        leverage={10}
        side="long"
      >
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    // Initial: 50000 * (1 - 1/10) = 45000
    await expect.element(screen.getByText("45,000")).toBeVisible();

    // Change to 20x leverage
    await userEvent.click(screen.getByLabelText("20x"));

    // New: 50000 * (1 - 1/20) = 50000 * 0.95 = 47500
    await expect.element(screen.getByText("47,500")).toBeVisible();
  });

  test("multiple leverage selections before confirm only submits final value", async () => {
    const onLeverageChange = vi.fn();
    const screen = await render(
      <LeverageDialog
        {...defaultProps}
        leverage={10}
        onLeverageChange={onLeverageChange}
      >
        <span>Set Leverage</span>
      </LeverageDialog>,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set Leverage"));

    // Click multiple leverage buttons
    await userEvent.click(screen.getByLabelText("5x"));
    await userEvent.click(screen.getByLabelText("20x"));
    await userEvent.click(screen.getByLabelText("2x"));

    // Confirm
    await userEvent.click(screen.getByText("Set 2x"));

    // Should only be called once with the final value
    expect(onLeverageChange).toHaveBeenCalledTimes(1);
    expect(onLeverageChange).toHaveBeenCalledWith(2);
  });
});

describe("LeverageDialogContent", () => {
  const defaultContentProps = {
    onClose: vi.fn(),
    leverage: 10,
    onLeverageChange: vi.fn(),
    currentPrice: 50000,
    maxLeverage: 40,
    side: "long" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders all UI elements", async () => {
    const screen = await render(
      <LeverageDialogContent {...defaultContentProps} />,
      { wrapper: TestWrapper },
    );

    await expect.element(screen.getByTestId("leverage-title")).toBeVisible();
    await expect
      .element(screen.getByTestId("leverage-display"))
      .toHaveTextContent("10x");
    await expect
      .element(screen.getByText("Est. Liquidation Price"))
      .toBeVisible();
    await expect.element(screen.getByText("Current price")).toBeVisible();
    await expect.element(screen.getByText("Set 10x")).toBeVisible();
  });

  test("onClose is called when X button is clicked", async () => {
    const onClose = vi.fn();
    const screen = await render(
      <LeverageDialogContent {...defaultContentProps} onClose={onClose} />,
      { wrapper: TestWrapper },
    );

    const closeButton = screen.getByRole("button", { name: "" }).nth(0);
    await userEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("onLeverageChange and onClose are called when confirm is clicked", async () => {
    const onClose = vi.fn();
    const onLeverageChange = vi.fn();
    const screen = await render(
      <LeverageDialogContent
        {...defaultContentProps}
        onClose={onClose}
        onLeverageChange={onLeverageChange}
        leverage={10}
      />,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Set 10x"));

    expect(onLeverageChange).toHaveBeenCalledWith(10);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("renders leverage toggle options", async () => {
    const screen = await render(
      <LeverageDialogContent {...defaultContentProps} maxLeverage={40} />,
      { wrapper: TestWrapper },
    );

    // generateLeverageButtons(40) returns [2, 5, 10, 20, 40]
    await expect.element(screen.getByLabelText("2x")).toBeVisible();
    await expect.element(screen.getByLabelText("5x")).toBeVisible();
    await expect.element(screen.getByLabelText("10x")).toBeVisible();
    await expect.element(screen.getByLabelText("20x")).toBeVisible();
    await expect.element(screen.getByLabelText("40x")).toBeVisible();
  });
});
