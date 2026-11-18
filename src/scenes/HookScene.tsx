import React from "react";
import {
  AbsoluteFill,
  Loop,
  OffthreadVideo,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EpisodeProps } from "../schema";
import { getMediaSrc } from "../media";

export const HookScene: React.FC<{ props: EpisodeProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const brollUrl = props.assets.broll
    ? getMediaSrc(`${props.episodeDir}/${props.assets.broll}`)
    : "";

  // B-roll melebar/zoom-out di 20 frame awal lalu blur halus agar teks kontras
  const brollScale = interpolate(frame, [0, 25], [1.14, 1.02], {
    extrapolateRight: "clamp",
  });
  const brollBlur = interpolate(frame, [10, 28], [0, 6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 170 },
  });

  const painPoints = props.text.painPoints ?? [];

  return (
    <AbsoluteFill style={{ backgroundColor: "#090D16" }}>
      {brollUrl ? (
        <Loop durationInFrames={props.brollDurationInFrames}>
          <OffthreadVideo
            src={brollUrl}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.55,
              transform: `scale(${brollScale})`,
              filter: `blur(${brollBlur}px)`,
            }}
          />
        </Loop>
      ) : null}

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(9,13,22,0.88) 0%, rgba(9,13,22,0.55) 45%, rgba(9,13,22,0.95) 100%)",
        }}
      />

      {/* Safe Zone TikTok: atas 288px, kanan 130px, bawah > 510px */}
      <AbsoluteFill
        style={{
          paddingTop: 288,
          paddingRight: 130,
          paddingLeft: 64,
          paddingBottom: 640,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Bagian Atas: Badges + Judul Hook */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#F8FAFC",
                padding: "8px 18px",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 1.2,
              }}
            >
              {props.text.topBadge}
            </span>
            <span
              style={{
                backgroundColor: props.theme.accentColor,
                color: "#090D16",
                padding: "8px 18px",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 1,
              }}
            >
              {props.text.hookBadge}
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: 60,
              lineHeight: 1.15,
              fontWeight: 900,
              opacity: interpolate(frame, [0, 10], [0, 1], {
                extrapolateRight: "clamp",
              }),
              transform: `translateY(${interpolate(titleSpring, [0, 1], [32, 0])}px)`,
              textShadow: "0 6px 24px rgba(0,0,0,0.65)",
            }}
          >
            {props.text.hookTitle}
          </h1>
        </div>

        {/* Bagian Tengah-Bawah: 2 Poin Masalah + Kartu Pengantar Solusi */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {painPoints.slice(0, 2).map((point, idx) => {
            const itemSpring = spring({
              frame: Math.max(0, frame - (12 + idx * 8)),
              fps,
              config: { damping: 15, stiffness: 150 },
            });
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(248, 113, 113, 0.45)",
                  borderLeft: "6px solid #F87171",
                  borderRadius: 16,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: interpolate(itemSpring, [0, 1], [0, 1]),
                  transform: `translateX(${interpolate(itemSpring, [0, 1], [-24, 0])}px)`,
                }}
              >
                <span
                  style={{ color: "#F87171", fontSize: 26, fontWeight: 900 }}
                >
                  ✕
                </span>
                <span
                  style={{
                    color: "#F1F5F9",
                    fontSize: 28,
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {point}
                </span>
              </div>
            );
          })}

          {props.text.solutionTitle ? (
            <div
              style={{
                marginTop: 4,
                backgroundColor: "rgba(15, 23, 42, 0.92)",
                border: `2px solid ${props.theme.accentColor}`,
                borderRadius: 18,
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: interpolate(frame, [26, 36], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: props.theme.accentColor,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  SOLUSI DI KELAS
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginTop: 2,
                  }}
                >
                  {props.text.solutionTitle}
                </div>
              </div>
              <span
                style={{
                  fontSize: 34,
                  color: props.theme.accentColor,
                  fontWeight: 900,
                }}
              >
                →
              </span>
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
