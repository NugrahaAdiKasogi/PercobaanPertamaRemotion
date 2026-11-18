import { z } from 'zod';

export const CaptionItemSchema = z.object({
  text: z.string().optional(),
  word: z.string().optional(),
  start: z.number().optional(),
  end: z.number().optional(),
  startMs: z.number().optional(),
  endMs: z.number().optional(),
});

export const EpisodeSchema = z.object({
  episodeDir: z.string(),
  theme: z.object({
    accentColor: z.string(),
  }),
  assets: z.object({
    voiceover: z.string(),
    broll: z.string(),
    demo: z.string(),
    captions: z.string(),
    bgm: z.string().optional().default(''),
    sfxPop: z.string().optional().default(''),
  }),
  cues: z.object({
    demoStartSec: z.number(),
    questionStartSec: z.number(),
  }),
  text: z.object({
    topBadge: z.string(),
    panelHeader: z.string(),
    hookBadge: z.string(),
    hookTitle: z.string(),
    painPoints: z.array(z.string()).optional().default([]),
    solutionTitle: z.string().optional().default('Solusi Interaktif'),
    solutionPoints: z.array(z.string()).optional().default([]),
    closingQuestion: z.string(),
  }),
  options: z
    .object({
      showProgressBar: z.boolean().optional().default(true),
    })
    .optional()
    .default({ showProgressBar: true }),
  // Diisi otomatis oleh calculateMetadata
  resolvedCaptions: z.array(CaptionItemSchema).optional().default([]),
  brollDurationInFrames: z.number().optional().default(300),
  demoDurationInFrames: z.number().optional().default(600),
});

export type CaptionItem = z.infer<typeof CaptionItemSchema>;
export type EpisodeProps = z.infer<typeof EpisodeSchema>;