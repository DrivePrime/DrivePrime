import { vehicles, type Vehicle } from "./vehicles";
import riad800 from "@/assets/riad-800.webp";
import riad1400 from "@/assets/riad-1400.webp";
import hero960 from "@/assets/hero-960.webp";
import hero1680 from "@/assets/hero-1680.webp";

/*
  One visual world per service ("Nos services").

  Dedicated photographs: drop a file named after the service key into src/assets/services/
  (e.g. chauffeur.webp, airportDelivery.jpg). It is picked up automatically and replaces the
  interim scene below — no code change needed.

  Interim scenes use only what is real: the two Marrakech photographs of the site, or the
  studio photo of the actual fleet vehicle that fits the service, staged in layers.
*/
const dropped = import.meta.glob<string>(
  "../assets/services/*.{webp,avif,jpg,jpeg,png}",
  {
    eager: true,
    import: "default",
  },
);
const droppedFor = (key: string) =>
  Object.entries(dropped).find(
    ([path]) =>
      path
        .split("/")
        .pop()!
        .replace(/\.\w+$/, "") === key,
  )?.[1];

export type ServiceScene =
  | {
      kind: "photo";
      src: string;
      srcSet?: string;
      position: string;
      final: boolean;
    }
  | {
      kind: "studio";
      vehicle: Vehicle;
      mood: "dusk" | "night";
      overlay?: "message";
      final: false;
    };

const fleet = (id: string) => vehicles.find((v) => v.id === id)!;

const interim: Record<string, ServiceScene> = {
  // Real Marrakech photograph: white Range Rover Sport in a riad courtyard at golden hour
  longTermDegressive: {
    kind: "photo",
    src: riad1400,
    srcSet: `${riad800} 800w, ${riad1400} 1400w`,
    position: "50% 62%",
    final: true,
  },
  // No chauffeur photo yet: the fleet's flagship sedan
  chauffeur: {
    kind: "studio",
    vehicle: fleet("mercedes-classe-s"),
    mood: "dusk",
    final: false,
  },
  // No airport photo yet: the fleet's 8-seat van (luggage, transfers)
  airportDelivery: {
    kind: "studio",
    vehicle: fleet("mercedes-vito"),
    mood: "dusk",
    final: false,
  },
  // Real Marrakech photograph: black Range Rover at a riad entrance
  hotelDelivery: {
    kind: "photo",
    src: hero1680,
    srcSet: `${hero960} 960w, ${hero1680} 1680w`,
    position: "60% 55%",
    final: true,
  },
  // No night photo yet: a fleet SUV under night light
  support24h: {
    kind: "studio",
    vehicle: fleet("range-rover-vogue"),
    mood: "night",
    final: false,
  },
  // No phone photo yet: the real WhatsApp request the site sends, over a fleet car
  quickBooking: {
    kind: "studio",
    vehicle: fleet("mercedes-classe-g"),
    mood: "dusk",
    overlay: "message",
    final: false,
  },
};

export function sceneFor(key: string): ServiceScene {
  const photo = droppedFor(key);
  if (photo)
    return { kind: "photo", src: photo, position: "50% 50%", final: true };
  return interim[key];
}

/** Image URLs to warm up before a scene is shown. */
export const sceneImages = (scene: ServiceScene) =>
  scene.kind === "photo" ? [scene.src] : [scene.vehicle.image];
