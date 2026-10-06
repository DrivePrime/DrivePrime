import { useState } from "react";
import { Command } from "cmdk";
import { Drawer } from "vaul";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Building2, Check, Plane, Search } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { cityName, citySpellings, pickupCities } from "@/data/locations";
import { LocationTrigger, type LocationFieldProps } from "./LocationField";

// Loaded on demand by LocationField.

// Accent- and case-insensitive substring match ("fes" finds "Fès", "tetouan" finds "Tétouan").
const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const matchLocation = (value: string, search: string, keywords?: string[]) => {
  const q = normalize(search);
  if (!q) return 1;
  return [value, ...(keywords ?? [])].some((k) => normalize(k).includes(q))
    ? 1
    : 0;
};

function LocationList({
  value,
  onSelect,
  autoFocus,
}: {
  value: string;
  onSelect: (id: string) => void;
  autoFocus: boolean;
}) {
  const { t, language, isRTL } = useLanguage();
  const [highlight, setHighlight] = useState(value);

  return (
    <Command
      label={t.booking.location}
      value={highlight}
      onValueChange={setHighlight}
      filter={matchLocation}
      loop
      dir={isRTL ? "rtl" : "ltr"}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex items-center gap-2.5 border-b border-border px-4">
        <Search
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <Command.Input
          autoFocus={autoFocus}
          placeholder={t.locations.search}
          className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/80"
        />
      </div>
      <Command.List className="max-h-[min(22rem,60dvh)] flex-1 overflow-y-auto overscroll-contain p-1.5 max-sm:max-h-none">
        <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
          {t.locations.empty}
        </Command.Empty>
        {pickupCities.map((group) => (
          <Command.Group
            key={group.city}
            heading={cityName(group.city, language)}
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            {group.items.map((loc) => {
              const selected = loc.id === value;
              return (
                <Command.Item
                  key={loc.id}
                  value={loc.id}
                  keywords={[...citySpellings(loc.city), t.locations[loc.kind]]}
                  onSelect={() => onSelect(loc.id)}
                  className="flex h-11 cursor-pointer select-none items-center gap-3 rounded-sm px-3 text-[15px] text-foreground/90 transition-colors data-[selected=true]:bg-foreground/[0.07] data-[selected=true]:text-foreground max-sm:h-12"
                >
                  {loc.kind === "airport" ? (
                    <Plane
                      className="h-4 w-4 shrink-0 text-muted-foreground rtl:-scale-x-100"
                      aria-hidden="true"
                    />
                  ) : (
                    <Building2
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  <span className="flex-1">
                    {t.locations[loc.kind]}
                    <span className="sr-only">
                      , {cityName(loc.city, language)}
                    </span>
                  </span>
                  {selected && (
                    <Check
                      className="h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </Command.Item>
              );
            })}
          </Command.Group>
        ))}
      </Command.List>
    </Command>
  );
}

export default function LocationPanel({
  id,
  value,
  onChange,
  defaultOpen = false,
}: LocationFieldProps & { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  // Phones get a bottom sheet with large rows; larger screens a popover under the field.
  const [phone] = useState(
    () => window.matchMedia("(max-width: 639px)").matches,
  );
  const { t, isRTL } = useLanguage();

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  if (phone) {
    return (
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>
          <LocationTrigger
            id={id}
            value={value}
            data-state={open ? "open" : "closed"}
          />
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <Drawer.Content
            dir={isRTL ? "rtl" : "ltr"}
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[82dvh] flex-col rounded-t-xl border-t border-border bg-popover pb-[env(safe-area-inset-bottom)] outline-none"
          >
            <div
              className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-foreground/20"
              aria-hidden="true"
            />
            <Drawer.Title className="type-wide px-5 pb-3 pt-4 text-lg font-semibold text-foreground">
              {t.booking.location}
            </Drawer.Title>
            <LocationList value={value} onSelect={select} autoFocus={false} />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <LocationTrigger id={id} value={value} />
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          dir={isRTL ? "rtl" : "ltr"}
          className="pop-in z-50 flex w-[max(var(--radix-popover-trigger-width),19rem)] flex-col overflow-hidden rounded-md border border-border bg-popover shadow-[0_24px_60px_-20px_rgb(0_0_0/0.7)]"
        >
          <LocationList value={value} onSelect={select} autoFocus />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
