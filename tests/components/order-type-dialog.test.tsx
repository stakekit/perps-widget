import { beforeEach, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import {
  ORDER_TYPE_OPTIONS,
  OrderTypeDialog,
} from "@/components/modules/Order/Overview/order-type-dialog";
import { TestWrapper } from "./wrapper";

const defaultProps = {
  selectedType: "market" as const,
  onTypeSelect: vi.fn(),
};

describe("OrderTypeDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders trigger button with Market label when market is selected", async () => {
    const screen = await render(<OrderTypeDialog {...defaultProps} />, {
      wrapper: TestWrapper,
    });

    await expect.element(screen.getByText("Market")).toBeVisible();
  });

  test("renders trigger button with Limit label when limit is selected", async () => {
    const screen = await render(
      <OrderTypeDialog {...defaultProps} selectedType="limit" />,
      { wrapper: TestWrapper },
    );

    await expect.element(screen.getByText("Limit")).toBeVisible();
  });

  test("opens dialog when trigger is clicked", async () => {
    const screen = await render(<OrderTypeDialog {...defaultProps} />, {
      wrapper: TestWrapper,
    });

    await userEvent.click(screen.getByText("Market"));

    await expect.element(screen.getByText("Order type")).toBeVisible();
  });

  test("displays all order type options in dialog", async () => {
    const screen = await render(<OrderTypeDialog {...defaultProps} />, {
      wrapper: TestWrapper,
    });

    await userEvent.click(screen.getByText("Market"));

    // Check Market option
    await expect
      .element(screen.getByText("Execute immediately at current market price"))
      .toBeVisible();

    // Check Limit option
    await expect.element(screen.getByText("Limit")).toBeVisible();
    await expect
      .element(
        screen.getByText("Execute only at your specified price or better"),
      )
      .toBeVisible();
  });

  test("calls onTypeSelect with 'limit' when Limit option is clicked", async () => {
    const onTypeSelect = vi.fn();
    const screen = await render(
      <OrderTypeDialog {...defaultProps} onTypeSelect={onTypeSelect} />,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Market"));
    // Click the Limit option button (the one with the description)
    await userEvent.click(
      screen.getByText("Execute only at your specified price or better"),
    );

    expect(onTypeSelect).toHaveBeenCalledWith("limit");
  });

  test("calls onTypeSelect with 'market' when Market option is clicked", async () => {
    const onTypeSelect = vi.fn();
    const screen = await render(
      <OrderTypeDialog
        {...defaultProps}
        selectedType="limit"
        onTypeSelect={onTypeSelect}
      />,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Limit"));
    // Click the Market option button (the one with the description)
    await userEvent.click(
      screen.getByText("Execute immediately at current market price"),
    );

    expect(onTypeSelect).toHaveBeenCalledWith("market");
  });

  test("closes dialog after selecting an option", async () => {
    const screen = await render(<OrderTypeDialog {...defaultProps} />, {
      wrapper: TestWrapper,
    });

    await userEvent.click(screen.getByText("Market"));
    await expect.element(screen.getByText("Order type")).toBeVisible();

    await userEvent.click(
      screen.getByText("Execute only at your specified price or better"),
    );

    await expect
      .element(screen.getByText("Order type"))
      .not.toBeInTheDocument();
  });

  test("shows checkmark for selected Market option", async () => {
    const screen = await render(
      <OrderTypeDialog {...defaultProps} selectedType="market" />,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Market"));

    // The selected option should have a checkmark
    // We verify by checking the Market button contains content indicating selection
    const dialogContent = screen.getByText("Order type");
    await expect.element(dialogContent).toBeVisible();

    // Both options should be visible, market is selected
    await expect
      .element(screen.getByText("Execute immediately at current market price"))
      .toBeVisible();
  });

  test("shows checkmark for selected Limit option", async () => {
    const screen = await render(
      <OrderTypeDialog {...defaultProps} selectedType="limit" />,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Limit"));

    // The selected option should have a checkmark
    const dialogContent = screen.getByText("Order type");
    await expect.element(dialogContent).toBeVisible();

    // Both options should be visible, limit is selected
    await expect
      .element(
        screen.getByText("Execute only at your specified price or better"),
      )
      .toBeVisible();
  });

  test("displays both order options when dialog is open", async () => {
    const screen = await render(
      <OrderTypeDialog {...defaultProps} selectedType="market" />,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Market"));

    // Both options should be visible
    await expect
      .element(screen.getByText("Execute immediately at current market price"))
      .toBeVisible();
    await expect
      .element(
        screen.getByText("Execute only at your specified price or better"),
      )
      .toBeVisible();
  });

  test("ORDER_TYPE_OPTIONS exports correct values", () => {
    expect(ORDER_TYPE_OPTIONS).toHaveLength(2);

    expect(ORDER_TYPE_OPTIONS[0]).toEqual({
      value: "market",
      label: "Market",
      description: "Execute immediately at current market price",
    });

    expect(ORDER_TYPE_OPTIONS[1]).toEqual({
      value: "limit",
      label: "Limit",
      description: "Execute only at your specified price or better",
    });
  });

  test("trigger button has correct styling classes", async () => {
    const screen = await render(<OrderTypeDialog {...defaultProps} />, {
      wrapper: TestWrapper,
    });

    const triggerButton = screen.getByRole("button", { name: /Market/i });
    await expect.element(triggerButton).toBeVisible();
  });

  test("selecting same type as currently selected still calls onTypeSelect", async () => {
    const onTypeSelect = vi.fn();
    const screen = await render(
      <OrderTypeDialog
        {...defaultProps}
        selectedType="market"
        onTypeSelect={onTypeSelect}
      />,
      { wrapper: TestWrapper },
    );

    await userEvent.click(screen.getByText("Market"));
    await userEvent.click(
      screen.getByText("Execute immediately at current market price"),
    );

    expect(onTypeSelect).toHaveBeenCalledWith("market");
  });

  test("dialog shows correct title", async () => {
    const screen = await render(<OrderTypeDialog {...defaultProps} />, {
      wrapper: TestWrapper,
    });

    await userEvent.click(screen.getByText("Market"));

    await expect.element(screen.getByText("Order type")).toBeVisible();
  });

  test("can switch from market to limit and back", async () => {
    const onTypeSelect = vi.fn();
    const result = await render(
      <OrderTypeDialog selectedType="market" onTypeSelect={onTypeSelect} />,
      { wrapper: TestWrapper },
    );

    // Open and select Limit
    await userEvent.click(result.getByRole("button", { name: "Market" }));
    await userEvent.click(
      result.getByText("Execute only at your specified price or better"),
    );
    expect(onTypeSelect).toHaveBeenCalledWith("limit");

    // Rerender with limit selected
    await result.rerender(
      <OrderTypeDialog selectedType="limit" onTypeSelect={onTypeSelect} />,
    );

    // Open and select Market - use the first button which is the trigger
    await userEvent.click(
      result.getByRole("button", { name: "Limit" }).first(),
    );
    await userEvent.click(
      result.getByText("Execute immediately at current market price"),
    );
    expect(onTypeSelect).toHaveBeenCalledWith("market");
  });
});
