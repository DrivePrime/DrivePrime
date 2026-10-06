import { useEffect, useRef } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { PreferenceTrigger, type PreferenceMenuProps } from "./PreferenceMenu";

/* Radix handles keyboard, focus return, Escape and collision; RTL follows the page. */
// Loaded on first hover/focus/click by PreferenceMenu.
export default function PreferenceMenuPanel<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  defaultOpen = false,
}: PreferenceMenuProps<T> & { defaultOpen?: boolean }) {
  const { isRTL } = useLanguage();
  const current = options.find((o) => o.value === value) ?? options[0];
  const contentRef = useRef<HTMLDivElement>(null);

  // Opened right after loading: start on the current choice, as a native menu would.
  useEffect(() => {
    if (!defaultOpen) return;
    const id = requestAnimationFrame(() =>
      contentRef.current
        ?.querySelector<HTMLElement>('[data-state="checked"]')
        ?.focus(),
    );
    return () => cancelAnimationFrame(id);
  }, [defaultOpen]);

  return (
    <DropdownMenu.Root
      dir={isRTL ? "rtl" : "ltr"}
      modal={false}
      defaultOpen={defaultOpen}
    >
      <DropdownMenu.Trigger asChild>
        <PreferenceTrigger
          current={current}
          label={label}
          className={className}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          ref={contentRef}
          align="end"
          sideOffset={10}
          collisionPadding={12}
          className="pref-pop z-[70] min-w-[11.5rem] overflow-hidden rounded-md border border-foreground/10 bg-popover p-1.5 shadow-[0_24px_50px_-20px_rgb(0_0_0/0.85)]"
        >
          <DropdownMenu.Label className="px-3 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={value}
            onValueChange={(v) => onChange(v as T)}
          >
            {options.map((o) => (
              <DropdownMenu.RadioItem
                key={o.value}
                value={o.value}
                className="relative flex h-10 cursor-pointer select-none items-center gap-3 rounded-sm px-3 text-[14px] text-foreground/85 outline-none transition-colors data-[highlighted]:bg-foreground/[0.07] data-[state=checked]:text-foreground"
              >
                <span lang={o.lang} className="flex-1">
                  {o.label}
                </span>
                {o.hint && (
                  <span className="text-[13px] text-muted-foreground">
                    {o.hint}
                  </span>
                )}
                <span className="grid w-4 place-items-center">
                  <DropdownMenu.ItemIndicator>
                    <Check
                      className="h-4 w-4 text-primary"
                      aria-hidden="true"
                    />
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
