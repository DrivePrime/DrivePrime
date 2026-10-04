import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export interface PreferenceOption<T extends string> {
  value: T;
  /** Short code shown on the trigger (FR, EUR…) */
  short: string;
  /** Full name in the list (Français, Euro…) */
  label: string;
  /** Optional secondary text in the list (€, DH) */
  hint?: string;
  lang?: string;
}

interface PreferenceMenuProps<T extends string> {
  label: string;
  value: T;
  options: PreferenceOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/*
  Compact header preference (language, currency): "FR ⌄" opens a small list.
  Radix handles keyboard, focus return, Escape and collision; RTL follows the page.
*/
export default function PreferenceMenu<T extends string>({ label, value, options, onChange, className }: PreferenceMenuProps<T>) {
  const { isRTL } = useLanguage();
  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <DropdownMenu.Root dir={isRTL ? "rtl" : "ltr"} modal={false}>
      <DropdownMenu.Trigger
        aria-label={`${label} : ${current.label}`}
        className={cn(
          "group/pref inline-flex h-9 items-center gap-1.5 rounded-sm px-2 text-[13px] font-semibold tracking-[0.06em] text-foreground/80 transition-colors hover:text-foreground data-[state=open]:text-foreground",
          className,
        )}
      >
        <span lang={current.lang}>{current.short}</span>
        <ChevronDown
          aria-hidden="true"
          className="h-3.5 w-3.5 text-foreground/50 transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-data-[state=open]/pref:rotate-180 group-hover/pref:text-foreground/80"
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          collisionPadding={12}
          className="pref-pop z-[70] min-w-[11.5rem] overflow-hidden rounded-md border border-foreground/10 bg-popover p-1.5 shadow-[0_24px_50px_-20px_rgb(0_0_0/0.85)]"
        >
          <DropdownMenu.Label className="px-3 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={value} onValueChange={(v) => onChange(v as T)}>
            {options.map((o) => (
              <DropdownMenu.RadioItem
                key={o.value}
                value={o.value}
                className="relative flex h-10 cursor-pointer select-none items-center gap-3 rounded-sm px-3 text-[14px] text-foreground/85 outline-none transition-colors data-[highlighted]:bg-foreground/[0.07] data-[state=checked]:text-foreground"
              >
                <span lang={o.lang} className="flex-1">
                  {o.label}
                </span>
                {o.hint && <span className="text-[13px] text-muted-foreground">{o.hint}</span>}
                <span className="grid w-4 place-items-center">
                  <DropdownMenu.ItemIndicator>
                    <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                  </DropdownMenu.ItemIndicator>
                </span>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
