import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { confirmed, whatsappUrl, type ServiceKey } from "@/config/business";
import { sceneFor, type ServiceScene } from "@/data/service-scenes";
import { useSwipe } from "@/hooks/use-swipe";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";

/*
  "Nos services" — one photograph per service, changed like a cut in a car film:
  the new shot is wiped in from the side you travel towards while the old one eases back,
  the title/description step up and out then in, the counter rolls and the brass marker slides.
  ~600 ms desktop, ~400 ms phones, instant with reduced motion. Never autoplays.
  A change only starts once the next photo is decoded (or after a short timeout) — no blank frame.
*/
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
const pad = (n: number) => String(n).padStart(2, "0");
const HOVER_INTENT_MS = 140;
const EXIT_MS = 700; // the outgoing shot is unmounted once the longest animation is over
const DECODE_WAIT_MS = 350;
const SIZES = "(min-width: 1024px) 56vw, 100vw";

// One decode per photo, kept for the page's lifetime (same srcset/sizes as the <img>, same file picked)
const decoded = new Map<string, Promise<void>>();
const warm = (scene?: ServiceScene) => {
  if (!scene || typeof window === "undefined") return Promise.resolve();
  let p = decoded.get(scene.src);
  if (!p) {
    const img = new Image();
    img.sizes = SIZES;
    img.srcset = scene.srcSet;
    img.src = scene.src;
    p = img.decode().catch(() => undefined);
    decoded.set(scene.src, p);
  }
  return p;
};

type Item = { key: string; title: string; description: string };
type Phase = "enter" | "exit" | "idle";

