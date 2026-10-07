export const WULING = {
  lat: 24.384,
  lon: 121.311,
  elev: 1800,
};

export type Vec3 = { e: number; n: number; u: number };

export type Basis = {
  forward: Vec3;
  right: Vec3;
  up: Vec3;
  alt: number;
  az: number;
};

const DEG = Math.PI / 180;

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function enu(altDeg: number, azDeg: number): Vec3 {
  const alt = altDeg * DEG;
  const az = azDeg * DEG;
  const c = Math.cos(alt);
  return { e: c * Math.sin(az), n: c * Math.cos(az), u: Math.sin(alt) };
}

export function dot(a: Vec3, b: Vec3) {
  return a.e * b.e + a.n * b.n + a.u * b.u;
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    e: a.n * b.u - a.u * b.n,
    n: a.u * b.e - a.e * b.u,
    u: a.e * b.n - a.n * b.e,
  };
}

export function norm(v: Vec3): Vec3 {
  const L = Math.hypot(v.e, v.n, v.u) || 1;
  return { e: v.e / L, n: v.n / L, u: v.u / L };
}

export function angSep(a: { alt: number; az: number }, b: { alt: number; az: number }) {
  const c = clamp(dot(enu(a.alt, a.az), enu(b.alt, b.az)), -1, 1);
  return (Math.acos(c) * 180) / Math.PI;
}

/** Shortest signed delta from a to b, in degrees, range (-180, 180]. */
export function angDelta(a: number, b: number) {
  return ((((b - a) % 360) + 540) % 360) - 180;
}

export function lerpAngle(a: number, b: number, t: number) {
  return (a + angDelta(a, b) * t + 360) % 360;
}

const DIRS = [
  "北",
  "北北東",
  "東北",
  "東北東",
  "東",
  "東南東",
  "東南",
  "南南東",
  "南",
  "南南西",
  "西南",
  "西南西",
  "西",
  "西北西",
  "西北",
  "北北西",
];

export function azLabel(az: number) {
  const a = ((az % 360) + 360) % 360;
  return DIRS[Math.round(a / 22.5) % 16] ?? "北";
}

export function taipeiParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  return { y: g("year"), m: g("month"), d: g("day"), h: g("hour"), min: g("minute") };
}

/** Taipei wall time → absolute Date. Hours may fall outside 0–23; Date normalizes them. */
export function atTaipei(y: number, m: number, d: number, h: number, min: number) {
  return new Date(Date.UTC(y, m - 1, d, h - 8, min, 0));
}

export function fmtTime(d: Date) {
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
}

