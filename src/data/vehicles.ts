const vehicleImages = import.meta.glob<string>("../assets/vehicles/*.webp", {
  eager: true,
  import: "default",
});

/** Returns the 768px card photo and the 1536px full photo for an asset basename. */
function photo(base: string) {
  return {
    thumb: vehicleImages[`../assets/vehicles/${base}-768.webp`],
    image: vehicleImages[`../assets/vehicles/${base}-1536.webp`],
  };
}

export type VehicleCategory =
  | "Tous" 
  | "Économique" 
  | "Compacte" 
  | "Berline" 
  | "Cabriolet" 
  | "Sport" 
  | "SUV" 
  | "SUV Premium" 
  | "Luxe" 
  | "Van";

export interface Vehicle {
  id: string;
  name: string;
  category: VehicleCategory;
  seats: number;
  transmission: "Manu." | "Auto.";
  fuel: "Essence" | "Diesel";
  pricePerDay: number;
  /** 1536px photo */
  image: string;
  /** 768px photo for cards */
  thumb: string;
  /**
   * Extra real photos of this exact car (same 768/1536 pairs as above), shown in the
   * vehicle page gallery after the main photo. None are available yet.
   */
  gallery?: { thumb: string; image: string }[];
}

/** Main photo first, then any gallery photos. */
export const vehiclePhotos = (v: Vehicle) => [{ thumb: v.thumb, image: v.image }, ...(v.gallery ?? [])];

