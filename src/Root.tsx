import React from "react";
import { Composition, staticFile } from "remotion";
import {
  getAudioDurationInSeconds,
  getVideoMetadata,
} from "@remotion/media-utils";
import { MasterTemplate } from "./MasterTemplate";
import { EpisodeSchema, EpisodeProps } from "./schema";
import defaultData from "../public/episodes/template/data.json";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MasterTemplate"
      component={MasterTemplate}
      width={1080}
      height={1920}
      fps={FPS}
      schema={EpisodeSchema}
      defaultProps={defaultData as EpisodeProps}
      calculateMetadata={async ({ props }) => {
        const voUrl = staticFile(
          `${props.episodeDir}/${props.assets.voiceover}`,
        );
        const brollUrl = staticFile(
          `${props.episodeDir}/${props.assets.broll}`,
        );
        const demoUrl = staticFile(`${props.episodeDir}/${props.assets.demo}`);
        const captionsUrl = staticFile(
          `${props.episodeDir}/${props.assets.captions}`,
        );

        let audioDurationSec = 20;
        if (props.assets.voiceover) {
          try {
            const voUrl = staticFile(
              `${props.episodeDir}/${props.assets.voiceover}`,
            );
            audioDurationSec = await getAudioDurationInSeconds(voUrl);
          } catch (e) {
            console.warn("Gagal membaca durasi audio:", e);
          }
        }

        let brollDurationSec = 10;
        if (props.assets.broll) {
          try {
            const brollUrl = staticFile(
              `${props.episodeDir}/${props.assets.broll}`,
            );
            const brollMeta = await getVideoMetadata(brollUrl);
            brollDurationSec = brollMeta.durationInSeconds;
          } catch (e) {
            console.warn("Gagal membaca durasi broll.mp4:", e);
          }
        }

        let demoDurationSec = 20;
        if (props.assets.demo) {
          try {
            const demoUrl = staticFile(
              `${props.episodeDir}/${props.assets.demo}`,
            );
            const demoMeta = await getVideoMetadata(demoUrl);
            demoDurationSec = demoMeta.durationInSeconds;
          } catch (e) {
            console.warn("Gagal membaca durasi demo.mp4:", e);
          }
        }
        let captions = [];
        try {
          const res = await fetch(captionsUrl);
          if (res.ok) {
            captions = await res.json();
          }
        } catch {
          captions = [];
        }

        const totalDurationSec = audioDurationSec + 0.5;

        return {
          durationInFrames: Math.max(30, Math.ceil(totalDurationSec * FPS)),
          props: {
            ...props,
            resolvedCaptions: captions,
            brollDurationInFrames: Math.max(
              1,
              Math.floor(brollDurationSec * FPS),
            ),
            demoDurationInFrames: Math.max(
              1,
              Math.floor(demoDurationSec * FPS),
            ),
          },
        };
      }}
    />
  );
};
