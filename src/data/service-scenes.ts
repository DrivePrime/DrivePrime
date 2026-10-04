/*
  One photograph per service ("Nos services").
  Originals: public/images/service-*.png (kept untouched). The site serves WebP copies
  made from them (src/assets/services/<key>-960|1536.webp, same pixels, web-compressed).

  `position` is the object-position used by object-fit: cover. Each one is set per image so the
  subject survives the crop (the frame is narrower than the 3:2 photos on desktop and phones).
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
  src: file(`${key}-1536`),
  srcSet: `${file(`${key}-960`)} 960w, ${file(`${key}-1536`)} 1536w`,
  position,
});

const scenes: Record<string, ServiceScene> = {
  // white Range Rover Sport, Moroccan architecture at golden hour (car right of centre)
  longTermDegressive: scene("longTermDegressive", "56% 50%"),
  // chauffeur opening the door, client in the car (chauffeur left, car to the right edge)
  chauffeur: scene("chauffeur", "78% 50%"),
  // Marrakech Menara sign (left) + van, chauffeur, client and luggage
  airportDelivery: scene("airportDelivery", "58% 50%"),
  // key handover (left) + black Range Rover (right)
  hotelDelivery: scene("hotelDelivery", "72% 50%"),
  // night, Koutoubia: black car (left) and person on the phone
  support24h: scene("support24h", "30% 50%"),
  // smartphone in the foreground, car behind
  quickBooking: scene("quickBooking", "88% 50%"),
};

export const sceneFor = (key: string): ServiceScene => scenes[key];
