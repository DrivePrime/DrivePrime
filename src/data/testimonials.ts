/*
  Customer reviews from the original site, reproduced verbatim.
  The owner confirmed they are genuine reviews (2026-10-03).
  Quotes stay in the language the customer wrote them in; they are not translated.
*/
export interface Testimonial {
  name: string;
  location: string;
  text: string;
  lang: "fr" | "en";
  /** Fleet vehicle named explicitly in the review (only when the exact model is unambiguous). */
  vehicleId?: string;
}

/*
  Room for 11 reviews. Only real reviews are shown: the slider, its counter (01 / 06 … 01 / 11)
  and its indicators are generated from `testimonials` below, so adding a review here is enough.
  The 5 slots marked TODO wait for genuine reviews from the owner (name, city, text, language) —
  never fill them with invented content.
*/
const reviews: (Testimonial | null)[] = [
  {
    name: "Pierre Dubois",
    location: "Paris, France",
    text: "Service exceptionnel ! Le Range Rover était impeccable et la livraison à l'aéroport parfaitement à l'heure. Je recommande vivement Drive Prime.",
    lang: "fr",
  },
  {
    name: "Sarah Martin",
    location: "Lyon, France",
    text: "Équipe très professionnelle et réactive sur WhatsApp. Le véhicule était en parfait état. Nous avons passé un séjour inoubliable à Marrakech.",
    lang: "fr",
  },
  {
    name: "Ahmed Benali",
    location: "Casablanca, Maroc",
    text: "Les meilleurs prix de Marrakech avec un service premium. Le chauffeur était ponctuel et très courtois. Une expérience 5 étoiles !",
    lang: "fr",
  },
  {
    name: "Emma Thompson",
    location: "Londres, UK",
    text: "Fantastic service! The car was immaculate and the team was incredibly helpful. Will definitely use Drive Prime again on my next visit.",
    lang: "en",
  },
  {
    name: "Mohammed Alami",
    location: "Rabat, Maroc",
    text: "J'ai loué une Mercedes Classe C pour mon mariage. Tout était parfait, du début à la fin. Merci à toute l'équipe de Drive Prime !",
    lang: "fr",
    vehicleId: "mercedes-classe-c",
  },
  {
    name: "Julie Fontaine",
    location: "Bruxelles, Belgique",
    text: "Réservation simple via WhatsApp, livraison au riad, véhicule impeccable. Que demander de plus ? Je reviendrai certainement !",
    lang: "fr",
  },
  // TODO(owner): 5 genuine reviews to provide — { name, location, text, lang, vehicleId? }
  null,
  null,
  null,
  null,
  null,
];

export const testimonials: Testimonial[] = reviews.filter(
  (r): r is Testimonial => r !== null,
);
