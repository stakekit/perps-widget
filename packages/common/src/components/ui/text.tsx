import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const textVariants = cva("", {
  variants: {
    variant: {
      inherit: "",
      titleXl: "font-semibold text-xl text-foreground",
      titleXlTight: "font-semibold text-xl text-foreground tracking-[-0.6px]",
      titleLg:
        "text-foreground text-lg font-semibold leading-tight tracking-[-0.72px]",
      titleMd:
        "text-foreground text-md font-semibold leading-tight tracking-[-0.54px]",
      bodyMd: "text-md",
      headingBase: "text-foreground font-semibold text-base",
      headingBaseTight:
        "text-foreground font-semibold text-base tracking-tight",
      labelBaseWhite: "text-white font-semibold text-base tracking-tight",
      labelBase: "font-semibold text-base tracking-tight",
      labelSm: "font-semibold text-sm tracking-tight",
      labelSmSemibold: "text-sm font-semibold",
      labelBaseSemibold: "text-base font-semibold",
      labelXs: "font-semibold text-xs tracking-tight",
      labelSmWhiteNeg:
        "font-semibold text-sm text-white tracking-[-0.42px] leading-tight",
      labelSmWhiteNegNoLeading:
        "font-semibold text-sm text-white tracking-[-0.42px]",
      labelSmForegroundNeg:
        "font-semibold text-sm text-foreground tracking-[-0.42px] leading-tight",
      bodySmWhiteNeg:
        "text-sm text-white font-normal tracking-[-0.42px] leading-tight",
      bodySmWhiteNegNoLeading:
        "text-white text-sm font-normal tracking-[-0.42px]",
      bodySmWhite: "text-white text-sm font-normal",
      labelSmGray2Tight: "text-gray-2 font-semibold text-sm tracking-tight",
      labelSmGray2Neg: "text-gray-2 text-sm font-semibold tracking-[-0.42px]",
      labelSmGray2NegTight:
        "text-gray-2 font-semibold text-sm leading-tight tracking-[-0.42px]",
      bodySmGray2: "text-sm text-gray-2",
      bodySmMedium: "text-sm font-medium",
      bodySmGray2Tight: "text-gray-2 text-sm font-normal tracking-tight",
      bodySmTight: "text-sm font-normal tracking-tight",
      bodySmGray2Neg: "text-gray-2 text-sm font-normal tracking-[-0.42px]",
      bodySmGray2NegTight:
        "text-gray-2 font-normal text-sm tracking-[-0.42px] leading-tight",
      bodySmNeg: "text-sm font-normal tracking-[-0.42px]",
      bodyXsGray2: "text-xs text-gray-2",
      labelXsGray2: "text-gray-2 font-semibold text-xs tracking-tight",
      labelXsWhiteNeg: "text-white text-xs font-semibold tracking-[-0.24px]",
      helperSmGray1: "text-gray-1 text-sm",
      helperSmGray1Tight: "text-gray-1 text-sm tracking-tight",
      bodyXsGray2Medium: "font-medium text-gray-2 text-xs",
      bodySmForegroundMedium: "font-medium text-foreground text-sm",
      bodyBaseForegroundMedium: "font-medium text-foreground",
      bodyBaseForegroundMediumTight:
        "font-medium text-foreground tracking-tight",
      caption11Gray2Medium: "font-medium text-[11px] text-gray-2",
      amountDisplay30:
        "text-white font-semibold text-[30px] tracking-tight leading-tight",
      amountDisplay44:
        "text-white text-[44px] font-semibold tracking-[-1.76px] leading-none",
      optionTitle:
        "text-white font-bold text-base tracking-[-0.48px] leading-tight",
      badgePrimary:
        "px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary",
      badgeDestructive:
        "px-2.5 py-1 text-xs font-semibold rounded-full bg-destructive/10 text-destructive",
      badgeNeutral:
        "px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-3 text-gray-2",
      badgeWhiteSmall:
        "bg-white/25 px-1.5 py-1 rounded-[5px] text-[11px] text-white leading-none",
      badgeWhiteTight:
        "bg-white/25 px-1.5 py-1 rounded text-[11px] text-white text-center leading-tight",
      badgeSideTight:
        "px-1.5 py-1 rounded text-[11px] text-white text-center leading-tight",
    },
  },
  defaultVariants: {
    variant: "bodySmGray2",
  },
});

type TextAs = "span" | "p" | "div" | "label" | "h1" | "h2" | "h3";

export type TextProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof textVariants> & {
    as?: TextAs;
  };

export function Text({ as = "span", variant, className, ...props }: TextProps) {
  const Comp = as;
  return (
    <Comp
      data-slot="text"
      className={cn(textVariants({ variant }), className)}
      {...props}
    />
  );
}
