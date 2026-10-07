import {
  Body,
  DefineStar,
  Equator,
  EquatorFromVector,
  Horizon,
  Illumination,
  MakeTime,
  MoonPhase,
  Observer,
  Rotation_EQJ_EQD,
  RotateVector,
  SearchAltitude,
  SearchRiseSet,
  Vector,
  type Body as BodyName,
} from "astronomy-engine";
import {
  ASTERISMS,
  CON_BY_ID,
  CONSTELLATIONS,
  DEEP_SKY,
  STARS,
  STAR_BY_ID,
  type Constellation,
  type Star,
} from "./catalog";
import { WULING, angSep, atTaipei, galacticToEquatorial, nightStart, taipeiParts } from "./math";

export const OBS = new Observer(WULING.lat, WULING.lon, WULING.elev);

export type Kind = "star" | "planet" | "moon" | "sun" | "dso";

export type SkyBody = {
  id: string;
  kind: Kind;
  name: string;
  en: string;
  mag: number;
  alt: number;
  az: number;
  ra: number;
  dec: number;
  con?: string;
  blurb?: string;
  illum?: number;
  waxing?: boolean;
  phase?: string;
  ringTilt?: number;
};

export type SkySnapshot = {
  date: Date;
  sun: SkyBody;
  moon: SkyBody;
  planets: SkyBody[];
  stars: SkyBody[];
  dsos: SkyBody[];
  byId: Map<string, SkyBody>;
  milky: { alt: number; az: number; l: number; b: number }[];
};

const PLANETS: { id: string; body: BodyName; name: string; en: string; blurb: string }[] = [
  {
    id: "mercury",
    body: Body.Mercury,
    name: "水星",
    en: "Mercury",
    blurb: "總是貼著太陽，只有黃昏或黎明、地平線附近才有機會看到。",
  },
  {
    id: "venus",
    body: Body.Venus,
    name: "金星",
    en: "Venus",
    blurb: "除了日月之外最亮。只出現在黃昏的西邊，或黎明的東邊，光很穩、不閃。",
  },
  {
    id: "mars",
    body: Body.Mars,
    name: "火星",
    en: "Mars",
    blurb: "明顯的橘紅色。亮度隨季節差很多，暗的時候會混在恆星裡。",
  },
  {
    id: "jupiter",
    body: Body.Jupiter,
    name: "木星",
    en: "Jupiter",
    blurb: "通常是夜空裡最亮的行星之一。光很穩，不像恆星會閃爍。",
  },
  {
    id: "saturn",
    body: Body.Saturn,
    name: "土星",
    en: "Saturn",
    blurb: "穩穩的黃白色，不會閃。肉眼看不出光環，但顏色和穩定度能把它跟恆星分開。",
  },
];

function phaseName(deg: number) {
  const d = ((deg % 360) + 360) % 360;
  if (d < 12 || d > 348) return "新月";
  if (d < 80) return "娥眉月";
  if (d < 100) return "上弦月";
  if (d < 170) return "盈凸月";
  if (d < 190) return "滿月";
  if (d < 260) return "虧凸月";
  if (d < 280) return "下弦月";
  return "殘月";
}

function placeFixed(date: Date, ra: number, dec: number, time = MakeTime(date)) {
  const rot = Rotation_EQJ_EQD(time);
  const raR = (ra * Math.PI) / 12;
  const decR = (dec * Math.PI) / 180;
  const v = new Vector(
    Math.cos(decR) * Math.cos(raR),
    Math.cos(decR) * Math.sin(raR),
    Math.sin(decR),
    time,
  );
  const eq = EquatorFromVector(RotateVector(rot, v));
  const hor = Horizon(date, OBS, eq.ra, eq.dec, "normal");
  return { alt: hor.altitude, az: hor.azimuth };
}

