import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { CalendarDays, Check, MapPin } from "lucide-react";
import { vehicles } from "@/data/vehicles";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCurrency } from "@/i18n/CurrencyContext";
import { bookingRequest, formatDay, locationText } from "@/lib/booking-message";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";
import poster768 from "@/assets/step-rouler-768.webp";
import poster1280 from "@/assets/step-rouler-1280.webp";

/*
  "Réserver en trois étapes" — the three visuals tell one story.
  01 and 02 are small, real Drive Prime interfaces (real fleet, real labels, the real WhatsApp
  message builder) played by a quiet cursor. 03 is the owner's film.
  Each demo is drawn at a fixed design size (360 × 270) and scaled to its frame, so it reads the
  same at every width. It plays only while visible; reduced motion shows its final state, still.
*/

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
const DESIGN_W = 360;
const DESIGN_H = 270;
const PICKUP = "Marrakech - Aéroport";
const byId = (id: string) => vehicles.find((v) => v.id === id)!;

const motionAllowed = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("js-motion");

/** Visible on screen (≥ 35 %), for pausing timelines and films. */
function useOnScreen(ref: RefObject<HTMLElement>, threshold = 0.35) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => setOn(entries[entries.length - 1].isIntersecting),
      {
        threshold,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return on;
}

/**
 * A looping list of phases (each with its duration). Advances only while `running`;
 * without motion it rests on `finalPhase`.
 */
function useTimeline(
  durations: number[],
  running: boolean,
  finalPhase: number,
) {
  const [phase, setPhase] = useState(0);
  const [still, setStill] = useState(false);
  useEffect(() => setStill(!motionAllowed()), []);
  useEffect(() => {
    if (still || !running) return;
    const id = window.setTimeout(
      () => setPhase((p) => (p + 1) % durations.length),
      durations[phase],
    );
    return () => window.clearTimeout(id);
  }, [phase, running, still, durations]);
  return still ? finalPhase : phase;
}

