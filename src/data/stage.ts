/*
  Per-photo framing for the studio "stage" (presentation only, no vehicle data).
  All fleet photos share one studio set-up; a few cars sit smaller in the frame,
  so they get a tighter crop to keep every car at a similar visual size.
*/
const DEFAULT_ZOOM = 1.1;

const zoom: Record<string, number> = {
  "fiat-500": 1.2,
  "vw-t-roc": 1.2,
};

export const stageZoom = (vehicleId: string) => zoom[vehicleId] ?? DEFAULT_ZOOM;
