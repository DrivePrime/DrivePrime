import { forwardRef, lazy, Suspense, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/*
  Compact header preference (language, currency): "FR ⌄" opens a small list.
  The trigger is light; the menu itself (Radix + positioning) is code-split and fetched
  on first hover/focus, then opened on click — same pattern as the location field.
*/
const loadPanel = () => import("./PreferenceMenuPanel");
const PreferenceMenuPanel = lazy(loadPanel);

export interface PreferenceOption<T extends string> {
  value: T;
  /** Short code shown on the trigger (FR, EUR…) */
  short: string;
  /** Full name in the list (Français, English…) */
  label: string;
  /** Optional secondary text in the list (€, DH) */
  hint?: string;
  lang?: string;
}

export interface PreferenceMenuProps<T extends string> {
  label: string;
  value: T;
  options: PreferenceOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

type TriggerProps = {
  current: PreferenceOption<string>;
  label: string;
} & React.ComponentPropsWithoutRef<"button">;

// forwardRef: also used as the Radix trigger (asChild) once the menu is loaded.
export const PreferenceTrigger = forwardRef<HTMLButtonElement, TriggerProps>(
  function PreferenceTrigger({ current, label, className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-haspopup="menu"
        aria-label={`${label} : ${current.label}`}
        className={cn(
          "group/pref inline-flex h-9 items-center gap-1.5 rounded-sm px-2 text-[13px] font-semibold tracking-[0.06em] text-foreground/80 transition-colors hover:text-foreground data-[state=open]:text-foreground",
          className,
        )}
        {...rest}
      >
        <span lang={current.lang}>{current.short}</span>
        <ChevronDown
          aria-hidden="true"
          className="h-3.5 w-3.5 text-foreground/50 transition-transform duration-300 [transition-timing-function:var(--ease-premium)] group-data-[state=open]/pref:rotate-180 group-hover/pref:text-foreground/80"
        />
      </button>
    );
  },
);

export default function PreferenceMenu<T extends string>(
  props: PreferenceMenuProps<T>,
) {
  const [activated, setActivated] = useState(false);
  const current =
    props.options.find((o) => o.value === props.value) ?? props.options[0];

  if (!activated) {
    return (
      <PreferenceTrigger
        current={current}
        label={props.label}
        className={props.className}
        aria-expanded={false}
        onPointerEnter={loadPanel}
        onFocus={loadPanel}
        onClick={() => setActivated(true)}
      />
    );
  }
  return (
    <Suspense
      fallback={
        <PreferenceTrigger
          current={current}
          label={props.label}
          className={props.className}
          aria-busy="true"
        />
      }
    >
      <PreferenceMenuPanel {...props} defaultOpen />
    </Suspense>
  );
}
