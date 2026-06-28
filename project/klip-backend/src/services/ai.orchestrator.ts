import { generateCaptionWithGemini } from './gemini.service';
import { generateCaptionWithOpenAI, generateImageWithDalle } from './openai.service';
import { generateCaptionWithHuggingFace } from './huggingface.service';
import { generateCaptionWithGroq } from './groq-text.service';
import { generateImageWithPollinations } from './pollinations.service';

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
  const culturalPrompt = `Genere un contenu humoristique adapte a la culture de : ${country}. Si le pays est CM (Cameroun), integre des references locales (noms populaires, expressions locales, contexte africain) si pertinent.`;

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
    bestCaption = 'Meme genere par KLIP';
    usedProvider = 'fallback';
  }

  try {
    const imageBuffer = await generateImageWithPollinations(bestCaption);
    return { imageBuffer, caption: bestCaption, provider: `${usedProvider}+pollinations` };
  } catch (err: any) {
    console.log('Pollinations image generation failed:', err.message);
  }

  try {
    const imageBuffer = await generateImageWithDalle(bestCaption);
    return { imageBuffer, caption: bestCaption, provider: `${usedProvider}+dalle-image` };
  } catch (err: any) {
    console.log('DALL-E image generation failed:', err.message);
    const axios = require('axios');
    const fallback = await axios.get('https://dummyimage.com/600x600/2C2C2C/FFFFFF.png&text=Image+Non+Disponible', { responseType: 'arraybuffer' });
    return { imageBuffer: Buffer.from(fallback.data, 'binary'), caption: bestCaption, provider: `${usedProvider}+fallback-image` };
  }
};
