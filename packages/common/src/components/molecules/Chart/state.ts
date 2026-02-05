import { Atom } from "@effect-atom/atom-react";
import { Array as _Array, Option, Record, Schema } from "effect";
import tradingViewSymbols from "../../../assets/tradingview-symbols.json" with {
  type: "json",
};

const TradingViewSymbolSchema = Schema.Array(
  Schema.Struct({
    perpsSymbol: Schema.String,
    tradingViewSymbol: Schema.String,
    providerId: Schema.String,
  }),
);

const tradingViewSymbolsRecordAtom = Atom.make(() => {
  const decoded = Schema.decodeUnknownSync(TradingViewSymbolSchema)(
    tradingViewSymbols,
  );

  return Record.fromIterableBy(decoded, (v) => v.perpsSymbol);
}).pipe(Atom.keepAlive);

export const tradingViewSymbolAtom = Atom.family((perpsSymbol: string) =>
  Atom.map(tradingViewSymbolsRecordAtom, (record) =>
    Record.get(record, perpsSymbol),
  ),
);

export const CHART_INTERVALS = [
  { value: "15", label: "15m" },
  { value: "30", label: "30m" },
  { value: "60", label: "1h" },
  { value: "D", label: "1d" },
  { value: "W", label: "1w" },
];

export const INITIAL_INTERVAL = _Array
  .head(CHART_INTERVALS)
  .pipe(Option.getOrThrow).value;
