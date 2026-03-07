import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Font } from "@takumi-rs/core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontsDir = resolve(__dirname, "../fonts");

function loadFont(file: string, name: string, weight?: number, style?: string): Font {
  return {
    data: readFileSync(resolve(fontsDir, file)),
    name,
    ...(weight && { weight }),
    ...(style && { style }),
  };
}

export function loadDefaultFonts(): Font[] {
  return [
    loadFont("Geist[wght].ttf", "Geist"),
    loadFont("Geist-Italic[wght].ttf", "Geist", undefined, "italic"),
    loadFont("GeistMono[wght].ttf", "Geist Mono"),
    loadFont("GeistMono-Italic[wght].ttf", "Geist Mono", undefined, "italic"),
    ...loadSystemEmojiFont(),
  ];
}

const emojiPaths = [
  // Linux
  "/usr/share/fonts/noto/NotoColorEmoji.ttf",
  "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf",
  "/usr/share/fonts/google-noto-emoji/NotoColorEmoji.ttf",
  // macOS
  "/System/Library/Fonts/Apple Color Emoji.ttc",
  // Windows
  "C:\\Windows\\Fonts\\seguiemj.ttf",
];

function loadSystemEmojiFont(): Font[] {
  for (const fontPath of emojiPaths) {
    if (existsSync(fontPath)) {
      return [{ data: readFileSync(fontPath) }];
    }
  }
  return [];
}
