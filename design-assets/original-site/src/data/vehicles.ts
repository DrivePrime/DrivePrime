import meganeRsImg from "../assets/megane-rs-new.png";

import golf8RLineImg from "../assets/golf-8-r-line.png";
import golf8Img from "../assets/golf-8.png";
import vwTiguanImg from "../assets/vw-tiguan.png";
import vwTouaregImg from "../assets/vw-touareg.png";
import audiA3Img from "../assets/audi-a3.png";
import audiRs3Img from "../assets/audi-rs3.png";
import audiQ3Img from "../assets/audi-q3.png";
import audiQ8Img from "../assets/audi-q8.png";
import daciaDusterImg from "../assets/dacia-duster.png";
import hyundaiAccentImg from "../assets/hyundai-accent.png";
import hyundaiTucsonImg from "../assets/hyundai-tucson.png";
import fiat500Img from "../assets/fiat-500.png";
import clio5Img from "../assets/clio5.png";
import bmwSerie4CabrioletImg from "../assets/bmw-serie-4-cabriolet.png";
import mercedesClasseAImg from "../assets/mercedes-classe-a.png";
import mercedesClaImg from "../assets/mercedes-cla.png";
import mercedesClasseCImg from "../assets/mercedes-classe-c.png";
import mercedesClasseSImg from "../assets/mercedes-classe-s.png";
import mercedesClasseGImg from "../assets/mercedes-classe-g.png";
import mercedesVitoImg from "../assets/mercedes-vito.png";
import rangeRoverSportImg from "../assets/range-rover-sport.png";
import rangeRoverEvoqueImg from "../assets/range-rover-evoque.png";
import rangeRoverVogueImg from "../assets/range-rover-vogue.png";
import porscheMacanImg from "../assets/porsche-macan.png";
import porscheMacanTImg from "../assets/porsche-macan-t.png";
import porscheMacanSImg from "../assets/porsche-macan-s.png";
import porscheMacanGtsImg from "../assets/porsche-macan-gts.png";
import porscheCayenneImg from "../assets/porsche-cayenne.png";
import porsche911Img from "../assets/porsche-911.png";
import maseratiLevanteImg from "../assets/maserati-levante.png";
import vwTRocImg from "../assets/vw-t-roc.jpg";

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
  image: string;
}

export const vehicles: Vehicle[] = [
  {
    id: "dacia-duster",
    name: "Dacia Duster",
    category: "SUV",
    seats: 5,
    transmission: "Manu.",
    fuel: "Diesel",
    pricePerDay: 50,
    image: daciaDusterImg
  },
  {
    id: "hyundai-accent",
    name: "Hyundai Accent",
    category: "Économique",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 35,
    image: hyundaiAccentImg
  },
  {
    id: "hyundai-tucson",
    name: "Hyundai Tucson",
    category: "SUV",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 60,
    image: hyundaiTucsonImg
  },
  {
    id: "fiat-500",
    name: "Fiat 500",
    category: "Économique",
    seats: 4,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 35,
    image: fiat500Img
  },
  {
    id: "clio-5",
    name: "Clio 5",
    category: "Économique",
    seats: 5,
    transmission: "Manu.",
    fuel: "Diesel",
    pricePerDay: 30,
    image: clio5Img
  },
  {
    id: "clio-5-auto",
    name: "Clio 5",
    category: "Économique",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 35,
    image: clio5Img
  },
  {
    id: "renault-megane-rs",
    name: "Renault Megane RS",
    category: "Sport",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 100,
    image: meganeRsImg
  },
  {
    id: "vw-t-roc",
    name: "VW T-Roc",
    category: "SUV",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 80,
    image: vwTRocImg
  },
  {
    id: "golf-8",
    name: "Golf 8",
    category: "Compacte",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 80,
    image: golf8Img
  },
  {
    id: "golf-8-r-line",
    name: "Golf 8 R-Line",
    category: "Compacte",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 100,
    image: golf8RLineImg
  },
  {
    id: "vw-tiguan",
    name: "VW Tiguan",
    category: "SUV",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 100,
    image: vwTiguanImg
  },
  {
    id: "vw-touareg",
    name: "VW Touareg",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 100,
    image: vwTouaregImg
  },
  {
    id: "vw-touareg-full",
    name: "VW Touareg Full Option",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 120,
    image: vwTouaregImg
  },
  {
    id: "audi-a3",
    name: "Audi A3 Sline",
    category: "Compacte",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 100,
    image: audiA3Img
  },
  {
    id: "audi-rs3",
    name: "Audi RS3",
    category: "Sport",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 300,
    image: audiRs3Img
  },
  {
    id: "audi-q3",
    name: "Audi Q3",
    category: "SUV",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 120,
    image: audiQ3Img
  },
  {
    id: "audi-q8",
    name: "Audi Q8",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 220,
    image: audiQ8Img
  },
  {
    id: "bmw-serie-4-cabriolet",
    name: "BMW Série 4 Cabriolet",
    category: "Cabriolet",
    seats: 4,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 300,
    image: bmwSerie4CabrioletImg
  },
  {
    id: "mercedes-classe-a",
    name: "Mercedes Classe A",
    category: "Compacte",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 100,
    image: mercedesClasseAImg
  },
  {
    id: "mercedes-cla",
    name: "Mercedes CLA",
    category: "Berline",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 130,
    image: mercedesClaImg
  },
  {
    id: "mercedes-classe-c",
    name: "Mercedes Classe C",
    category: "Berline",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 180,
    image: mercedesClasseCImg
  },
  {
    id: "mercedes-classe-s",
    name: "Mercedes Classe S",
    category: "Berline",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 500,
    image: mercedesClasseSImg
  },
  {
    id: "mercedes-classe-g",
    name: "Mercedes Classe G",
    category: "Luxe",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 1000,
    image: mercedesClasseGImg
  },
  {
    id: "mercedes-vito",
    name: "Mercedes Vito",
    category: "Van",
    seats: 8,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 300,
    image: mercedesVitoImg
  },
  {
    id: "maserati-levante",
    name: "Maserati Levante",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 250,
    image: maseratiLevanteImg
  },
  {
    id: "range-rover-evoque",
    name: "Range Rover Evoque",
    category: "SUV",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 120,
    image: rangeRoverEvoqueImg
  },
  {
    id: "range-rover-sport",
    name: "Range Rover Sport",
    category: "Luxe",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 300,
    image: rangeRoverSportImg
  },
  {
    id: "range-rover-vogue",
    name: "Range Rover Vogue",
    category: "Luxe",
    seats: 5,
    transmission: "Auto.",
    fuel: "Diesel",
    pricePerDay: 500,
    image: rangeRoverVogueImg
  },
  {
    id: "porsche-macan",
    name: "Porsche Macan",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 200,
    image: porscheMacanImg
  },
  {
    id: "porsche-macan-t",
    name: "Porsche Macan T",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 250,
    image: porscheMacanTImg
  },
  {
    id: "porsche-macan-s",
    name: "Porsche Macan S",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 230,
    image: porscheMacanSImg
  },
  {
    id: "porsche-macan-gts",
    name: "Porsche Macan GTS",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 300,
    image: porscheMacanGtsImg
  },
  {
    id: "porsche-cayenne",
    name: "Porsche Cayenne",
    category: "SUV Premium",
    seats: 5,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 400,
    image: porscheCayenneImg
  },
  {
    id: "porsche-boxster-911",
    name: "Porsche Boxster 911",
    category: "Sport",
    seats: 4,
    transmission: "Auto.",
    fuel: "Essence",
    pricePerDay: 350,
    image: porsche911Img
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
