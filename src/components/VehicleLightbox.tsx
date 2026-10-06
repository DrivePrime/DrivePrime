import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSwipe } from "@/hooks/use-swipe";
import type { Photo } from "./VehicleGallery";

interface VehicleLightboxProps {
  photos: Photo[];
  label: string;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

// Full-screen view, loaded on demand. Radix Dialog handles focus trap, Escape and scroll lock.
export default function VehicleLightbox({
  photos,
  label,
  index,
  onIndex,
  onClose,
}: VehicleLightboxProps) {
  const { t, isRTL } = useLanguage();
  const many = photos.length > 1;
  const go = (dir: -1 | 1) =>
    onIndex((index + dir + photos.length) % photos.length);
  const swipe = useSwipe((dir) => many && go((isRTL ? -dir : dir) as -1 | 1));
  const photo = photos[index];

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="lightbox-fade fixed inset-0 z-[60] bg-[hsl(216_20%_3%/0.96)]" />
        <Dialog.Content
          aria-describedby={undefined}
          dir={isRTL ? "rtl" : "ltr"}
          onKeyDown={(e) => {
            if (!many) return;
            if (e.key === "ArrowRight") go(isRTL ? -1 : 1);
            if (e.key === "ArrowLeft") go(isRTL ? 1 : -1);
          }}
          className="fixed inset-0 z-[60] flex flex-col outline-none"
          {...swipe}
        >
          <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))]">
            <Dialog.Title className="type-wide text-[15px] font-semibold text-foreground">
              {label}
              {many && (
                <span className="tabular ms-3 font-normal text-muted-foreground">
                  {index + 1} / {photos.length}
                </span>
              )}
            </Dialog.Title>
            <Dialog.Close
              aria-label={t.gallery.close}
              className="grid h-11 w-11 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <img
              key={photo.image}
              src={photo.image}
              alt={
                many
                  ? `${label} – ${t.gallery.photo(index + 1, photos.length)}`
                  : label
              }
              className="lightbox-zoom max-h-full max-w-full select-none rounded-sm object-contain"
              draggable={false}
            />
            {many && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t.gallery.prev}
                  className="absolute start-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-foreground/10 text-foreground transition-colors hover:bg-foreground/20"
                >
                  <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t.gallery.next}
                  className="absolute end-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-foreground/10 text-foreground transition-colors hover:bg-foreground/20"
                >
                  <ChevronRight className="h-6 w-6 rtl:rotate-180" />
                </button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
