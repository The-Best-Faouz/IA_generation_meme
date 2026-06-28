import { generateCaptionWithGemini } from './gemini.service';
import { generateCaptionWithOpenAI } from './openai.service';
import { generateCaptionWithHuggingFace } from './huggingface.service';
import { generateCaptionWithGroq } from './groq-text.service';
import { generateImageWithDalle } from './openai.service';

export interface MemeResult {
  imageBuffer: Buffer;
  caption: string;
  provider: string;
}

const captionProviders: Array<{
  name: string;
  generate: (type: 'text' | 'image' | 'prompt', content: string | Buffer, country: string, culturalPrompt: string) => Promise<string>;
}> = [
  { name: 'openai', generate: generateCaptionWithOpenAI },
  { name: 'groq', generate: generateCaptionWithGroq },
  { name: 'gemini', generate: generateCaptionWithGemini },
  { name: 'huggingface', generate: generateCaptionWithHuggingFace },
];

export const generateMeme = async (
  type: 'text' | 'image' | 'prompt',
  content: string | Buffer,
  country: string
): Promise<MemeResult> => {
  const culturalPrompt = `Génère un contenu humoristique adapté à la culture de : ${country}. Si le pays est CM (Cameroun), intègre des références locales (noms populaires, expressions locales, contexte africain) si pertinent.`;

  let bestCaption = '';
  let usedProvider = '';

  for (const provider of captionProviders) {
    try {
      const caption = await provider.generate(type, content, country, culturalPrompt);
      if (caption && caption.length > bestCaption.length) {
        bestCaption = caption;
        usedProvider = provider.name;
      }
    } catch (err: any) {
      console.log(`${provider.name} caption failed:`, err.message);
    }
  }

  if (!bestCaption) {
    bestCaption = 'Mème généré par KLIP';
    usedProvider = 'fallback';
  }

  try {
    const imageBuffer = await generateImageWithDalle(bestCaption);
    return { imageBuffer, caption: bestCaption, provider: usedProvider };
  } catch (err: any) {
    console.log('DALL-E image generation failed:', err.message);
    throw new Error('Impossible de générer l\'image du mème. Tous les services IA ont échoué.');
  }
};
