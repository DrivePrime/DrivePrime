import {
  ACESFilmicToneMapping,
  BackSide,
  Box3,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  RectAreaLight,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

/*
  The closing scene's car, in 3D (local prototype — the model's licence is non-commercial).
  Plain three.js, loaded on demand by the footer. Renders only when something changes
  (drag, inertia, intro, resize): once the car is still, nothing runs.

  Rotation: yaw only, unlimited (a full 360° turn), driven by horizontal drags on the car itself;
  light inertia on release. No pitch, pan or zoom. Touch: `touch-action: pan-y` lets vertical
  swipes scroll the page; a horizontal swipe on the car turns it.

  Staging: the canvas is larger than the photo it replaces. The car is framed from its real
  geometry so that, at every angle of a full turn, it stays inside the canvas and clear of the
  page's text (keep-out boxes given by the page), as large as that allows, pushed away from the text.
*/

export interface CarStage {
  dispose(): void;
}

/** Canvas-pixel rectangle the car must never cover (title, paragraph, buttons). */
export interface KeepOut {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CarLayout {
  /** where the brass line should fade out: just before the car's nearest ground point (canvas fractions) */
  lineX: number;
  lineY: number;
  /** car centre and size at rest (canvas fractions), for the studio light behind it */
  cx: number;
  cy: number;
  w: number;
  h: number;
}

interface Framing {
  /** ground line, fraction of the canvas height */
  ground: number;
  /** minimum distance between the car and the canvas edges, px */
  margin: number;
  /** extra distance kept from the keep-out boxes, px */
  gap: number;
  keepOut: KeepOut[];
  /** side away from the text: the car is pushed towards it */
  far: "left" | "right";
}

interface Options {
  url: string;
  /** element receiving keyboard focus / bubbling pointer events (the car frame) */
  surface: HTMLElement;
  reducedMotion: boolean;
  /** first drag / key press — the page hides its hint */
  onInteract: () => void;
  /** read at every resize: where and how the car may be framed */
  framing: () => Framing;
  onLayout?: (l: CarLayout) => void;
}

// The fleet's Classe G is black; the downloaded model is painted olive. Paint it like the real car:
// a near-black base under a glossy clear coat, so the studio's softboxes draw its lines.
const PAINT = {
  color: 0x060708,
  metalness: 0.0,
  roughness: 0.5, // the base stays a soft black; the clear coat draws the lines
  clearcoat: 1,
  clearcoatRoughness: 0.035,
};
// Rest pose: front three-quarter, nose towards the text (like the studio photo it replaces).
// Positive yaw turns the nose to the right; the intro arrives on the rest pose.
const REST_YAW = (-38 * Math.PI) / 180;
const INTRO_TURN = (25 * Math.PI) / 180;
const INTRO_MS = 2600;
const GLIDE_MS = 2200; // the softbox's single pass at the entrance
const YAWS = 36; // angles checked when framing a full turn
const PITCH = 0.1; // slight view from above, like a studio shot

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
        mat.color.setHex(0x06080b);
        mat.opacity = 0.72;
        mat.roughness = 0.02;
        mat.metalness = 0.2;
      } else {
        mat.opacity = 0.8;
      }
    }
    if ((mat as MeshStandardMaterial).envMapIntensity !== undefined)
      mat.envMapIntensity = 1;
  });
}

