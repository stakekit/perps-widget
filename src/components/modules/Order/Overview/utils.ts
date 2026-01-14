import { Option } from "effect";
import type { TPOrSLSettings } from "@/components/molecules/tp-sl-dialog";

export function formatTPOrSLSettings(settings: TPOrSLSettings): string {
  const tp = Option.fromNullable(settings.takeProfit.percentage).pipe(
    Option.filter((percentage) => percentage !== 0),
    Option.map((percentage) => `TP +${percentage}%`),
    Option.getOrElse(() => "TP Off"),
  );

  const sl = Option.fromNullable(settings.stopLoss.percentage).pipe(
    Option.filter((percentage) => percentage !== 0),
    Option.map((percentage) => `SL -${percentage}%`),
    Option.getOrElse(() => "SL Off"),
  );

  return `${tp}, ${sl}`;
}