function Shot({
  scene,
  item,
  phase,
  eager,
}: {
  scene: ServiceScene;
  item: Item;
  phase: Phase;
  eager?: boolean;
}) {
  return (
    <div
      className={cn(
        "shot absolute inset-0",
        phase !== "idle" && `shot-${phase}`,
      )}
      aria-hidden="true"
    >
      <img
        src={scene.src}
        srcSet={scene.srcSet}
        sizes={SIZES}
        alt=""
        width={1344}
        height={752}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="shot-media absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: scene.position }}
      />
      {/* Light shade at the very bottom only, so the caption reads without dulling the photo */}
      <div className="shot-shade absolute inset-0 hidden sm:block" />
      <div className="shot-caption absolute inset-x-0 bottom-0 hidden p-8 sm:block lg:p-9">
        <div className="max-w-[34rem]">
          <h3 className="type-display text-[2.3rem] font-semibold text-white lg:text-[2.4rem]">
            {item.title}
          </h3>
          <p className="mt-3 max-w-[44ch] text-base leading-relaxed text-white/85">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const { t, isRTL } = useLanguage();
  const items = t.services.items.filter(
    (item) => confirmed.services[item.key as ServiceKey],
  );
  const scenes = items.map((it) => sceneFor(it.key));
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [marker, setMarker] = useState({ top: 0, height: 0, ready: false });
  const [near, setNear] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const activeRef = useRef(0);
  const request = useRef(0);
  // Separate refs: the phone row and the desktop list are two renderings of the same tabs.
  const rowTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const listTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const hoverTimer = useRef<number>();
  const exitTimer = useRef<number>();
  const baseId = useId();

  const select = (to: number) => {
    if (!items[to]) return;
    const ticket = ++request.current;
    if (to === activeRef.current) return;
    const go = () => {
      const from = activeRef.current;
      if (ticket !== request.current || to === from) return;
      activeRef.current = to;
      window.clearTimeout(exitTimer.current);
      setDir(to > from ? 1 : -1);
      // Reduced motion (no js-motion class): plain cut, no outgoing layer
      if (document.documentElement.classList.contains("js-motion")) {
        setLeaving(from);
        exitTimer.current = window.setTimeout(() => setLeaving(null), EXIT_MS);
      }
      setActive(to);
    };
    // Start as soon as the photo is decoded (usually already done by the warm-up)
    Promise.race([
      warm(scenes[to]),
      new Promise((r) => window.setTimeout(r, DECODE_WAIT_MS)),
    ]).then(go);
  };

  // Phones: keep the active chip in view (scrolls the row only, never the page)
  useEffect(() => {
    const chip = rowTabs.current[active];
    const row = chip?.parentElement;
    if (!chip || !row || row.scrollWidth <= row.clientWidth) return;
    // rect-based delta: also correct in RTL, where scrollLeft runs negative
    const c = chip.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    const left = c.left + c.width / 2 - (r.left + r.width / 2);
    const smooth = document.documentElement.classList.contains("js-motion");
    row.scrollBy({ left, behavior: smooth ? "smooth" : "auto" });
  }, [active]);

  // Brass marker travels to the active row (desktop list)
  useIsoLayoutEffect(() => {
    const place = () => {
      const btn = listTabs.current[active];
      if (btn)
        setMarker({
          top: btn.offsetTop,
          height: btn.offsetHeight,
          ready: true,
        });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active, t]);

  // Only the first photo comes with the page; the neighbours are decoded once the section is near.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !("IntersectionObserver" in window)) return setNear(true);
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setNear(true),
      { rootMargin: "500px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const count = scenes.length;
  useEffect(() => {
    if (!near || count === 0) return;
    warm(scenes[active]).then(() => {
      warm(scenes[(active + 1) % count]);
      warm(scenes[(active - 1 + count) % count]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scenes only depend on the service keys
  }, [near, active, count]);

  useEffect(
    () => () => {
      window.clearTimeout(hoverTimer.current);
      window.clearTimeout(exitTimer.current);
    },
    [],
  );

  const swipe = useSwipe((d) => {
    const step = isRTL ? -d : d;
    select((activeRef.current + step + items.length) % items.length);
  });

  if (items.length === 0) return null;
  const current = items[active];
  // Screen direction of travel: +1 = the next shot comes from the right edge
  const travel = isRTL ? -dir : dir;

  const onKey = (e: KeyboardEvent, i: number, horizontal: boolean) => {
    const keys = horizontal
      ? isRTL
        ? ["ArrowLeft", "ArrowRight"]
        : ["ArrowRight", "ArrowLeft"]
      : ["ArrowDown", "ArrowUp"];
    let to = i;
    if (e.key === keys[0]) to = (i + 1) % items.length;
    else if (e.key === keys[1]) to = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = items.length - 1;
    else return;
    e.preventDefault();
    (horizontal ? rowTabs : listTabs).current[to]?.focus();
    select(to);
  };

  const counter = (
    <p
      dir="ltr"
      className="tabular flex items-baseline gap-1.5 text-[13px] font-semibold"
    >
      <span className="relative inline-block overflow-hidden text-primary">
        <span
          key={active}
          className={cn(
            "inline-block",
            leaving !== null && (dir === 1 ? "roll-up" : "roll-down"),
          )}
        >
          {pad(active + 1)}
        </span>
      </span>
      <span className="opacity-60">/ {pad(items.length)}</span>
    </p>
  );

  const caption = (i: number, phase: Phase) => (
    <div
      key={i}
      className={cn("[grid-area:1/1]", phase !== "idle" && `cap-${phase}`)}
      aria-hidden={phase === "exit" || undefined}
    >
      <h3 className="type-display text-[1.7rem] font-semibold leading-tight text-foreground">
        {items[i].title}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        {items[i].description}
      </p>
    </div>
  );

  const arrowBtn =
    "grid h-11 w-11 place-items-center rounded-full border border-foreground/20 text-foreground transition-[background-color,border-color,transform] duration-200 active:scale-95 active:bg-foreground/10";

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-labelledby="services-title"
      className="relative py-24 lg:py-32"
    >
      <div className="container grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-14">
        {/* Heading + service selector */}
        <div className="min-w-0 lg:col-span-5">
          <h2
            id="services-title"
            data-reveal="rise"
            className="type-display text-4xl font-semibold text-foreground sm:text-5xl"
          >
            {t.services.title}
          </h2>
          <p
            data-reveal="rise"
            style={{ "--reveal-delay": "110ms" } as CSSProperties}
            className="mt-5 max-w-[42ch] text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {t.services.intro}
          </p>

          {/* Phones / tablets: compact swipeable row */}
          <div
            role="tablist"
            aria-label={t.services.listLabel}
            data-reveal="rise"
            style={{ "--reveal-delay": "200ms" } as CSSProperties}
            className="no-scrollbar -mx-5 mt-7 flex snap-x gap-2 overflow-x-auto scroll-px-5 px-5 lg:hidden"
          >
            {items.map((s, i) => (
              <button
                key={s.key}
                ref={(el) => (rowTabs.current[i] = el)}
                id={`${baseId}-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={i === active}
                aria-controls={`${baseId}-panel`}
                tabIndex={i === active ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(e) => onKey(e, i, true)}
                className={cn(
                  "h-11 shrink-0 snap-start whitespace-nowrap rounded-full border px-4 text-[14px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  i === active
                    ? "border-primary/70 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground",
                )}
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* Desktop: vertical list; one brass marker slides to the active row */}
          <div
            role="tablist"
            aria-label={t.services.listLabel}
            aria-orientation="vertical"
            data-reveal="stagger"
            style={{ "--reveal-delay": "200ms" } as CSSProperties}
            className="relative mt-10 hidden lg:block"
          >
            <span
              aria-hidden="true"
              className={cn("svc-marker", marker.ready && "is-ready")}
              style={{ top: marker.top, height: marker.height }}
            />
            {items.map((s, i) => (
              <button
                key={s.key}
                ref={(el) => (listTabs.current[i] = el)}
                id={`${baseId}-vtab-${i}`}
                role="tab"
                type="button"
                aria-selected={i === active}
                aria-controls={`${baseId}-panel`}
                tabIndex={i === active ? 0 : -1}
                data-active={i === active || undefined}
                style={{ "--i": i } as CSSProperties}
                onClick={() => {
                  window.clearTimeout(hoverTimer.current);
                  select(i);
                }}
                onMouseEnter={() => {
                  warm(scenes[i]);
                  window.clearTimeout(hoverTimer.current);
                  hoverTimer.current = window.setTimeout(
                    () => select(i),
                    HOVER_INTENT_MS,
                  );
                }}
                onMouseLeave={() => window.clearTimeout(hoverTimer.current)}
                onKeyDown={(e) => onKey(e, i, false)}
                className="svc-row flex w-full items-center gap-5 border-t border-foreground/10 py-4 ps-6 text-start last:border-b"
              >
                <span className="tabular w-6 text-[12px] font-semibold opacity-50">
                  {pad(i + 1)}
                </span>
                <span className="type-wide flex-1 text-lg font-semibold">
                  {s.title}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="svc-arrow h-4 w-4 rtl:rotate-180"
                />
              </button>
            ))}
          </div>
        </div>

        {/* The shot */}
        <div className="min-w-0 lg:col-span-7">
          <div
            data-reveal="wipe"
            style={{ "--reveal-delay": "300ms" } as CSSProperties}
          >
            <div
              data-travel={travel > 0 ? "end" : "start"}
              style={{ "--travel": travel } as CSSProperties}
              {...swipe}
              className="svc-stage relative aspect-[4/3] touch-pan-y overflow-hidden rounded-lg bg-card sm:aspect-[16/11] lg:aspect-[6/5]"
            >
              {leaving !== null && (
                <Shot
                  key={leaving}
                  scene={scenes[leaving]}
                  item={items[leaving]}
                  phase="exit"
                />
              )}
              <Shot
                key={active}
                scene={scenes[active]}
                item={current}
                phase={leaving !== null ? "enter" : "idle"}
                eager={near}
              />
              <div className="svc-counter absolute end-5 top-5 z-10 hidden rounded-full bg-black/60 px-3 py-1.5 text-white backdrop-blur-sm sm:block">
                {counter}
              </div>
            </div>
          </div>

          {/* Accessible panel; on phones the caption sits under the photo with counter + arrows */}
          <div
            id={`${baseId}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${active}`}
            aria-live="polite"
          >
            <p className="sr-only">
              {current.title}. {current.description}
            </p>
            <div aria-hidden="true" className="sm:hidden">
              <div className="mt-5 flex items-center justify-between gap-4 text-foreground">
                {counter}
                <div className="flex gap-2">
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={t.services.prev}
                    onClick={() =>
                      select(
                        (activeRef.current - 1 + items.length) % items.length,
                      )
                    }
                    className={arrowBtn}
                  >
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={t.services.next}
                    onClick={() =>
                      select((activeRef.current + 1) % items.length)
                    }
                    className={arrowBtn}
                  >
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
              {/* Both captions share one grid cell: the old one steps up and out while the new one arrives */}
              <div className="mt-3 grid min-h-[7.5rem]">
                {leaving !== null && caption(leaving, "exit")}
                {caption(active, leaving !== null ? "enter" : "idle")}
              </div>
            </div>
            {/* Fixed slot: the CTA must not change the column height, or the centred list
                would shift under the cursor and hover would hop to the neighbouring row. */}
            <div className="h-16">
              {current.key === "quickBooking" && (
                <a
                  href={whatsappUrl(t.whatsapp.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-4 h-11 sm:mt-5"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {t.hero.ctaWhatsapp}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