export function skyAt(date: Date): SkySnapshot {
  const time = MakeTime(date);
  const rot = Rotation_EQJ_EQD(time);
  const byId = new Map<string, SkyBody>();

  const put = (b: SkyBody) => {
    byId.set(b.id, b);
    return b;
  };

  const fixed = (ra: number, dec: number) => {
    const raR = (ra * Math.PI) / 12;
    const decR = (dec * Math.PI) / 180;
    const v = new Vector(
      Math.cos(decR) * Math.cos(raR),
      Math.cos(decR) * Math.sin(raR),
      Math.sin(decR),
      time,
    );
    const eq = EquatorFromVector(RotateVector(rot, v));
    const hor = Horizon(date, OBS, eq.ra, eq.dec, "normal");
    return { alt: hor.altitude, az: hor.azimuth };
  };

  const stars = STARS.map((s) => {
    const h = fixed(s.ra, s.dec);
    return put({
      id: s.id,
      kind: "star",
      name: s.zh || s.en,
      en: s.en,
      mag: s.mag,
      alt: h.alt,
      az: h.az,
      ra: s.ra,
      dec: s.dec,
      con: s.con,
      blurb: s.blurb,
    });
  });

  const bodyOf = (body: BodyName, id: string, name: string, en: string, kind: Kind, blurb?: string) => {
    const eq = Equator(body, date, OBS, true, true);
    const hor = Horizon(date, OBS, eq.ra, eq.dec, "normal");
    const ill = Illumination(body, date);
    return put({
      id,
      kind,
      name,
      en,
      mag: ill.mag,
      alt: hor.altitude,
      az: hor.azimuth,
      ra: eq.ra,
      dec: eq.dec,
      blurb,
      ringTilt: ill.ring_tilt,
    });
  };

  const sun = bodyOf(Body.Sun, "sun", "太陽", "Sun", "sun");
  const phaseDeg = MoonPhase(date);
  const moonIll = Illumination(Body.Moon, date);
  const moonEq = Equator(Body.Moon, date, OBS, true, true);
  const moonHor = Horizon(date, OBS, moonEq.ra, moonEq.dec, "normal");
  const moon = put({
    id: "moon",
    kind: "moon",
    name: "月亮",
    en: "Moon",
    mag: moonIll.mag,
    alt: moonHor.altitude,
    az: moonHor.azimuth,
    ra: moonEq.ra,
    dec: moonEq.dec,
    illum: moonIll.phase_fraction,
    waxing: ((phaseDeg % 360) + 360) % 360 < 180,
    phase: phaseName(phaseDeg),
    blurb: `今晚月相是${phaseName(phaseDeg)}。越接近滿月，銀河和暗星越不清楚。`,
  });

  const planets = PLANETS.map((p) => bodyOf(p.body, p.id, p.name, p.en, "planet", p.blurb));

  const dsos = DEEP_SKY.map((d) => {
    const h = fixed(d.ra, d.dec);
    return put({
      id: d.id,
      kind: "dso",
      name: d.name,
      en: d.en,
      mag: 4,
      alt: h.alt,
      az: h.az,
      ra: d.ra,
      dec: d.dec,
      blurb: d.blurb,
    });
  });

  const milky = MILKY.map((p) => {
    const h = fixed(p.ra, p.dec);
    return { alt: h.alt, az: h.az, l: p.l, b: p.b };
  });

  return { date, sun, moon, planets, stars, dsos, byId, milky };
}

export type Passage = { rise: Date | null; set: Date | null };

const BODY_ENUM: Record<string, BodyName> = {
  sun: Body.Sun,
  moon: Body.Moon,
  mercury: Body.Mercury,
  venus: Body.Venus,
  mars: Body.Mars,
  jupiter: Body.Jupiter,
  saturn: Body.Saturn,
};

export function passages(body: SkyBody, from: Date): Passage {
  let target: BodyName;
  if (body.kind === "star" || body.kind === "dso") {
    const ra = ((body.ra % 24) + 24) % 24;
    DefineStar(Body.Star1, ra, body.dec, 1000);
    target = Body.Star1;
  } else {
    target = BODY_ENUM[body.id] ?? Body.Star1;
  }
  const rise = SearchRiseSet(target, OBS, 1, from, 1.2);
  const set = SearchRiseSet(target, OBS, -1, from, 1.2);
  return {
    rise: rise ? rise.date : null,
    set: set ? set.date : null,
  };
}

export type SunNight = {
  sunset: Date | null;
  dark: Date | null;
  dawn: Date | null;
  sunrise: Date | null;
};

export function sunNight(anchor: Date): SunNight {
  const from = new Date(nightStart(anchor).getTime() - 60 * 60 * 1000);
  const sunset = SearchRiseSet(Body.Sun, OBS, -1, from, 1);
  const sunrise = SearchRiseSet(Body.Sun, OBS, 1, from, 1);
  const dark = SearchAltitude(Body.Sun, OBS, -1, from, 1, -18);
  const dawn = SearchAltitude(Body.Sun, OBS, 1, from, 1, -18);
  return {
    sunset: sunset?.date ?? null,
    sunrise: sunrise?.date ?? null,
    dark: dark?.date ?? null,
    dawn: dawn?.date ?? null,
  };
}

/** Next moment the Sun is at least 15° below the horizon, or now if it already is. */
export function nextDark(date: Date, sunAlt: number) {
  if (sunAlt < -15) return date;
  const hit = SearchAltitude(Body.Sun, OBS, -1, date, 2, -15);
  return hit?.date ?? date;
}

export function midnightOf(anchor: Date) {
  const p = taipeiParts(anchor);
  if (p.h < 5) return atTaipei(p.y, p.m, p.d, 0, 0);
  return atTaipei(p.y, p.m, p.d + 1, 0, 0);
}

