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

export const ClosingScene: React.FC<{ props: EpisodeProps }> = ({ props }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const brollUrl = props.assets.broll
    ? getMediaSrc(`${props.episodeDir}/${props.assets.broll}`)
    : '';

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 13, stiffness: 150 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#090D16' }}>
      {brollUrl ? (
        <Loop durationInFrames={props.brollDurationInFrames}>
          <OffthreadVideo
            src={brollUrl}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
          />
        </Loop>
      ) : null}

      <AbsoluteFill
        style={{
          paddingTop: 230,
          paddingRight: 120,
          paddingLeft: 64,
          paddingBottom: 620,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            padding: '44px 36px',
            borderRadius: 32,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            border: `3px solid ${props.theme.accentColor}`,
            boxShadow: '0 24px 60px rgba(0,0,0,0.75)',
            transform: `translateY(${interpolate(cardSpring, [0, 1], [40, 0])}px) scale(${interpolate(cardSpring, [0, 1], [0.95, 1])})`,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              backgroundColor: props.theme.accentColor,
              color: '#090D16',
              fontSize: 22,
              fontWeight: 800,
              padding: '6px 16px',
              borderRadius: 999,
              marginBottom: 20,
            }}
          >
            DISKUSI YUK
          </div>
          <p
            style={{
              margin: 0,
              color: '#FFFFFF',
              fontSize: 48,
              lineHeight: 1.28,
              fontWeight: 800,
            }}
          >
            {props.text.closingQuestion}
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};