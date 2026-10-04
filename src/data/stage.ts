/*
  Per-photo framing for the studio "stage" (presentation only, no vehicle data).
  All fleet photos share one studio set-up; a few cars sit smaller in the frame,
  so they get a tighter crop to keep every car at a similar visual size.
*/
const DEFAULT_ZOOM = 1.1;

const zoom: Record<string, number> = {
  // shot closer than the rest: pulled back so every car keeps the same scale and some air
  "renault-megane-rs": 0.98,
  "dacia-duster": 1.02,
  "fiat-500": 1.08,
  "clio-5": 1.04,
  "clio-5-auto": 1.04,
  // shot further away: brought slightly closer
  "vw-t-roc": 1.2,
  "mercedes-classe-g": 1.14,
};

export const stageZoom = (vehicleId: string) => zoom[vehicleId] ?? DEFAULT_ZOOM;
