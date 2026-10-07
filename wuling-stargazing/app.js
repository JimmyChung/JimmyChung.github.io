(function () {
  const A = window.Astro, SKY = window.SKY, RAD = A.RAD, DEG = A.DEG;
  const WULING = { lat: 24.3583, lon: 121.3089, name: '武陵農場' };
  const MAG_DECL = -4.5; // Taiwan magnetic declination (deg, west negative)

  // Short notes for constellations worth finding from Taiwan in autumn evenings
  const TIPS = {
    Cyg: '夏季大三角之一。天津四是天鵝尾巴，整隻天鵝沿著銀河飛，又叫「北十字」。',
    Lyr: '織女星所在，全天第五亮星。夏季大三角最亮的一角。',
    Aql: '牛郎星（河鼓二）所在，兩側各有一顆小星，像扁擔挑著兩個孩子。',
    Sgr: '銀河中心方向，「南斗六星」像一個茶壺，壺嘴冒出的蒸氣就是銀河最亮處。',
    Sco: '一隻大蠍子，紅色的心宿二是蠍子的心臟。十月傍晚低在西南方。',
    Cas: '五顆亮星排成 W 形，在北方天空，可用來找北極星。',
    And: '仙女座大星系 M31 在這裡，在暗處肉眼可見一團模糊的光，距離 250 萬光年。',
    Peg: '四顆星組成「秋季四邊形」，是秋天夜空的地標。',
    Per: '英仙座流星雨的輻射點；大陵五是著名的變星。',
    Aur: '五車二是亮黃色的星，深夜從東北方升起。',
    Tau: '畢宿五是金牛的紅色眼睛；附近的昴宿星團（七姊妹）肉眼就能看到一小群星。',
    Ori: '冬季最明顯的星座，腰帶三顆星排成一直線。十月要到半夜後才升起。',
    UMa: '北斗七星在這裡。十月傍晚低在西北方地平線附近。',
    UMi: '北極星是小熊尾巴，幾乎不動，在武陵大約仰角 24 度的正北方。',
    PsA: '北落師門是秋季南方天空唯一的亮星，很好認。',
    Aqr: '十二星座之一，秋季南方天空，星星較暗。',
    Cap: '十二星座之一，形狀像一個大三角形。',
    Psc: '十二星座之一，在秋季四邊形的下方，星星都很暗。',
    Cet: '很大的星座，蒭藁增二（Mira）是著名的變星。',
    Her: '武仙座球狀星團 M13 在這裡，用望遠鏡看很漂亮。',
    Boo: '大角星是北天最亮的星，橘色，十月傍晚在西方。',
    Dra: '一條長長的龍蜿蜒在北極附近。',
    Cep: '形狀像一間有尖屋頂的房子，在北方天空。',
    Ari: '十二星座之一，在昴宿星團和秋季四邊形之間。',
    Gem: '北河二、北河三兩兄弟，後半夜從東北方升起。',
    CMa: '天狼星是全天最亮的恆星，十月要到清晨才升起。',
    Oph: '巨大的蛇夫座，位於天蠍座上方。',
    Del: '小小的海豚座，像一顆鑽石形狀，在牛郎星旁邊。',
    Sge: '很小的箭頭形狀，在天鵝與天鷹之間。',
    Tri: '三角座星系 M33 在這裡，需要非常暗的天空。',
  };
  // Picture for each constellation (drawn faintly behind the lines, so kids can see the shape)
  const FIG = {
    And: '👸', Ant: '💨', Aps: '🐦', Aqr: '🏺', Aql: '🦅', Ara: '🕯️', Ari: '🐏', Aur: '🐐', Boo: '🧑‍🌾', Cae: '🔨',
    Cam: '🦒', Cnc: '🦀', CVn: '🐕', CMa: '🐕', CMi: '🐶', Cap: '🐐', Car: '⛵', Cas: '👑', Cen: '🐎', Cep: '🤴',
    Cet: '🐳', Cha: '🦎', Cir: '📐', Col: '🕊️', Com: '💇', CrA: '👑', CrB: '👑', Crv: '🐦', Crt: '🏆', Cru: '✝️',
    Cyg: '🦢', Del: '🐬', Dor: '🐠', Dra: '🐉', Equ: '🐴', Eri: '🌊', For: '🔥', Gem: '👬', Gru: '🐦', Her: '💪',
    Hor: '🕰️', Hya: '🐍', Hyi: '🐍', Ind: '🪶', Lac: '🦎', Leo: '🦁', LMi: '🦁', Lep: '🐇', Lib: '⚖️', Lup: '🐺',
    Lyn: '🐈', Lyr: '🎵', Men: '⛰️', Mic: '🔬', Mon: '🦄', Mus: '🪰', Nor: '📏', Oct: '🧭', Oph: '⚕️', Ori: '🏹',
    Pav: '🦚', Peg: '🐎', Per: '⚔️', Phe: '🔥', Pic: '🎨', Psc: '🐟', PsA: '🐠', Pup: '⛵', Pyx: '🧭', Ret: '🕸️',
    Sge: '➡️', Sgr: '🫖', Sco: '🦂', Scl: '🗿', Sct: '🛡️', Ser: '🐍', Sex: '📐', Tau: '🐂', Tel: '🔭', Tri: '🔺',
    TrA: '🔺', Tuc: '🦜', UMa: '🐻', UMi: '🧸', Vel: '⛵', Vir: '👧', Vol: '🐟', Vul: '🦊',
  };
  // Pictures are drawn only for well-known constellations, so the sky does not get crowded
  const FIG_SHOW = new Set(Object.keys(TIPS).concat(['Leo', 'Vir', 'Lib', 'Cnc', 'CMi', 'Lep', 'Cru', 'Cen', 'Lup', 'Col', 'Vul', 'Equ', 'Phe', 'Gru', 'Crv', 'Hya', 'Mon', 'Lyn', 'Cam', 'Eri']));
  const PLANETS = [
    ['mercury', '水星', '#c9b8a3'], ['venus', '金星', '#fff6d5'], ['mars', '火星', '#ff8a5c'],
    ['jupiter', '木星', '#ffe2b0'], ['saturn', '土星', '#f3d58f'], ['uranus', '天王星', '#b6f0f0'], ['neptune', '海王星', '#8fb6ff'],
  ];
  const DIRS = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
  const dirName = (az) => DIRS[Math.round(az / 45) % 8];

  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const normalize = (a) => { const r = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / r, a[1] / r, a[2] / r]; };

  // ---------- data prep ----------
  const NS = SKY.stars.length / 4;
  const starV = new Float32Array(NS * 3), starMag = new Float32Array(NS), starCol = [];
  const bvColor = (bv) => bv < 0 ? '#aabfff' : bv < 0.3 ? '#cad7ff' : bv < 0.6 ? '#f8f7ff' : bv < 0.8 ? '#fff4ea' : bv < 1.2 ? '#ffd2a1' : '#ffb478';
  for (let i = 0; i < NS; i++) {
    const v = A.radec(SKY.stars[i * 4], SKY.stars[i * 4 + 1]);
    starV.set(v, i * 3); starMag[i] = SKY.stars[i * 4 + 2]; starCol.push(bvColor(SKY.stars[i * 4 + 3]));
  }
  const consById = {};
  const cons = SKY.cons.map((c) => {
    const o = { id: c.id, zh: c.zh, en: c.en, rank: c.rank, v: A.radec(c.c[0], c.c[1]),
      lines: c.l.map((l) => { const a = []; for (let k = 0; k < l.length; k += 2) a.push(A.radec(l[k], l[k + 1])); return a; }) };
    if (!consById[c.id]) consById[c.id] = o;
    // centre of the stick figure and its angular radius, for sizing the picture
    let sx = 0, sy = 0, sz = 0;
    for (const l of o.lines) for (const v of l) { sx += v[0]; sy += v[1]; sz += v[2]; }
    o.mid = normalize([sx, sy, sz]);
    o.rad = 0;
    for (const l of o.lines) for (const v of l) o.rad = Math.max(o.rad, Math.acos(Math.min(1, dot(o.mid, v))));
    o.fig = FIG[c.id] || '';
    return o;
  });
  const names = SKY.names.map(([i, zh, en, c]) => ({ i, zh, en, c, mag: starMag[i], v: [starV[i * 3], starV[i * 3 + 1], starV[i * 3 + 2]] }));
  const dsos = SKY.dsos.map(([ra, dec, id, zh, type, mag]) => ({ id, zh, type, mag, v: A.radec(ra, dec) }));

  // Milky Way: analytic glow in galactic coordinates, sampled into points bucketed by brightness
  const mwLevels = [[], [], [], [], [], []];
  (function buildMilkyWay() {
    const aG = 192.85948, dG = 27.12825, lN = 122.93192;
    for (let l = 0; l < 360; l += 2) {
      const lc = l > 180 ? l - 360 : l;
      const c = (1 + Math.cos(l * RAD)) / 2;
      const w = 4 + 9 * c;
      for (let b = -30; b <= 30; b += 1.5) {
        let I = (0.3 + 0.7 * c * c) * Math.exp(-((b / w) ** 2));
        I += 0.7 * Math.exp(-((lc / 14) ** 2) - (b / 9) ** 2); // galactic bulge
        if (lc > -5 && lc < 65) I *= 1 - 0.55 * Math.exp(-(((b - 1) / 2.6) ** 2)) * Math.min(1, (65 - lc) / 20); // Great Rift
        if (I < 0.08) continue;
        const sb = Math.sin(b * RAD), cb = Math.cos(b * RAD), d = (lN - l) * RAD;
        const dec = Math.asin(sb * Math.sin(dG * RAD) + cb * Math.cos(dG * RAD) * Math.cos(d)) * DEG;
        const ra = aG + Math.atan2(cb * Math.sin(d), sb * Math.cos(dG * RAD) - cb * Math.sin(dG * RAD) * Math.cos(d)) * DEG;
        mwLevels[Math.min(5, Math.floor(I * 5))].push(A.radec(ra, dec));
      }
    }
  })();

  // ---------- state ----------
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem('wl.' + k)); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem('wl.' + k, JSON.stringify(v)); } catch (e) {} };
  const S = {
    lat: WULING.lat, lon: WULING.lon, locName: WULING.name,
    timeFixed: null, // null = live
    az: 135, alt: 40, fov: load('fov', 100),
    sensor: false, red: load('red', false), azCal: load('azCal', 0),
    show: Object.assign({ lines: true, figures: true, cname: true, sname: true, planets: true, dso: true, mw: true, grid: false }, load('show', {})),
    cam: false, camFov: load('camFov', 67), // camera mode; camFov = field of view across the photo's long side
    target: null,
  };
  const now = () => S.timeFixed == null ? Date.now() : S.timeFixed;

  // ---------- canvas & projection ----------
  const cv = document.getElementById('sky'), ctx = cv.getContext('2d'), mwCanvas = document.createElement('canvas');
  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    dirty = true;
  }
  // Camera basis in horizon coords (east, north, up)
  let camF = [0, 1, 0], camU = [0, 0, 1], camR = [1, 0, 0];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const hvec = (alt, az) => [Math.cos(alt * RAD) * Math.sin(az * RAD), Math.cos(alt * RAD) * Math.cos(az * RAD), Math.sin(alt * RAD)];
  function setManualCamera() {
    camF = hvec(S.alt, S.az);
    camR = [Math.cos(S.az * RAD), -Math.sin(S.az * RAD), 0];
    camU = cross(camR, camF);
  }
  let scale = 1, cx = 0, cy = 0, viewFov = 100;
  // Project horizon vector; returns [x, y, dz]. Stereographic normally; in camera mode
  // rectilinear (like a camera lens) so the drawing lines up with the video.
  function proj(h) {
    const dz = dot(h, camF);
    if (S.cam) {
      if (dz < 0.08) return [cx, cy, -1];
      return [cx + dot(h, camR) * scale / dz, cy - dot(h, camU) * scale / dz, dz];
    }
    const k = scale / (1 + Math.max(dz, -0.999));
    return [cx + dot(h, camR) * k, cy - dot(h, camU) * k, dz];
  }
  // Inverse projection: screen point -> horizon vector
  function unproj(x, y) {
    const X = (x - cx) / scale, Y = (cy - y) / scale, r2 = X * X + Y * Y;
    if (S.cam) return normalize([0, 1, 2].map((i) => camR[i] * X + camU[i] * Y + camF[i]));
    const dz = (1 - r2) / (1 + r2), f = (1 + dz);
    return normalize([camR[0] * X * f + camU[0] * Y * f + camF[0] * dz, camR[1] * X * f + camU[1] * Y * f + camF[1] * dz, camR[2] * X * f + camU[2] * Y * f + camF[2] * dz]);
  }

  // ---------- scene computation ----------
  let M = null, sceneT = 0, sunH, moonO, moonH, planetsO = [];
  function computeScene(t) {
    sceneT = t;
    M = A.horizonMatrix(t, S.lat, S.lon);
    sunH = A.applyM(M, A.sun(t).v);
    moonO = A.moon(t);
    moonH = A.applyM(M, moonO.v);
    // topocentric parallax: lower the moon by ~par*cos(alt)
    const malt = Math.asin(moonH[2]), nalt = malt - moonO.par * RAD * Math.cos(malt), k = Math.cos(nalt) / Math.max(1e-6, Math.cos(malt));
    moonH = [moonH[0] * k, moonH[1] * k, Math.sin(nalt)];
    planetsO = PLANETS.map(([id, zh, col]) => { const p = A.planet(id, t); return { id, zh, col, mag: p.mag, v: p.v, h: A.applyM(M, p.v) }; });
  }
  const H_ = (v) => A.applyM(M, v);

  // ---------- drawing ----------
  let dirty = true, labelBoxes = [], hits = [], aimCon = null;
  function placeLabel(text, x, y, font, color, alpha, prio) {
    ctx.font = font;
    const w = ctx.measureText(text).width, h = parseInt(font, 10) || 12;
    const box = [x - w / 2 - 2, y - h, x + w / 2 + 2, y + 2];
    for (const b of labelBoxes) if (box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]) return false;
    labelBoxes.push(box);
    ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.fillText(text, x - w / 2, y);
    ctx.globalAlpha = 1;
    return true;
  }
  const onScreen = (p, m = 40) => p[2] > -0.3 && p[0] > -m && p[0] < W + m && p[1] > -m && p[1] < H + m;

  function draw() {
    const t = now();
    if (!M || Math.abs(t - sceneT) > 500) computeScene(t);
    if (!S.sensor) setManualCamera();
    cx = W / 2; cy = H / 2;
    if (S.cam) {
      // the video is scaled to cover the screen; its long side spans camFov degrees
      const vw = video.videoWidth || 16, vh = video.videoHeight || 9;
      const longPx = Math.max(vw, vh) * Math.max(W / vw, H / vh);
      scale = longPx / 2 / Math.tan(S.camFov / 2 * RAD);
      viewFov = 2 * Math.atan(Math.min(W, H) / 2 / scale) * DEG;
    } else {
      scale = Math.min(W, H) / 2 / Math.tan(S.fov / 4 * RAD);
      viewFov = S.fov;
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    labelBoxes = []; hits = [];

    // sky background, brightened by the sun (camera mode shows the video instead)
    const sunAlt = Math.asin(sunH[2]) * DEG;
    if (S.cam) ctx.clearRect(0, 0, W, H);
    else {
      const day = Math.max(0, Math.min(1, (sunAlt + 18) / 18));
      const top = mix([4, 6, 18], [40, 90, 170], day), bot = mix([10, 16, 36], [120, 160, 210], day);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, rgb(top)); g.addColorStop(1, rgb(bot));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    const starFade = S.cam ? 1 : 1 - 0.85 * Math.max(0, Math.min(1, (sunAlt + 12) / 12));
    const zf = Math.sqrt(100 / viewFov);

    // Milky Way: blobs on a quarter-resolution canvas, blurred, then upscaled for a soft glow
    if (S.show.mw) {
      const q = 4, mw = mwCanvas, mc = mw.getContext('2d');
      if (mw.width !== Math.ceil(W / q) || mw.height !== Math.ceil(H / q)) { mw.width = Math.ceil(W / q); mw.height = Math.ceil(H / q); }
      mc.clearRect(0, 0, mw.width, mw.height);
      mc.filter = 'blur(' + Math.max(1, Math.round(0.8 * RAD * scale / q)) + 'px)';
      const r = Math.max(1.5, 1.4 * RAD * scale) / q;
      mc.fillStyle = '#a8b8ff';
      for (let lv = 0; lv < 6; lv++) {
        mc.globalAlpha = 0.05 + lv * 0.05;
        mc.beginPath();
        for (const v of mwLevels[lv]) {
          const p = proj(H_(v)), x = p[0] / q, y = p[1] / q;
          if (p[2] < -0.2 || x < -r || x > mw.width + r || y < -r || y > mw.height + r) continue;
          mc.moveTo(x + r, y); mc.arc(x, y, r, 0, 6.2832);
        }
        mc.fill();
      }
      ctx.globalAlpha = (S.cam ? 0.35 : 0.8) * starFade;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(mw, 0, 0, mw.width * q, mw.height * q);
      ctx.globalAlpha = 1;
    }

    if (S.show.grid) drawGrid();

    aimCon = constellationAt(camF);
    if (S.show.figures) drawFigures();

    // constellation lines
    if (S.show.lines) {
      ctx.strokeStyle = S.cam ? 'rgba(150,195,255,0.9)' : 'rgba(110,160,255,0.55)'; ctx.lineWidth = S.cam ? 2 : 1.1;
      ctx.beginPath();
      for (const c of cons) {
        const hl = S.target && S.target.kind === 'con' && S.target.id === c.id;
        if (hl) continue;
        traceCon(c);
      }
      ctx.stroke();
      if (S.target && S.target.kind === 'con') {
        ctx.strokeStyle = 'rgba(255,220,120,0.95)'; ctx.lineWidth = S.cam ? 3 : 2;
        ctx.beginPath(); cons.filter((c) => c.id === S.target.id).forEach(traceCon); ctx.stroke();
      }
    }

    // stars
    const lim = Math.max(4.6, Math.min(6.0, 5.0 + (100 - viewFov) / 60));
    ctx.globalAlpha = starFade;
    for (let i = 0; i < NS; i++) {
      const m = starMag[i];
      if (m > lim) break; // sorted by magnitude
      const v = [starV[i * 3], starV[i * 3 + 1], starV[i * 3 + 2]];
      const p = proj(H_(v));
      if (!onScreen(p, 10)) continue;
      const r = Math.max(0.55, Math.min(7, (lim + 1.2 - m) * 0.55 * zf));
      ctx.fillStyle = starCol[i];
      if (m < 1.0) {
        const gr = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 3.5);
        gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gr; ctx.fillRect(p[0] - r * 3.5, p[1] - r * 3.5, r * 7, r * 7);
        ctx.fillStyle = starCol[i];
      }
      if (r < 1.3) ctx.fillRect(p[0] - r, p[1] - r, r * 2, r * 2);
      else { ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 6.2832); ctx.fill(); }
    }
    ctx.globalAlpha = 1;

    // deep sky objects
    if (S.show.dso) {
      ctx.strokeStyle = 'rgba(160,255,200,0.6)'; ctx.lineWidth = 1;
      for (const d of dsos) {
        const famous = d.zh && (d.mag < 5 || viewFov < 70);
        if (!famous && viewFov > 60) continue;
        const p = proj(H_(d.v));
        if (!onScreen(p)) continue;
        ctx.beginPath(); ctx.ellipse(p[0], p[1], 5, 3.5, 0, 0, 6.2832); ctx.stroke();
        d._p = p;
        hits.push({ kind: 'dso', o: d, x: p[0], y: p[1] });
      }
    }

    // sun, moon, planets
    const sp = proj(sunH);
    if (onScreen(sp)) {
      ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.arc(sp[0], sp[1], Math.max(10, 0.27 * RAD * scale), 0, 6.2832); ctx.fill();
      hits.push({ kind: 'sun', x: sp[0], y: sp[1] });
    }
    if (S.show.planets) for (const pl of planetsO) {
      if (pl.mag > 6 && viewFov > 50) continue; // Uranus/Neptune need binoculars
      const p = proj(pl.h);
      if (!onScreen(p)) continue;
      const r = Math.max(2.5, Math.min(6, (3 - pl.mag) * 0.9)) * Math.min(1.6, zf);
      ctx.fillStyle = pl.col; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 6.2832); ctx.fill();
      if (pl.id === 'saturn') { ctx.strokeStyle = pl.col; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(p[0], p[1], r * 2.1, r * 0.7, -0.4, 0, 6.2832); ctx.stroke(); }
      pl._p = p;
      hits.push({ kind: 'planet', o: pl, x: p[0], y: p[1] });
    }
    const mp = proj(moonH);
    if (onScreen(mp)) { drawMoon(mp, sp); hits.push({ kind: 'moon', x: mp[0], y: mp[1] }); }

    // ground (camera mode: the real ground is in the video, just mark the horizon)
    if (S.cam) drawHorizonLine(); else drawGround(sunAlt);

    // labels (priority order)
    ctx.textBaseline = 'alphabetic';
    const fade = (h) => (h[2] < 0 ? 0.35 : 1);
    if (S.show.planets) for (const pl of planetsO) if (pl._p && onScreen(pl._p)) placeLabel(pl.zh, pl._p[0], pl._p[1] - 9, 'bold 14px sans-serif', '#ffd27a', fade(pl.h));
    if (onScreen(mp)) placeLabel('月亮', mp[0], mp[1] - 14, 'bold 14px sans-serif', '#fff3c4', fade(moonH));
    if (onScreen(sp)) placeLabel('太陽', sp[0], sp[1] - 16, 'bold 14px sans-serif', '#ffe680', 1);
    if (S.show.cname) for (const c of cons) {
      if (c.rank > (viewFov > 110 ? 1 : viewFov > 70 ? 2 : 3) && !(S.target && S.target.id === c.id)) continue;
      const h = H_(c.v), p = proj(h);
      if (!onScreen(p, 0)) continue;
      const hl = S.target && S.target.kind === 'con' && S.target.id === c.id;
      placeLabel(c.zh, p[0], p[1], (hl ? 'bold 17px' : '15px') + ' sans-serif', hl ? '#ffdc78' : '#8fb3ff', fade(h) * 0.95);
      hits.push({ kind: 'con', o: c, x: p[0], y: p[1] - 6 });
    }
    if (S.show.sname) for (const n of names) {
      if (n.mag > lim - 2.6) continue;
      const h = H_(n.v), p = proj(h);
      if (!onScreen(p, 0)) continue;
      placeLabel(n.zh, p[0], p[1] - 7, '12px sans-serif', '#e8e8f0', fade(h) * 0.85);
      hits.push({ kind: 'star', o: n, x: p[0], y: p[1] });
    }
    if (S.show.dso) for (const d of dsos) {
      if (!d._p || !onScreen(d._p)) continue;
      if (d.zh) placeLabel(d.zh, d._p[0], d._p[1] + 15, '11px sans-serif', '#a0ffc8', 0.85);
      d._p = null;
    }
    for (const pl of planetsO) pl._p = null;

    drawTarget();
    drawCenter();
  }

  // The constellation being aimed at (screen centre) and the search target get a clear picture;
  // the others stay faint.
  function drawFigures() {
    const tgt = S.target && S.target.kind === 'con' ? S.target.id : null;
    const aimed = aimCon && aimCon.id;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const c of cons) {
      if (!c.fig || !(FIG_SHOW.has(c.id) || c.id === tgt || c.id === aimed)) continue;
      const p = proj(H_(c.mid));
      const size = Math.min(Math.min(W, H) * 0.9, Math.max(28, 2 * c.rad * scale * 0.95));
      if (p[2] < 0.2 || p[0] < -size / 2 || p[0] > W + size / 2 || p[1] < -size / 2 || p[1] > H + size / 2) continue;
      ctx.globalAlpha = c.id === tgt ? 0.8 : c.id === aimed ? 0.65 : S.cam ? 0.25 : 0.14;
      ctx.font = Math.round(size) + 'px sans-serif';
      ctx.fillText(c.fig, p[0], p[1]);
    }
    ctx.globalAlpha = 1; ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
  }

  function drawHorizonLine() {
    ctx.strokeStyle = 'rgba(120,230,150,0.9)'; ctx.lineWidth = 2;
    ctx.beginPath();
    let pen = false;
    for (let az = 0; az <= 360; az += 2) {
      const p = proj(hvec(0, az));
      if (p[2] < 0) { pen = false; continue; }
      if (pen) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
      pen = true;
    }
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const p = proj(hvec(0, i * 45));
      if (!onScreen(p, 0)) continue;
      ctx.font = (i % 2 ? '14px' : 'bold 20px') + ' sans-serif';
      const w = ctx.measureText(DIRS[i]).width;
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(p[0] - w / 2 - 4, p[1] + 3, w + 8, 22);
      ctx.fillStyle = i === 0 ? '#ff8a8a' : '#a6f0bc';
      ctx.fillText(DIRS[i], p[0] - w / 2, p[1] + 20);
      labelBoxes.push([p[0] - w / 2, p[1], p[0] + w / 2, p[1] + 24]);
    }
  }

  function traceCon(c) {
    for (const line of c.lines) {
      let pen = false;
      for (const v of line) {
        const p = proj(H_(v));
        if (p[2] < -0.3) { pen = false; continue; }
        if (pen) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
        pen = true;
      }
    }
  }

  function drawMoon(mp, sp) {
    const R = Math.max(10, 0.26 * RAD * scale), k = moonO.frac;
    // direction to the sun on screen
    const sunDir = [dot(sunH, camR) - dot(moonH, camR), dot(sunH, camU) - dot(moonH, camU)];
    const ang = Math.atan2(-sunDir[1], sunDir[0]);
    ctx.save(); ctx.translate(mp[0], mp[1]); ctx.rotate(ang);
    ctx.fillStyle = 'rgba(60,60,70,0.9)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#fff6d8'; ctx.beginPath();
    ctx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2, false);
    ctx.ellipse(0, 0, Math.abs(R * (2 * k - 1)), R, 0, Math.PI / 2, -Math.PI / 2, k < 0.5);
    ctx.fill(); ctx.restore();
  }

  function drawGround(sunAlt) {
    const az0 = Math.atan2(camF[0], camF[1]) * DEG;
    const pts = [az0, az0 + 90, az0 - 90].map((a) => proj(hvec(0, a)));
    const [a, b, c] = pts;
    const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
    const useZenith = camF[2] >= 0;
    const tp = proj(useZenith ? [0, 0, 1] : [0, 0, -1]);
    ctx.fillStyle = sunAlt > -6 ? 'rgba(20,30,25,0.88)' : 'rgba(8,14,10,0.85)';
    ctx.beginPath();
    let circle = null;
    if (Math.abs(d) > 1e-6) {
      const sa = a[0] ** 2 + a[1] ** 2, sb = b[0] ** 2 + b[1] ** 2, sc = c[0] ** 2 + c[1] ** 2;
      const ux = (sa * (b[1] - c[1]) + sb * (c[1] - a[1]) + sc * (a[1] - b[1])) / d;
      const uy = (sa * (c[0] - b[0]) + sb * (a[0] - c[0]) + sc * (b[0] - a[0])) / d;
      const r = Math.hypot(a[0] - ux, a[1] - uy);
      if (r < 1e5) circle = [ux, uy, r];
    }
    if (circle) {
      const inside = Math.hypot(tp[0] - circle[0], tp[1] - circle[1]) < circle[2];
      const groundInside = useZenith ? !inside : inside;
      if (groundInside) ctx.arc(circle[0], circle[1], circle[2], 0, 6.2832);
      else { ctx.rect(0, 0, W, H); ctx.arc(circle[0], circle[1], circle[2], 0, 6.2832, true); }
      ctx.fill('evenodd');
      ctx.strokeStyle = 'rgba(120,200,140,0.7)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(circle[0], circle[1], circle[2], 0, 6.2832); ctx.stroke();
    } else {
      const dx = c[0] - b[0], dy = c[1] - b[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      let nx = -uy, ny = ux;
      const side = (tp[0] - b[0]) * nx + (tp[1] - b[1]) * ny;
      if ((side > 0) === useZenith) { nx = -nx; ny = -ny; }
      const F = 1e4;
      ctx.moveTo(b[0] - ux * F, b[1] - uy * F); ctx.lineTo(b[0] + ux * F, b[1] + uy * F);
      ctx.lineTo(b[0] + ux * F + nx * F, b[1] + uy * F + ny * F); ctx.lineTo(b[0] - ux * F + nx * F, b[1] - uy * F + ny * F);
      ctx.fill();
    }
    // cardinal directions
    for (let i = 0; i < 8; i++) {
      const p = proj(hvec(-2, i * 45));
      if (!onScreen(p, 0)) continue;
      ctx.font = (i % 2 ? '13px' : 'bold 18px') + ' sans-serif';
      ctx.fillStyle = i === 0 ? '#ff7a7a' : '#9fe0b0';
      const w = ctx.measureText(DIRS[i]).width;
      ctx.fillText(DIRS[i], p[0] - w / 2, p[1] + 14);
      labelBoxes.push([p[0] - w / 2, p[1], p[0] + w / 2, p[1] + 16]);
    }
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let alt = 15; alt < 90; alt += 15) {
      let pen = false;
      for (let az = 0; az <= 360; az += 3) {
        const p = proj(hvec(alt, az));
        if (p[2] < -0.3) { pen = false; continue; }
        if (pen) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
        pen = true;
      }
    }
    for (let az = 0; az < 360; az += 30) {
      let pen = false;
      for (let alt = 0; alt <= 90; alt += 3) {
        const p = proj(hvec(alt, az));
        if (p[2] < -0.3) { pen = false; continue; }
        if (pen) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
        pen = true;
      }
    }
    ctx.stroke();
  }

  function targetH() {
    const T = S.target;
    if (!T) return null;
    if (T.kind === 'planet') return planetsO.find((p) => p.id === T.id).h;
    if (T.kind === 'moon') return moonH;
    if (T.kind === 'sun') return sunH;
    return H_(T.v);
  }
  function drawTarget() {
    const h = targetH();
    if (!h) return;
    const p = proj(h);
    const inView = p[2] > 0 && p[0] > 30 && p[0] < W - 30 && p[1] > 80 && p[1] < H - 120;
    ctx.strokeStyle = '#ffdc78'; ctx.fillStyle = '#ffdc78'; ctx.lineWidth = 2;
    if (inView) {
      ctx.beginPath(); ctx.arc(p[0], p[1], 22, 0, 6.2832); ctx.stroke();
      return;
    }
    // arrow toward target from the screen center
    let dx = dot(h, camR), dy = -dot(h, camU);
    const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    const R = Math.min(W, H) / 2 - 70;
    const ax = cx + dx * R, ay = cy + dy * R;
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(Math.atan2(dy, dx));
    ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(-8, -16); ctx.lineTo(-2, 0); ctx.lineTo(-8, 16); ctx.closePath(); ctx.fill();
    ctx.restore();
    const [alt, az] = A.altAz(h);
    ctx.font = 'bold 14px sans-serif';
    const txt = S.target.zh + (alt < 0 ? '（在地平線下）' : '');
    const w = ctx.measureText(txt).width;
    ctx.fillText(txt, Math.max(8, Math.min(W - w - 8, ax - w / 2 - dx * 30)), ay - dy * 30 + 5);
  }

  function drawCenter() {
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - 12, cy); ctx.lineTo(cx - 4, cy); ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 12, cy);
    ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy - 4); ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, cy + 12); ctx.stroke();
    const [alt, az] = A.altAz(camF);
    const con = aimCon;
    document.getElementById('aim').textContent = (con ? '對準 ' + con.zh + ' ・ ' : '') + dirName(az) + ' ' + Math.round(az) + '° ・ 仰角 ' + Math.round(alt) + '°';
  }

  // Constellation nearest to a horizon direction (by nearest line vertex)
  function constellationAt(h) {
    let best = null, bd = -2;
    for (const c of cons) for (const line of c.lines) for (const v of line) {
      const d = dot(H_(v), h);
      if (d > bd) { bd = d; best = c; }
    }
    return bd > Math.cos(20 * RAD) ? best : null;
  }

  const mix = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
  const rgb = (c) => 'rgb(' + c.map(Math.round).join(',') + ')';

  // ---------- loop ----------
  let lastLive = 0;
  function frame(ts) {
    if (S.timeFixed == null && ts - lastLive > 1000) { lastLive = ts; dirty = true; updateTimeLabel(); }
    if (dirty || S.sensor || anim) {
      if (anim) stepAnim();
      dirty = false;
      draw();
    }
    requestAnimationFrame(frame);
  }

  // ---------- smooth pan to target ----------
  let anim = null;
  function panTo(h) {
    const [alt, az] = A.altAz(h);
    let dAz = ((az - S.az + 540) % 360) - 180;
    anim = { az0: S.az, alt0: S.alt, dAz, alt1: Math.max(alt, 5), t0: performance.now() };
  }
  function stepAnim() {
    const k = Math.min(1, (performance.now() - anim.t0) / 700), e = k * k * (3 - 2 * k);
    S.az = A.norm360(anim.az0 + anim.dAz * e); S.alt = anim.alt0 + (anim.alt1 - anim.alt0) * e;
    if (k >= 1) anim = null;
  }

  // ---------- touch / mouse ----------
  const pointers = new Map();
  let pinch0 = null, drag0 = null, tapStart = null;
  cv.addEventListener('pointerdown', (e) => {
    cv.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 1) { drag0 = { x: e.clientX, y: e.clientY, az: S.az, alt: S.alt }; tapStart = { x: e.clientX, y: e.clientY, t: performance.now() }; }
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch0 = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), fov: S.fov }; tapStart = null; }
    anim = null;
  });
  cv.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 2 && pinch0) {
      const [a, b] = [...pointers.values()];
      setFov(pinch0.fov * pinch0.d / Math.max(10, Math.hypot(a[0] - b[0], a[1] - b[1])));
    } else if (pointers.size === 1 && drag0 && !S.sensor) {
      const dpp = S.fov / Math.min(W, H) * 1.0;
      S.az = A.norm360(drag0.az - (e.clientX - drag0.x) * dpp);
      S.alt = Math.max(-30, Math.min(90, drag0.alt + (e.clientY - drag0.y) * dpp));
      dirty = true;
    }
    if (tapStart && Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > 10) tapStart = null;
  });
  const up = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch0 = null;
    if (pointers.size === 1) { const [p] = [...pointers.values()]; drag0 = { x: p[0], y: p[1], az: S.az, alt: S.alt }; }
    if (tapStart && performance.now() - tapStart.t < 400) pick(e.clientX, e.clientY);
    tapStart = null;
    save('fov', S.fov);
  };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', (e) => { tapStart = null; up(e); });
  cv.addEventListener('wheel', (e) => { e.preventDefault(); setFov(S.fov * Math.exp(e.deltaY * 0.001)); }, { passive: false });
  function setFov(f) { if (S.cam) return; S.fov = Math.max(15, Math.min(160, f)); dirty = true; }

  function pick(x, y) {
    let best = null, bd = 36;
    for (const h of hits) {
      const d = Math.hypot(h.x - x, h.y - y) - (h.kind === 'con' ? -6 : h.kind === 'star' ? 0 : 6);
      if (d < bd) { bd = d; best = h; }
    }
    if (!best) {
      // fall back: constellation under the finger
      const c = constellationAt(unproj(x, y));
      if (c) best = { kind: 'con', o: c };
    }
    if (best) showInfo(best); else hideInfo();
  }

  // ---------- info card ----------
  const infoEl = document.getElementById('info');
  function objectFromHit(hh) {
    switch (hh.kind) {
      case 'planet': return { kind: 'planet', id: hh.o.id, zh: hh.o.zh, sub: '行星', mag: hh.o.mag };
      case 'moon': return { kind: 'moon', zh: '月亮', sub: '月相 ' + Math.round(moonO.frac * 100) + '%（' + (moonO.waxing ? '漸盈' : '漸虧') + '）' };
      case 'sun': return { kind: 'sun', zh: '太陽', sub: '恆星' };
      case 'star': return { kind: 'star', zh: hh.o.zh, en: hh.o.en, v: hh.o.v, mag: hh.o.mag, sub: '恆星' + (consById[hh.o.c] ? ' ・ ' + consById[hh.o.c].zh : ''), con: hh.o.c };
      case 'dso': return { kind: 'dso', zh: (hh.o.zh || hh.o.id), en: hh.o.id, v: hh.o.v, mag: hh.o.mag, sub: hh.o.type };
      case 'con': return conObj(hh.o);
    }
  }
  const conObj = (c) => ({ kind: 'con', id: c.id, zh: c.zh, en: c.en, v: c.v, fig: c.fig, sub: '星座', tip: TIPS[c.id] });
  function altFnFor(o) {
    if (o.kind === 'planet') return (t) => A.altAz(A.applyM(A.horizonMatrix(t, S.lat, S.lon), A.planet(o.id, t).v))[0];
    if (o.kind === 'moon') return (t) => A.altAz(A.applyM(A.horizonMatrix(t, S.lat, S.lon), A.moon(t).v))[0] - 0.95;
    if (o.kind === 'sun') return (t) => A.altAz(A.applyM(A.horizonMatrix(t, S.lat, S.lon), A.sun(t).v))[0];
    return (t) => A.altAz(A.applyM(A.horizonMatrix(t, S.lat, S.lon), o.v))[0];
  }
  function riseSet(o) {
    const n0 = A.nightStart(now()), f = altFnFor(o);
    const cr = A.crossings(f, n0, n0 + 86400000, o.kind === 'sun' ? -0.833 : -0.5);
    const rise = cr.find((c) => c.rising), set = cr.find((c) => !c.rising);
    if (!cr.length) return f(n0) > 0 ? '整夜都在地平線上' : '這天看不到';
    return (rise ? '升起 ' + A.fmtTime(rise.t) : '') + (rise && set ? ' ・ ' : '') + (set ? '落下 ' + A.fmtTime(set.t) : '');
  }
  function showInfo(hh) {
    const o = hh.zh ? hh : objectFromHit(hh);
    S.target = o; dirty = true;
    const h = targetH(), [alt, az] = A.altAz(h);
    infoEl.innerHTML = '<button class="x" aria-label="關閉">×</button>' +
      '<div class="t">' + (o.fig ? '<span class="fig">' + o.fig + '</span>' : '') + o.zh + (o.en && o.en !== o.zh ? ' <small>' + o.en + '</small>' : '') + '</div>' +
      '<div class="s">' + (o.sub || '') + (o.mag != null ? ' ・ 亮度 ' + o.mag.toFixed(1) + ' 等' : '') + '</div>' +
      '<div class="s">現在：' + dirName(az) + '方 ' + Math.round(az) + '° ・ 仰角 ' + Math.round(alt) + '°' + (alt < 0 ? '（在地平線下）' : '') + '</div>' +
      '<div class="s">' + riseSet(o) + '</div>' +
      (o.tip ? '<p>' + o.tip + '</p>' : '') +
      (S.sensor ? '' : '<button class="go">轉到這裡</button>');
    infoEl.hidden = false;
    infoEl.querySelector('.x').onclick = () => { S.target = null; hideInfo(); };
    const go = infoEl.querySelector('.go');
    if (go) go.onclick = () => panTo(targetH());
  }
  function hideInfo() { infoEl.hidden = true; dirty = true; }

  // ---------- panels ----------
  const $ = (id) => document.getElementById(id);
  function openPanel(id) { document.querySelectorAll('.panel').forEach((p) => (p.hidden = p.id !== id)); }
  document.querySelectorAll('.panel .close').forEach((b) => (b.onclick = () => (b.closest('.panel').hidden = true)));

  function visibilityText(h) { const [alt, az] = A.altAz(h); return alt < 0 ? '<span class="dim">地平線下</span>' : dirName(az) + ' ' + Math.round(alt) + '°'; }
  function buildSearch() {
    if (!M) computeScene(now());
    const q = $('q').value.trim().toLowerCase();
    const items = [];
    items.push({ o: objectFromHit({ kind: 'moon' }), h: moonH, grp: '月亮與行星' });
    for (const p of planetsO) items.push({ o: objectFromHit({ kind: 'planet', o: p }), h: p.h, grp: '月亮與行星' });
    const seen = {};
    for (const c of cons) { if (seen[c.id]) continue; seen[c.id] = 1; items.push({ o: conObj(c), h: H_(c.v), grp: '星座', star: !!TIPS[c.id] }); }
    for (const n of names) items.push({ o: objectFromHit({ kind: 'star', o: n }), h: H_(n.v), grp: '亮星' });
    for (const d of dsos) if (d.zh) items.push({ o: objectFromHit({ kind: 'dso', o: d }), h: H_(d.v), grp: '星團・星雲・星系' });
    const list = items.filter((it) => !q || it.o.zh.toLowerCase().includes(q) || (it.o.en || '').toLowerCase().includes(q));
    list.sort((a, b) => (b.h[2] > 0) - (a.h[2] > 0) || (b.star ? 1 : 0) - (a.star ? 1 : 0) || b.h[2] - a.h[2]);
    const groups = ['月亮與行星', '星座', '亮星', '星團・星雲・星系'];
    $('results').innerHTML = groups.map((g) => {
      const rows = list.filter((it) => it.grp === g);
      if (!rows.length) return '';
      return '<h3>' + g + '</h3>' + rows.map((it) => '<button class="row" data-i="' + items.indexOf(it) + '"><span>' + (it.o.fig ? it.o.fig + ' ' : '') + (it.star ? '★ ' : '') + it.o.zh + (it.o.en && it.o.en !== it.o.zh ? ' <small>' + it.o.en + '</small>' : '') + '</span><span>' + visibilityText(it.h) + '</span></button>').join('');
    }).join('');
    $('results').querySelectorAll('.row').forEach((b) => (b.onclick = () => {
      const it = items[+b.dataset.i];
      $('search').hidden = true;
      showInfo(it.o);
      if (!S.sensor) panTo(targetH());
    }));
  }
  $('btnSearch').onclick = () => { openPanel('search'); buildSearch(); };
  $('q').oninput = buildSearch;

  function buildTonight() {
    const t = now(), n0 = A.nightStart(t), n1 = n0 + 86400000;
    const lat = S.lat, lon = S.lon;
    const sunAlt = (tt) => A.altAz(A.applyM(A.horizonMatrix(tt, lat, lon), A.sun(tt).v))[0];
    const moonAlt = (tt) => A.altAz(A.applyM(A.horizonMatrix(tt, lat, lon), A.moon(tt).v))[0] - 0.95;
    const ss = A.crossings(sunAlt, n0, n1, -0.833), tw = A.crossings(sunAlt, n0, n1, -18);
    const sunset = ss.find((c) => !c.rising), sunrise = ss.find((c) => c.rising);
    const dark = tw.find((c) => !c.rising), dawn = tw.find((c) => c.rising);
    const mc = A.crossings(moonAlt, n0, n1, 0);
    const mid = dark && dawn ? (dark.t + dawn.t) / 2 : n0 + 12 * 3600000;
    const mo = A.moon(mid);
    const phaseName = mo.frac < 0.04 ? '新月（沒有月光，最適合看星星！）' : mo.frac > 0.96 ? '滿月（月光很亮，星星會變少）' : (mo.waxing ? (mo.frac < 0.5 ? '眉月' : '盈凸月') : (mo.frac < 0.5 ? '殘月' : '虧凸月'));
    const row = (k, v) => '<tr><th>' + k + '</th><td>' + v + '</td></tr>';
    let html = '<h3>' + A.fmtDate(n0) + ' 晚上 ・ ' + S.locName + '</h3><table>' +
      row('日落', sunset ? A.fmtTime(sunset.t) : '-') +
      row('完全天黑', dark ? A.fmtTime(dark.t) + '（天文晨昏結束）' : '-') +
      row('天開始亮', dawn ? A.fmtTime(dawn.t) : '-') +
      row('日出', sunrise ? A.fmtTime(sunrise.t) : '-') +
      row('月相', Math.round(mo.frac * 100) + '% ' + phaseName) +
      row('月亮', mc.length ? mc.map((c) => (c.rising ? '升起 ' : '落下 ') + A.fmtTime(c.t)).join('、') : (moonAlt(n0) > 0 ? '整晚在天上' : '整晚不在天上')) +
      '</table>';
    // planets during darkness
    const t0 = dark ? dark.t : n0 + 7 * 3600000, t1 = dawn ? dawn.t : n0 + 17 * 3600000;
    html += '<h3>今晚看得到的行星</h3><ul>';
    let any = false;
    for (const [id, zh] of PLANETS) {
      if (id === 'uranus' || id === 'neptune') continue;
      const f = (tt) => A.altAz(A.applyM(A.horizonMatrix(tt, lat, lon), A.planet(id, tt).v))[0];
      let bestT = null, bestA = 10;
      for (let tt = t0; tt <= t1; tt += 15 * 60000) { const a = f(tt); if (a > bestA) { bestA = a; bestT = tt; } }
      if (bestT == null) continue;
      any = true;
      const cr = A.crossings(f, n0, n1, -0.5);
      const mag = A.planet(id, bestT).mag;
      html += '<li><b>' + zh + '</b>（亮度 ' + mag.toFixed(1) + ' 等）最高約 ' + Math.round(bestA) + '°，約 ' + A.fmtTime(bestT) + (cr.length ? ' ・ ' + cr.map((c) => (c.rising ? '升 ' : '落 ') + A.fmtTime(c.t)).join(' ') : '') + '</li>';
    }
    if (!any) html += '<li>天黑時段沒有明顯的行星</li>';
    html += '</ul>';
    // constellations high at ~21:00 and ~01:00
    const at = (hh) => n0 + (hh - 12) * 3600000 + (hh < 12 ? 86400000 : 0);
    for (const hh of [21, 1]) {
      const tt = at(hh), m = A.horizonMatrix(tt, lat, lon);
      const vis = Object.keys(TIPS).map((id) => consById[id]).filter(Boolean)
        .map((c) => ({ c, a: A.altAz(A.applyM(m, c.v)) })).filter((x) => x.a[0] > 25).sort((a, b) => b.a[0] - a.a[0]);
      html += '<h3>' + (hh === 21 ? '晚上 9 點' : '凌晨 1 點') + '值得找的星座</h3><p>' + vis.map((x) => '<span class="chip" data-id="' + x.c.id + '">' + x.c.fig + ' ' + x.c.zh + ' <small>' + dirName(x.a[1]) + '</small></span>').join(' ') + '</p>';
    }
    html += '<h3>武陵觀星小提醒</h3><ul class="tips">' +
      '<li>武陵海拔約 1,750 公尺以上，十月夜晚可能只有 5～12°C，請帶厚外套、帽子、毯子。</li>' +
      '<li>找遠離路燈的地方，眼睛在黑暗中適應 15～20 分鐘才看得到銀河。</li>' +
      '<li>打開下方「紅光」模式，避免手機亮光破壞暗適應，也不影響旁人。</li>' +
      '<li>山區可能沒有訊號：出發前先打開本頁一次（或加到主畫面），之後離線也能用。</li>' +
      '<li>「指向」模式使用手機指南針，若方向偏掉，可以在設定中微調或把手機畫 8 字校正。</li>' +
      '</ul>';
    $('tonightBody').innerHTML = html;
    $('tonightBody').querySelectorAll('.chip').forEach((el) => (el.onclick = () => {
      const c = consById[el.dataset.id];
      $('tonight').hidden = true;
      showInfo(conObj(c));
      if (!S.sensor) panTo(targetH());
    }));
  }
  $('btnTonight').onclick = () => { openPanel('tonight'); buildTonight(); };

  // ---------- settings ----------
  const toggles = { lines: '星座連線', figures: '星座圖案', cname: '星座名稱', sname: '亮星名稱', planets: '行星', dso: '星團星雲', mw: '銀河', grid: '高度方位格線' };
  $('toggles').innerHTML = Object.entries(toggles).map(([k, v]) => '<label><input type="checkbox" data-k="' + k + '"' + (S.show[k] ? ' checked' : '') + '> ' + v + '</label>').join('');
  $('toggles').querySelectorAll('input').forEach((el) => (el.onchange = () => { S.show[el.dataset.k] = el.checked; save('show', S.show); dirty = true; }));
  $('btnSettings').onclick = () => openPanel('settings');
  $('camFov').value = S.camFov; $('camFovV').textContent = S.camFov + '°';
  $('camFov').oninput = () => { S.camFov = +$('camFov').value; $('camFovV').textContent = S.camFov + '°'; save('camFov', S.camFov); dirty = true; };
  $('azCal').value = S.azCal; $('azCalV').textContent = S.azCal + '°';
  $('azCal').oninput = () => { S.azCal = +$('azCal').value; $('azCalV').textContent = S.azCal + '°'; save('azCal', S.azCal); };
  $('btnGps').onclick = () => {
    if (!navigator.geolocation) return alert('這台裝置不支援定位');
    $('locStatus').textContent = '定位中…';
    navigator.geolocation.getCurrentPosition((p) => {
      S.lat = p.coords.latitude; S.lon = p.coords.longitude; S.locName = '目前位置';
      $('locStatus').textContent = '目前位置 ' + S.lat.toFixed(3) + ', ' + S.lon.toFixed(3);
      M = null; dirty = true;
    }, (err) => { $('locStatus').textContent = '定位失敗：' + err.message; }, { enableHighAccuracy: false, timeout: 15000 });
  };
  $('btnWuling').onclick = () => { S.lat = WULING.lat; S.lon = WULING.lon; S.locName = WULING.name; $('locStatus').textContent = '武陵農場 24.36°N 121.31°E'; M = null; dirty = true; };
  $('btnFull').onclick = () => { const d = document.documentElement; if (!document.fullscreenElement && d.requestFullscreen) d.requestFullscreen().catch(() => {}); else if (document.exitFullscreen) document.exitFullscreen(); };

  // ---------- time controls ----------
  function setTime(t) { S.timeFixed = t; M = null; dirty = true; updateTimeLabel(); if (!$('tonight').hidden) buildTonight(); }
  function updateTimeLabel() {
    const t = now();
    $('timeLabel').textContent = A.fmtDate(t) + ' ' + A.fmtTime(t) + (S.timeFixed == null ? ' 現在' : '');
    $('btnNow').classList.toggle('on', S.timeFixed == null);
  }
  $('btnMinus').onclick = () => setTime(now() - 3600000);
  $('btnPlus').onclick = () => setTime(now() + 3600000);
  $('btnNow').onclick = () => setTime(null);
  $('timeLabel').onclick = () => { $('dt').value = A.fmtInput(now()); openPanel('timePanel'); };
  $('dtOk').onclick = () => { const v = $('dt').value; if (v) setTime(A.parseInput(v)); $('timePanel').hidden = true; };
  document.querySelectorAll('[data-preset]').forEach((b) => (b.onclick = () => {
    const [mo, d, h] = b.dataset.preset.split('-').map(Number);
    const y = A.local(Date.now()).getUTCFullYear();
    setTime(Date.UTC(y, mo - 1, d, h) - 8 * 3600000);
    $('timePanel').hidden = true;
  }));

  // ---------- red mode ----------
  function applyRed() { document.body.classList.toggle('red', S.red); $('btnRed').classList.toggle('on', S.red); }
  $('btnRed').onclick = () => { S.red = !S.red; save('red', S.red); applyRed(); };

  // ---------- device orientation ----------
  let wakeLock = null, gotSensor = false, camWasOn = false;
  function onOrient(e) {
    let a = e.alpha, b = e.beta, g = e.gamma;
    if (e.webkitCompassHeading != null) a = 360 - e.webkitCompassHeading;
    if (a == null || b == null || g == null) return;
    gotSensor = true;
    a = (a - MAG_DECL - S.azCal) * RAD; b *= RAD; g *= RAD;
    // Rows of R = Rz(a)Rx(b)Ry(g): device frame -> earth (east, north, up)
    const cA = Math.cos(a), sA = Math.sin(a), cB = Math.cos(b), sB = Math.sin(b), cG = Math.cos(g), sG = Math.sin(g);
    const X = [cA * cG - sA * sB * sG, sA * cG + cA * sB * sG, -cB * sG];
    const Y = [-sA * cB, cA * cB, sB];
    const Z = [cA * sG + sA * sB * cG, sA * sG - cA * sB * cG, cB * cG];
    const th = ((screen.orientation && screen.orientation.angle) || window.orientation || 0) * RAD;
    const upN = [0, 1, 2].map((i) => Math.sin(th) * X[i] + Math.cos(th) * Y[i]);
    const fN = Z.map((x) => -x);
    const k = 0.25;
    camF = normalize(camF.map((x, i) => x * (1 - k) + fN[i] * k));
    let u = camU.map((x, i) => x * (1 - k) + upN[i] * k);
    u = normalize(u.map((x, i) => x - dot(u, camF) * camF[i]));
    camU = u; camR = cross(camF, camU);
  }
  async function setSensor(on) {
    if (on && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try { if ((await DeviceOrientationEvent.requestPermission()) !== 'granted') return; } catch (err) { return; }
    }
    S.sensor = on;
    $('btnSensor').classList.toggle('on', on);
    const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    if (on) {
      gotSensor = false;
      window.addEventListener(evt, onOrient);
      setTimeout(() => { if (S.sensor && !gotSensor) { toast('這台裝置沒有方向感應器，請用手指拖曳'); setSensor(false); } }, 2500);
      if (navigator.wakeLock) navigator.wakeLock.request('screen').then((w) => (wakeLock = w)).catch(() => {});
      toast('把手機舉向天空，畫面會跟著轉');
    } else {
      window.removeEventListener(evt, onOrient);
      if (S.cam) setCamera(false); // camera mode needs the sensors
      const [alt, az] = A.altAz(camF); S.alt = Math.max(-30, Math.min(90, alt)); S.az = az;
      if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
    }
    dirty = true;
  }
  $('btnSensor').onclick = () => setSensor(!S.sensor);

  // ---------- camera mode: live video behind the sky drawing ----------
  const video = $('cam');
  let camStream = null;
  async function setCamera(on) {
    if (on) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return toast('這個瀏覽器不能開鏡頭');
      try {
        camStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
      } catch (err) {
        return toast(err && err.name === 'NotAllowedError' ? '請允許使用相機，才能開鏡頭模式' : '鏡頭打不開：' + (err && err.message || err));
      }
      video.srcObject = camStream;
      video.play().catch(() => {});
      S.cam = true; document.body.classList.add('cam');
      if (!S.sensor) await setSensor(true);
      if (S.cam) toast('把手機對準天空，星座圖案會疊在畫面上');
    } else {
      if (camStream) camStream.getTracks().forEach((t) => t.stop());
      camStream = null; video.srcObject = null;
      S.cam = false; document.body.classList.remove('cam');
    }
    $('btnCam').classList.toggle('on', S.cam);
    dirty = true;
  }
  $('btnCam').onclick = () => setCamera(!S.cam);
  video.addEventListener('loadedmetadata', () => { dirty = true; });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && S.cam) { setCamera(false); camWasOn = true; }
    else if (document.visibilityState === 'visible' && camWasOn) { camWasOn = false; setCamera(true); }
    if (document.visibilityState === 'visible' && S.sensor && navigator.wakeLock) navigator.wakeLock.request('screen').then((w) => (wakeLock = w)).catch(() => {});
  });

  let toastT = 0;
  function toast(msg) { const el = $('toast'); el.textContent = msg; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (el.hidden = true), 3000); }

  // ---------- start ----------
  window.addEventListener('resize', resize);
  resize(); applyRed(); updateTimeLabel();
  if (!load('seenHelp', false)) { $('help').hidden = false; }
  $('helpOk').onclick = () => { $('help').hidden = true; save('seenHelp', true); };
  $('btnHelp').onclick = () => { $('settings').hidden = true; $('help').hidden = false; };
  requestAnimationFrame(frame);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