/*
  Automotive studio, used for reflections only (never drawn): a black room with long softboxes.
  A large overhead box outlines roof and bonnet, two waist-high strips run along the flanks,
  a lower strip catches wheels and sills, a wide panel behind gives the rim. The boxes surround
  the car, so the lines travel across the body as it turns and every angle stays readable.
*/
function studio(renderer: WebGLRenderer) {
  const room = new Scene();
  room.background = new Color(0x000000);
  const shell = new Mesh(
    new BoxGeometry(30, 14, 30),
    new MeshBasicMaterial({ color: 0x0f1013, side: BackSide }),
  );
  shell.position.y = 5;
  room.add(shell);
  const softbox = (
    w: number,
    h: number,
    power: number,
    pos: [number, number, number],
    look: [number, number, number],
  ) => {
    const m = new Mesh(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({ color: new Color(power, power, power * 1.02) }),
    );
    m.position.set(...pos);
    m.lookAt(...look);
    room.add(m);
  };
  /*
    The camera sits slightly above the car and never moves, so every face turned towards it
    (front, flank, rear) mirrors the same band just below the horizon behind the camera, while
    roof and bonnet mirror the band just above it. Long horizontal softboxes there draw the lines
    of the body at every angle of the turn; dark gaps between them keep the black deep.
  */
  // behind the camera (+Z): long strips at the angles the body actually mirrors (the room is seen
  // from the car's footprint: y / 10 ≈ the angle). Faces turned to the viewer mirror −1°…−9°,
  // roof and bonnet +2°…+7°. Thin dark gaps between strips keep the lines crisp and the black deep.
  softbox(16, 0.4, 5, [0, 0.95, 10], [0, 0.95, 0]); // roof
  softbox(16, 0.22, 7, [0, 0.45, 10], [0, 0.45, 0]); // bonnet and roof edges
  softbox(16, 0.1, 22, [0, -0.25, 10], [0, -0.2, 0]); // upper doors, pillars, window frames, grille top
  softbox(16, 0.06, 16, [0, -0.6, 10], [0, -0.55, 0]); // waist line
  softbox(16, 0.1, 18, [0, -0.95, 10], [0, -0.9, 0]); // lower doors, wings, tailgate
  softbox(16, 0.22, 7, [0, -1.4, 10], [0, -1.35, 0]); // sills, bumpers, wheels
  softbox(10, 2.2, 1.1, [0, 4.5, 8], [0, 0, 0]); // broad, dim key above: curvature on wings and edges
  // overhead: roof and bonnet edges as they tilt
  softbox(7, 2.4, 2.2, [0, 7, 0.5], [0, 0, 0.5]);
  // sides: grazing lines when a flank turns away
  softbox(9, 0.5, 3.4, [-8, 1.4, 1], [0, 1.2, 0]);
  softbox(9, 0.5, 3.4, [8, 1.4, -1], [0, 1.2, 0]);
  // behind the car (-Z): the rim — silhouette, roof line, rear pillars, wing tops
  softbox(14, 1.2, 4.5, [0, 3.2, -10], [0, 1, 0]);
  softbox(14, 0.4, 2.5, [0, 0.6, -10], [0, 0.6, 0]);
  const pmrem = new PMREMGenerator(renderer);
  const env = pmrem.fromScene(room, 0.02).texture;
  room.traverse((o) => {
    const m = o as Mesh;
    if (m.isMesh) {
      m.geometry.dispose();
      (m.material as Material).dispose();
    }
  });
  pmrem.dispose();
  return env;
}

/**
 * Contact shadow drawn from the car's real footprint: points near the ground darken a small
 * canvas (lower = darker), blurred twice — tight under the tyres, soft under the body.
 * Lies on the turntable, so it turns with the car. No shadow maps, no visible floor.
 */
