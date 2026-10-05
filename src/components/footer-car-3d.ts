import {
  ACESFilmicToneMapping,
  Box3,
  BufferGeometry,
  CanvasTexture,
  DirectionalLight,
  Group,
  HemisphereLight,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*
  The closing scene's car, in 3D (local prototype — the model's licence is non-commercial).
  Plain three.js, loaded on demand by the footer. Renders only when something changes
  (drag, inertia, intro, resize): once the car is still, nothing runs.

  Rotation: yaw only, unlimited (a full 360° turn), driven by horizontal drags; light inertia on
  release. No pitch, pan or zoom. Touch: `touch-action: pan-y` on the element lets vertical swipes
  scroll the page; a horizontal swipe turns the car.
*/

export interface CarStage {
  dispose(): void;
}

interface Options {
  url: string;
  /** element receiving the drag (the car frame) */
  surface: HTMLElement;
  reducedMotion: boolean;
  /** first drag / key press — the page hides its hint */
  onInteract: () => void;
  /** where the ground should sit in the frame (0 = top, 1 = bottom) */
  groundAt?: number;
  isRTL?: () => boolean;
  /** ground point under the wheel nearest to the text, as fractions of the canvas */
  onAnchor?: (fx: number, fy: number) => void;
}

// The fleet's Classe G is black; the downloaded model is painted olive. Paint it like the real car.
const PAINT = {
  color: 0x050506,
  metalness: 0.15,
  roughness: 0.3,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
};
// Rest pose: front three-quarter, nose towards the text (like the studio photo it replaces).
// Positive yaw turns the nose to the right; the intro arrives on the rest pose.
const REST_YAW = (-38 * Math.PI) / 180;
const INTRO_TURN = (25 * Math.PI) / 180;
const INTRO_MS = 2600;

const isCoarse = () => window.matchMedia("(pointer: coarse)").matches;

/** One mesh per material instead of hundreds: the export has ~700 meshes; draw calls drop to ~30. */
function mergeByMaterial(root: Group) {
  root.updateMatrixWorld(true);
  const groups = new Map<Material, BufferGeometry[]>();
  root.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh || Array.isArray(m.material)) return;
    const g = m.geometry.clone().applyMatrix4(m.matrixWorld);
    const list = groups.get(m.material) ?? [];
    list.push(g);
    groups.set(m.material, list);
  });
  const out = new Group();
  groups.forEach((geos, mat) => {
    // mergeGeometries needs identical attribute sets and index presence
    const names = geos.map((g) => Object.keys(g.attributes));
    const common = names.reduce((a, b) => a.filter((n) => b.includes(n)));
    const indexed = geos.every((g) => g.index);
    const ready = geos.map((g) => {
      const x = indexed ? g : g.index ? g.toNonIndexed() : g;
      Object.keys(x.attributes).forEach(
        (n) => !common.includes(n) && x.deleteAttribute(n),
      );
      x.morphAttributes = {};
      return x;
    });
    const merged = mergeGeometries(ready, false);
    if (merged) out.add(new Mesh(merged, mat));
    else geos.forEach((g) => out.add(new Mesh(g, mat)));
  });
  return out;
}

function tuneMaterials(root: Group) {
  root.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    const mat = m.material as MeshPhysicalMaterial;
    const name = mat.name || "";
    if (/Paint/i.test(name)) {
      mat.color.setHex(PAINT.color);
      mat.metalness = PAINT.metalness;
      mat.roughness = PAINT.roughness;
      if ("clearcoat" in mat) {
        mat.clearcoat = PAINT.clearcoat;
        mat.clearcoatRoughness = PAINT.clearcoatRoughness;
      }
    }
    // Real transmission costs an extra render pass per frame; tinted glass reads the same here.
    if (mat.transmission > 0) {
      mat.transmission = 0;
      mat.transparent = true;
      mat.depthWrite = false;
      if (/Window/i.test(name)) {
        mat.color.setHex(0x0a0d12);
        mat.opacity = 0.62;
        mat.roughness = 0.03;
        mat.metalness = 0.1;
      } else {
        mat.opacity = 0.75;
      }
    }
    if ((mat as MeshStandardMaterial).envMapIntensity !== undefined)
      mat.envMapIntensity = 1;
  });
}

