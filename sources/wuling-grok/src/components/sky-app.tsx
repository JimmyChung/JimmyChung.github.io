import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Camera, Compass, Info, Layers, Lock, Search, Unlock, X } from "lucide-react";
import { CONSTELLATIONS } from "@/lib/astro/catalog";
import {
  angDelta,
  azLabel,
  basisFromLook,
  cameraBasis,
  clamp,
  fmtDate,
  fmtTime,
  lerpAngle,
  nightStart,
  type Basis,
} from "@/lib/astro/math";
import {
  centroid,
  constellationsNow,
  drownedBySun,
  midnightOf,
  nextDark,
  nightGuide,
  passages,
  predawnOf,
  skyAt,
  sunNight,
  type Passage,
  type SkyBody,
  type SkySnapshot,
} from "@/lib/astro/sky";
import { SkyView } from "@/components/sky-view";

type Mode = "map" | "align" | "night";
type Panel = null | "layers" | "search" | "info" | "time" | "tune";

const btn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-surface px-3 text-sm text-fg";
const btnOn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-3 text-sm font-medium text-accent-ink";

export function SkyApp() {
  const [mode, setMode] = useState<Mode>("map");
  const [panel, setPanel] = useState<Panel>(null);
  const [linesOn, setLinesOn] = useState(true);
  const [namesOn, setNamesOn] = useState(true);
  const [planetsOn, setPlanetsOn] = useState(true);
  const [milkyOn, setMilkyOn] = useState(true);
  const [asterOn, setAsterOn] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlightCon, setHighlightCon] = useState<string | null>(null);
  const [look, setLook] = useState({ alt: 45, az: 180 });
  const [fov, setFov] = useState(64);
  const [rim, setRim] = useState(0);
  const [mapRot, setMapRot] = useState(0);
  const [follow, setFollow] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const [sensorBasis, setSensorBasis] = useState<Basis | null>(null);
  const [cal, setCal] = useState(0);
  const [locked, setLocked] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [camMsg, setCamMsg] = useState<string | null>(null);
  const [sensorMsg, setSensorMsg] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const [fixed, setFixed] = useState<number | null>(null);
  const [passage, setPassage] = useState<Passage | null>(null);
  const [dockH, setDockH] = useState(176);
  const [headH, setHeadH] = useState(76);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dockRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const lookRef = useRef(look);
  lookRef.current = look;

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 20000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wuling-sky");
      if (!raw) return;
      const saved = JSON.parse(raw) as { cal?: number };
      if (typeof saved.cal === "number") setCal(saved.cal);
    } catch {
      /* ignore broken prefs */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wuling-sky", JSON.stringify({ cal }));
  }, [cal]);

  useEffect(() => {
    const watch = (el: HTMLElement | null, set: (n: number) => void) => {
      if (!el) return () => {};
      const ro = new ResizeObserver(() => set(el.offsetHeight));
      ro.observe(el);
      set(el.offsetHeight);
      return () => ro.disconnect();
    };
    const a = watch(dockRef.current, setDockH);
    const b = watch(headRef.current, setHeadH);
    return () => {
      a();
      b();
    };
  }, [mode, panel, selectedId]);

  const instant = fixed ?? now;
  const sky = useMemo(() => (instant == null ? null : skyAt(new Date(instant))), [instant]);
  const schedule = useMemo(() => (sky ? sunNight(sky.date) : null), [sky]);

  useEffect(() => {
    if (!sky || !selectedId) {
      setPassage(null);
      return;
    }
    const body = sky.byId.get(selectedId);
    if (!body) {
      setPassage(null);
      return;
    }
    setPassage(passages(body, sky.date));
  }, [sky, selectedId]);

  useEffect(() => {
    if (!tracking) return;
    let last = 0;
    const handler = (event: Event) => {
      const e = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
      if (e.beta == null || e.gamma == null) return;
      const t = performance.now();
      if (t - last < 50) return;
      last = t;
      let alpha = e.alpha ?? 0;
      if (typeof e.webkitCompassHeading === "number" && !Number.isNaN(e.webkitCompassHeading)) {
        alpha = (360 - e.webkitCompassHeading) % 360;
      }
      const screenAngle = window.screen?.orientation?.angle ?? 0;
      const basis = cameraBasis(alpha, e.beta, e.gamma, screenAngle, cal);
      setSensorBasis(basis);
      setLook({ alt: basis.alt, az: basis.az });
      setHeading(basis.az);
    };
    const type =
      "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    window.addEventListener(type, handler);
    return () => window.removeEventListener(type, handler);
  }, [tracking, cal]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (mode !== "align" || locked) return;
      const step = e.shiftKey ? 12 : 5;
      if (e.key === "ArrowLeft") {
        setTracking(false);
        setLook((l) => ({ ...l, az: (l.az - step + 360) % 360 }));
      } else if (e.key === "ArrowRight") {
        setTracking(false);
        setLook((l) => ({ ...l, az: (l.az + step) % 360 }));
      } else if (e.key === "ArrowUp") {
        setTracking(false);
        setLook((l) => ({ ...l, alt: clamp(l.alt + step, -5, 89) }));
      } else if (e.key === "ArrowDown") {
        setTracking(false);
        setLook((l) => ({ ...l, alt: clamp(l.alt - step, -5, 89) }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, locked]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const basis = tracking && sensorBasis ? sensorBasis : basisFromLook(look.alt, look.az);
  const rotation = follow && heading != null ? heading - 180 : mapRot;
  const selected = selectedId && sky ? sky.byId.get(selectedId) ?? null : null;
  const guide = sky ? nightGuide(sky) : "正在對武陵農場的天空。";

  function slewTo(alt: number, az: number) {
    setTracking(false);
    setSensorBasis(null);
    const from = lookRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setLook({ alt, az });
      return;
    }
    const start = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 680);
      const e = 1 - (1 - k) ** 3;
      setLook({
        alt: from.alt + (alt - from.alt) * e,
        az: lerpAngle(from.az, az, e),
      });
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function aim(alt: number, az: number) {
    setMode("align");
    setPanel(null);
    if (tracking) return;
    slewTo(clamp(alt, 8, 78), az);
  }

  async function enableTracking() {
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof D.requestPermission === "function") {
      try {
        const res = await D.requestPermission();
        if (res !== "granted") {
          setSensorMsg("沒有羅盤權限。用手指拖曳星空，讓它跟相機裡的星星重疊。");
          return;
        }
      } catch {
        setSensorMsg("沒有羅盤權限。用手指拖曳星空來對準。");
        return;
      }
    }
    setTracking(true);
    setFollow(true);
    setMode("align");
    setSensorMsg(null);
    window.setTimeout(() => {
      setHeading((h) => {
        if (h == null) setSensorMsg("這台裝置沒有方向感測。用手指拖曳星空來對準相機。");
        return h;
      });
    }, 1800);
  }

  async function toggleCamera() {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraOn(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamMsg("這個瀏覽器不能開相機。星圖跟對星的拖曳仍然可以用。");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      setCamMsg(null);
      setMode("align");
    } catch {
      setCamMsg("相機沒打開。允許相機權限後再試，或用手指拖曳來比對。");
    }
  }

  function togglePanel(next: Panel) {
    setPanel((cur) => (cur === next ? null : next));
    setQuery("");
  }

  const turn =
    mode === "align" && selected
      ? turnHint(selected.name, selected.alt, selected.az, look.alt, look.az)
      : null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-bg font-sans text-fg">
      <video
        ref={videoRef}
        className={cameraOn ? "absolute inset-0 h-full w-full object-cover" : "hidden"}
        playsInline
        muted
        autoPlay
      />
      <SkyView
        sky={sky}
        mode={mode === "align" ? "align" : "map"}
        transparent={cameraOn && mode === "align"}
        basis={basis}
        mapRotation={rotation}
        rim={rim}
        fov={fov}
        showLines={linesOn}
        showNames={namesOn}
        showPlanets={planetsOn}
        showMilky={milkyOn}
        showAsterisms={asterOn}
        highlightCon={highlightCon}
        selectedId={selectedId}
        insetTop={headH + 8}
        insetBottom={dockH + 12}
        onTap={(id) => {
          setSelectedId(id);
          if (id && sky?.byId.get(id)?.con) setHighlightCon(sky.byId.get(id)!.con!);
        }}
        onMapRotate={(delta) => {
          if (locked) return;
          setFollow(false);
          setMapRot((r) => r + delta);
        }}
        onLookDrag={(dAlt, dAz) => {
          if (locked || mode !== "align") return;
          setTracking(false);
          setSensorBasis(null);
          setLook((l) => ({
            alt: clamp(l.alt + dAlt, -5, 89),
            az: (l.az + dAz + 360) % 360,
          }));
        }}
        onZoom={(factor) => {
          if (mode === "align") setFov((f) => clamp(f / factor, 28, 100));
          else setRim((r) => clamp(90 - (90 - r) / factor, 0, 70));
        }}
      />

      <header ref={headRef} className="pad-safe-t pointer-events-none absolute inset-x-0 top-0 z-20 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="pointer-events-auto min-w-0">
            <h1 className="font-serif text-xl leading-tight">武陵觀星</h1>
            <p className="text-sm text-muted">武陵農場 · 24.38°N</p>
          </div>
          <button
            type="button"
            className={`${btn} pointer-events-auto tabular-nums`}
            onClick={() => togglePanel("time")}
          >
            <span>{sky ? fmtTime(sky.date) : "——"}</span>
            {sky && sky.sun.alt > 0 ? <span className="text-accent">白天</span> : null}
            {sky && sky.sun.alt <= 0 ? <span className="text-muted">{sky.moon.phase}</span> : null}
          </button>
        </div>
      </header>

      <div className="absolute top-24 right-3 z-20 flex flex-col gap-2">
        <IconButton label="搜尋星星" onClick={() => togglePanel("search")}>
          <Search className="size-5" />
        </IconButton>
        <IconButton label="圖層" onClick={() => togglePanel("layers")}>
          <Layers className="size-5" />
        </IconButton>
        <IconButton label="說明" onClick={() => togglePanel("info")}>
          <Info className="size-5" />
        </IconButton>
      </div>

      {mode === "align" ? (
        <p className="pointer-events-none absolute top-24 left-1/2 z-10 -translate-x-1/2 rounded-full border border-line bg-bg/80 px-3 py-2 text-sm tabular-nums">
          高度 {Math.round(look.alt)}° · {azLabel(look.az)}
        </p>
      ) : null}
      {turn ? (
        <p className="pointer-events-none absolute top-36 left-1/2 z-10 max-w-xs -translate-x-1/2 rounded-full bg-accent px-3 py-2 text-center text-sm text-accent-ink">
          {turn}
        </p>
      ) : null}

      <footer
        ref={dockRef}
        className="pad-safe-b absolute inset-x-0 bottom-0 z-30 border-t border-line bg-bg px-4 pt-3"
      >
        {selected && sky ? (
          <div className="mb-3">
            <BodyCard
              body={selected}
              passage={passage}
              onClose={() => setSelectedId(null)}
              onAim={() => aim(selected.alt, selected.az)}
            />
          </div>
        ) : (
          <p className="mb-3 text-sm leading-snug text-fg">{guide}</p>
        )}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <ModeButton on={mode === "map"} onClick={() => setMode("map")}>
            星圖
          </ModeButton>
          <ModeButton on={mode === "align"} onClick={() => setMode("align")}>
            對星
          </ModeButton>
          <ModeButton on={mode === "night"} onClick={() => setMode("night")}>
            今晚
          </ModeButton>
        </div>
        {mode === "align" ? (
          <div className="mb-3 flex flex-wrap gap-2">
            <button type="button" className={cameraOn ? btnOn : btn} onClick={() => void toggleCamera()}>
              <Camera className="size-4" />
              {cameraOn ? "關閉相機" : "開相機"}
            </button>
            <button type="button" className={tracking ? btnOn : btn} onClick={() => void enableTracking()}>
              <Compass className="size-4" />
              {tracking ? "羅盤跟著" : "開羅盤"}
            </button>
            <button type="button" className={locked ? btnOn : btn} onClick={() => setLocked((v) => !v)}>
              {locked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
              {locked ? "已鎖定" : "鎖定"}
            </button>
            <button type="button" className={btn} onClick={() => togglePanel("tune")}>
              微調
            </button>
          </div>
        ) : null}
        {mode === "map" ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {fixed != null ? (
              <button type="button" className={btnOn} onClick={() => setFixed(null)}>
                回到現在
              </button>
            ) : sky && sky.sun.alt > -6 ? (
              <button
                type="button"
                className={btnOn}
                onClick={() => setFixed(nextDark(new Date(), sky.sun.alt).getTime())}
              >
                看今夜
              </button>
            ) : null}
            <button
              type="button"
              className={follow ? btnOn : btn}
              onClick={() => {
                if (follow) setFollow(false);
                else void enableTracking();
              }}
            >
              <Compass className="size-4" />
              {follow ? "跟著朝向" : "轉到我面向"}
            </button>
            <button
              type="button"
              className={btn}
              onClick={() => {
                setFollow(false);
                setMapRot(0);
              }}
            >
              北朝上
            </button>
          </div>
        ) : null}
        {camMsg || sensorMsg ? <p className="mb-3 text-sm text-accent">{camMsg || sensorMsg}</p> : null}
        {mode === "night" && sky && !selected ? <Tonight sky={sky} onPick={pickFromList} /> : null}
      </footer>

      {panel ? (
        <section
          className="absolute inset-0 z-40 flex flex-col bg-bg"
          role="dialog"
          aria-modal="true"
          aria-label="面板"
        >
          <div className="pad-safe-t flex items-center justify-between px-4">
            <h2 className="font-serif text-xl">
              {panel === "time"
                ? "觀測時間"
                : panel === "layers"
                  ? "圖層"
                  : panel === "search"
                    ? "找星"
                    : panel === "tune"
                      ? "對準微調"
                      : "怎麼用"}
            </h2>
            <button type="button" className={`${btn} w-11 px-0`} onClick={() => setPanel(null)} aria-label="關閉">
              <X className="size-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-10">
            {panel === "time" && sky ? (
              <TimePanel
                sky={sky}
                fixed={fixed != null}
                schedule={schedule}
                onNow={() => setFixed(null)}
                onDark={() => setFixed(nextDark(new Date(), sky.sun.alt).getTime())}
                onMidnight={() => setFixed(midnightOf(sky.date).getTime())}
                onDawn={() => setFixed(predawnOf(sky.date).getTime())}
                onSlide={(ms) => setFixed(ms)}
              />
            ) : null}
            {panel === "layers" ? (
              <div className="flex flex-col gap-2">
                <Toggle on={linesOn} set={setLinesOn} label="星座連線" />
                <Toggle on={namesOn} set={setNamesOn} label="中文星名" />
                <Toggle on={planetsOn} set={setPlanetsOn} label="行星、月亮、太陽" />
                <Toggle on={milkyOn} set={setMilkyOn} label="銀河" />
                <Toggle on={asterOn} set={setAsterOn} label="大三角與冬季六邊形" />
              </div>
            ) : null}
            {panel === "search" && sky ? (
              <SearchPanel
                sky={sky}
                query={query}
                setQuery={setQuery}
                onPick={(id) => {
                  pickFromList(id);
                  setPanel(null);
                }}
              />
            ) : null}
            {panel === "tune" ? (
              <div className="flex flex-col gap-5">
                <label className="block text-sm">
                  鏡頭視角 {Math.round(fov)}°
                  <input
                    type="range"
                    min={28}
                    max={100}
                    value={fov}
                    onChange={(e) => setFov(Number(e.target.value))}
                  />
                  <span className="text-muted">星星顯得太大就加大，對不齊大小就縮小。</span>
                </label>
                <label className="block text-sm">
                  羅盤修正 {cal > 0 ? "+" : ""}
                  {Math.round(cal)}°
                  <input
                    type="range"
                    min={-40}
                    max={40}
                    value={cal}
                    onChange={(e) => setCal(Number(e.target.value))}
                  />
                  <span className="text-muted">
                    整片星空偏了，就滑到北極星落在正北、高度約 24° 的地方。台灣磁偏大約西偏 4°。
                  </span>
                </label>
                <button type="button" className={btn} onClick={() => setCal(-4)}>
                  套用台灣磁偏 −4°
                </button>
              </div>
            ) : null}
            {panel === "info" ? <InfoBody /> : null}
          </div>
        </section>
      ) : null}
    </div>
  );

  function pickFromList(id: string) {
    if (!sky) return;
    if (id.startsWith("con:")) {
      const cid = id.slice(4);
      setHighlightCon(cid);
      setSelectedId(null);
      const members = sky.stars.filter((s) => s.con === cid);
      if (!members.length) return;
      const c = centroid(members);
      if (mode === "align") aim(c.alt, c.az);
      return;
    }
    const body = sky.byId.get(id);
    if (!body) return;
    setSelectedId(id);
    if (body.con) setHighlightCon(body.con);
    if (mode === "align") aim(body.alt, body.az);
  }
}

