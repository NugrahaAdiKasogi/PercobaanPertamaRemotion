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
    ? interpolate(frame, [freezeAt, freezeAt + 120], [1, 1.08], {
        extrapolateRight: 'clamp',
      })
    : 1;

  const dotOpacity = interpolate(Math.sin(frame / 6), [-1, 1], [0.35, 1]);

  const videoElement = demoUrl ? (
    <OffthreadVideo
      src={demoUrl}
      muted
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${freezeZoom})`,
      }}
    />
  ) : null;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0B1120' }}>
      <AbsoluteFill
        style={{
          paddingTop: 230,
          paddingRight: 120,
          paddingLeft: 64,
          paddingBottom: 620,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            borderRadius: 28,
            overflow: 'hidden',
            border: `2px solid ${props.theme.accentColor}`,
            backgroundColor: '#020617',
            boxShadow: '0 20px 50px rgba(0,0,0,0.65)',
            display: 'flex',
            flexDirection: 'column',
            transform: `scale(${interpolate(cardSpring, [0, 1], [0.94, 1])})`,
          }}
        >
          <div
            style={{
              padding: '16px 24px',
              backgroundColor: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: props.theme.accentColor,
                opacity: dotOpacity,
              }}
            />
            <span
              style={{
                color: '#E2E8F0',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 1.2,
              }}
            >
              {props.text.panelHeader}
            </span>
          </div>

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
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
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                [ Area Video Demo ]
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};