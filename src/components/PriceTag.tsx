import { useLanguage } from "@/i18n/LanguageContext";
import { useCurrency } from "@/i18n/CurrencyContext";
import { cn } from "@/lib/utils";

interface PriceTagProps {
  /** Daily rate in euros, as in the fleet data (never altered here). */
  pricePerDay: number;
  size?: "sm" | "md" | "lg";
  /** "stack": small label above the price; "inline": label before the price on one line. */
  layout?: "stack" | "inline";
  align?: "start" | "end";
  className?: string;
}

const priceSize = { sm: "text-lg", md: "text-xl", lg: "text-3xl" } as const;

/*
  Starting daily rate. "À partir de*" stays small and secondary; the asterisk refers to the
  price note shown with the fleet and on vehicle pages (t.fleet.priceNote).
*/
export default function PriceTag({ pricePerDay, size = "md", layout = "stack", align = "start", className }: PriceTagProps) {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const from = (
    <span className="text-[12px] font-medium leading-none tracking-wide text-muted-foreground">
      {t.fleet.from}
      <span aria-hidden="true">*</span>
    </span>
  );
  const price = (
    <span className="whitespace-nowrap leading-none">
      <span className={cn("tabular type-wide font-semibold text-foreground", priceSize[size])}>
        {formatPrice(pricePerDay)}
      </span>
      <span className="text-[13px] text-muted-foreground"> {t.fleet.perDay}</span>
    </span>
  );

  if (layout === "inline") {
    return (
      <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
        {from}
        {price}
      </p>
    );
  }
  return (
    <p className={cn("flex flex-col gap-1.5", align === "end" ? "items-end text-end" : "items-start", className)}>
      {from}
      {price}
    </p>
  );
}
