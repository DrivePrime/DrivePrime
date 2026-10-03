// Single source of truth for Drive Prime contact details.
export const SITE_URL = "https://driveprimecar.com";

export const business = {
  name: "Drive Prime",
  whatsapp: "212612132748",
  phoneDisplay: "+212 6 12 13 27 48",
  phoneHref: "tel:+212612132748",
  email: "contact.drive.prime@gmail.com",
  city: "Marrakech",
  country: "Maroc",
  instagram: "https://www.instagram.com/location_drive_prime_",
  tiktok: "https://www.tiktok.com/@drive.prime",
};

/*
  Business claims awaiting confirmation by the owner.
  Nothing here is shown on the site while its flag is `false`.
  Switch a flag to `true` only once the offer is confirmed.
*/
export const confirmed = {
  /** Confirmed by the owner on 2026-10-03 (the six services of the original site). */
  services: {
    airportDelivery: true,
    hotelDelivery: true,
    chauffeur: true,
    longTermDegressive: true,
    support24h: true,
    quickBooking: true,
  },
  /**
   * Rental policies shown on the original site's hero. NOT confirmed yet: kept hidden.
   * Switch to true only once the owner confirms each policy.
   */
  policies: {
    instantConfirmation: false,
    freeCancellation24h: false,
    unlimitedMileage: false,
  },
  /**
   * The original site's list of 24 pick-up locations (src/data/vehicles.ts).
   * Shown again at the owner's request; actual delivery coverage is still to be confirmed.
   */
  pickupLocations: true,
};

export type ServiceKey = keyof typeof confirmed.services;

export const hasConfirmedServices = Object.values(confirmed.services).some(Boolean);

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${business.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function openWhatsApp(message?: string) {
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
}