export function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("zh-Hant-TW", {
    timeZone: "Asia/Taipei",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(d);
}

/** 16:00 Taipei on the afternoon that opens the observing night containing `anchor`. */
export function nightStart(anchor: Date) {
  const p = taipeiParts(anchor);
  if (p.h < 12) return atTaipei(p.y, p.m, p.d - 1, 16, 0);
  return atTaipei(p.y, p.m, p.d, 16, 0);
}

export function galacticToEquatorial(lDeg: number, bDeg: number) {
  const l = lDeg * DEG;
  const b = bDeg * DEG;
  const raNGP = 192.85948 * DEG;
  const decNGP = 27.12825 * DEG;
  const lNCP = 122.93192 * DEG;
  const sinDec =
    Math.sin(decNGP) * Math.sin(b) + Math.cos(decNGP) * Math.cos(b) * Math.cos(lNCP - l);
  const dec = Math.asin(clamp(sinDec, -1, 1));
  const y = Math.cos(b) * Math.sin(lNCP - l);
  const x = Math.sin(b) * Math.cos(decNGP) - Math.cos(b) * Math.sin(decNGP) * Math.cos(lNCP - l);
  let ra = Math.atan2(y, x) + raNGP;
  ra = ((ra % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return { ra: ra / DEG / 15, dec: dec / DEG };
}

function yawSpin(v: Vec3, deg: number): Vec3 {
  const a = deg * DEG;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { e: v.e * c + v.n * s, n: -v.e * s + v.n * c, u: v.u };
}

/**
 * Device orientation → the direction the rear camera looks.
 * alpha/beta/gamma follow the W3C deviceorientation spec (alpha counterclockwise from north).
 * screenAngle is `screen.orientation.angle` (clockwise from natural).
 * yawDeg adds a user compass calibration, positive toward the east.
 */
export function cameraBasis(
  alpha: number,
  beta: number,
  gamma: number,
  screenAngle: number,
  yawDeg: number,
): Basis {
  const cZ = Math.cos(alpha * DEG);
  const sZ = Math.sin(alpha * DEG);
  const cX = Math.cos(beta * DEG);
  const sX = Math.sin(beta * DEG);
  const cY = Math.cos(gamma * DEG);
  const sY = Math.sin(gamma * DEG);
  const m11 = cZ * cY - sZ * sX * sY;
  const m12 = -cX * sZ;
  const m13 = cY * sZ * sX + cZ * sY;
  const m21 = cY * sZ + cZ * sX * sY;
  const m22 = cZ * cX;
  const m23 = sZ * sY - cZ * cY * sX;
  const m31 = -cX * sY;
  const m32 = sX;
  const m33 = cX * cY;
  const R = (x: number, y: number, z: number): Vec3 => ({
    e: m11 * x + m12 * y + m13 * z,
    n: m21 * x + m22 * y + m23 * z,
    u: m31 * x + m32 * y + m33 * z,
  });
  // Rear camera looks along device −Z (screen +Z points at the user).
  let forward = R(0, 0, -1);
  const a = screenAngle * DEG;
  let right = R(Math.cos(a), -Math.sin(a), 0);
  let up = R(Math.sin(a), Math.cos(a), 0);
  if (yawDeg) {
    forward = yawSpin(forward, yawDeg);
    right = yawSpin(right, yawDeg);
    up = yawSpin(up, yawDeg);
  }
  forward = norm(forward);
  right = norm(right);
  up = norm(up);
  const alt = (Math.asin(clamp(forward.u, -1, 1)) * 180) / Math.PI;
  const az = ((Math.atan2(forward.e, forward.n) * 180) / Math.PI + 360) % 360;
  return { forward, right, up, alt, az };
}

/** Level camera (no roll) looking toward alt/az. Screen-up points toward the zenith. */
export function basisFromLook(altDeg: number, azDeg: number): Basis {
  const forward = enu(altDeg, azDeg);
  const zenith: Vec3 = { e: 0, n: 0, u: 1 };
  let right = cross(forward, zenith);
  if (Math.hypot(right.e, right.n, right.u) < 1e-4) {
    right = { e: 1, n: 0, u: 0 };
  } else {
    right = norm(right);
  }
  const up = norm(cross(right, forward));
  return { forward, right, up, alt: altDeg, az: azDeg };
}

export function projectPerspective(
  alt: number,
  az: number,
  basis: Basis,
  width: number,
  height: number,
  fovDeg: number,
) {
  const s = enu(alt, az);
  const z = dot(s, basis.forward);
  if (z <= 0.05) return null;
  const x = dot(s, basis.right);
  const y = dot(s, basis.up);
  const f = width / 2 / Math.tan((fovDeg * DEG) / 2);
  return { x: width / 2 + (f * x) / z, y: height / 2 - (f * y) / z };
}

export function projectMap(
  alt: number,
  az: number,
  cx: number,
  cy: number,
  radius: number,
  rimAlt: number,
  rotation: number,
) {
  if (alt < rimAlt - 1) return null;
  const span = Math.max(10, 90 - rimAlt);
  const rr = ((90 - alt) / span) * radius;
  const a = ((az - rotation) * Math.PI) / 180;
  return { x: cx + rr * Math.sin(a), y: cy - rr * Math.cos(a) };
}
