import { forwardRef, lazy, Suspense, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { useDateLabel } from "@/lib/dates";

/*
  Date picker that follows the site language (native <input type="date"> follows the
  browser's locale instead). The calendar itself (react-day-picker + popover + date-fns
  locales) is code-split and only fetched when the visitor reaches for the field.
*/
const loadPopover = () => import("./DatePopover");
const DatePopover = lazy(loadPopover);

export interface DateFieldProps {
  id: string;
  value: string;
  onChange: (iso: string) => void;
  /** Earliest selectable day (ISO yyyy-mm-dd) */
  min?: string;
  invalid?: boolean;
  describedBy?: string;
}

type DateTriggerProps = Pick<
  DateFieldProps,
  "id" | "value" | "invalid" | "describedBy"
> &
  React.ComponentPropsWithoutRef<"button">;

// forwardRef: used as the Radix PopoverTrigger (asChild) anchor.
export const DateTrigger = forwardRef<HTMLButtonElement, DateTriggerProps>(
  function DateTrigger(
    { id, value, invalid, describedBy, className, ...rest },
    ref,
  ) {
    const { t } = useLanguage();
    const label = useDateLabel(value);
    return (
      <button
        ref={ref}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(
          "field tabular flex items-center justify-between gap-3 text-start",
          !label && "text-muted-foreground/80",
          invalid && "border-destructive",
          className,
        )}
        {...rest}
      >
        <span className="truncate">{label || t.booking.pickDate}</span>
        <CalendarDays
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </button>
    );
  },
);

export default function DateField(props: DateFieldProps) {
  const [activated, setActivated] = useState(false);

  if (!activated) {
    return (
      <DateTrigger
        id={props.id}
        value={props.value}
        invalid={props.invalid}
        describedBy={props.describedBy}
        aria-expanded={false}
        onPointerEnter={loadPopover}
        onFocus={loadPopover}
        onClick={() => setActivated(true)}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <DateTrigger
          id={props.id}
          value={props.value}
          invalid={props.invalid}
          aria-busy="true"
        />
      }
    >
      <DatePopover {...props} defaultOpen />
    </Suspense>
  );
}
