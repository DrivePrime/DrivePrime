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
import {
  sceneFor,
  sceneImages,
  type ServiceScene,
} from "@/data/service-scenes";
import { bookingRequest } from "@/lib/booking-message";
import { useSwipe } from "@/hooks/use-swipe";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";

/*
  "Nos services" — one visual world per service.
  Changing service: a mask sweeps the new scene in while the old one eases back; layered
  (studio) scenes bring background, car and overlay in a short sequence; caption, counter and
  the brass marker follow. ~620 ms on desktop, ~420 ms on phones, instant with reduced motion.
  Desktop hover previews after a short intent delay (no flicker on accidental passes); click is immediate.
*/
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
const pad = (n: number) => String(n).padStart(2, "0");
const HOVER_INTENT_MS = 140;
const SCENE_MS = 700; // the outgoing scene is unmounted once the longest animation is over

const warmed = new Set<string>();
const preload = (scene?: ServiceScene) =>
  scene &&
  sceneImages(scene).forEach((src) => {
    if (warmed.has(src)) return;
    warmed.add(src);
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  });

type Item = { key: string; title: string; description: string };
type Phase = "enter" | "exit" | "idle";

function SceneView({
  scene,
  item,
  message,
  phase,
}: {
  scene: ServiceScene;
  item: Item;
  message: string;
  phase: Phase;
}) {
  return (
    <div
      className={cn(
        "scene absolute inset-0",
        phase === "enter" && "scene-enter",
        phase === "exit" && "scene-exit",
      )}
      aria-hidden="true"
    >
      {scene.kind === "photo" ? (
        <img
          src={scene.src}
          srcSet={scene.srcSet}
          sizes="(min-width: 1024px) 56vw, 100vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="scene-media absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: scene.position }}
        />
      ) : (
        <div
          className={cn(
            "scene-studio absolute inset-0",
            scene.mood === "night" && "is-night",
          )}
        >
          <div className="scene-bg absolute inset-0" />
          <div className="scene-car absolute inset-x-[5%] top-[16%] sm:inset-x-[7%] sm:top-[8%]">
            <div
              className="stage"
              style={{ "--stage-zoom": 1.04 } as CSSProperties}
            >
              <img
                src={scene.vehicle.image}
                srcSet={`${scene.vehicle.thumb} 768w, ${scene.vehicle.image} 1536w`}
                sizes="(min-width: 1024px) 48vw, 90vw"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          {scene.overlay === "message" && (
            // The real request the site sends on WhatsApp (same builder as every CTA) — not a screenshot
            <div className="scene-overlay absolute start-[5%] top-[6%] w-[min(18rem,72%)] rounded-lg rounded-ss-sm bg-[#1f2c34] px-4 py-3 shadow-[0_24px_50px_-20px_rgb(0_0_0/0.9)]">
              <p
                dir="auto"
                className="whitespace-pre-line text-[12px] leading-relaxed text-[#e9edef] sm:text-[12.5px]"
              >
                {message}
              </p>
            </div>
          )}
        </div>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-[linear-gradient(to_top,hsl(var(--background)/0.92)_0%,hsl(var(--background)/0.35)_40%,transparent_62%)] sm:block"
      />
      {/* Caption on the image (tablet / desktop) */}
      <div className="scene-caption absolute inset-x-0 bottom-0 hidden p-9 sm:block">
        <div className="max-w-[34rem]">
          <h3 className="type-display text-[2.4rem] font-semibold text-foreground">
            {item.title}
          </h3>
          <p className="mt-3 max-w-[44ch] text-base leading-relaxed text-foreground/80">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const { t, language, isRTL } = useLanguage();
  const items = t.services.items.filter(
    (item) => confirmed.services[item.key as ServiceKey],
  );
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [marker, setMarker] = useState({ top: 0, height: 0, ready: false });
  const [near, setNear] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  // Separate refs: the phone row and the desktop list are two renderings of the same tabs.
  const rowTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const listTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const hoverTimer = useRef<number>();
  const exitTimer = useRef<number>();
  const baseId = useId();
  const scenes = items.map((it) => sceneFor(it.key));
  const message = bookingRequest(t, language, {});

  const select = (to: number) => {
    if (to === active || !items[to]) return;
    window.clearTimeout(exitTimer.current);
    setDir(to > active ? 1 : -1);
    // Reduced motion (no js-motion class): plain swap, no outgoing layer
    if (document.documentElement.classList.contains("js-motion")) {
      setLeaving(active);
      exitTimer.current = window.setTimeout(() => setLeaving(null), SCENE_MS);
    }
    setActive(to);
  };

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

  // Only the first scene loads with the page; neighbours are warmed once the section is near.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !("IntersectionObserver" in window)) return setNear(true);
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setNear(true),
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const count = scenes.length;
  useEffect(() => {
    if (!near || count === 0) return;
    preload(scenes[(active + 1) % count]);
    preload(scenes[(active - 1 + count) % count]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scenes is derived from the language-independent keys
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
    select((active + step + items.length) % items.length);
  });

  if (items.length === 0) return null;
  const current = items[active];

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
    select(to);
    (horizontal ? rowTabs : listTabs).current[to]?.focus();
  };

  const counter = (
    <p
      dir="ltr"
      className="tabular flex items-baseline gap-1.5 text-[13px] font-semibold text-primary"
    >
      <span className="inline-block overflow-hidden">
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
      <span className="text-foreground/45">/ {pad(items.length)}</span>
    </p>
  );

  const arrowBtn =
    "grid h-11 w-11 place-items-center rounded-full border border-foreground/20 text-foreground transition-[background-color,border-color,color,transform] duration-200 active:scale-95";

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
          <div data-reveal="rise">
            <h2
              id="services-title"
              className="type-display text-4xl font-semibold text-foreground sm:text-5xl"
            >
              {t.services.title}
            </h2>
            <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.services.intro}
            </p>
          </div>

          {/* Phones / tablets: compact swipeable row */}
          <div
            role="tablist"
            aria-label={t.services.listLabel}
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
                  "h-11 shrink-0 snap-start whitespace-nowrap rounded-full border px-4 text-[14px] font-medium transition-colors",
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
            style={{ "--reveal-delay": "160ms" } as CSSProperties}
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
                  preload(scenes[i]);
                  window.clearTimeout(hoverTimer.current);
                  hoverTimer.current = window.setTimeout(
                    () => select(i),
                    HOVER_INTENT_MS,
                  );
                }}
                onMouseLeave={() => window.clearTimeout(hoverTimer.current)}
                onFocus={() => select(i)}
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

        {/* The scene */}
        <div className="min-w-0 lg:col-span-7">
          <div
            data-reveal="clip"
            style={{ "--reveal-delay": "280ms" } as CSSProperties}
            {...swipe}
            className="relative aspect-[4/3] touch-pan-y overflow-hidden rounded-lg bg-card sm:aspect-[16/11] lg:aspect-[6/5]"
          >
            {leaving !== null && (
              <SceneView
                key={leaving}
                scene={scenes[leaving]}
                item={items[leaving]}
                message={message}
                phase="exit"
              />
            )}
            <SceneView
              key={active}
              scene={scenes[active]}
              item={current}
              message={message}
              phase={leaving !== null ? "enter" : "idle"}
            />
            <div className="absolute end-5 top-5 z-10 hidden rounded-full bg-background/60 px-3 py-1.5 backdrop-blur-sm sm:block">
              {counter}
            </div>
          </div>

          {/* Accessible panel; on phones the caption sits under the image with counter + arrows */}
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
              <div className="mt-5 flex items-center justify-between gap-4">
                {counter}
                <div className="flex gap-2">
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={t.services.prev}
                    onClick={() =>
                      select((active - 1 + items.length) % items.length)
                    }
                    className={arrowBtn}
                  >
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={t.services.next}
                    onClick={() => select((active + 1) % items.length)}
                    className={arrowBtn}
                  >
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
              <div
                key={active}
                className={cn("mt-3", leaving !== null && "service-swap")}
              >
                <h3 className="type-display text-[1.75rem] font-semibold text-foreground">
                  {current.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {current.description}
                </p>
              </div>
            </div>
            {/* Fixed slot on desktop: the CTA must not change the column height, or the centred list
                would shift under the cursor and hover would hop to the neighbouring row. */}
            <div className="lg:h-16">
              {current.key === "quickBooking" && (
                <a
                  href={whatsappUrl(t.whatsapp.general)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5 h-11"
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
