import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const argDir = process.argv[2] || "public/episodes/template";
const episodeDir = path.resolve(
  argDir.startsWith("public") ? argDir : path.join("public", argDir),
);

if (!fs.existsSync(episodeDir)) {
  console.error(`Folder episode tidak ditemukan: ${episodeDir}`);
  process.exit(1);
}

// Cari klip sumber di <episodeDir>/raw, atau fallback ke folder raw-broll/ di root
const localRawDir = path.join(episodeDir, "raw");
const globalRawDir = path.resolve("raw-broll");
const sourceDir = fs.existsSync(localRawDir) ? localRawDir : globalRawDir;

if (!fs.existsSync(sourceDir)) {
  console.error(
    `Folder klip mentah tidak ditemukan. Buat folder ${localRawDir} dan taruh klip MP4 di dalamnya.`,
  );
  process.exit(1);
}

const clips = fs
  .readdirSync(sourceDir)
  .filter((f) => /\.(mp4|mov|mkv|webm)$/i.test(f))
  .sort()
  .map((f) => path.join(sourceDir, f));

if (clips.length === 0) {
  console.error(`Tidak ada file video ditemukan di ${sourceDir}`);
  process.exit(1);
}

const outputBroll = path.join(episodeDir, "broll.mp4");
const listFile = path.join(episodeDir, ".concat-list.txt");

// Buat daftar concat FFmpeg
const listContent = clips
  .map((c) => `file '${c.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`)
  .join("\n");
fs.writeFileSync(listFile, listContent, "utf-8");

console.log(`Merakit ${clips.length} klip menjadi ${outputBroll}...`);

try {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listFile,
      "-vf",
      "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30",
      "-an",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-crf",
      "22",
      outputBroll,
    ],
    { stdio: "inherit" },
  );
  console.log(`Selesai! Tersimpan di: ${outputBroll}`);
} finally {
  if (fs.existsSync(listFile)) fs.unlinkSync(listFile);
}
