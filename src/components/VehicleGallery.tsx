import { lazy, Suspense, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { useSwipe } from "@/hooks/use-swipe";

const VehicleLightbox = lazy(() => import("./VehicleLightbox"));

export interface Photo {
  thumb: string;
  image: string;
}

interface VehicleGalleryProps {
  photos: Photo[];
  label: string;
  zoom: number;
}

/*
  Vehicle page gallery. Main photo on the studio stage, click/tap to open full screen.
  With several real photos: thumbnails, previous/next, swipe and arrow keys. With one photo
  (the case today) it stays a single large image that can be enlarged.
*/
export default function VehicleGallery({
  photos,
  label,
  zoom,
}: VehicleGalleryProps) {
  const { t, isRTL } = useLanguage();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const many = photos.length > 1;
  const go = (dir: -1 | 1) =>
    setIndex((i) => (i + dir + photos.length) % photos.length);
  // In Arabic the visual "next" is to the left.
  const swipe = useSwipe((dir) => many && go((isRTL ? -dir : dir) as -1 | 1));
  const current = photos[index];

  return (
    <div>
      <div className="group relative" {...swipe}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`${t.gallery.enlarge} – ${label}`}
          className="block w-full cursor-zoom-in rounded-md focus-visible:outline-offset-4"
        >
          <span
            className="stage block"
            style={{ "--stage-zoom": zoom } as CSSProperties}
          >
            <img
              key={current.image}
              src={current.image}
              srcSet={`${current.thumb} 768w, ${current.image} 1536w`}
              sizes="(min-width: 1024px) 60vw, 100vw"
              alt={
                many
                  ? `${label} – ${t.gallery.photo(index + 1, photos.length)}`
                  : label
              }
              width={1536}
              height={864}
              {...(index === 0 ? { fetchpriority: "high" } : {})}
              className={cn(index !== 0 && "anim-fade")}
            />
          </span>
        </button>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 end-4 grid h-10 w-10 place-items-center rounded-full border border-foreground/15 bg-background/60 text-foreground/80 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        >
          <Expand className="h-4 w-4" />
        </span>

        {many && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t.gallery.prev}
              className="absolute start-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-foreground/15 bg-background/60 text-foreground transition-colors hover:bg-background/90"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t.gallery.next}
              className="absolute end-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-foreground/15 bg-background/60 text-foreground transition-colors hover:bg-background/90"
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </>
        )}
      </div>

      {many && (
        <ul
          className="mt-4 flex gap-3 overflow-x-auto no-scrollbar"
          aria-label={label}
        >
          {photos.map((p, i) => (
            <li key={p.image} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t.gallery.photo(i + 1, photos.length)}
                aria-current={i === index}
                className={cn(
                  "block w-28 overflow-hidden rounded-sm border transition-[border-color,opacity] duration-200",
                  i === index
                    ? "border-primary opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <img
                  src={p.thumb}
                  alt=""
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <Suspense fallback={null}>
          <VehicleLightbox
            photos={photos}
            label={label}
            index={index}
            onIndex={setIndex}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
