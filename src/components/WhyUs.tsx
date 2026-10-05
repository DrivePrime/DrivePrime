import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MoveHorizontal } from "lucide-react";
import type { Material, MeshPhysicalMaterial as PhysicalMat } from "three";
import { vehicles } from "@/data/vehicles";
import { stageZoom } from "@/data/stage";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCurrency } from "@/i18n/CurrencyContext";
import { confirmed } from "@/config/business";
import { cn } from "@/lib/utils";

// A flagship of the real fleet, shown in its own studio photograph (fallback of the 3D car).
const FEATURED_ID = "range-rover-vogue";
const featured = vehicles.find((v) => v.id === FEATURED_ID) ?? vehicles[0];
const prices = vehicles.map((v) => v.pricePerDay);
const LOWEST = Math.min(...prices);
const HIGHEST = Math.max(...prices);

/*
  3D Range Rover Evoque — LOCAL PROTOTYPE ONLY, like the closing scene's G63 (model licence not
  cleared for the public site). Enabled in `vite` dev, or in a local build made with
  VITE_G63_LOCAL=true / VITE_3D_LOCAL=true. A normal build never loads it, and vite.config removes
  public/models from the output.
*/
const LOCAL_3D =
  import.meta.env.DEV ||
  import.meta.env.VITE_G63_LOCAL === "true" ||
  import.meta.env.VITE_3D_LOCAL === "true";
const EVOQUE_URL = "/models/evoque/evoque.glb";
const hasWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

