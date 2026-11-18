import React from 'react';
import {
  AbsoluteFill,
  Freeze,
  OffthreadVideo,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { EpisodeProps } from '../schema';
import { getMediaSrc } from '../media';

export const DemoScene: React.FC<{ props: EpisodeProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const demoUrl = props.assets.demo
    ? getMediaSrc(`${props.episodeDir}/${props.assets.demo}`)
    : '';

  const freezeAt = Math.max(0, props.demoDurationInFrames - 2);
  const isFrozen = frame >= freezeAt;

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 140 },
  });

  const freezeZoom = isFrozen
    ? interpolate(frame, [freezeAt, freezeAt + 120], [1, 1.05], {
        extrapolateRight: 'clamp',
      })
    : 1;

  const dotOpacity = interpolate(Math.sin(frame / 6), [-1, 1], [0.35, 1]);
  const solutionPoints = props.text.solutionPoints ?? [];

  const videoElement = demoUrl ? (
    <OffthreadVideo
      src={demoUrl}
      muted
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        transform: `scale(${freezeZoom})`,
      }}
    />
  ) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0B1120' }}>
      {/* Safe Zone TikTok: atas 288px, kanan 130px */}
      <AbsoluteFill
        style={{
          paddingTop: 288,
          paddingRight: 130,
          paddingLeft: 64,
          paddingBottom: 630,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        {/* Window Browser 16:9 Presisi (Tidak Terpotong) */}
        <div
          style={{
            width: '100%',
            borderRadius: 24,
            overflow: 'hidden',
            border: `2px solid ${props.theme.accentColor}`,
            backgroundColor: '#020617',
            boxShadow: '0 20px 50px rgba(0,0,0,0.65)',
            display: 'flex',
            flexDirection: 'column',
            transform: `scale(${interpolate(cardSpring, [0, 1], [0.94, 1])})`,
          }}
        >
          {/* Header Panel */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: 13,
                height: 13,
                borderRadius: '50%',
                backgroundColor: props.theme.accentColor,
                opacity: dotOpacity,
              }}
            />
            <span
              style={{
                color: '#E2E8F0',
                fontSize: 21,
                fontWeight: 700,
                letterSpacing: 1.1,
              }}
            >
              {props.text.panelHeader}
            </span>
          </div>

          {/* Kontainer Video 16:9 */}
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              backgroundColor: '#020617',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {videoElement ? (
              isFrozen ? (
                <Freeze frame={freezeAt}>{videoElement}</Freeze>
              ) : (
                videoElement
              )
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                [ Demo Aplikasi 16:9 ]
              </div>
            )}
          </div>
        </div>

        {/* Kartu Sorotan Solusi di Ruang Bawah Panel */}
        {(props.text.solutionTitle || solutionPoints.length > 0) && (
          <div
            style={{
              flex: 1,
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderLeft: `6px solid ${props.theme.accentColor}`,
              borderRadius: 22,
              padding: '22px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 14,
              opacity: interpolate(frame, [8, 20], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            {props.text.solutionTitle ? (
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: props.theme.accentColor,
                  letterSpacing: 0.4,
                }}
              >
                {props.text.solutionTitle}
              </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {solutionPoints.map((item, idx) => {
                const ptSpring = spring({
                  frame: Math.max(0, frame - (14 + idx * 10)),
                  fps,
                  config: { damping: 16, stiffness: 150 },
                });
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      opacity: interpolate(ptSpring, [0, 1], [0, 1]),
                      transform: `translateY(${interpolate(ptSpring, [0, 1], [14, 0])}px)`,
                    }}
                  >
                    <span
                      style={{
                        color: props.theme.accentColor,
                        fontSize: 26,
                        fontWeight: 900,
                        lineHeight: 1.25,
                      }}
                    >
                      ✓
                    </span>
                    <span
                      style={{
                        color: '#F1F5F9',
                        fontSize: 27,
                        fontWeight: 600,
                        lineHeight: 1.32,
                      }}
                    >
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};