function ModeButton({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button type="button" className={on ? btnOn : btn} onClick={onClick} aria-pressed={on}>
      {children}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className={`${btn} w-11 px-0`} aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button type="button" className={on ? btnOn : btn} aria-pressed={on} onClick={() => set(!on)}>
      {label}
    </button>
  );
}

function turnHint(name: string, alt: number, az: number, lookAlt: number, lookAz: number) {
  const dAz = angDelta(lookAz, az);
  const dAlt = alt - lookAlt;
  const scale = Math.hypot(dAz * Math.cos((lookAlt * Math.PI) / 180), dAlt);
  if (alt < 0) return `${name}現在在地平線下`;
  if (scale < 8) return `${name}就在十字附近`;
  const bits: string[] = [];
  if (Math.abs(dAz) > 10) bits.push(dAz > 0 ? "往右轉" : "往左轉");
  if (Math.abs(dAlt) > 8) bits.push(dAlt > 0 ? "再舉高一點" : "再放低一點");
  return `${name}：${bits.join("，")}`;
}

function BodyCard({
  body,
  passage,
  onClose,
  onAim,
}: {
  body: SkyBody;
  passage: Passage | null;
  onClose: () => void;
  onAim: () => void;
}) {
  const where =
    body.alt > 0
      ? `高度 ${Math.round(body.alt)}° · ${azLabel(body.az)}`
      : `在地平下 ${Math.round(-body.alt)}°`;
  const when = passageText(body, passage);
  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-serif text-lg leading-tight">{body.name}</h2>
          <p className="text-sm text-muted">
            {body.en}
            {body.kind === "star" && body.con ? ` · ${conName(body.con)}` : ""}
            {body.kind !== "dso" ? ` · 星等 ${body.mag.toFixed(1)}` : ""}
          </p>
        </div>
        <button type="button" className={`${btn} w-11 shrink-0 px-0`} onClick={onClose} aria-label="關閉">
          <X className="size-5" />
        </button>
      </div>
      <p className="mt-2 text-sm tabular-nums">
        {where}
        {when ? ` · ${when}` : ""}
      </p>
      {body.blurb ? <p className="mt-2 text-sm leading-relaxed text-fg">{body.blurb}</p> : null}
      <button type="button" className={`${btnOn} mt-3`} onClick={onAim}>
        拿到天空上對
      </button>
    </article>
  );
}