/*
  "Pourquoi nous choisir ?" — the page turns to daylight. Short, legible arguments from the
  original site on a bone surface; the car sits in a dark "studio window" with facts taken only
  from the data or confirmed by the owner.
  Entrance (once, when ~25 % of the section is visible): title, introduction, then each argument —
  its title leading its explanation — while the studio window fades in and the car turns a little.
*/
export default function WhyUs() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const w = t.whyUs;
  const section = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  // One editorial line: figure first, small caption under it (data or owner-confirmed only)
  const stats = [
    {
      value: String(vehicles.length),
      label: w.stats.vehicles,
      full: w.factVehicles(vehicles.length),
    },
    {
      value: `${formatPrice(LOWEST)} – ${formatPrice(HIGHEST)}`,
      label: w.stats.perDay,
      full: w.factRange(formatPrice(LOWEST), formatPrice(HIGHEST)),
    },
    ...(confirmed.services.support24h
      ? [
          {
            value: w.stats.supportValue,
            label: w.stats.support,
            full: w.factSupport,
          },
        ]
      : []),
  ];

  // One entrance per visit: never replays while scrolling up and down
  useEffect(() => {
    const el = section.current;
    if (
      !el ||
      !("IntersectionObserver" in window) ||
      !document.documentElement.classList.contains("js-motion")
    ) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1]; // latest state wins
        if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={section}
      id="pourquoi"
      aria-labelledby="whyus-title"
      className={cn("whyus surface-light py-24 lg:py-32", shown && "is-in")}
    >
      <div className="container grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-6">
          <h2
            id="whyus-title"
            className="wy-title type-display text-4xl font-semibold text-foreground sm:text-5xl lg:text-[3.5rem]"
          >
            {w.title}
          </h2>
          <p className="wy-intro mt-6 max-w-[46ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            {w.intro}
          </p>

          <ul className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {w.reasons.map((reason, i) => (
              <li key={reason.title} style={{ "--i": i } as CSSProperties}>
                <h3 className="wy-point type-wide text-[1.35rem] font-semibold leading-tight text-foreground">
                  {reason.title}
                </h3>
                <p className="wy-detail mt-3 max-w-[34ch] text-[15px] leading-relaxed text-muted-foreground">
                  {reason.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Studio window: the photo's own night backdrop, framed as an object on the light page */}
        <figure className="wy-visual studio-window relative overflow-hidden rounded-xl lg:col-span-6">
          <EvoqueStage hint={w.explore} />
          <figcaption className="relative px-5 pb-7 pt-2 sm:px-8 sm:pb-8">
            <dl
              aria-label={w.factsLabel}
              className="wy-stats"
              style={{ "--n": stats.length } as CSSProperties}
            >
              {stats.map((st) => (
                <div key={st.label} className="wy-stat" title={st.full}>
                  <dt className="wy-stat-label">{st.label}</dt>
                  <dd dir="auto" className="wy-stat-value tabular">
                    {st.value}
                  </dd>
                </div>
              ))}
            </dl>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/** The studio photo, replaced by the interactive 3D Evoque once it is loaded (local prototype). */
function EvoqueStage({ hint }: { hint: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"photo" | "3d">("photo");
  const [hintOn, setHintOn] = useState(true);

  // Load the 22 MB model only when the section approaches; any failure keeps the photo.
  useEffect(() => {
    if (!LOCAL_3D || !frame.current || !canvas.current || !hasWebGL()) return;
    let stage: { dispose(): void } | null = null;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1]; // latest state wins
        if (!e.isIntersecting) return;
        io.disconnect();
        Promise.all([import("./footer-car-3d"), import("three")])
          .then(([{ mountCar }, THREE]) => {
            // The model's paint and glass are flat (no gloss); give them a lacquer and tinted glass.
            // Same material in → same material out, so meshes still merge by material.
            const swapped = new Map<Material, Material>();
            const tune = (mat: PhysicalMat, name: string) => {
              const hit = swapped.get(mat);
              if (hit) return hit;
              let next: Material = mat;
              if (/Pintura/i.test(name)) {
                next = new THREE.MeshPhysicalMaterial({
                  name,
                  color: mat.color.clone().multiplyScalar(0.8),
                  roughness: 0.22,
                  metalness: 0,
                  clearcoat: 1,
                  clearcoatRoughness: 0.04,
                });
              } else if (/Vidros/i.test(name)) {
                mat.roughness = 0.03;
                mat.metalness = 0.2;
                mat.color.setHex(0x05070a);
                mat.opacity = Math.max(mat.opacity, 0.78);
                mat.depthWrite = false;
              } else if (/Cromado|Espelhos/i.test(name)) {
                mat.metalness = 1;
                mat.roughness = 0.12;
              } else if (/Roda/i.test(name)) {
                mat.metalness = Math.max(mat.metalness, 0.6);
                mat.roughness = Math.min(mat.roughness, 0.35);
              }
              swapped.set(mat, next);
              return next;
            };
            return mountCar(canvas.current!, {
              url: EVOQUE_URL,
              surface: frame.current!,
              reducedMotion:
                !document.documentElement.classList.contains("js-motion"),
              onInteract: () => setHintOn(false),
              framing: () => ({
                ground: 0.88,
                margin: window.innerWidth >= 640 ? 28 : 16,
                gap: 0,
                keepOut: [],
                far: "center",
              }),
              model: {
                lengthM: 4.37,
                tune,
                exposure: 0.9,
                envIntensity: 0.75,
                keyIntensity: 0.9,
                sweep: false,
                shadow: 2,
                floorLight: 0.22,
                pitch: 0.2,
                // a slow turntable: ~34 s a turn (~44 s on phones), paused 4 s after any touch
                autoRotate: {
                  periodMs: window.innerWidth < 768 ? 44000 : 34000,
                  resumeMs: 4000,
                },
              },
            });
          })
          .then((s) => {
            if (cancelled) return s.dispose();
            stage = s;
            setMode("3d");
          })
          .catch((err) =>
            console.warn("3D Evoque unavailable, keeping the photo:", err),
          );
      },
      { rootMargin: "900px 0px" },
    );
    io.observe(frame.current);
    return () => {
      cancelled = true;
      io.disconnect();
      stage?.dispose();
    };
  }, []);

  return (
    <div
      ref={frame}
      data-car={mode}
      {...(mode === "3d"
        ? {
            role: "img",
            tabIndex: 0,
            "aria-label": `Range Rover Evoque — ${hint}`,
          }
        : {})}
      className="wy-car relative"
    >
      <div
        className="wy-photo stage"
        style={{ "--stage-zoom": stageZoom(featured.id) } as CSSProperties}
      >
        <img
          src={featured.image}
          srcSet={`${featured.thumb} 768w, ${featured.image} 1536w`}
          sizes="(min-width: 1024px) 46vw, 100vw"
          alt={mode === "3d" ? "" : featured.name}
          width={1536}
          height={1024}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>
      {LOCAL_3D && (
        <>
          <canvas
            ref={canvas}
            aria-hidden="true"
            className="wy-3d absolute inset-0 h-full w-full"
          />
          <p
            aria-hidden="true"
            data-on={(mode === "3d" && hintOn) || undefined}
            className="wy-hint absolute inset-x-0 bottom-0 flex items-center justify-center gap-3"
          >
            <span className="wy-hint-rule" />
            {hint}
            <span className="wy-hint-arrows">
              <MoveHorizontal className="h-3.5 w-3.5" />
            </span>
          </p>
        </>
      )}
    </div>
  );
}
