import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

/*
  Quiet reassurance: the vehicle is part of the fleet currently offered.
  Not a date-specific availability (that is confirmed on WhatsApp) — the hint says so.
*/
export default function Availability({
  long = false,
  className,
}: {
  long?: boolean;
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <span
      title={t.fleet.availableHint}
      className={cn(
        "inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-[hsl(142_45%_52%)]"
      />
      {long ? t.fleet.availableLong : t.fleet.available}
      <span className="sr-only"> — {t.fleet.availableHint}</span>
    </span>
  );
}
