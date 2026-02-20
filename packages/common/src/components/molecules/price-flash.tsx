import { useEffect, useRef } from "react";

export const PriceFlash = ({
  price,
  children,
}: {
  price: number;
  children: React.ReactNode;
}) => {
  const prevPrice = useRef(price);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;

    if (!el || price === prevPrice.current) {
      prevPrice.current = price;
      return;
    }

    const cls =
      price > prevPrice.current ? "price-flash-up" : "price-flash-down";
    prevPrice.current = price;

    el.classList.remove("price-flash-up", "price-flash-down");
    // Force reflow to restart animation when direction is the same
    void el.offsetWidth;
    el.classList.add(cls);
  }, [price]);

  return <span ref={ref}>{children}</span>;
};