function contactShadow(points: Float32Array, length: number, width: number) {
  const W = 256;
  const spanX = width * 1.9;
  const spanZ = length * 1.35;
  const H = Math.round((W * spanZ) / spanX);
  const marks = document.createElement("canvas");
  marks.width = W;
  marks.height = H;
  const mg = marks.getContext("2d")!;
  const body = document.createElement("canvas");
  body.width = W;
  body.height = H;
  const bg = body.getContext("2d")!;
  for (let i = 0; i < points.length; i += 3) {
    const y = points[i + 1];
    if (y > 0.9) continue;
    const px = (points[i] / spanX + 0.5) * W;
    const pz = (points[i + 2] / spanZ + 0.5) * H;
    bg.fillStyle = "rgba(0,0,0,0.05)";
    bg.fillRect(px - 2, pz - 2, 4, 4);
    if (y < 0.12) {
      mg.fillStyle = `rgba(0,0,0,${0.35 * (1 - y / 0.12)})`;
      mg.fillRect(px - 1.5, pz - 1.5, 3, 3);
    }
  }
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const g = out.getContext("2d")!;
  g.filter = "blur(14px)";
  g.globalAlpha = 0.85;
  g.drawImage(body, 0, 0);
  g.filter = "blur(4px)";
  g.globalAlpha = 1;
  g.drawImage(marks, 0, 0);
  g.filter = "none";
  const mesh = new Mesh(
    new PlaneGeometry(spanX, spanZ),
    new MeshBasicMaterial({
      map: new CanvasTexture(out),
      transparent: true,
      depthWrite: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.004;
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
  renderer.toneMappingExposure = 1.4;

  const scene = new Scene();
  const env = studio(renderer);
  scene.environment = env;
  scene.environmentIntensity = 1;
  // Direct light: a soft key for what reflections don't carry (tyres, textured grille, wheels),
  // two rims from behind and above to cut the silhouette out of the dark page
  const key = new DirectionalLight(0xffffff, 1.2);
  key.position.set(-2, 6, 5);
  const rimL = new DirectionalLight(0xe4eaf4, 1.8);
  rimL.position.set(-4, 5, -7);
  const rimR = new DirectionalLight(0xe4eaf4, 1.8);
  rimR.position.set(4, 5, -7);
  scene.add(key, rimL, rimR);
  // A softbox that glides once across the body when the scene appears (a real area light: its
  // highlight follows the paint's shape), then rests at the end of its travel.
  RectAreaLightUniformsLib.init();
  const sweep = new RectAreaLight(0xffffff, 0, 7, 0.9);
  const SWEEP_FROM = -7;
  const SWEEP_TO = 6;
  const placeSweep = (k: number) => {
    sweep.position.set(SWEEP_FROM + (SWEEP_TO - SWEEP_FROM) * k, 1.1, 6.5);
    sweep.lookAt(0, 0.9, 0);
    // fades in, crosses, settles to a quiet level
    sweep.intensity =
      k <= 0 ? 0 : 30 * Math.sin(Math.PI * Math.min(1, k)) + 3 * k;
  };
  placeSweep(opts.reducedMotion ? 1 : 0);
  scene.add(sweep);

  const gltf = await new GLTFLoader().loadAsync(opts.url);
  const source = gltf.scene as unknown as Group;
  tuneMaterials(source);
  const car = mergeByMaterial(source);

  // The export is in centimetres x 0.01 (the car is 0.05 units long): scale it to the real
  // G63 length so lights, camera and shadow work in metres.
  const raw = new Box3().setFromObject(car).getSize(new Vector3());
  car.scale.setScalar(4.87 / Math.max(raw.x, raw.z));
  car.updateMatrixWorld(true);

  // Centre on the footprint, wheels on y = 0; length along Z
  const box = new Box3().setFromObject(car);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  car.position.set(-center.x, -box.min.y, -center.z);
  const alongX = size.x > size.z;
  const length = Math.max(size.x, size.z);
  const width = Math.min(size.x, size.z);
  const height = size.y;
  const turntable = new Group();
  const body = new Group();
  body.add(car);
  if (alongX) body.rotation.y = Math.PI / 2;
  turntable.add(body);
  scene.add(turntable);
  turntable.updateMatrixWorld(true);

  // The car's real shape as a point cloud (surface vertices, one per 7 cm cell): used to frame it,
  // to draw its contact shadow and to know where it is on screen.
  const cells = new Map<string, number[]>();
  const v = new Vector3();
  car.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    const pos = m.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
      const k = `${Math.round(v.x / 0.07)},${Math.round(v.y / 0.07)},${Math.round(v.z / 0.07)}`;
      if (!cells.has(k)) cells.set(k, [v.x, v.y, v.z]);
    }
  });
  const cloud = new Float32Array(cells.size * 3);
  let ci = 0;
  cells.forEach((p) => {
    cloud[ci++] = p[0];
    cloud[ci++] = p[1];
    cloud[ci++] = p[2];
  });
  cells.clear();
  turntable.add(contactShadow(cloud, length, width));

  const camera = new PerspectiveCamera(15, 1, 0.1, 200);
  const viewProj = new Matrix4();
  let W = 1;
  let H = 1;
  let offX = 0; // px the image is shifted by (setViewOffset), current frame
  let offY = 0;

  /** Project the cloud at a yaw into canvas px (without the view offset). Calls fn per point. */
  const projectAt = (
    yaw: number,
    fn: (x: number, y: number, worldY: number) => void,
  ) => {
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    const e = viewProj.elements;
    for (let i = 0; i < cloud.length; i += 3) {
      const px = cloud[i] * c + cloud[i + 2] * s;
      const py = cloud[i + 1];
      const pz = -cloud[i] * s + cloud[i + 2] * c;
      const w = e[3] * px + e[7] * py + e[11] * pz + e[15];
      const x = (e[0] * px + e[4] * py + e[8] * pz + e[12]) / w;
      const y = (e[1] * px + e[5] * py + e[9] * pz + e[13]) / w;
      fn(((x + 1) / 2) * W, ((1 - y) / 2) * H, cloud[i + 1]);
    }
  };
  const aim = height * 0.45;
  const place = (d: number) => {
    camera.clearViewOffset();
    camera.position.set(0, aim + Math.tan(PITCH) * d, d);
    camera.lookAt(0, aim, 0);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    viewProj.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse,
    );
  };

  /*
    Framing, computed once per canvas size (never during rotation): one camera distance and one
    image offset for the whole turn. The car's real shape is projected at every angle of a full
    turn; the closest distance at which all of them stay inside the canvas and clear of the text
    (keep-out boxes), wheels on the ground line, is kept — that is the profile view's size, the
    widest one. Then the camera, FOV and scale never change: only the turntable (Y axis) turns,
    so a front view is naturally narrower than a profile.
  */
  const STEP = (Math.PI * 2) / YAWS;
  const fit = () => {
    const f = opts.framing();
    const outs = f.keepOut.map((k) => ({
      x0: k.x - f.gap,
      y0: k.y - f.gap,
      x1: k.x + k.w + f.gap,
      y1: k.y + k.h + f.gap,
    }));
    const groundPx = f.ground * H;
    const left = f.far === "left" ? f.margin : 2;
    const right = f.far === "right" ? f.margin : 2;
    const xs: number[] = [];
    const ys: number[] = [];
    // project one or more angles at distance d; returns the box (no offsets) and keeps the points
    const shoot = (d: number, yaws: number[]) => {
      place(d);
      xs.length = 0;
      ys.length = 0;
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (const a of yaws)
        projectAt(a, (x, y) => {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          xs.push(x);
          ys.push(y);
        });
      return { minX, maxX, minY, maxY };
    };
    const clear = (
      b: { minX: number; maxX: number; minY: number; maxY: number },
      dx: number,
      dy: number,
    ) => {
      if (b.minX + dx < left - 0.5 || b.maxX + dx > W - right + 0.5)
        return false;
      if (b.minY + dy < f.margin) return false;
      for (const o of outs) {
        if (
          b.maxX + dx < o.x0 ||
          b.minX + dx > o.x1 ||
          b.maxY + dy < o.y0 ||
          b.minY + dy > o.y1
        )
          continue;
        for (let i = 0; i < xs.length; i++) {
          const x = xs[i] + dx;
          const y = ys[i] + dy;
          if (x > o.x0 && x < o.x1 && y > o.y0 && y < o.y1) return false;
        }
      }
      return true;
    };
    const bisect = (ok: (d: number) => boolean) => {
      let lo = 4;
      let hi = 160;
      for (let i = 0; i < 16; i++) {
        const mid = (lo + hi) / 2;
        if (ok(mid)) hi = mid;
        else lo = mid;
      }
      return hi;
    };
    const turn = Array.from({ length: YAWS }, (_, k) => k * STEP);
    let off = { x: 0, y: 0 };
    const d = bisect((dd) => {
      const box = shoot(dd, turn);
      // pushed to the far side (away from the text), wheels on the ground line
      const dx =
        f.far === "right" ? W - f.margin - box.maxX : f.margin - box.minX;
      const dy = groundPx - box.maxY;
      if (!clear(box, dx, dy)) return false;
      off = { x: dx, y: dy };
      return true;
    });
    place(d);
    offX = off.x;
    offY = off.y;
    camera.setViewOffset(W, H, -offX, -offY, W, H);
    camera.updateProjectionMatrix();
  };

  // Car's on-screen box at the current camera (canvas px, with the view offset)
  const screenBox = (yaw: number) => {
    let x0 = Infinity,
      x1 = -Infinity,
      y0 = Infinity,
      y1 = -Infinity;
    projectAt(yaw, (x, y) => {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    });
    return { x0: x0 + offX, x1: x1 + offX, y0: y0 + offY, y1: y1 + offY };
  };

  const reportLayout = () => {
    if (!opts.onLayout) return;
    const f = opts.framing();
    const b = screenBox(REST_YAW);
    // the car's nearest point to the text among its low points (wheels, bumper)
    let near = f.far === "right" ? Infinity : -Infinity;
    projectAt(REST_YAW, (x, _y, wy) => {
      if (wy > 0.5) return;
      const sx = x + offX;
      near = f.far === "right" ? Math.min(near, sx) : Math.max(near, sx);
    });
    const lineX = f.far === "right" ? near - 56 : near + 56;
    opts.onLayout({
      lineX: lineX / W,
      lineY: (b.y1 - 6) / H,
      cx: (b.x0 + b.x1) / 2 / W,
      cy: (b.y0 + b.y1) / 2 / H,
      w: (b.x1 - b.x0) / W,
      h: (b.y1 - b.y0) / H,
    });
  };

  // ── rendering on demand
  let raf = 0;
  // with the intro the car starts a little before its rest pose; reduced motion: at rest, still
  let yaw = opts.reducedMotion ? REST_YAW : REST_YAW - INTRO_TURN;
  let velocity = 0; // rad / ms
  let intro: { from: number; start: number } | null = null;
  let dragging = false;
  let glide: number | null = null; // start time of the softbox's single pass
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
    if (glide !== null) {
      const k = Math.min(1, (now - glide) / GLIDE_MS);
      placeSweep(k < 1 ? k * k * (3 - 2 * k) : 1);
      if (k < 1) again = true;
      else glide = null;
    }
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

  let sized = "";
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const f = opts.framing();
    const sig = `${w}x${h}|${f.far}|${f.keepOut.map((k) => `${Math.round(k.x)},${Math.round(k.y)},${Math.round(k.w)},${Math.round(k.h)}`).join(";")}`;
    if (sig === sized) return;
    sized = sig;
    W = w;
    H = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    fit();
    render();
    reportLayout();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ── drag to turn (yaw only), only when the gesture starts on the car
  const surface = opts.surface;
  let interacted = false;
  const firstTouch = () => {
    if (!interacted) {
      interacted = true;
      opts.onInteract();
    }
  };
  const onCar = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const b = screenBox(yaw);
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    return x > b.x0 - 12 && x < b.x1 + 12 && y > b.y0 - 12 && y < b.y1 + 12;
  };
  let start: { x: number; y: number; id: number; decided: boolean } | null =
    null;
  const samples: { x: number; t: number }[] = [];
  const perPixel = () =>
    (Math.PI * 2) / Math.max(600, surface.clientWidth * 1.6);
  const down = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (!onCar(e)) return;
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
      surface.style.cursor = "grabbing";
      firstTouch();
    }
  };
  const move = (e: PointerEvent) => {
    if (!start || e.pointerId !== start.id) {
      // hover: the hand appears over the car only
      if (e.pointerType === "mouse" && !dragging)
        surface.style.cursor = onCar(e) ? "grab" : "";
      return;
    }
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
    surface.style.cursor = e.pointerType === "mouse" && onCar(e) ? "grab" : "";
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
          glide = performance.now(); // the light passes once, even if the visitor already grabbed the car
          schedule();
          if (interacted || dragging) return;
          intro = { from: yaw, start: performance.now() };
          schedule();
        }, 650);
      },
      { threshold: 0.5 },
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
          const mat = m.material as MeshBasicMaterial;
          mat.map?.dispose();
          mat.dispose();
        }
      });
      env.dispose();
      renderer.dispose();
    },
  };
}