function passageText(body: SkyBody, passage: Passage | null) {
  if (!passage) return "";
  if (body.alt > 0) {
    if (passage.set) return `約 ${fmtTime(passage.set)} 落下`;
    return "整晚不落";
  }
  if (passage.rise) return `約 ${fmtTime(passage.rise)} 升起`;
  return "從武陵幾乎升不起來";
}

function conName(id: string) {
  return CONSTELLATIONS.find((c) => c.id === id)?.name ?? "";
}

function Tonight({ sky, onPick }: { sky: SkySnapshot; onPick: (id: string) => void }) {
  const planets = [sky.moon, ...sky.planets].filter((p) => p.alt > 0 && !drownedBySun(p, sky.sun));
  const stars = sky.stars
    .filter((s) => s.alt > 8 && s.mag < 1.7 && s.name !== s.en)
    .sort((a, b) => a.mag - b.mag)
    .slice(0, 8);
  const cons = constellationsNow(sky)
    .filter((c) => c.up >= 2 && c.alt > 8)
    .sort((a, b) => b.alt - a.alt)
    .slice(0, 8);
  return (
    <div className="mb-2 max-h-80 overflow-y-auto overscroll-contain">
      <RowGroup title="行星與月亮">
        {planets.length === 0 ? <p className="text-sm text-muted">現在地平線上沒有亮行星。</p> : null}
        {planets.map((p) => (
          <Row
            key={p.id}
            title={p.name}
            meta={`${azLabel(p.az)} ${Math.round(p.alt)}° · 星等 ${p.mag.toFixed(1)}`}
            onClick={() => onPick(p.id)}
          />
        ))}
      </RowGroup>
      <RowGroup title="亮星">
        {stars.map((s) => (
          <Row
            key={s.id}
            title={s.name}
            meta={`${conName(s.con ?? "")} · ${azLabel(s.az)} ${Math.round(s.alt)}°`}
            onClick={() => onPick(s.id)}
          />
        ))}
      </RowGroup>
      <RowGroup title="星座">
        {cons.map((c) => (
          <Row
            key={c.con.id}
            title={c.con.name}
            meta={c.con.about}
            onClick={() => onPick(`con:${c.con.id}`)}
          />
        ))}
      </RowGroup>
    </div>
  );
}

function RowGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <h3 className="mb-1 text-sm text-accent">{title}</h3>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function Row({ title, meta, onClick }: { title: string; meta: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-2xl px-2 py-2 text-left hover:bg-surface">
      <span className="block text-sm">{title}</span>
      <span className="block text-sm text-muted">{meta}</span>
    </button>
  );
}

function TimePanel({
  sky,
  fixed,
  schedule,
  onNow,
  onDark,
  onMidnight,
  onDawn,
  onSlide,
}: {
  sky: SkySnapshot;
  fixed: boolean;
  schedule: ReturnType<typeof sunNight> | null;
  onNow: () => void;
  onDark: () => void;
  onMidnight: () => void;
  onDawn: () => void;
  onSlide: (ms: number) => void;
}) {
  const start = nightStart(sky.date).getTime();
  const hours = clamp((sky.date.getTime() - start) / 3600000, 0, 16);
  return (
    <div className="flex flex-col gap-4">
      <p className="font-serif text-2xl tabular-nums">
        {fmtDate(sky.date)} {fmtTime(sky.date)}
      </p>
      <p className="text-sm text-muted">時間是台灣時間，地點固定在武陵農場。</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={fixed ? btn : btnOn} onClick={onNow}>
          現在
        </button>
        <button type="button" className={btn} onClick={onDark}>
          全黑後
        </button>
        <button type="button" className={btn} onClick={onMidnight}>
          子夜
        </button>
        <button type="button" className={btn} onClick={onDawn}>
          黎明前
        </button>
      </div>
      <label className="block text-sm">
        這一夜的時刻
        <input
          type="range"
          min={0}
          max={16}
          step={0.25}
          value={hours}
          onChange={(e) => onSlide(start + Number(e.target.value) * 3600000)}
        />
      </label>
      {schedule ? (
        <ul className="flex flex-col gap-1 text-sm tabular-nums">
          <li>日沒 {schedule.sunset ? fmtTime(schedule.sunset) : "—"}</li>
          <li>天文黑夜開始 {schedule.dark ? fmtTime(schedule.dark) : "—"}</li>
          <li>天文黑夜結束 {schedule.dawn ? fmtTime(schedule.dawn) : "—"}</li>
          <li>日出 {schedule.sunrise ? fmtTime(schedule.sunrise) : "—"}</li>
        </ul>
      ) : null}
      <p className="text-sm">
        太陽高度 {Math.round(sky.sun.alt)}° · {azLabel(sky.sun.az)}。月亮是{sky.moon.phase}，高度{" "}
        {Math.round(sky.moon.alt)}°。
      </p>
    </div>
  );
}

