import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva("flex flex-col w-full");

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return <div className={cn(cardVariants(), className)} {...props} />;
}

const cardSectionVariants = cva("bg-gray-3 px-4 py-[18px]", {
  variants: {
    position: {
      first: "rounded-t-2xl",
      middle: "border-t border-[#090909]",
      last: "rounded-b-2xl border-t border-[#090909]",
      only: "rounded-2xl",
    },
  },
  defaultVariants: {
    position: "only",
  },
});

interface CardSectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardSectionVariants> {}

function CardSection({ className, position, ...props }: CardSectionProps) {
  return (
    <div
      className={cn(cardSectionVariants({ position }), className)}
      {...props}
    />
  );
}

export { Card, CardSection, cardVariants, cardSectionVariants };
