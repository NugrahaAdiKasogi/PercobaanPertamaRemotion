import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Video,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type VideoProps = {
  timing: {
    hookSeconds: number;
    demoSeconds: number;
    outroSeconds: number;
  };
  hook: {
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
  top: Math.round(H * 0.15),
  bottom: Math.round(H * 0.25),
  right: Math.round(W * 0.12),
  left: 60,
};
const CONTENT_W = W - SAFE.left - SAFE.right;

const SafeZone: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="absolute flex flex-col justify-center gap-8"
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
    config: { damping: 9, stiffness: 140, mass: 0.8 },
  });
  const opacity = interpolate(p, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${(1 - p) * 90}px) scale(${0.7 + 0.3 * p})`,
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
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const HookScene: React.FC<Pick<VideoProps, "hook">> = ({ hook }) => (
  <SceneFade>
    <SafeZone>
      <Pop>
        <div className="rounded-[40px] bg-slate-900/85 border border-white/15 px-10 py-12 shadow-2xl">
          <h1 className="text-white font-extrabold text-[84px] leading-[1.08] tracking-tight">
            {hook.title}
          </h1>
        </div>
      </Pop>

      {hook.problems.map((text, i) => (
        <Pop key={i} delay={18 + i * 12}>
          <div className="flex items-center gap-6 rounded-3xl bg-rose-600/90 px-8 py-8 shadow-xl">
            <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-white text-rose-600 text-4xl font-extrabold">
              {i + 1}
            </div>
            <p className="text-white text-[44px] font-bold leading-tight">
              {text}
            </p>
          </div>
        </Pop>
      ))}
    </SafeZone>
  </SceneFade>
);

const MOCKUP_VIDEO_H = Math.round((CONTENT_W * 10) / 16);

const DemoScene: React.FC<Pick<VideoProps, "demo">> = ({ demo }) => (
  <SceneFade>
    <SafeZone>
      <Pop>
        <div className="rounded-3xl overflow-hidden bg-slate-900 border border-white/15 shadow-2xl">
          <div className="h-14 flex items-center gap-3 px-5 bg-slate-800">
            <span className="w-4 h-4 rounded-full bg-red-400" />
            <span className="w-4 h-4 rounded-full bg-yellow-400" />
            <span className="w-4 h-4 rounded-full bg-green-400" />
            <div className="ml-4 flex-1 h-8 rounded-full bg-slate-900 px-5 flex items-center">
              <span className="text-slate-300 text-[20px] truncate">
                {demo.url}
              </span>
            </div>
          </div>
          <div style={{ width: CONTENT_W, height: MOCKUP_VIDEO_H }}>
            <Video
              src={assetUrl("demo.mp4")}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      </Pop>

      <Pop delay={15}>
        <div className="rounded-[36px] bg-slate-900/90 border border-emerald-400/40 px-9 py-8 shadow-2xl">
          <span className="inline-block rounded-full bg-emerald-400 text-slate-950 text-[26px] font-extrabold px-5 py-1 mb-4">
            {demo.solutionLabel}
          </span>
          <h2 className="text-white text-[54px] font-extrabold leading-tight">
            {demo.solutionTitle}
          </h2>
          <p className="text-slate-200 text-[34px] leading-snug mt-3">
            {demo.solutionDescription}
          </p>
        </div>
      </Pop>
    </SafeZone>
  </SceneFade>
);

const OutroScene: React.FC<Pick<VideoProps, "outro">> = ({ outro }) => (
  <SafeZone>
    <Pop>
      <p className="text-amber-300 text-[40px] font-bold uppercase tracking-widest">
        {outro.heading}
      </p>
    </Pop>
    <Pop delay={8}>
      <div className="rounded-[40px] bg-slate-900/90 border border-white/15 px-10 py-14 shadow-2xl">
        <h2 className="text-white text-[72px] font-extrabold leading-[1.12]">
          {outro.question}
        </h2>
      </div>
    </Pop>
    <Pop delay={22}>
      <div className="self-start rounded-full bg-amber-400 px-10 py-5 shadow-xl">
        <span className="text-slate-950 text-[40px] font-extrabold">
          {outro.cta}
        </span>
      </div>
    </Pop>
  </SafeZone>
);

export const MainComposition: React.FC<VideoProps> = ({
  timing,
  hook,
  demo,
  outro,
}) => {
  const { fps } = useVideoConfig();
  const hookF = Math.round(timing.hookSeconds * fps);
  const demoF = Math.round(timing.demoSeconds * fps);
  const outroF = Math.round(timing.outroSeconds * fps);

  return (
    <AbsoluteFill className="bg-slate-950">
      <Video
        src={assetUrl("broll.mp4")}
        muted
        loop
        style={{ width: W, height: H, objectFit: "cover" }}
      />
      <AbsoluteFill className="bg-slate-950/50" />

      <Sequence from={0} durationInFrames={hookF} name="Hook">
        <HookScene hook={hook} />
      </Sequence>

      <Sequence from={hookF} durationInFrames={demoF} name="Demo">
        <DemoScene demo={demo} />
      </Sequence>

      <Sequence from={hookF + demoF} durationInFrames={outroF} name="Outro">
        <OutroScene outro={outro} />
      </Sequence>

      <Audio src={assetUrl("vo.wav")} />
    </AbsoluteFill>
  );
};
