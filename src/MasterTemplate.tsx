import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { EpisodeProps } from './schema';
import { HookScene } from './scenes/HookScene';
import { DemoScene } from './scenes/DemoScene';
import { ClosingScene } from './scenes/ClosingScene';
import { getMediaSrc } from './media';

export const MasterTemplate: React.FC<EpisodeProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const currentSec = frame / fps;

  const voUrl = props.assets.voiceover
    ? getMediaSrc(`${props.episodeDir}/${props.assets.voiceover}`)
    : '';
  const bgmUrl = props.assets.bgm ? getMediaSrc(props.assets.bgm) : '';
  const sfxPopUrl = props.assets.sfxPop ? getMediaSrc(props.assets.sfxPop) : '';

  const demoStartFrame = Math.min(
    durationInFrames - 2,
    Math.max(1, Math.round(props.cues.demoStartSec * fps))
  );
  const questionStartFrame = Math.min(
    durationInFrames - 1,
    Math.max(demoStartFrame + 1, Math.round(props.cues.questionStartSec * fps))
  );

  const hookDuration = demoStartFrame;
  const demoDuration = questionStartFrame - demoStartFrame;
  const closingDuration = durationInFrames - questionStartFrame;

  const activeCaption = props.resolvedCaptions.find((item) => {
    const startSec =
      typeof item.start === 'number'
        ? item.start
        : typeof item.startMs === 'number'
          ? item.startMs / 1000
          : -1;
    const endSec =
      typeof item.end === 'number'
        ? item.end
        : typeof item.endMs === 'number'
          ? item.endMs / 1000
          : -1;
    return currentSec >= startSec && currentSec <= endSec;
  });

  const captionText = activeCaption?.text ?? activeCaption?.word ?? '';

  return (
    <AbsoluteFill style={{ backgroundColor: '#090D16', fontFamily: 'sans-serif' }}>
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

      {captionText ? (
        <div
          style={{
            position: 'absolute',
            bottom: 510,
            left: 64,
            right: 120,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(9, 13, 22, 0.88)',
              border: `2px solid ${props.theme.accentColor}`,
              color: '#FFFFFF',
              padding: '16px 28px',
              borderRadius: 20,
              fontSize: 40,
              fontWeight: 800,
              textAlign: 'center',
              lineHeight: 1.25,
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            }}
          >
            {captionText}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};