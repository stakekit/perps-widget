import { cva, type VariantProps } from "class-variance-authority";
import { getNetworkLogo } from "../../lib/utils";

const tokenIconVariants = cva("relative flex items-end", {
  variants: {
    size: {
      xs: "size-4",
      sm: "size-6",
      md: "size-8",
      lg: "size-10",
      xl: "size-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const networkBadgeVariants = cva(
  "rounded-full absolute right-[-1px] bottom-[-1px] object-contain bg-background flex items-center justify-center p-0.5",
  {
    variants: {
      size: {
        xs: "size-2.5",
        sm: "size-3",
        md: "size-4",
        lg: "size-5",
        xl: "size-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export type TokenIconProps = {
  logoURI: string;
  name: string;
  network?: string;
} & VariantProps<typeof tokenIconVariants>;

export function TokenIcon({ logoURI, name, network, size }: TokenIconProps) {
  return (
    <div className={tokenIconVariants({ size })}>
      <img
        src={logoURI}
        alt={name}
        className="w-full h-full rounded-full object-contain"
      />

      {network && (
        <img
          src={getNetworkLogo(network)}
          alt={network}
          className={networkBadgeVariants({ size })}
        />
      )}
    </div>
  );
}
