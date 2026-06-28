import sharp from "sharp";
import { generateCaptionWithGemini } from "./gemini.service";
import { generateCaptionWithOpenAI } from "./openai.service";
import { generateCaptionWithHuggingFace } from "./huggingface.service";
import { generateCaptionWithGroq } from "./groq-text.service";
import { generateImageWithDalle } from "./openai.service";

export interface MemeResult {
  imageBuffer: Buffer;
  caption: string;
  provider: string;
}

const captionProviders: Array<{
  name: string;
  generate: (
    type: "text" | "image" | "prompt",
    content: string | Buffer,
    country: string,
    culturalPrompt: string,
  ) => Promise<string>;
}> = [
  { name: "openai", generate: generateCaptionWithOpenAI },
  { name: "groq", generate: generateCaptionWithGroq },
  { name: "gemini", generate: generateCaptionWithGemini },
  { name: "huggingface", generate: generateCaptionWithHuggingFace },
];

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const splitCaptionLines = (caption: string, maxChars = 32): string[] => {
  const words = caption.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length > maxChars && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const overlayCaptionOnImage = async (
  imageBuffer: Buffer,
  caption: string,
): Promise<Buffer> => {
  const image = sharp(imageBuffer).ensureAlpha();
  const metadata = await image.metadata();
  const width = metadata.width || 512;
  const height = metadata.height || 512;
  const lines = splitCaptionLines(
    caption,
    Math.max(24, Math.floor(width / 18)),
  );
  const fontSize = Math.max(20, Math.round(width / 18));
  const lineHeight = fontSize + 10;
  const captionHeight = lines.length * lineHeight + 24;
  const overlaySvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="${height - captionHeight}" width="${width}" height="${captionHeight}" fill="rgba(0,0,0,0.54)" rx="14" />
      ${lines
        .map((line, index) => {
          const y = height - captionHeight + 20 + index * lineHeight;
          return `<text x="${width / 2}" y="${y}" font-family="Impact,Arial,Helvetica,sans-serif" font-size="${fontSize}" fill="#ffffff" stroke="#000000" stroke-width="3" text-anchor="middle">${escapeXml(line)}</text>`;
        })
        .join("")}
    </svg>
  `;

  return image
    .composite([{ input: Buffer.from(overlaySvg), top: 0, left: 0 }])
    .webp({ quality: 90 })
    .toBuffer();
};

const generateBestCaption = async (
  type: "text" | "image" | "prompt",
  content: string | Buffer,
  country: string,
  culturalPrompt: string,
): Promise<{ caption: string; provider: string }> => {
  let bestCaption = "";
  let usedProvider = "";

  for (const provider of captionProviders) {
    try {
      const caption = await provider.generate(
        type,
        content,
        country,
        culturalPrompt,
      );
      if (caption && caption.length > bestCaption.length) {
        bestCaption = caption;
        usedProvider = provider.name;
      }
    } catch (err: any) {
      console.log(`${provider.name} caption failed:`, err.message);
    }
  }

  if (!bestCaption) {
    bestCaption = "Mème généré par KLIP";
    usedProvider = "fallback";
  }

  return { caption: bestCaption, provider: usedProvider };
};

export const generateMeme = async (
  type: "text" | "image" | "prompt",
  content: string | Buffer,
  country: string,
): Promise<MemeResult> => {
  const culturalPrompt = `Génère un contenu humoristique adapté à la culture de : ${country}. Si le pays est CM (Cameroun), intègre des références locales (noms populaires, expressions locales, contexte africain) si pertinent.`;

  const { caption, provider } = await generateBestCaption(
    type,
    content,
    country,
    culturalPrompt,
  );

  try {
    const imageBuffer = await generateImageWithDalle(caption);
    return { imageBuffer, caption, provider };
  } catch (err: any) {
    console.log("DALL-E image generation failed:", err.message);
    throw new Error(
      "Impossible de générer l'image du mème. Tous les services IA ont échoué.",
    );
  }
};

export const remixImageWithCaption = async (
  imageBuffer: Buffer,
  country: string,
): Promise<MemeResult> => {
  const culturalPrompt = `Génère un contenu humoristique adapté à la culture de : ${country}. Si le pays est CM (Cameroun), intègre des références locales (noms populaires, expressions locales, contexte africain) si pertinent.`;

  const { caption, provider } = await generateBestCaption(
    "image",
    imageBuffer,
    country,
    culturalPrompt,
  );
  const outputBuffer = await overlayCaptionOnImage(imageBuffer, caption);
  return { imageBuffer: outputBuffer, caption, provider };
};