export function predawnOf(anchor: Date) {
  const p = taipeiParts(anchor);
  if (p.h < 5) return atTaipei(p.y, p.m, p.d, 4, 30);
  return atTaipei(p.y, p.m, p.d + 1, 4, 30);
}

export function centroid(bodies: { alt: number; az: number }[]) {
  let e = 0;
  let n = 0;
  let u = 0;
  for (const b of bodies) {
    const alt = (b.alt * Math.PI) / 180;
    const az = (b.az * Math.PI) / 180;
    const c = Math.cos(alt);
    e += c * Math.sin(az);
    n += c * Math.cos(az);
    u += Math.sin(alt);
  }
  const len = Math.hypot(e, n, u) || 1;
  const alt = (Math.asin(Math.max(-1, Math.min(1, u / len))) * 180) / Math.PI;
  const az = ((Math.atan2(e, n) * 180) / Math.PI + 360) % 360;
  return { alt, az };
}

export type ConView = {
  con: Constellation;
  alt: number;
  az: number;
  up: number;
  brightest?: SkyBody;
};

export function constellationsNow(sky: SkySnapshot): ConView[] {
  const byCon = new Map<string, SkyBody[]>();
  for (const s of sky.stars) {
    if (!s.con) continue;
    const list = byCon.get(s.con);
    if (list) list.push(s);
    else byCon.set(s.con, [s]);
  }
  const out: ConView[] = [];
  for (const con of CONSTELLATIONS) {
    const members = byCon.get(con.id) ?? [];
    if (!members.length) continue;
    const c = centroid(members);
    const up = members.filter((m) => m.alt > 8).length;
    const brightest = [...members].sort((a, b) => a.mag - b.mag)[0];
    out.push({ con, alt: c.alt, az: c.az, up, brightest });
  }
  return out;
}

export function nightGuide(sky: SkySnapshot) {
  const sun = sky.sun;
  const moonUp = sky.moon.alt > 5 && (sky.moon.illum ?? 0) > 0.85;
  const moonNote = moonUp ? "月亮很亮，銀河和暗星會被沖掉。" : "";
  if (sun.alt > 0) {
    return "現在是白天，星座已經畫在圖上。按「看今夜」切到天黑之後。";
  }
  if (sun.alt > -8) {
    return `暮光還沒退。先找最亮、而且不會閃的那顆，多半是行星。${moonNote}`;
  }
  const alt = (id: string) => sky.byId.get(id)?.alt ?? -90;
  const antares = alt("antares");
  const vega = alt("vega");
  const altair = alt("altair");
  const deneb = alt("deneb");
  const sirius = alt("sirius");
  const belt = alt("alnilam");
  const square = Math.min(alt("markab"), alt("scheat"), alt("alpheratz"), alt("algenib"));
  const planet = [...sky.planets].filter((p) => p.alt > 8).sort((a, b) => a.mag - b.mag)[0];
  let line = "把星圖的北轉到你面前，或打開對星，讓星座線疊上真實的天空。";
  if (antares > 18) line = "往南看那條彎鉤，紅星是心宿二，整條是天蠍。";
  else if (vega > 35 && altair > 15 && deneb > 25)
    line = "夏季大三角還在：織女最亮，牛郎帶兩顆扁擔星，天津四在銀河裡。";
  else if (belt > 18) line = "獵戶座出來了。先找腰帶三星，往東南就是天狼。";
  else if (sirius > 12) line = "全天最亮的天狼在南方附近，沿著獵戶腰帶就能對上。";
  else if (square > 35) line = "天頂附近是飛馬大方塊，往東北接著仙女座。";
  else if (planet) line = `${planet.name}在${planet.alt > 20 ? "天上" : "低空"}，它不閃，比旁邊的恆星好認。`;
  return moonNote ? `${line}${moonNote}` : line;
}

export function drownedBySun(body: SkyBody, sun: SkyBody) {
  if (body.id === "sun") return false;
  if (sun.alt < -6) return false;
  return angSep(body, sun) < 15;
}

export function milkyPoints() {
  const pts: { ra: number; dec: number; l: number; b: number }[] = [];
  for (const b of [-7, 0, 7]) {
    for (let l = 0; l < 360; l += 4) {
      const eq = galacticToEquatorial(l, b);
      pts.push({ ra: eq.ra, dec: eq.dec, l, b });
    }
  }
  return pts;
}

export const MILKY = milkyPoints();

export function starRecord(id: string): Star | undefined {
  return STAR_BY_ID[id];
}

export function conRecord(id: string): Constellation | undefined {
  return CON_BY_ID[id];
}

export { ASTERISMS, placeFixed };
