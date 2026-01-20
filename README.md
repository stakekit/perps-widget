# Perps Widget

A self-custodial perpetual futures trading widget built with React. Trade perpetual contracts on Hyperliquid with full control of your assets.

## Features

- **Perpetual Trading**: Open long and short positions with customizable leverage
- **Multiple Order Types**: Market and limit orders supported
- **Risk Management**: Take profit and stop loss (TP/SL) orders
- **Position Management**: Increase, decrease, or close positions
- **Wallet Integration**: Connect via WalletConnect (Reown AppKit)
- **Real-time Data**: Live market prices and portfolio updates
- **Embeddable Widget**: Compact 400×600px design perfect for embedding

## Tech Stack

- **React 19** with React Compiler
- **TanStack Router** for file-based routing
- **Effect** for functional error handling and services
- **Tailwind CSS v4** for styling
- **Viem + Wagmi** for Ethereum interactions
- **Reown AppKit** for wallet connections

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `VITE_PERPS_BASE_URL` - Perps API endpoint
- `VITE_PERPS_API_KEY` - Perps API key
- `VITE_REOWN_PROJECT_ID` - Reown (WalletConnect) project ID
- `VITE_MORALIS_API_KEY` - Moralis API key for token balances

### Development

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Build

```bash
pnpm build
```

### Linting

```bash
pnpm lint
```

## Project Structure

```
src/
├── atoms/          # State management (Effect Atom)
├── components/
│   ├── modules/    # Feature components (Home, Order, Account, etc.)
│   ├── molecules/  # Reusable compound components
│   └── ui/         # Base UI components
├── context/        # React context providers
├── domain/         # Domain types and business logic
├── hooks/          # Custom React hooks
├── routes/         # File-based routes (TanStack Router)
└── services/       # API clients and external services
```

## License

[BSL-1.1](LICENSE) - Business Source License 1.1

Converts to MIT on 2030-01-20.
