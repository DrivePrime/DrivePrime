/*
  One photograph per service ("Nos services"), from the owner's campaign.
  Originals: design-assets/originals/services/0X-*.png (kept untouched, not published). The site
  serves WebP copies made from them (src/assets/services/<key>-960|1344.webp, native width 1344).

  `position` is the object-position used by object-fit: cover. Each one is set per image so the
  subject survives the crop (the frame is narrower than the 16:9 photos on desktop and phones).
*/
const files = import.meta.glob<string>("../assets/services/*.webp", {
  eager: true,
  import: "default",
});
const file = (name: string) => {
  const hit = Object.entries(files).find(([path]) =>
    path.endsWith(`/${name}.webp`),
  );
  if (!hit) throw new Error(`Missing service image: ${name}`);
  return hit[1];
};

export interface ServiceScene {
  src: string;
  srcSet: string;
  /** object-position — keeps the subject in frame */
  position: string;
}

const scene = (key: string, position: string): ServiceScene => ({
  src: file(`${key}-1344`),
  srcSet: `${file(`${key}-960`)} 960w, ${file(`${key}-1344`)} 1344w`,
  position,
});

const scenes: Record<string, ServiceScene> = {
  // black Range Rover by a riad pool at sunset, Atlas behind (car left of centre)
  longTermDegressive: scene("longTermDegressive", "40% 55%"),
  // chauffeur opening the rear door of a black saloon for a client (right half)
  chauffeur: scene("chauffeur", "70% 55%"),
  // Marrakech airport: client with luggage, chauffeur, black van (centre-right)
  airportDelivery: scene("airportDelivery", "64% 55%"),
  // key handover at a riad door, black Range Rover on the left
  hotelDelivery: scene("hotelDelivery", "42% 55%"),
  // night, Koutoubia: black SUV and two men talking (left-centre)
  support24h: scene("support24h", "44% 55%"),
  // client on a terrace with her phone, black Range Rover behind (keeps both)
  quickBooking: scene("quickBooking", "58% 55%"),
};

export const sceneFor = (key: string): ServiceScene => scenes[key];
