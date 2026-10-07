import { useEffect, useRef } from "react";
import { ASTERISMS, CON_BY_ID, HOT, STARS, WARM } from "@/lib/astro/catalog";
import { projectMap, projectPerspective, type Basis } from "@/lib/astro/math";
import type { SkyBody, SkySnapshot } from "@/lib/astro/sky";

const INK = "#07080d";
const PAPER = "#ebe6da";
const MUTED = "#9aa3b5";
const AMBER = "#e2b15a";

type Hit = { id: string; x: number; y: number; pick: number };

export function SkyView({
  sky,
  mode,
  transparent,
  basis,
  mapRotation,
  rim,
  showLines,
  showNames,
  showPlanets,
  showMilky,
  showAsterisms,
  highlightCon,
  selectedId,
  fov,
  insetTop,
  insetBottom,
  onTap,
  onMapRotate,
  onLookDrag,
  onZoom,
}: {
  sky: SkySnapshot | null;
  mode: "map" | "align";
  transparent: boolean;
  basis: Basis;
  mapRotation: number;
  rim: number;
  showLines: boolean;
  showNames: boolean;
  showPlanets: boolean;
  showMilky: boolean;
  showAsterisms: boolean;
  highlightCon: string | null;
  selectedId: string | null;
  fov: number;
  insetTop: number;
  insetBottom: number;
  onTap: (id: string | null) => void;
  onMapRotate: (delta: number) => void;
  onLookDrag: (dAlt: number, dAz: number) => void;
  onZoom: (factor: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hits = useRef<Hit[]>([]);
  const propsRef = useRef({
    mode,
    basis,
    onTap,
    onMapRotate,
    onLookDrag,
    onZoom,
  });
  propsRef.current = { mode, basis, onTap, onMapRotate, onLookDrag, onZoom };

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !sky) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    if (width < 2 || height < 2) return;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    hits.current = [];
    paint(ctx, width, height, sky, {
      mode,
      transparent,
      basis,
      mapRotation,
      rim,
      showLines,
      showNames,
      showPlanets,
      showMilky,
      showAsterisms,
      highlightCon,
      selectedId,
      fov,
      insetTop,
      insetBottom,
      hits: hits.current,
    });
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch: number | null = null;
    let moved = 0;

    const dist = () => {
      const pts = [...pointers.values()];
      if (pts.length < 2) return 0;
      return Math.hypot(pts[0]!.x - pts[1]!.x, pts[0]!.y - pts[1]!.y);
    };

    const down = (e: PointerEvent) => {
      wrap.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = 0;
      if (pointers.size === 2) pinch = dist();
    };
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved += Math.hypot(dx, dy);
      const p = propsRef.current;
      if (pointers.size >= 2 && pinch) {
        const d = dist();
        if (pinch > 0 && d > 0) p.onZoom(d / pinch);
        pinch = d;
        return;
      }
      if (pointers.size === 1) {
        if (p.mode === "map") p.onMapRotate(-dx * 0.35);
      else {
        const w = wrap.clientWidth || 390;
        const fovGuess = Number(wrap.dataset.fov) || 64;
        const scale = fovGuess / Math.max(220, w);
        const cosA = Math.max(0.28, Math.cos((p.basis.alt * Math.PI) / 180));
        p.onLookDrag(dy * scale, (-dx * scale) / cosA);
      }
      }
    };
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0 && moved < 8) {
        const rect = wrap.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let best: Hit | null = null;
        let bestD = 26;
        for (const h of hits.current) {
          const d = Math.hypot(h.x - x, h.y - y);
          const limit = Math.max(h.pick, 18);
          if (d < limit && d < bestD) {
            best = h;
            bestD = d;
          }
        }
        propsRef.current.onTap(best ? best.id : null);
      }
    };
    wrap.addEventListener("pointerdown", down);
    wrap.addEventListener("pointermove", move);
    wrap.addEventListener("pointerup", up);
    wrap.addEventListener("pointercancel", up);
    return () => {
      wrap.removeEventListener("pointerdown", down);
      wrap.removeEventListener("pointermove", move);
      wrap.removeEventListener("pointerup", up);
      wrap.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div ref={wrapRef} data-fov={fov} className="absolute inset-0 touch-none">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

type PaintOpts = {
  mode: "map" | "align";
  transparent: boolean;
  basis: Basis;
  mapRotation: number;
  rim: number;
  showLines: boolean;
  showNames: boolean;
  showPlanets: boolean;
  showMilky: boolean;
  showAsterisms: boolean;
  highlightCon: string | null;
  selectedId: string | null;
  fov: number;
  insetTop: number;
  insetBottom: number;
  hits: Hit[];
};

function paint(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sky: SkySnapshot,
  o: PaintOpts,
) {
  const tag = new Set(STARS.filter((s) => s.tag).map((s) => s.id));
  ctx.clearRect(0, 0, width, height);
  const top = Math.max(8, o.insetTop);
  const bottom = Math.max(8, o.insetBottom);
  const cx = width / 2;
  const cy = top + (height - top - bottom) / 2;
  const radius = Math.max(40, Math.min(width / 2 - 32, (height - top - bottom) / 2 - 18));

  const project = (alt: number, az: number) => {
    if (o.mode === "map") return projectMap(alt, az, cx, cy, radius, o.rim, o.mapRotation);
    return projectPerspective(alt, az, o.basis, width, height, o.fov);
  };

  if (o.mode === "map") {
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, width, height);
    const g = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
    g.addColorStop(0, "#16233b");
    g.addColorStop(0.72, "#0c1424");
    g.addColorStop(1, "#080d16");
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  } else if (!o.transparent) {
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, "#0b1428");
    g.addColorStop(0.55, "#090d18");
    g.addColorStop(1, "#07080c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    drawHorizon(ctx, width, height, o.basis, o.fov, true);
  }

  const clipMap = () => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
  };

  ctx.save();
  if (o.mode === "map") clipMap();

  if (o.showMilky) drawMilky(ctx, sky, project, o.mode === "map" ? radius : Math.min(width, height));

  const pos = new Map<string, { x: number; y: number; alt: number }>();
  const putStar = (b: SkyBody) => {
    const p = project(b.alt, b.az);
    if (!p) return;
    if (o.mode === "map" && Math.hypot(p.x - cx, p.y - cy) > radius + 2) return;
    pos.set(b.id, { x: p.x, y: p.y, alt: b.alt });
  };
  for (const s of sky.stars) putStar(s);

  if (o.showLines) {
    for (const con of Object.values(CON_BY_ID)) {
      const hot = o.highlightCon === con.id;
      ctx.lineWidth = hot ? 1.6 : 1;
      ctx.strokeStyle = hot ? "rgba(226,177,90,0.92)" : "rgba(226,177,90,0.38)";
      ctx.beginPath();
      for (const [a, b] of con.lines) {
        const pa = pos.get(a);
        const pb = pos.get(b);
        if (!pa || !pb) continue;
        if (Math.hypot(pa.x - pb.x, pa.y - pb.y) > (o.mode === "map" ? radius : width) * 0.72) continue;
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
      }
      ctx.stroke();
    }
  }

  if (o.showAsterisms) {
    ctx.save();
    ctx.setLineDash([4, 5]);
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = "rgba(235,230,218,0.45)";
    for (const ast of ASTERISMS) {
      ctx.beginPath();
      let started = false;
      for (const id of ast.ids) {
        const p = pos.get(id);
        if (!p) {
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  for (const s of sky.stars) {
    const p = pos.get(s.id);
    if (!p || p.alt < -1) continue;
    drawStar(ctx, p.x, p.y, s, o.mode, o.fov);
    o.hits.push({ id: s.id, x: p.x, y: p.y, pick: Math.max(16, starRadius(s.mag, o.mode, o.fov) + 8) });
  }

  if (o.showPlanets) {
    for (const planet of sky.planets) {
      if (planet.alt < -1) continue;
      const p = project(planet.alt, planet.az);
      if (!p) continue;
      drawPlanet(ctx, p.x, p.y, planet);
      o.hits.push({ id: planet.id, x: p.x, y: p.y, pick: 20 });
    }
    if (sky.moon.alt > -2) {
      const p = project(sky.moon.alt, sky.moon.az);
      if (p) {
        drawMoon(ctx, p.x, p.y, o.mode === "map" ? 9 : 11, sky.moon.illum ?? 0.5, !!sky.moon.waxing);
        o.hits.push({ id: "moon", x: p.x, y: p.y, pick: 22 });
      }
    }
    if (sky.sun.alt > -8) {
      const p = project(sky.sun.alt, sky.sun.az);
      if (p) {
        drawSun(ctx, p.x, p.y);
        o.hits.push({ id: "sun", x: p.x, y: p.y, pick: 22 });
      }
    }
  }

  for (const d of sky.dsos) {
    if (d.alt < 6) continue;
    const p = project(d.alt, d.az);
    if (!p) continue;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(235,230,218,0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();
    o.hits.push({ id: d.id, x: p.x, y: p.y, pick: 16 });
    if (o.showNames) {
      ctx.font = `12px "Noto Serif TC", "WenQuanYi Zen Hei", sans-serif`;
      ctx.fillStyle = MUTED;
      ctx.textAlign = "left";
      ctx.fillText(d.name, p.x + 10, p.y + 4);
    }
  }

  if (o.showNames) {
    const labels: { x: number; y: number; text: string; pri: number; fill: string; size: number }[] = [];
    for (const conId of Object.keys(CON_BY_ID)) {
      const members = sky.stars.filter((s) => s.con === conId && pos.has(s.id) && s.alt > 0);
      if (members.length < 2 && conId !== o.highlightCon) continue;
      if (!members.length) continue;
      const sx = members.reduce((a, s) => a + pos.get(s.id)!.x, 0) / members.length;
      const sy = members.reduce((a, s) => a + pos.get(s.id)!.y, 0) / members.length;
      const bright = Math.min(...members.map((s) => s.mag));
      const con = CON_BY_ID[conId];
      if (!con) continue;
      labels.push({
        x: sx,
        y: sy - 12,
        text: con.short,
        pri: (o.highlightCon === conId ? 80 : 20) + (4 - bright) * 4,
        fill: o.highlightCon === conId ? AMBER : "rgba(235,230,218,0.82)",
        size: 13,
      });
    }
    for (const s of sky.stars) {
      const p = pos.get(s.id);
      if (!p || s.alt < 2) continue;
      const famous = s.mag < 1.55 || (tag.has(s.id) && (s.mag < 2.3 || o.highlightCon === s.con));
      if (!famous && s.id !== o.selectedId) continue;
      if (!s.name || s.name === s.en) continue;
      labels.push({
        x: p.x,
        y: p.y - starRadius(s.mag, o.mode, o.fov) - 4,
        text: s.name,
        pri: 40 - s.mag * 6 + (s.id === o.selectedId ? 30 : 0),
        fill: PAPER,
        size: 12,
      });
    }
    for (const planet of sky.planets) {
      if (!o.showPlanets || planet.alt < 0) continue;
      const p = project(planet.alt, planet.az);
      if (!p) continue;
      labels.push({
        x: p.x,
        y: p.y - 12,
        text: planet.name,
        pri: 70,
        fill: AMBER,
        size: 13,
      });
    }
    if (o.showPlanets && sky.moon.alt > 0) {
      const p = project(sky.moon.alt, sky.moon.az);
      if (p)
        labels.push({
          x: p.x,
          y: p.y - 16,
          text: sky.moon.phase ?? "月亮",
          pri: 75,
          fill: PAPER,
          size: 13,
        });
    }
    drawLabels(ctx, labels);
  }

  if (o.selectedId) {
    const b = sky.byId.get(o.selectedId);
    const p = b ? project(b.alt, b.az) : null;
    if (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 1.25;
      ctx.stroke();
    }
  }

  ctx.restore();

  if (o.mode === "map") {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(226,177,90,0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();
    const span = Math.max(10, 90 - o.rim);
    if (30 > o.rim) {
      const rr = ((90 - 30) / span) * radius;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(154,163,181,0.18)";
      ctx.stroke();
    }
    ctx.font = `12px "Noto Serif TC", "WenQuanYi Zen Hei", sans-serif`;
    ctx.fillStyle = AMBER;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cards = [
      ["北", 0],
      ["東", 90],
      ["南", 180],
      ["西", 270],
    ] as const;
    for (const [label, az] of cards) {
      const a = ((az - o.mapRotation) * Math.PI) / 180;
      const x = cx + (radius + 14) * Math.sin(a);
      const y = cy - (radius + 14) * Math.cos(a);
      ctx.fillText(label, x, y);
    }
    ctx.fillStyle = MUTED;
    ctx.font = `11px "Noto Sans TC", "WenQuanYi Zen Hei", sans-serif`;
    ctx.fillText("天頂", cx, cy - 10);
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = "rgba(226,177,90,0.85)";
    ctx.lineWidth = 1;
    const arm = 18;
    ctx.beginPath();
    ctx.moveTo(width / 2 - arm, height / 2);
    ctx.lineTo(width / 2 - 5, height / 2);
    ctx.moveTo(width / 2 + 5, height / 2);
    ctx.lineTo(width / 2 + arm, height / 2);
    ctx.moveTo(width / 2, height / 2 - arm);
    ctx.lineTo(width / 2, height / 2 - 5);
    ctx.moveTo(width / 2, height / 2 + 5);
    ctx.lineTo(width / 2, height / 2 + arm);
    ctx.stroke();
    drawHorizon(ctx, width, height, o.basis, o.fov, false);
  }
}

function drawMilky(
  ctx: CanvasRenderingContext2D,
  sky: SkySnapshot,
  project: (alt: number, az: number) => { x: number; y: number } | null,
  scale: number,
) {
  const bands = 3;
  const per = Math.floor(sky.milky.length / bands);
  if (per < 2) return;
  const styles = [
    { width: Math.max(6, scale * 0.05), color: "rgba(176, 190, 214, 0.07)" },
    { width: Math.max(10, scale * 0.085), color: "rgba(226, 214, 186, 0.11)" },
    { width: Math.max(6, scale * 0.05), color: "rgba(176, 190, 214, 0.07)" },
  ];
  for (let band = 0; band < bands; band++) {
    const slice = sky.milky.slice(band * per, (band + 1) * per);
    const style = styles[band] ?? styles[1]!;
    ctx.lineWidth = style.width;
    ctx.strokeStyle = style.color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    let open = false;
    let prev: { x: number; y: number } | null = null;
    for (const p of slice) {
      const q = project(p.alt, p.az);
      const jump = q && prev ? Math.hypot(q.x - prev.x, q.y - prev.y) > scale * 0.42 : false;
      if (!q || jump) {
        if (open) ctx.stroke();
        ctx.beginPath();
        open = false;
        prev = q;
        if (q) {
          ctx.moveTo(q.x, q.y);
          open = true;
        }
        continue;
      }
      ctx.lineTo(q.x, q.y);
      open = true;
      prev = q;
    }
    if (open) ctx.stroke();
  }
}

function starRadius(mag: number, mode: "map" | "align", fov: number) {
  const m = Math.min(5.4, Math.max(-1.6, mag));
  const base = Math.max(1.05, (4.8 - m) * 0.78);
  return mode === "map" ? base : base * Math.max(0.85, 62 / fov);
}

function starFill(id: string) {
  if (WARM.has(id)) return "#ffb07a";
  if (HOT.has(id)) return "#d5e6ff";
  return "#f4f1e8";
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: SkyBody,
  mode: "map" | "align",
  fov: number,
) {
  const r = starRadius(s.mag, mode, fov);
  const color = starFill(s.id);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  if (s.mag < 0.4) {
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - r * 3.2, y);
    ctx.lineTo(x + r * 3.2, y);
    ctx.moveTo(x, y - r * 3.2);
    ctx.lineTo(x, y + r * 3.2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawPlanet(ctx: CanvasRenderingContext2D, x: number, y: number, p: SkyBody) {
  const color =
    p.id === "mars" ? "#e7a07a" : p.id === "saturn" ? "#f0e2b0" : p.id === "jupiter" ? "#f3d7a6" : "#f6edd4";
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 4.5, 0, Math.PI * 2);
  ctx.fill();
  if (p.id === "saturn") {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.5);
    ctx.beginPath();
    const tilt = Math.max(0.18, Math.abs(Math.sin(((p.ringTilt ?? 15) * Math.PI) / 180)));
    ctx.ellipse(0, 0, 9, 9 * tilt, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(240,226,176,0.85)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}

function drawSun(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd27a";
  ctx.fill();
}

function drawMoon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  illum: number,
  waxing: boolean,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#1a2230";
  ctx.fillRect(x - r - 1, y - r - 1, r * 2 + 2, r * 2 + 2);
  ctx.fillStyle = "#f4efe2";
  const k = Math.max(0, Math.min(1, illum));
  // q = +1 new (dark), 0 quarter, -1 full
  const q = 1 - 2 * k;
  ctx.beginPath();
  if (waxing) {
    ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, false);
    ctx.ellipse(x, y, Math.abs(q) * r, r, 0, Math.PI / 2, -Math.PI / 2, q > 0);
  } else {
    ctx.arc(x, y, r, Math.PI / 2, -Math.PI / 2, false);
    ctx.ellipse(x, y, Math.abs(q) * r, r, 0, -Math.PI / 2, Math.PI / 2, q < 0);
  }
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(244,239,226,0.7)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawHorizon(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  basis: Basis,
  fov: number,
  fillGround: boolean,
) {
  const pts: { x: number; y: number }[] = [];
  for (let az = 0; az <= 360; az += 4) {
    const p = projectPerspective(0, az, basis, width, height, fov);
    if (p && p.x > -80 && p.x < width + 80 && p.y > -80 && p.y < height + 80) pts.push(p);
  }
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (const p of pts) ctx.lineTo(p.x, p.y);
  ctx.strokeStyle = "rgba(226,177,90,0.7)";
  ctx.lineWidth = 1.25;
  ctx.stroke();
  if (fillGround && pts.length > 4) {
    ctx.beginPath();
    ctx.moveTo(pts[0]!.x, pts[0]!.y);
    for (const p of pts) ctx.lineTo(p.x, p.y);
    ctx.lineTo(width + 20, height + 20);
    ctx.lineTo(-20, height + 20);
    ctx.closePath();
    ctx.fillStyle = "rgba(6,7,10,0.55)";
    ctx.fill();
  }
}

function drawLabels(
  ctx: CanvasRenderingContext2D,
  labels: { x: number; y: number; text: string; pri: number; fill: string; size: number }[],
) {
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  const sorted = [...labels].sort((a, b) => b.pri - a.pri);
  for (const lb of sorted) {
    ctx.font = `${lb.size}px "Noto Serif TC", "WenQuanYi Zen Hei", sans-serif`;
    const w = ctx.measureText(lb.text).width;
    const box = { x: lb.x - w / 2 - 2, y: lb.y - lb.size, w: w + 4, h: lb.size + 3 };
    if (placed.some((p) => overlap(p, box))) continue;
    placed.push(box);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(7,8,13,0.72)";
    ctx.strokeText(lb.text, lb.x, lb.y);
    ctx.fillStyle = lb.fill;
    ctx.fillText(lb.text, lb.x, lb.y);
  }
}

function overlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