function SearchPanel({
  sky,
  query,
  setQuery,
  onPick,
}: {
  sky: SkySnapshot;
  query: string;
  setQuery: (q: string) => void;
  onPick: (id: string) => void;
}) {
  const q = query.trim();
  const items = useMemo(() => {
    const all: { id: string; name: string; meta: string }[] = [];
    for (const s of sky.stars) {
      if (!s.name || s.name === s.en) continue;
      all.push({ id: s.id, name: s.name, meta: `${s.en} · ${conName(s.con ?? "")}` });
    }
    for (const p of sky.planets) all.push({ id: p.id, name: p.name, meta: p.en });
    all.push({ id: "moon", name: "月亮", meta: sky.moon.phase ?? "" });
    for (const c of CONSTELLATIONS) all.push({ id: `con:${c.id}`, name: c.name, meta: c.about });
    for (const d of sky.dsos) all.push({ id: d.id, name: d.name, meta: d.en });
    if (!q) {
      const pin = ["polaris", "vega", "altair", "antares", "sirius", "betelgeuse", "saturn", "jupiter", "con:sco", "con:ori", "con:peg"];
      return pin.map((id) => all.find((item) => item.id === id)).filter((item): item is { id: string; name: string; meta: string } => !!item);
    }
    const lower = q.toLowerCase();
    return all.filter((item) => item.name.includes(q) || item.meta.toLowerCase().includes(lower)).slice(0, 30);
  }, [sky, q]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="織女、天蠍、土星…"
        className="mb-3 h-11 w-full rounded-full border border-line bg-surface px-4 text-sm text-fg outline-none"
        aria-label="搜尋"
      />
      <div className="flex flex-col">
        {items.map((item) => (
          <Row key={item.id} title={item.name} meta={item.meta} onClick={() => onPick(item.id)} />
        ))}
      </div>
    </div>
  );
}

