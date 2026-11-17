import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import ffmpegPath from "ffmpeg-static";

if (!fs.existsSync("public")) fs.mkdirSync("public");

// 1. Gabung & blur semua video di folder "clips" -> public/broll.mp4
const clips = fs
  .readdirSync("clips")
  .filter((f) => /\.(mp4|mov|mkv)$/i.test(f))
  .sort()
  .map((f) => path.join("clips", f));

if (clips.length > 0) {
  const inputs = clips.flatMap((file) => ["-i", file]);
  const filters = clips.map(
    (_, i) =>
      `[${i}:v]fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,format=yuv420p[v${i}]`,
  );
  const concatInputs = clips.map((_, i) => `[v${i}]`).join("");
  const filterComplex = `${filters.join(";")};${concatInputs}concat=n=${clips.length}:v=1:a=0,gblur=sigma=20[outv]`;

  execFileSync(
    ffmpegPath,
    [
      ...inputs,
      "-filter_complex",
      filterComplex,
      "-map",
      "[outv]",
      "-c:v",
      "libx264",
      "-crf",
      "23",
      "-an",
      "-y",
      "public/broll.mp4",
    ],
    { stdio: "inherit" },
  );
  console.log("Berhasil membuat public/broll.mp4");
}

// 2. Ubah file .mp3 ElevenLabs di folder utama -> public/vo.wav
const mp3File = fs.readdirSync(".").find((f) => /\.mp3$/i.test(f));
if (mp3File) {
  execFileSync(
    ffmpegPath,
    ["-i", mp3File, "-ar", "16000", "-ac", "1", "-y", "public/vo.wav"],
    { stdio: "inherit" },
  );
  console.log("Berhasil membuat public/vo.wav");
}
