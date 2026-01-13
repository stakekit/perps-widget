import { cva, type VariantProps } from "class-variance-authority";
import { getNetworkLogo } from "@/lib/utils";
import type { Networks } from "@/services/api-client/client-factory";

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
  "rounded-full absolute right-0 bottom-0 object-contain",
  {
    variants: {
      size: {
        xs: "size-2",
        sm: "size-2.5",
        md: "size-3",
        lg: "size-4",
        xl: "size-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

type TokenIconProps = {
  logoURI: string;
  name: string;
  network?: Networks;
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