function InfoBody() {
  return (
    <div className="flex max-w-prose flex-col gap-4 text-sm leading-relaxed">
      <p>
        給武陵農場用的掌上星圖。地點鎖在北緯 24.38°、東經 121.31°，海拔約 1,800 公尺。時間用台灣時間。
      </p>
      <div>
        <h3 className="mb-1 font-serif text-lg">星圖</h3>
        <p>北在上、東在右。點一顆星看高度和方位。左右拖可以轉動星圖，雙指可以放大天頂附近。</p>
      </div>
      <div>
        <h3 className="mb-1 font-serif text-lg">對星</h3>
        <p>
          打開相機和羅盤，把手機舉向天空，星座線會疊在你看見的星星上。若沒對準，用手指拖曳，或到「微調」改羅盤和鏡頭視角。北極星在正北、高度約 24°，可以用來校正。
        </p>
      </div>
      <div>
        <h3 className="mb-1 font-serif text-lg">看銀河</h3>
        <p>
          夏天天黑後，銀河從南方的天蠍、人馬拉到天頂的天鵝。武陵光害低，新月前後最清楚。滿月那幾夜淡星會被月光蓋掉。請把螢幕亮度調到最低，眼睛大約十五分鐘才適應。
        </p>
      </div>
      <p className="text-muted">
        恆星位置夠肉眼認星。行星和月亮大約準到一度以內。手機羅盤會受車子和金屬影響，請走開再校正。
      </p>
    </div>
  );
}