/** Fixed-size stage scaled to its frame. */
function Scaled({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useIsoLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const fit = () =>
      setK(Math.min(el.clientWidth / DESIGN_W, el.clientHeight / DESIGN_H));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      ref={outer}
      className="relative h-full w-full overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="demo-stage absolute start-1/2 top-1/2"
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `translate(-50%, -50%) scale(${k})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** The cursor glides to the centre of a target inside the stage. */
function Cursor({
  stage,
  target,
  press,
}: {
  stage: RefObject<HTMLDivElement>;
  target: string;
  press?: boolean;
}) {
  const [pos, setPos] = useState({ x: DESIGN_W + 30, y: DESIGN_H * 0.7 });
  useIsoLayoutEffect(() => {
    const root = stage.current;
    const el = root?.querySelector<HTMLElement>(`[data-target="${target}"]`);
    if (!root || !el) return setPos({ x: DESIGN_W + 30, y: DESIGN_H * 0.7 });
    // offsets inside the unscaled stage
    let x = el.offsetWidth * 0.55;
    let y = el.offsetHeight * 0.6;
    let n: HTMLElement | null = el;
    while (n && n !== root) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent as HTMLElement | null;
    }
    setPos({ x, y });
  }, [target, stage]);
  return (
    <svg
      className={cn("demo-cursor", press && "is-press")}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      width="18"
      height="22"
      viewBox="0 0 18 22"
    >
      <path
        d="M1.5 1.5v16.2l4.3-3.9 2.7 6.1 2.9-1.3-2.7-6h5.8z"
        fill="#f3efe9"
        stroke="#0f1115"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ───────────────────────── 01 — Choisir ───────────────────────── */

const CATS = [
  { key: "Économique", cars: ["fiat-500", "clio-5", "hyundai-accent"] },
  {
    key: "SUV",
    cars: ["dacia-duster", "hyundai-tucson", "range-rover-evoque"],
  },
  {
    key: "Luxe",
    cars: ["range-rover-vogue", "range-rover-sport", "mercedes-classe-g"],
  },
] as const;
const CHOSEN = 1; // Range Rover Sport, in the middle of the "Luxe" row

// phase → [cursor target, category, selected, cta, press]
const CHOOSE: [string, number, boolean, boolean, boolean][] = [
  ["out", 0, false, false, false],
  ["cat-0", 0, false, false, true],
  ["cat-1", 1, false, false, true],
  ["cat-2", 2, false, false, true],
  ["car-1", 2, false, false, false],
  ["car-1", 2, true, false, true],
  ["cta", 2, true, true, false],
  ["cta", 2, true, true, true],
  ["out", 2, true, true, false],
];
const CHOOSE_MS = [700, 900, 1000, 1000, 650, 450, 750, 500, 1400];

export function ChooseDemo() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const on = useOnScreen(frame);
  const phase = useTimeline(CHOOSE_MS, on, 7);
  const [target, cat, selected, cta, press] = CHOOSE[phase];
  const cars = CATS[cat].cars.map(byId);

  return (
    <div ref={frame} className="h-full w-full">
      <Scaled>
        <div ref={stage} className="relative h-full w-full p-4">
          {/* categories: type and a brass marker, like the real fleet rail */}
          <div className="flex items-end gap-5 border-b border-foreground/10 text-[12.5px]">
            {CATS.map((c, i) => (
              <span
                key={c.key}
                data-target={`cat-${i}`}
                className={cn(
                  "relative pb-2 font-semibold transition-colors duration-300",
                  i === cat ? "text-foreground" : "text-foreground/45",
                )}
              >
                {t.fleet.categories[c.key]}
                <span className="ms-1.5 text-[11px] font-medium text-foreground/40">
                  {vehicles.filter((v) => v.category === c.key).length}
                </span>
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-px h-px bg-primary transition-opacity duration-300",
                    i === cat ? "opacity-100" : "opacity-0",
                  )}
                />
              </span>
            ))}
          </div>

          {/* cars of the category: real photos, names and daily rates */}
          <div key={cat} className="demo-cars mt-4 grid grid-cols-3 gap-2">
            {cars.map((v, i) => {
              const isChosen = selected && i === CHOSEN;
              return (
                <div
                  key={v.id}
                  data-target={`car-${i}`}
                  className={cn(
                    "demo-car rounded-md border bg-card p-2 transition-[transform,border-color,opacity] duration-500",
                    isChosen
                      ? "is-chosen border-primary/70"
                      : "border-foreground/10",
                    selected && !isChosen && "opacity-45",
                  )}
                >
                  <div
                    className="stage rounded-sm"
                    style={{ "--stage-zoom": 1 } as React.CSSProperties}
                  >
                    <img
                      src={v.thumb}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width={768}
                      height={432}
                    />
                  </div>
                  <p className="mt-2 truncate text-[11px] font-semibold text-foreground">
                    {v.name}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-foreground/55">
                    <span className="tabular font-semibold text-foreground/85">
                      {formatPrice(v.pricePerDay)}
                    </span>{" "}
                    {t.fleet.perDay}
                  </p>
                </div>
              );
            })}
          </div>

          {/* the chosen car's action */}
          <div className="mt-4 flex justify-center">
            <span
              data-target="cta"
              className={cn(
                "demo-cta inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-3.5 text-[11.5px] font-semibold text-primary-foreground",
                cta && "is-on",
              )}
            >
              <WhatsAppIcon className="h-3 w-3" />
              {t.fleet.book} · {byId(CATS[2].cars[CHOSEN]).name}
            </span>
          </div>
          <Cursor stage={stage} target={target} press={press} />
        </div>
      </Scaled>
    </div>
  );
}

/* ───────────────────────── 02 — Réserver ───────────────────────── */

// phase → [cursor target, calendar open, start, end, location, message, sent, press]
const BOOK: [
  string,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
][] = [
  ["out", false, false, false, false, false, false, false],
  ["start", true, false, false, false, false, false, true],
  ["day-a", true, true, false, false, false, false, true],
  ["day-b", true, true, true, false, false, false, true],
  ["loc", false, true, true, false, false, false, false],
  ["loc", false, true, true, true, false, false, true],
  ["send", false, true, true, true, true, false, false],
  ["send", false, true, true, true, true, false, true],
  ["send", false, true, true, true, true, true, false],
  ["out", false, true, true, true, true, true, false],
];
const BOOK_MS = [600, 700, 650, 800, 550, 650, 1300, 450, 1500, 600];

export function BookDemo() {
  const { t, language } = useLanguage();
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const on = useOnScreen(frame);
  const phase = useTimeline(BOOK_MS, on, 8);
  const [target, calOpen, hasStart, hasEnd, hasLoc, showMsg, sent, press] =
    BOOK[phase];

  // Dates: the 12th → 16th of next month (always in the future)
  const [dates] = useState(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const iso = (d: number) => {
      const dt = new Date(y, m, d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    };
    return { year: y, month: m, start: iso(12), end: iso(16) };
  });
  const locale =
    language === "ar" ? "ar-MA" : language === "en" ? "en-GB" : "fr-FR";
  const monthLabel = new Date(dates.year, dates.month, 1).toLocaleDateString(
    locale,
    { month: "long", year: "numeric" },
  );
  const first = new Date(dates.year, dates.month, 1).getDay(); // 0 = Sunday
  const offset = (first + 6) % 7; // weeks start on Monday
  const days = new Date(dates.year, dates.month + 1, 0).getDate();
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "narrow" }),
  );
  const message = bookingRequest(t, language, {
    vehicle: byId("range-rover-sport").name,
    location: PICKUP,
    start: dates.start,
    end: dates.end,
  });

  const field =
    "flex h-9 items-center gap-2 rounded-sm border bg-background px-2.5 text-[11px] transition-colors";
  return (
    <div ref={frame} className="h-full w-full">
      <Scaled>
        <div ref={stage} className="relative h-full w-full p-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <p className="mb-1 text-[10.5px] font-medium text-foreground/55">
                {t.booking.location}
              </p>
              <div
                data-target="loc"
                className={cn(
                  field,
                  target === "loc"
                    ? "border-primary/70"
                    : "border-foreground/15",
                )}
              >
                <MapPin className="h-3 w-3 text-primary" />
                <span
                  className={hasLoc ? "text-foreground" : "text-foreground/40"}
                >
                  {hasLoc
                    ? locationText(PICKUP, language, t)
                    : t.booking.locationPlaceholder}
                </span>
              </div>
            </div>
            {[
              {
                key: "start",
                label: t.booking.startDate,
                value: hasStart ? formatDay(dates.start) : "",
              },
              {
                key: "end",
                label: t.booking.endDate,
                value: hasEnd ? formatDay(dates.end) : "",
              },
            ].map((f) => (
              <div key={f.key}>
                <p className="mb-1 text-[10.5px] font-medium text-foreground/55">
                  {f.label}
                </p>
                <div
                  data-target={f.key}
                  className={cn(
                    field,
                    "justify-between",
                    (f.key === "start" && calOpen && !hasStart) ||
                      (f.key === "end" && calOpen && hasStart)
                      ? "border-primary/70"
                      : "border-foreground/15",
                  )}
                >
                  <span
                    dir="ltr"
                    className={cn(
                      "tabular",
                      f.value ? "text-foreground" : "text-foreground/40",
                    )}
                  >
                    {f.value || "—"}
                  </span>
                  <CalendarDays className="h-3 w-3 text-foreground/45" />
                </div>
              </div>
            ))}
          </div>

          {/* calendar: the real month, 12 → 16 picked */}
          <div
            className={cn(
              "demo-pop absolute inset-x-4 top-[6.6rem] z-[4] rounded-md border border-foreground/12 bg-popover p-3 shadow-[0_24px_50px_-20px_rgb(0_0_0/0.9)]",
              calOpen && "is-on",
            )}
          >
            <p className="mb-2 text-center text-[10.5px] font-semibold capitalize text-foreground">
              {monthLabel}
            </p>
            <div className="grid grid-cols-7 gap-y-0.5 text-center text-[10.5px]">
              {weekdays.map((d, i) => (
                <span key={i} className="pb-1 text-foreground/40">
                  {d}
                </span>
              ))}
              {Array.from({ length: offset }, (_, i) => (
                <span key={`e${i}`} />
              ))}
              {Array.from({ length: days }, (_, i) => {
                const d = i + 1;
                const isA = d === 12 && hasStart;
                const isB = d === 16 && hasEnd;
                const inRange = hasEnd && d > 12 && d < 16;
                return (
                  <span
                    key={d}
                    data-target={
                      d === 12 ? "day-a" : d === 16 ? "day-b" : undefined
                    }
                    className={cn(
                      "tabular mx-auto grid h-[1.15rem] w-[1.15rem] place-items-center rounded-full transition-colors duration-200",
                      isA || isB
                        ? "bg-primary font-semibold text-primary-foreground"
                        : inRange
                          ? "bg-primary/15 text-foreground"
                          : "text-foreground/75",
                    )}
                  >
                    {d}
                  </span>
                );
              })}
            </div>
          </div>

          {/* the exact message the site sends — no price, ever */}
          <div
            className={cn(
              "demo-msg absolute inset-x-4 bottom-[3.6rem] rounded-lg rounded-ss-sm bg-[#1f2c34] px-3 py-2.5",
              showMsg && "is-on",
            )}
          >
            <p
              dir="auto"
              className="line-clamp-4 whitespace-pre-line text-[10.5px] leading-[1.4] text-[#e9edef]"
            >
              {message}
            </p>
          </div>

          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3">
            <span
              className={cn(
                "demo-sent flex items-center gap-1.5 text-[11px] text-foreground/70",
                sent && "is-on",
              )}
            >
              <Check className="h-3 w-3 text-primary" />
              {showMsg && !sent
                ? t.process.demoPrepared
                : t.process.demoOpening}
            </span>
            <span
              data-target="send"
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-3 text-[10.5px] font-semibold text-primary-foreground transition-opacity duration-300",
                showMsg ? "opacity-100" : "opacity-40",
              )}
            >
              <WhatsAppIcon className="h-3 w-3" />
              {t.contact.send}
            </span>
          </div>
          <Cursor stage={stage} target={target} press={press} />
        </div>
      </Scaled>
    </div>
  );
}

/* ───────────────────────── 03 — Rouler ───────────────────────── */

/**
 * The owner's film, looping while visible (paused only when fully off screen; poster with reduced
 * motion). Its last frame does not match its first, so the loop seam is covered: the poster (= the
 * first frame) fades in over the last ~0.5 s, the film restarts underneath, the poster fades out.
 */
const SEAM_S = 0.5;
const POSTER_SET = `${poster768} 768w, ${poster1280} 1280w`;
export function DriveFilm() {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const on = useOnScreen(box, 0);
  const [ready, setReady] = useState(false);
  const [seam, setSeam] = useState(false);
  useEffect(() => {
    const v = video.current;
    if (!v || !motionAllowed()) return;
    if (!on) {
      v.pause();
      return;
    }
    if (!v.src)
      v.src =
        v.clientWidth * (window.devicePixelRatio || 1) > 1000
          ? "/videos/steps/03-rouler.mp4"
          : "/videos/steps/03-rouler-720.mp4";
    v.play().catch(() => undefined);
    // watch the play head frame by frame (timeupdate is too coarse for the seam)
    type Rvfc = HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
      cancelVideoFrameCallback?: (id: number) => void;
    };
    const rv = v as Rvfc;
    let id = 0;
    let raf = 0;
    const check = () => {
      if (v.duration) setSeam(v.duration - v.currentTime < SEAM_S);
      if (rv.requestVideoFrameCallback)
        id = rv.requestVideoFrameCallback(check);
      else raf = requestAnimationFrame(check);
    };
    check();
    return () => {
      if (id && rv.cancelVideoFrameCallback) rv.cancelVideoFrameCallback(id);
      cancelAnimationFrame(raf);
    };
  }, [on]);
  return (
    <div ref={box} className="relative h-full w-full">
      <img
        src={poster1280}
        srcSet={POSTER_SET}
        sizes="(min-width: 768px) 33vw, 84vw"
        alt=""
        loading="lazy"
        decoding="async"
        width={1280}
        height={720}
        className="absolute inset-0 h-full w-full object-cover object-[50%_55%]"
      />
      <video
        ref={video}
        muted
        playsInline
        loop
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setReady(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover object-[50%_55%] transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
      {/* seam cover: the first frame, over the film for the loop's last half second */}
      <img
        src={poster1280}
        srcSet={POSTER_SET}
        sizes="(min-width: 768px) 33vw, 84vw"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_55%] transition-opacity ease-in-out",
          seam && ready ? "opacity-100 duration-500" : "opacity-0 duration-700",
        )}
      />
    </div>
  );
}
