import { useState } from "react";
import { fr, enGB, arMA } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/i18n/LanguageContext";
import { DateTrigger, type DateFieldProps } from "./DateField";
import { dateToIso, isoToDate } from "@/lib/dates";

const locales = { fr, en: enGB, ar: arMA };

// Loaded on demand by DateField.
export default function DatePopover({
  id,
  value,
  onChange,
  min,
  invalid,
  describedBy,
  defaultOpen = false,
}: DateFieldProps & { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const { language, isRTL } = useLanguage();
  const selected = value ? isoToDate(value) : undefined;
  const minDate = min ? isoToDate(min) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <DateTrigger id={id} value={value} invalid={invalid} describedBy={describedBy} />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={12}
        className="w-auto rounded-md border-border bg-card p-0 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.7)]"
      >
        <Calendar
          mode="single"
          locale={locales[language]}
          dir={isRTL ? "rtl" : "ltr"}
          selected={selected}
          defaultMonth={selected ?? minDate}
          disabled={minDate ? { before: minDate } : undefined}
          onSelect={(date) => {
            if (!date) return;
            onChange(dateToIso(date));
            setOpen(false);
          }}
          initialFocus
          classNames={{
            caption_label: "text-sm font-semibold capitalize",
            nav_button_previous: "absolute start-1",
            nav_button_next: "absolute end-1",
            day_today: "text-primary font-semibold",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
