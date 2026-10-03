import { forwardRef, lazy, Suspense, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { cityName, findLocation } from "@/data/locations";
import { cn } from "@/lib/utils";

/*
  Pick-up location selector. The trigger is light; the searchable list (cmdk, popover on
  desktop, bottom sheet on phones) is code-split and fetched when the visitor reaches for it.
*/
const loadPanel = () => import("./LocationPanel");
const LocationPanel = lazy(loadPanel);

export interface LocationFieldProps {
  id: string;
  /** Selected location id (original "City - Aéroport" label) */
  value: string;
  onChange: (id: string) => void;
}

function useLocationLabel(id: string) {
  const { language, t } = useLanguage();
  const loc = findLocation(id);
  if (!loc) return "";
  return `${cityName(loc.city, language)} – ${t.locations[loc.kind]}`;
}

type TriggerProps = { value: string } & React.ComponentPropsWithoutRef<"button">;

// forwardRef: used as the Radix trigger (asChild) anchor in the panel.
export const LocationTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function LocationTrigger(
  { value, className, ...rest },
  ref,
) {
  const { t } = useLanguage();
  const label = useLocationLabel(value);
  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="dialog"
      className={cn(
        "field group/loc flex items-center gap-2.5 text-start",
        !label && "text-muted-foreground/80",
        className,
      )}
      {...rest}
    >
      <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{label || t.locations.placeholder}</span>
      <ChevronDown
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/loc:rotate-180"
        aria-hidden="true"
      />
    </button>
  );
});

export default function LocationField({ id, value, onChange }: LocationFieldProps) {
  const [activated, setActivated] = useState(false);

  if (!activated) {
    return (
      <LocationTrigger
        id={id}
        value={value}
        aria-expanded={false}
        onPointerEnter={loadPanel}
        onFocus={loadPanel}
        onClick={() => setActivated(true)}
      />
    );
  }
  return (
    <Suspense fallback={<LocationTrigger id={id} value={value} aria-busy="true" />}>
      <LocationPanel id={id} value={value} onChange={onChange} defaultOpen />
    </Suspense>
  );
}
