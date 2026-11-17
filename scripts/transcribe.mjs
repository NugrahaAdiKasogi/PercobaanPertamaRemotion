import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const whisperPkg = require('@remotion/install-whisper-cpp');
const {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
  toCaptions,
} = whisperPkg.default ?? whisperPkg;

const audioPath = path.resolve('public/vo.wav');
const whisperPath = path.join(process.cwd(), 'whisper.cpp');
const version = '1.5.5';
const model = 'small';

await installWhisperCpp({ to: whisperPath, version });
await downloadWhisperModel({ model, folder: whisperPath });

const whisperCppOutput = await transcribe({
  model,
  whisperPath,
  whisperCppVersion: version,
  inputPath: audioPath,
  tokenLevelTimestamps: true,
  language: 'id',
});

const { captions } = toCaptions({ whisperCppOutput });

// Gabungkan potongan suku kata & tanda baca menjadi kata utuh
const mergedWords = [];
for (const token of captions) {
  if (!token.text || !token.text.trim()) continue;
  const startsWithSpace = /^\s/.test(token.text);

  if (mergedWords.length === 0 || startsWithSpace) {
    mergedWords.push({
      text: token.text.trim(),
      startMs: token.startMs,
      endMs: token.endMs,
    });
  } else {
    const prev = mergedWords[mergedWords.length - 1];
    prev.text += token.text.trim();
    prev.endMs = token.endMs;
  }
}

fs.writeFileSync('src/captions.json', JSON.stringify(mergedWords, null, 2));
console.log(`Selesai! ${mergedWords.length} kata utuh tersimpan di src/captions.json`);