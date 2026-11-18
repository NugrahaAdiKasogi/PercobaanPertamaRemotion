import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EpisodeProps } from "./schema";
import { HookScene } from "./scenes/HookScene";
import { DemoScene } from "./scenes/DemoScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { getMediaSrc } from "./media";

interface NormalizedWord {
  text: string;
  startSec: number;
  endSec: number;
}

export const MasterTemplate: React.FC<EpisodeProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentSec = frame / fps;

  const voUrl = props.assets.voiceover
    ? getMediaSrc(`${props.episodeDir}/${props.assets.voiceover}`)
    : "";
  const bgmUrl = props.assets.bgm ? getMediaSrc(props.assets.bgm) : "";
  const sfxPopUrl = props.assets.sfxPop ? getMediaSrc(props.assets.sfxPop) : "";

  const demoStartFrame = Math.min(
    durationInFrames - 2,
    Math.max(1, Math.round(props.cues.demoStartSec * fps)),
  );
  const questionStartFrame = Math.min(
    durationInFrames - 1,
    Math.max(demoStartFrame + 1, Math.round(props.cues.questionStartSec * fps)),
  );

  const hookDuration = demoStartFrame;
  const demoDuration = questionStartFrame - demoStartFrame;
  const closingDuration = durationInFrames - questionStartFrame;

  // Kelompokkan captions menjadi chunk 4 kata dengan penanda kata aktif
  const captionChunks = useMemo(() => {
    const words: NormalizedWord[] = (props.resolvedCaptions || [])
      .map((item) => ({
        text: (item.word ?? item.text ?? "").trim(),
        startSec:
          typeof item.start === "number"
            ? item.start
            : typeof item.startMs === "number"
              ? item.startMs / 1000
              : 0,
        endSec:
          typeof item.end === "number"
            ? item.end
            : typeof item.endMs === "number"
              ? item.endMs / 1000
              : 0,
      }))
      .filter((w) => w.text.length > 0);

    const chunks: NormalizedWord[][] = [];
    for (let i = 0; i < words.length; i += 4) {
      chunks.push(words.slice(i, i + 4));
    }
    return chunks;
  }, [props.resolvedCaptions]);

  const activeChunk = captionChunks.find((chunk) => {
    const first = chunk[0];
    const last = chunk[chunk.length - 1];
    return currentSec >= first.startSec && currentSec <= last.endSec + 0.12;
  });

  const progressPercent = Math.min(
    100,
    Math.max(0, (frame / Math.max(1, durationInFrames - 1)) * 100),
  );

  return (
    <AbsoluteFill
      style={{ backgroundColor: "#090D16", fontFamily: "sans-serif" }}
    >
      {voUrl ? <Audio src={voUrl} /> : null}
      {bgmUrl ? <Audio src={bgmUrl} loop volume={0.1} /> : null}

      {sfxPopUrl ? (
        <>
          <Sequence from={demoStartFrame} durationInFrames={30}>
            <Audio src={sfxPopUrl} volume={0.4} />
          </Sequence>
          <Sequence from={questionStartFrame} durationInFrames={30}>
            <Audio src={sfxPopUrl} volume={0.4} />
          </Sequence>
        </>
      ) : null}

      <Sequence from={0} durationInFrames={hookDuration}>
        <HookScene props={props} />
      </Sequence>

      <Sequence from={demoStartFrame} durationInFrames={demoDuration}>
        <DemoScene props={props} />
      </Sequence>

      <Sequence from={questionStartFrame} durationInFrames={closingDuration}>
        <ClosingScene props={props} />
      </Sequence>

      {/* Progress Bar Atas (di dalam area aman atas TikTok) */}
      {props.options?.showProgressBar !== false ? (
        <div
          style={{
            position: "absolute",
            top: 256,
            left: 64,
            right: 130,
            height: 8,
            borderRadius: 999,
            backgroundColor: "rgba(255, 255, 255, 0.16)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              backgroundColor: props.theme.accentColor,
              borderRadius: 999,
            }}
          />
        </div>
      ) : null}

      {/* Layer Caption dengan Active-Word Highlight (Safe Zone: right 130px, bottom 510px) */}
      {activeChunk ? (
        <div
          style={{
            position: "absolute",
            bottom: 510,
            left: 64,
            right: 130,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(9, 13, 22, 0.9)",
              border: `2px solid ${props.theme.accentColor}`,
              padding: "16px 26px",
              borderRadius: 20,
              fontSize: 40,
              fontWeight: 800,
              textAlign: "center",
              lineHeight: 1.28,
              boxShadow: "0 10px 30px rgba(0,0,0,0.65)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0 10px",
            }}
          >
            {activeChunk.map((w, idx) => {
              const isCurrentWord =
                currentSec >= w.startSec && currentSec <= w.endSec + 0.05;
              return (
                <span
                  key={idx}
                  style={{
                    color: isCurrentWord ? props.theme.accentColor : "#FFFFFF",
                    transform: isCurrentWord ? "scale(1.06)" : "scale(1)",
                    display: "inline-block",
                  }}
                >
                  {w.text}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
