import React from "react";
import { Composition } from "remotion";
import "./index.css"; // file Tailwind (@import "tailwindcss";)
import { MainComposition, VideoProps } from "./Composition";
import data from "./data.json";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MasterTemplate"
      component={MainComposition}
      width={1080}
      height={1920}
      fps={FPS}
      // fallback; durasi sebenarnya dihitung dari data.json di bawah
      durationInFrames={40 * FPS}
      defaultProps={data as VideoProps}
      calculateMetadata={({ props }) => {
        const { hookSeconds, demoSeconds, outroSeconds } = props.timing;
        return {
          durationInFrames: Math.round(
            (hookSeconds + demoSeconds + outroSeconds) * FPS
          ),
        };
      }}
    />
  );
};