export const vehicles: Vehicle[] = [
  {
    id: "dacia-duster",
    name: "Dacia Duster",
    category: "SUV",
    seats: 5,
    transmission: "Manu.",
    fuel: "Diesel",
    pricePerDay: 50,
    ...photo("dacia-duster")
  },
  {
    id: "hyundai-accent",
    name: "Hyundai Accent",
    category: "Économique",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 35,
    ...photo("hyundai-accent")
  },
  {
    id: "hyundai-tucson",
    name: "Hyundai Tucson",
    category: "SUV",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 60,
    ...photo("hyundai-tucson")
  },
  {
    id: "fiat-500",
    name: "Fiat 500",
    category: "Économique",
    seats: 4,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 35,
    ...photo("fiat-500")
  },
  {
    id: "clio-5",
    name: "Clio 5",
    category: "Économique",
    seats: 5,
    transmission: "Manu.",
    fuel: "Diesel",
    pricePerDay: 30,
    ...photo("clio5")
  },
  {
    id: "clio-5-auto",
    name: "Clio 5",
    category: "Économique",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 35,
    ...photo("clio5")
  },
  {
    id: "renault-megane-rs",
    name: "Renault Megane RS",
    category: "Sport",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 100,
    ...photo("megane-rs-new")
  },
  {
    id: "vw-t-roc",
    name: "VW T-Roc",
    category: "SUV",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 80,
    ...photo("vw-t-roc")
  },
  {
    id: "golf-8",
    name: "Golf 8",
    category: "Compacte",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 80,
    ...photo("golf-8")
  },
  {
    id: "golf-8-r-line",
    name: "Golf 8 R-Line",
    category: "Compacte",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 100,
    ...photo("golf-8-r-line")
  },
  {
    id: "vw-tiguan",
    name: "VW Tiguan",
    category: "SUV",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 100,
    ...photo("vw-tiguan")
  },
  {
    id: "vw-touareg",
    name: "VW Touareg",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 100,
    ...photo("vw-touareg")
  },
  {
    id: "vw-touareg-full",
    name: "VW Touareg Full Option",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 120,
    ...photo("vw-touareg")
  },
  {
    id: "audi-a3",
    name: "Audi A3 Sline",
    category: "Compacte",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 100,
    ...photo("audi-a3")
  },
  {
    id: "audi-rs3",
    name: "Audi RS3",
    category: "Sport",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 300,
    ...photo("audi-rs3")
  },
  {
    id: "audi-q3",
    name: "Audi Q3",
    category: "SUV",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 120,
    ...photo("audi-q3")
  },
  {
    id: "audi-q8",
    name: "Audi Q8",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 220,
    ...photo("audi-q8")
  },
  {
    id: "bmw-serie-4-cabriolet",
    name: "BMW Série 4 Cabriolet",
    category: "Cabriolet",
    seats: 4,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 300,
    ...photo("bmw-serie-4-cabriolet")
  },
  {
    id: "mercedes-classe-a",
    name: "Mercedes Classe A",
    category: "Compacte",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 100,
    ...photo("mercedes-classe-a")
  },
  {
    id: "mercedes-cla",
    name: "Mercedes CLA",
    category: "Berline",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 130,
    ...photo("mercedes-cla")
  },
  {
    id: "mercedes-classe-c",
    name: "Mercedes Classe C",
    category: "Berline",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 180,
    ...photo("mercedes-classe-c")
  },
  {
    id: "mercedes-classe-s",
    name: "Mercedes Classe S",
    category: "Berline",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 500,
    ...photo("mercedes-classe-s")
  },
  {
    id: "mercedes-classe-g",
    name: "Mercedes Classe G",
    category: "Luxe",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 1000,
    ...photo("mercedes-classe-g")
  },
  {
    id: "mercedes-vito",
    name: "Mercedes Vito",
    category: "Van",
    seats: 8,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 300,
    ...photo("mercedes-vito")
  },
  {
    id: "maserati-levante",
    name: "Maserati Levante",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 250,
    ...photo("maserati-levante")
  },
  {
    id: "range-rover-evoque",
    name: "Range Rover Evoque",
    category: "SUV",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 120,
    ...photo("range-rover-evoque")
  },
  {
    id: "range-rover-sport",
    name: "Range Rover Sport",
    category: "Luxe",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 300,
    ...photo("range-rover-sport")
  },
  {
    id: "range-rover-vogue",
    name: "Range Rover Vogue",
    category: "Luxe",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 500,
    ...photo("range-rover-vogue")
  },
  {
    id: "porsche-macan",
    name: "Porsche Macan",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 200,
    ...photo("porsche-macan")
  },
  {
    id: "porsche-macan-t",
    name: "Porsche Macan T",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 250,
    ...photo("porsche-macan-t")
  },
  {
    id: "porsche-macan-s",
    name: "Porsche Macan S",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 230,
    ...photo("porsche-macan-s")
  },
  {
    id: "porsche-macan-gts",
    name: "Porsche Macan GTS",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 300,
    ...photo("porsche-macan-gts")
  },
  {
    id: "porsche-cayenne",
    name: "Porsche Cayenne",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 400,
    ...photo("porsche-cayenne")
  },
  {
    id: "porsche-boxster-911",
    name: "Porsche Boxster 911",
    category: "Sport",
    seats: 4,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 350,
    ...photo("porsche-911")
  }
];

export const categories: VehicleCategory[] = [
  "Tous",
  "Économique",
  "Compacte",
  "Berline",
  "Cabriolet",
  "Sport",
  "SUV",
  "SUV Premium",
  "Luxe",
  "Van"
];

export const locations = [
  "Marrakech - Aéroport",
  "Marrakech - Ville",
  "Casablanca - Aéroport",
  "Casablanca - Ville",
  "Agadir - Aéroport",
  "Agadir - Ville",
  "Rabat - Aéroport",
  "Rabat - Ville",
  "Tanger - Aéroport",
  "Tanger - Ville",
  "Tétouan - Aéroport",
  "Tétouan - Ville",
  "Fès - Aéroport",
  "Fès - Ville",
  "Oujda - Aéroport",
  "Oujda - Ville",
  "Essaouira - Aéroport",
  "Essaouira - Ville",
  "Beni Mellal - Aéroport",
  "Beni Mellal - Ville",
  "Al Hoceima - Aéroport",
  "Al Hoceima - Ville",
  "Nador - Aéroport",
  "Nador - Ville"
];

const nameCount = new Map<string, number>();
vehicles.forEach((v) => nameCount.set(v.name, (nameCount.get(v.name) ?? 0) + 1));

/** True when several fleet entries share a name (e.g. the manual and automatic Clio 5). */
export const hasNameTwin = (v: Vehicle) => (nameCount.get(v.name) ?? 0) > 1;
