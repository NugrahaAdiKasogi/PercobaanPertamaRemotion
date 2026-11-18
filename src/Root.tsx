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
        const cleanDir = props.episodeDir
          .replace(/^public\//, "")
          .replace(/\/$/, "");

        let audioDurationSec = 20;
        if (props.assets.voiceover) {
          try {
            const url = staticFile(`${cleanDir}/${props.assets.voiceover}`);
            audioDurationSec = await getAudioDurationInSeconds(url);
          } catch (e) {
            console.warn(
              "Gagal membaca durasi audio, memakai fallback 20s:",
              e,
            );
          }
        }

        let brollDurationSec = 10;
        if (props.assets.broll) {
          try {
            const url = staticFile(`${cleanDir}/${props.assets.broll}`);
            const meta = await getVideoMetadata(url);
            brollDurationSec = meta.durationInSeconds;
          } catch (e) {
            console.warn(
              "Gagal membaca durasi broll.mp4, memakai fallback 10s:",
              e,
            );
          }
        }

        let demoDurationSec = 20;
        if (props.assets.demo) {
          try {
            const url = staticFile(`${cleanDir}/${props.assets.demo}`);
            const meta = await getVideoMetadata(url);
            demoDurationSec = meta.durationInSeconds;
          } catch (e) {
            console.warn(
              "Gagal membaca durasi demo.mp4, memakai fallback 20s:",
              e,
            );
          }
        }

        let captions = [];
        if (props.assets.captions) {
          try {
            const url = staticFile(`${cleanDir}/${props.assets.captions}`);
            const res = await fetch(url);
            if (res.ok) {
              captions = await res.json();
            }
          } catch {
            captions = [];
          }
        }

        const totalDurationSec = audioDurationSec + 0.5;

        return {
          durationInFrames: Math.max(30, Math.ceil(totalDurationSec * FPS)),
          props: {
            ...props,
            episodeDir: cleanDir,
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
