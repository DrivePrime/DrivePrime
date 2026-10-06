import { hasNameTwin, type Vehicle } from "@/data/vehicles";
import type { Translations } from "./translations";

/** Display name; twins get their gearbox appended so titles and headings stay unique. */
export function vehicleLabel(vehicle: Vehicle, t: Translations) {
  return hasNameTwin(vehicle) && vehicle.transmission
    ? `${vehicle.name} ${t.fleet.transmission[vehicle.transmission]}`
    : vehicle.name;
}
