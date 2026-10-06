/*
  Per-photo framing for the studio "stage" (presentation only, no vehicle data).
  The owner's 2026-10 studio set is reframed once, offline, to 16:9 with each car at ~76 % of the
  width (design-assets/originals/fleet), so no per-car zoom is needed any more: every photo is
  shown whole. Kept as a hook in case a single photo ever needs a nudge.
*/
const DEFAULT_ZOOM = 1;

const zoom: Record<string, number> = {};

export const stageZoom = (vehicleId: string) => zoom[vehicleId] ?? DEFAULT_ZOOM;
