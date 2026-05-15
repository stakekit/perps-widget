export const portfolioReactivityKeys = {
  positions: "positions",
  orders: "orders",
  providersBalances: "providersBalances",
  selectedProviderBalances: "selectedProviderBalances",
} as const;

export const portfolioReactivityKeysArray = Object.values(
  portfolioReactivityKeys,
);
