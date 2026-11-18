import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const arg1 = process.argv[2];
const arg2 = process.argv[3];

if (!arg1) {
  console.error("Penggunaan:");
  console.error("  node scripts/transcribe.mjs public/episodes/<nama-episode>");
  console.error(
    "  node scripts/transcribe.mjs <path-audio> <path-output-captions.json>",
  );
  process.exit(1);
}

let audioPath = "";
let outputJsonPath = "";

const resolvedArg1 = path.resolve(arg1);
if (fs.existsSync(resolvedArg1) && fs.statSync(resolvedArg1).isDirectory()) {
  // Mode folder episode: cari vo.mp3 atau vo.wav otomatis
  const candidates = ["vo.mp3", "vo.wav", "voiceover.mp3", "voiceover.wav"];
  const found = candidates
    .map((f) => path.join(resolvedArg1, f))
    .find((p) => fs.existsSync(p));
  if (!found) {
    console.error(
      `File audio (vo.mp3 / vo.wav) tidak ditemukan di ${resolvedArg1}`,
    );
    process.exit(1);
  }
  audioPath = found;
  outputJsonPath = path.join(resolvedArg1, "captions.json");
} else {
  audioPath = resolvedArg1;
  outputJsonPath = arg2
    ? path.resolve(arg2)
    : path.join(path.dirname(resolvedArg1), "captions.json");
}

if (!fs.existsSync(audioPath)) {
  console.error(`File audio tidak ditemukan: ${audioPath}`);
  process.exit(1);
}

const tempDir = path.dirname(outputJsonPath);
const baseName = path.basename(audioPath, path.extname(audioPath));
const whisperRawJson = path.join(tempDir, `${baseName}.json`);

console.log(`Mentranskripsi ${audioPath} -> ${outputJsonPath}...`);

// Jalankan Python Whisper CLI dengan word_timestamps
execFileSync(
  "whisper",
  [
    audioPath,
    "--language",
    "Indonesian",
    "--model",
    "small",
    "--word_timestamps",
    "True",
    "--output_format",
    "json",
    "--output_dir",
    tempDir,
  ],
  { stdio: "inherit" },
);

// Normalisasi output Whisper menjadi [{ word, start, end }]
const raw = JSON.parse(fs.readFileSync(whisperRawJson, "utf-8"));
const normalized = [];

for (const seg of raw.segments || []) {
  if (Array.isArray(seg.words) && seg.words.length > 0) {
    for (const w of seg.words) {
      normalized.push({
        word: String(w.word || "").trim(),
        start: Number((w.start ?? 0).toFixed(2)),
        end: Number((w.end ?? 0).toFixed(2)),
      });
    }
  } else if (seg.text) {
    normalized.push({
      word: String(seg.text).trim(),
      start: Number((seg.start ?? 0).toFixed(2)),
      end: Number((seg.end ?? 0).toFixed(2)),
    });
  }
}

fs.writeFileSync(outputJsonPath, JSON.stringify(normalized, null, 2), "utf-8");
if (whisperRawJson !== outputJsonPath && fs.existsSync(whisperRawJson)) {
  fs.unlinkSync(whisperRawJson);
}

console.log(`Captions selesai (${normalized.length} token): ${outputJsonPath}`);