/** Soft contact shadow: a blurred ellipse under the car (no shadow maps, no visible floor). */
function contactShadow(length: number, width: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(0,0,0,0.85)");
  grad.addColorStop(0.45, "rgba(0,0,0,0.5)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new CanvasTexture(c);
  const mesh = new Mesh(
    new PlaneGeometry(length * 1.18, width * 1.45),
    new MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.003;
  mesh.renderOrder = -1;
  return mesh;
}

export async function mountCar(
  canvas: HTMLCanvasElement,
  opts: Options,
): Promise<CarStage> {
  const coarse = isCoarse();
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !coarse,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2),
  );
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  // Studio reflections: a neutral room, used for reflections only (never drawn as a background)
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.65;
  // Soft key from above-front, a cool rim from behind to cut the silhouette out of the dark page
  const key = new DirectionalLight(0xffffff, 1.6);
  key.position.set(-3, 6, 4);
  const rim = new DirectionalLight(0xc9d4e6, 1.4);
  rim.position.set(4, 3, -5);
  scene.add(key, rim, new HemisphereLight(0xdfe6f0, 0x0b0d10, 0.35));

  const gltf = await new GLTFLoader().loadAsync(opts.url);
  const source = gltf.scene as unknown as Group;
  tuneMaterials(source);
  const car = mergeByMaterial(source);

  // The export is in centimetres x 0.01 (the car is 0.05 units long): scale it to the real
  // G63 length so lights, camera and shadow work in metres.
  const raw = new Box3().setFromObject(car).getSize(new Vector3());
  car.scale.setScalar(4.87 / Math.max(raw.x, raw.z));
  car.updateMatrixWorld(true);

  // Centre on the footprint, wheels on y = 0; the long side defines the car's axis
  const box = new Box3().setFromObject(car);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  car.position.set(-center.x, -box.min.y, -center.z);
  const alongX = size.x > size.z;
  const length = Math.max(size.x, size.z);
  const width = Math.min(size.x, size.z);
  const turntable = new Group();
  const body = new Group();
  body.add(car);
  if (alongX) body.rotation.y = Math.PI / 2; // normalise: length along Z
  const shadow = contactShadow(length, width);
  shadow.rotation.z = 0;
  turntable.add(shadow, body);
  scene.add(turntable);

  const camera = new PerspectiveCamera(24, 1, 0.1, 100);
  const ground = opts.groundAt ?? 0.9;

  const corners: Vector3[] = [];
  for (const x of [-width / 2, width / 2])
    for (const y of [0, size.y])
      for (const z of [-length / 2, length / 2])
        corners.push(new Vector3(x, y, z));
  const PITCH = 0.12; // a slight view from above, like a studio shot
  const Y_AXIS = new Vector3(0, 1, 0);
  const p = new Vector3();
  const place = (d: number, t: number) => {
    camera.position.set(0, t + Math.tan(PITCH) * d, d);
    camera.lookAt(0, t, 0);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
  };
  const extent = () => {
    let xMax = 0,
      yMin = 1,
      yMax = -1;
    for (let a = 0; a < 24; a++) {
      const yaw = (a / 24) * Math.PI * 2;
      for (const c of corners) {
        p.copy(c).applyAxisAngle(Y_AXIS, yaw).project(camera);
        xMax = Math.max(xMax, Math.abs(p.x));
        yMin = Math.min(yMin, p.y);
        yMax = Math.max(yMax, p.y);
      }
    }
    return { xMax, yMin, yMax };
  };
  // Fit: every corner of the box, at every yaw, stays inside the frame (a full turn never crops the
  // roof, wheels or bumpers); then the view is raised or lowered so the lowest point sits at `ground`.
  const fit = () => {
    const low = 1 - ground * 2; // NDC y of the ground line
    const half = Math.tan((camera.fov * Math.PI) / 360);
    for (let d = 5; d < 40; d += 0.1) {
      let t = size.y * 0.45;
      place(d, t);
      for (let i = 0; i < 4; i++) {
        const { yMin } = extent();
        t += (yMin - low) * d * half * 0.95;
        place(d, t);
      }
      const e = extent();
      if (e.xMax <= 0.96 && e.yMax <= 0.94) return;
    }
  };

  // ── rendering on demand
  let raf = 0;
  // with the intro the car starts a little before its rest pose; reduced motion: at rest, still
  let yaw = opts.reducedMotion ? REST_YAW : REST_YAW - INTRO_TURN;
  let velocity = 0; // rad / ms
  let intro: { from: number; start: number } | null = null;
  let dragging = false;
  let last = performance.now();
  const render = () => {
    turntable.rotation.y = yaw;
    renderer.render(scene, camera);
  };
  const tick = (now: number) => {
    raf = 0;
    const dt = Math.min(48, now - last);
    last = now;
    let again = false;
    if (intro) {
      const k = Math.min(1, (now - intro.start) / INTRO_MS);
      yaw = intro.from + INTRO_TURN * (0.5 - Math.cos(Math.PI * k) / 2);
      if (k < 1) again = true;
      else intro = null;
    } else if (!dragging && Math.abs(velocity) > 0.00002) {
      yaw += velocity * dt;
      velocity *= Math.exp(-dt / 190); // short glide, settles within ~0.6 s
      again = true;
    }
    render();
    if (again) schedule();
  };
  const schedule = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    fit();
    render();
    reportAnchor();
  };
  // Where the page's brass line should land: the ground under the wheel nearest to the text,
  // at the rest pose (fractions of the canvas). Computed once per size; the car may turn after.
  const reportAnchor = () => {
    if (!opts.onAnchor) return;
    const pts = [-1, 1].flatMap((side) =>
      [-1, 1].map((end) =>
        new Vector3(side * width * 0.45, 0, end * length * 0.33)
          .applyAxisAngle(Y_AXIS, REST_YAW)
          .project(camera),
      ),
    );
    const near = pts.sort((a, b) => a.y - b.y).slice(0, 2); // lowest on screen = nearest side
    const p = near.sort((a, b) => (opts.isRTL?.() ? b.x - a.x : a.x - b.x))[0];
    opts.onAnchor((p.x + 1) / 2, (1 - p.y) / 2);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ── drag to turn (yaw only)
  const surface = opts.surface;
  let interacted = false;
  const firstTouch = () => {
    if (!interacted) {
      interacted = true;
      opts.onInteract();
    }
  };
  let start: { x: number; y: number; id: number; decided: boolean } | null =
    null;
  const samples: { x: number; t: number }[] = [];
  const perPixel = () =>
    (Math.PI * 2) / Math.max(600, surface.clientWidth * 1.6);
  const down = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // no native image drag / text selection: they would cancel the gesture
    if (e.pointerType === "mouse") e.preventDefault();
    intro = null;
    velocity = 0;
    start = {
      x: e.clientX,
      y: e.clientY,
      id: e.pointerId,
      decided: e.pointerType === "mouse",
    };
    samples.length = 0;
    samples.push({ x: e.clientX, t: e.timeStamp });
    if (start.decided) {
      dragging = true;
      surface.setPointerCapture(e.pointerId);
      surface.dataset.dragging = "";
      firstTouch();
    }
  };
  const move = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    if (!start.decided) {
      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      if (dx < 6 && dy < 6) return;
      if (dy > dx) {
        start = null; // vertical: the page scrolls
        return;
      }
      start.decided = true;
      dragging = true;
      surface.setPointerCapture(e.pointerId);
      firstTouch();
    }
    const prev = samples[samples.length - 1];
    yaw += (e.clientX - prev.x) * perPixel();
    samples.push({ x: e.clientX, t: e.timeStamp });
    if (samples.length > 6) samples.shift();
    render();
  };
  const up = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) return;
    if (dragging && samples.length > 1) {
      const a = samples[0];
      const b = samples[samples.length - 1];
      const dt = Math.max(32, b.t - a.t);
      // only a real flick keeps turning, and only a little; a slow release or a nudge stops there
      const travel = b.x - a.x;
      const flick = e.timeStamp - b.t < 80 && Math.abs(travel) > 24;
      velocity = flick ? ((travel * perPixel()) / dt) * 0.6 : 0;
      velocity = Math.max(-0.004, Math.min(0.004, velocity));
      schedule();
    }
    dragging = false;
    start = null;
    delete surface.dataset.dragging;
  };
  const key2 = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    intro = null;
    firstTouch();
    velocity = (e.key === "ArrowRight" ? 1 : -1) * 0.0022;
    schedule();
  };
  const noDrag = (e: Event) => e.preventDefault();
  surface.addEventListener("dragstart", noDrag);
  surface.addEventListener("pointerdown", down);
  surface.addEventListener("pointermove", move);
  surface.addEventListener("pointerup", up);
  surface.addEventListener("pointercancel", up);
  surface.addEventListener("keydown", key2);

  // ── intro: a slow ~25° turn the first time the car is on screen, then still
  let io: IntersectionObserver | null = null;
  if (!opts.reducedMotion) {
    io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io?.disconnect();
        window.setTimeout(() => {
          if (interacted || dragging) return;
          intro = { from: yaw, start: performance.now() };
          schedule();
        }, 650);
      },
      { threshold: 0.6 },
    );
    io.observe(canvas);
  }

  const lost = (e: Event) => e.preventDefault();
  canvas.addEventListener("webglcontextlost", lost);

  // compile everything before the page fades the canvas in: no half-drawn first frame
  renderer.compile(scene, camera);
  render();

  return {
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
      surface.removeEventListener("dragstart", noDrag);
      surface.removeEventListener("pointerdown", down);
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerup", up);
      surface.removeEventListener("pointercancel", up);
      surface.removeEventListener("keydown", key2);
      canvas.removeEventListener("webglcontextlost", lost);
      scene.traverse((o) => {
        const m = o as Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) =>
            x.dispose(),
          );
        }
      });
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
