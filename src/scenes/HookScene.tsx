import React from 'react';
import {
  AbsoluteFill,
  Loop,
  OffthreadVideo,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { EpisodeProps } from '../schema';
import { getMediaSrc } from '../media';

export const HookScene: React.FC<{ props: EpisodeProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const brollUrl = props.assets.broll
    ? getMediaSrc(`${props.episodeDir}/${props.assets.broll}`)
    : '';

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 170 },
  });

  const titleTranslateY = interpolate(titleSpring, [0, 1], [36, 0]);
  const titleOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#090D16' }}>
      {brollUrl ? (
        <Loop durationInFrames={props.brollDurationInFrames}>
          <OffthreadVideo
            src={brollUrl}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
          />
        </Loop>
      ) : null}

      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(9,13,22,0.85) 0%, rgba(9,13,22,0.35) 45%, rgba(9,13,22,0.92) 100%)',
        }}
      />

      <AbsoluteFill
        style={{
          paddingTop: 230,
          paddingRight: 120,
          paddingLeft: 64,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#F8FAFC',
              padding: '8px 18px',
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
              color: '#090D16',
              padding: '8px 18px',
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
            color: '#FFFFFF',
            fontSize: 64,
            lineHeight: 1.15,
            fontWeight: 900,
            opacity: titleOpacity,
            transform: `translateY(${titleTranslateY}px)`,
            textShadow: '0 6px 24px rgba(0,0,0,0.6)',
          }}
        >
          {props.text.hookTitle}
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};