export type ReservationStatus = "À venir" | "En cours" | "Terminée";

export const getStatus = (depart: string, retour: string): ReservationStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(depart);
  const r = new Date(retour);
  if (today < d) return "À venir";
  if (today > r) return "Terminée";
  return "En cours";
};

export const daysBetween = (a: string, b: string) => {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.max(1, Math.round((d2 - d1) / 86400000));
};

export const daysFromToday = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
};

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
