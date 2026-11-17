import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig((currentConfiguration) => {
  const config = enableTailwind(currentConfiguration);
  return {
    ...config,
    cache: false,
    output: {
      ...config.output,
      hashFunction: "sha256",
    },
  };
});