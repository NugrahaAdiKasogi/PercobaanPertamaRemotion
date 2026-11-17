import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  Video,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import captionsRaw from "./captions.json";

export type VideoProps = {
  timing: {
    hookSeconds: number;
    demoSeconds: number;
    outroSeconds: number;
  };
  hook: {
    badge?: string;
    title: string;
    problems: [string, string];
  };
  demo: {
    url: string;
    solutionLabel: string;
    solutionTitle: string;
    solutionDescription: string;
  };
  outro: {
    heading: string;
    question: string;
    cta: string;
  };
};

type CaptionToken = {
  text: string;
  startMs: number;
  endMs: number;
};

const assetUrl = (filename: string) => {
  const filePath = staticFile(filename);
  const origin = (globalThis as any).location?.origin;
  return origin
    ? `${origin.replace("localhost", "127.0.0.1")}${filePath}`
    : filePath;
};

const W = 1080;
const H = 1920;
const SAFE = {
  top: 230,
  bottom: 520, // Ruang bawah disisakan lebih lega untuk Auto-Caption & UI TikTok
  right: 120,
  left: 60,
};
const CONTENT_W = W - SAFE.left - SAFE.right;

const SafeZone: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="absolute flex flex-col justify-center gap-7"
    style={{
      top: SAFE.top,
      bottom: SAFE.bottom,
      left: SAFE.left,
      right: SAFE.right,
    }}
  >
    {children}
  </div>
);

const Pop: React.FC<{ delay?: number; children: React.ReactNode }> = ({
  delay = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 11, stiffness: 150, mass: 0.8 },
  });
  const opacity = interpolate(p, [0, 0.35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${(1 - p) * 70}px) scale(${0.82 + 0.18 * p})`,
      }}
    >
      {children}
    </div>
  );
};

const SceneFade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

/* ------------------------------------------------------------------ */
/* Layer B-Roll Dinamis: Kotak Tengah Tajam -> Zoom Penuh & Nge-Blur   */
/* ------------------------------------------------------------------ */
const DynamicBrollLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Detik 0 - 3.2: B-roll tampil tajam di kotak tengah
  // Detik 3.2 - 5.2: Melebar penuh ke 1080x1920 & perlahan nge-blur
  const expandStart = Math.round(3.2 * fps);
  const expandEnd = Math.round(5.2 * fps);

  const progress = interpolate(frame, [expandStart, expandEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const width = interpolate(progress, [0, 1], [860, W]);
  const height = interpolate(progress, [0, 1], [680, H]);
  const top = interpolate(progress, [0, 1], [440, 0]);
  const left = interpolate(progress, [0, 1], [(W - 860) / 2, 0]);
  const borderRadius = interpolate(progress, [0, 1], [44, 0]);
  const blurPx = interpolate(progress, [0, 1], [0, 20]);
  const innerScale = interpolate(progress, [0, 1], [1.0, 1.12]);
  const overlayOpacity = interpolate(progress, [0, 1], [0.05, 0.62]);

  // Badge label saat b-roll masih berbentuk kotak di awal
  const badgeOpacity = interpolate(frame, [8, 20, expandStart - 10, expandStart + 5], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="bg-slate-950">
      <div
        style={{
          position: "absolute",
          top,
          left,
          width,
          height,
          borderRadius,
          overflow: "hidden",
          boxShadow:
            progress < 0.95 ? "0 30px 90px rgba(0,0,0,0.75)" : "none",
          border:
            progress < 0.95
              ? "3px solid rgba(255,255,255,0.22)"
              : "0px solid transparent",
        }}
      >
        <Video
          src={assetUrl("broll.mp4")}
          muted
          loop
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `blur(${blurPx}px)`,
            transform: `scale(${innerScale})`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(2, 6, 23, ${overlayOpacity})`,
          }}
        />
      </div>

      {/* Label kecil di atas kotak B-roll pada 3 detik pertama */}
      <div
        style={{
          position: "absolute",
          top: 375,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: badgeOpacity,
        }}
      >
        <span className="rounded-full bg-emerald-400/95 text-slate-950 px-6 py-2 text-[26px] font-extrabold tracking-wide shadow-lg">
          ● DOKUMENTASI KELAS
        </span>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 1 — Hook (Teks masuk beriringan saat B-roll mulai nge-blur)    */
