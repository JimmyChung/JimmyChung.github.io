// Low-precision astronomy: good to a fraction of a degree, plenty for naked-eye use.
(function () {
  const RAD = Math.PI / 180, DEG = 180 / Math.PI;
  const sin = (d) => Math.sin(d * RAD), cos = (d) => Math.cos(d * RAD);
  const norm360 = (d) => ((d % 360) + 360) % 360;
  const TZ = 8; // Taiwan, UTC+8, no DST

  const julian = (t) => t / 86400000 + 2440587.5;
  const gmst = (jd) => norm360(280.46061837 + 360.98564736629 * (jd - 2451545.0));

  // Ecliptic (lon, lat in degrees) -> equatorial unit vector
  function eclToEq(lon, lat, eps) {
    const x = cos(lat) * cos(lon), y = cos(lat) * sin(lon), z = sin(lat);
    return [x, y * cos(eps) - z * sin(eps), y * sin(eps) + z * cos(eps)];
  }
  const radec = (ra, dec) => [cos(dec) * cos(ra), cos(dec) * sin(ra), sin(dec)];
  const vecToRaDec = (v) => {
    const r = Math.hypot(v[0], v[1], v[2]);
    return [norm360(Math.atan2(v[1], v[0]) * DEG), Math.asin(v[2] / r) * DEG];
  };

  // Matrix rows mapping an equatorial unit vector to (east, north, up)
  function horizonMatrix(t, lat, lon) {
    const L = (gmst(julian(t)) + lon) * RAD, p = lat * RAD;
    const cL = Math.cos(L), sL = Math.sin(L), cp = Math.cos(p), sp = Math.sin(p);
    return [-sL, cL, 0, -sp * cL, -sp * sL, cp, cp * cL, cp * sL, sp];
  }
  const applyM = (m, v) => [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
  const altAz = (h) => [Math.asin(Math.max(-1, Math.min(1, h[2]))) * DEG, norm360(Math.atan2(h[0], h[1]) * DEG)];

  function sun(t) {
    const T = (julian(t) - 2451545) / 36525;
    const L0 = 280.46646 + 36000.76983 * T, M = 357.52911 + 35999.05029 * T;
    const C = (1.914602 - 0.004817 * T) * sin(M) + 0.019993 * sin(2 * M) + 0.000289 * sin(3 * M);
    const lon = norm360(L0 + C), eps = 23.439291 - 0.0130042 * T;
    return { lon, v: eclToEq(lon, 0, eps) };
  }

  function moon(t) {
    const T = (julian(t) - 2451545) / 36525;
    const lon = norm360(218.32 + 481267.881 * T + 6.29 * sin(135.0 + 477198.87 * T)
      - 1.27 * sin(259.3 - 413335.36 * T) + 0.66 * sin(235.7 + 890534.22 * T)
      + 0.21 * sin(269.9 + 954397.74 * T) - 0.19 * sin(357.5 + 35999.05 * T)
      - 0.11 * sin(186.5 + 966404.03 * T));
    const lat = 5.13 * sin(93.3 + 483202.02 * T) + 0.28 * sin(228.2 + 960400.89 * T)
      - 0.28 * sin(318.3 + 6003.15 * T) - 0.17 * sin(217.6 - 407332.21 * T);
    const par = 0.9508 + 0.0518 * cos(135.0 + 477198.87 * T) + 0.0095 * cos(259.3 - 413335.36 * T)
      + 0.0078 * cos(235.7 + 890534.22 * T) + 0.0028 * cos(269.9 + 954397.74 * T);
    const eps = 23.439291 - 0.0130042 * T;
    const s = sun(t);
    const elong = norm360(lon - s.lon);
    const cosE = cos(lat) * cos(lon - s.lon);
    const frac = (1 - cosE) / 2; // illuminated fraction (phase angle ~ 180 - elongation)
    return { lon, lat, par, v: eclToEq(lon, lat, eps), frac, waxing: elong < 180, age: elong / 360 * 29.53 };
  }

  // JPL approximate Keplerian elements, J2000 ecliptic, valid 1800-2050
  const EL = {
    mercury: [0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593, 3.7e-7, 1.906e-5, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
    venus: [0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255, 3.9e-6, -4.107e-5, -0.0007889, 58517.81538729, 0.00268329, -0.27769418],
    earth: [1.00000261, 0.01671123, -1.531e-5, 100.46457166, 102.93768193, 0, 5.62e-6, -4.392e-5, -0.01294668, 35999.37244981, 0.32327364, 0],
    mars: [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 1.847e-5, 7.882e-5, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
    jupiter: [5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909, -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
    saturn: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448, -0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
    uranus: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.9542763, 74.01692503, -0.00196176, -4.397e-5, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
    neptune: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574, 0.00026291, 5.105e-5, 0.00035372, 218.45945325, -0.32241464, -0.00508664],
  };
  function helio(name, T) {
    const e0 = EL[name];
    const a = e0[0] + e0[6] * T, e = e0[1] + e0[7] * T, i = e0[2] + e0[8] * T;
    const L = e0[3] + e0[9] * T, W = e0[4] + e0[10] * T, N = e0[5] + e0[11] * T;
    const w = W - N, M = norm360(L - W) * RAD;
    let E = M + e * Math.sin(M);
    for (let k = 0; k < 6; k++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
    const cw = cos(w), sw = sin(w), cN = cos(N), sN = sin(N), ci = cos(i), si = sin(i);
    return [
      (cw * cN - sw * sN * ci) * xp + (-sw * cN - cw * sN * ci) * yp,
      (cw * sN + sw * cN * ci) * xp + (-sw * sN + cw * cN * ci) * yp,
      sw * si * xp + cw * si * yp,
    ];
  }
  const MAG = {
    mercury: (i) => -0.42 + 0.038 * i - 0.000273 * i * i + 0.000002 * i * i * i,
    venus: (i) => -4.4 + 0.0009 * i + 0.000239 * i * i - 0.00000065 * i * i * i,
    mars: (i) => -1.52 + 0.016 * i,
    jupiter: (i) => -9.4 + 0.005 * i,
    saturn: () => -8.88,
    uranus: () => -7.19,
    neptune: () => -6.87,
  };
  function planet(name, t) {
    const T = (julian(t) - 2451545) / 36525;
    const p = helio(name, T), E = helio('earth', T);
    const g = [p[0] - E[0], p[1] - E[1], p[2] - E[2]];
    const eps = 23.43928;
    const r = Math.hypot(...p), d = Math.hypot(...g), R = Math.hypot(...E);
    const v = [g[0] / d, (g[1] * cos(eps) - g[2] * sin(eps)) / d, (g[1] * sin(eps) + g[2] * cos(eps)) / d];
    const ph = Math.acos(Math.max(-1, Math.min(1, (r * r + d * d - R * R) / (2 * r * d)))) * DEG;
    return { v, mag: MAG[name](ph) + 5 * Math.log10(r * d), dist: d };
  }

  // Find times in [t0, t1] when altitude crosses `h` (degrees). altFn(t) -> altitude.
  function crossings(altFn, t0, t1, h, step = 10 * 60000) {
    const out = [];
    let pt = t0, pa = altFn(t0) - h;
    for (let t = t0 + step; t <= t1; t += step) {
      const a = altFn(t) - h;
      if ((pa < 0) !== (a < 0)) {
        let lo = pt, hi = t, la = pa;
        for (let k = 0; k < 12; k++) {
          const m = (lo + hi) / 2, am = altFn(m) - h;
          if ((am < 0) === (la < 0)) { lo = m; la = am; } else hi = m;
        }
        out.push({ t: (lo + hi) / 2, rising: a > pa });
      }
      pt = t; pa = a;
    }
    return out;
  }

  // Local (Taiwan) time helpers
  const local = (t) => new Date(t + TZ * 3600000);
  const pad = (n) => String(n).padStart(2, '0');
  const fmtTime = (t) => { const d = local(t); return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()); };
  const fmtDate = (t) => { const d = local(t); return (d.getUTCMonth() + 1) + '/' + d.getUTCDate(); };
  const fmtInput = (t) => { const d = local(t); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()); };
  const parseInput = (s) => Date.parse(s + ':00Z') - TZ * 3600000;
  // Noon (local) that starts the "night" containing t
  function nightStart(t) {
    const d = local(t);
    let noon = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12) - TZ * 3600000;
    if (t < noon) noon -= 86400000;
    return noon;
  }

  window.Astro = { RAD, DEG, radec, vecToRaDec, horizonMatrix, applyM, altAz, sun, moon, planet, crossings, julian, norm360, fmtTime, fmtDate, fmtInput, parseInput, nightStart, local };
})();