/* ------------------------------------------------------------------ */
const HookScene: React.FC<Pick<VideoProps, "hook">> = ({ hook }) => {
  const { fps } = useVideoConfig();
  // Mulai masuk di detik 3.8 tepat saat kotak B-roll melebar & nge-blur
  const startDelay = Math.round(3.8 * fps);

  return (
    <SceneFade>
      <SafeZone>
        <Pop delay={startDelay}>
          <div className="rounded-[38px] bg-slate-900/88 backdrop-blur-md border border-white/15 px-9 py-10 shadow-2xl">
            <h1 className="text-white font-extrabold text-[76px] leading-[1.1] tracking-tight">
              {hook.title}
            </h1>
          </div>
        </Pop>

        {hook.problems.map((text, i) => (
          <Pop key={i} delay={startDelay + 35 + i * 35}>
            <div className="flex items-center gap-5 rounded-3xl bg-rose-600/92 border border-rose-300/25 px-7 py-7 shadow-xl">
              <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-white text-rose-600 text-3xl font-extrabold">
                {i + 1}
              </div>
              <p className="text-white text-[40px] font-bold leading-snug">
                {text}
              </p>
            </div>
          </Pop>
        ))}
      </SafeZone>
    </SceneFade>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 2 — Demo Interactive Panel + Dynamic Zoom & Pan               */
/* ------------------------------------------------------------------ */
const MOCKUP_VIDEO_H = Math.round((CONTENT_W * 10) / 16);

const DemoScene: React.FC<Pick<VideoProps, "demo">> = ({ demo }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Dynamic Zoom & Pan halus pada video demo agar detail terbaca di layar HP
  const zoomScale = interpolate(
    frame,
    [0, 90, 260, 480, 720, durationInFrames - 30, durationInFrames],
    [1.0, 1.0, 1.38, 1.22, 1.42, 1.05, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const panX = interpolate(
    frame,
    [0, 90, 260, 480, 720, durationInFrames],
    [0, 0, -55, 65, -35, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const panY = interpolate(
    frame,
    [0, 90, 260, 480, 720, durationInFrames],
    [0, 0, 35, -30, 40, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <SceneFade>
      <SafeZone>
        <Pop>
          {/* Bingkai bergaya Interactive Flat Panel */}
          <div className="rounded-[32px] overflow-hidden bg-slate-900 border-[4px] border-slate-700/80 shadow-2xl">
            <div className="h-14 flex items-center justify-between px-5 bg-slate-800 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 text-[20px] font-bold tracking-wide">
                  INTERACTIVE PANEL MODE
                </span>
              </div>
              <span className="text-slate-400 text-[19px] font-medium truncate max-w-[380px]">
                {demo.url}
              </span>
            </div>

            <div
              style={{
                width: CONTENT_W,
                height: MOCKUP_VIDEO_H,
                overflow: "hidden",
                backgroundColor: "#020617",
              }}
            >
              <Video
                src={assetUrl("demo.mp4")}
                muted
                loop
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: `scale(${zoomScale}) translate(${panX}px, ${panY}px)`,
                  transformOrigin: "center center",
                }}
              />
            </div>
          </div>
        </Pop>

        <Pop delay={18}>
          <div className="rounded-[34px] bg-slate-900/92 border border-emerald-400/40 px-8 py-7 shadow-2xl">
            <span className="inline-block rounded-full bg-emerald-400 text-slate-950 text-[24px] font-extrabold px-5 py-1 mb-3">
              {demo.solutionLabel}
            </span>
            <h2 className="text-white text-[50px] font-extrabold leading-tight">
              {demo.solutionTitle}
            </h2>
            <p className="text-slate-200 text-[32px] leading-snug mt-2">
              {demo.solutionDescription}
            </p>
          </div>
        </Pop>
      </SafeZone>
    </SceneFade>
  );
};

/* ------------------------------------------------------------------ */
/* Scene 3 — Penutup / Diskusi Semua Guru                              */
/* ------------------------------------------------------------------ */
const OutroScene: React.FC<Pick<VideoProps, "outro">> = ({ outro }) => (
  <SafeZone>
    <Pop>
      <p className="text-amber-300 text-[36px] font-extrabold uppercase tracking-widest">
        {outro.heading}
      </p>
    </Pop>
    <Pop delay={10}>
      <div className="rounded-[38px] bg-slate-900/92 border border-white/15 px-9 py-12 shadow-2xl">
        <h2 className="text-white text-[64px] font-extrabold leading-[1.15]">
          {outro.question}
        </h2>
      </div>
    </Pop>
    <Pop delay={24}>
      <div className="self-start rounded-full bg-amber-400 px-9 py-5 shadow-xl">
        <span className="text-slate-950 text-[36px] font-extrabold">
          {outro.cta}
        </span>
      </div>
    </Pop>
  </SafeZone>
);

/* ------------------------------------------------------------------ */
/* Auto-Caption Gaya TikTok (Word-by-Word Highlight)                   */
/* ------------------------------------------------------------------ */
const TikTokCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const tokens = (captionsRaw as CaptionToken[]).filter(
    (t) => t.text && t.text.trim().length > 0
  );
  if (tokens.length === 0) return null;

  // Kelompokkan kata per 4 kata agar mudah dibaca sekejap mata
  const chunks: CaptionToken[][] = [];
  for (let i = 0; i < tokens.length; i += 4) {
    chunks.push(tokens.slice(i, i + 4));
  }

  const activeChunk = chunks.find(
    (group) =>
      currentMs >= group[0].startMs - 80 &&
      currentMs <= group[group.length - 1].endMs + 180
  );

  if (!activeChunk) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 330,
        left: SAFE.left,
        right: SAFE.right,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div className="inline-flex flex-wrap justify-center gap-x-3 gap-y-1 rounded-3xl bg-slate-950/88 border border-white/15 px-7 py-4 shadow-2xl">
        {activeChunk.map((token, idx) => {
          const isSpeaking =
            currentMs >= token.startMs && currentMs <= token.endMs + 60;
          return (
            <span
              key={idx}
              style={{
                color: isSpeaking ? "#FBBF24" : "#FFFFFF",
                transform: isSpeaking ? "scale(1.08)" : "scale(1)",
                transition: "transform 80ms ease-out",
                textShadow: "0 3px 12px rgba(0,0,0,0.9)",
              }}
              className="text-[44px] font-black tracking-tight leading-tight"
            >
              {token.text.trim()}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Komposisi Utama                                                     */
/* ------------------------------------------------------------------ */
export const MainComposition: React.FC<VideoProps> = ({
  timing,
  hook,
  demo,
  outro,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const hookF = Math.round(timing.hookSeconds * fps);
  const demoF = Math.round(timing.demoSeconds * fps);
  const outroF = Math.round(timing.outroSeconds * fps);

  const progressPct = Math.min(100, (frame / durationInFrames) * 100);

  return (
    <AbsoluteFill className="bg-slate-950">
      {/* Layer 1: B-roll dinamis (kotak tajam -> zoom penuh & nge-blur) */}
      <DynamicBrollLayer />

      {/* Layer 2: Adegan Konten */}
      <Sequence from={0} durationInFrames={hookF} name="Hook">
        <HookScene hook={hook} />
      </Sequence>

      <Sequence from={hookF} durationInFrames={demoF} name="Demo">
        <DemoScene demo={demo} />
      </Sequence>

      <Sequence from={hookF + demoF} durationInFrames={outroF} name="Outro">
        <OutroScene outro={outro} />
      </Sequence>

      {/* Layer 3: Auto-Caption Sinkron Suara */}
      <TikTokCaptions />

      {/* Layer 4: Progress Bar Atas */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          backgroundColor: "rgba(255,255,255,0.15)",
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: "100%",
            background: "linear-gradient(90deg, #34D399, #FBBF24)",
          }}
        />
      </div>

      {/* Audio Voiceover */}
      <Audio src={assetUrl("vo.wav")} />
    </AbsoluteFill>
  );
};