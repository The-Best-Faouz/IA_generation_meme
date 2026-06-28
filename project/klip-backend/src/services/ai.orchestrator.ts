import { generateCaptionWithGemini } from './gemini.service';
import { generateCaptionWithOpenAI } from './openai.service';
import { generateCaptionWithHuggingFace } from './huggingface.service';
import { generateCaptionWithGroq } from './groq-text.service';
import { generateImageWithDalle } from './openai.service';
import { generateImageWithHuggingFace } from './huggingface.service';

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

  const promises = captionProviders.map(async (provider) => {
    try {
      const caption = await provider.generate(type, content, country, culturalPrompt);
      if (caption) {
        return { caption, provider: provider.name };
      }
      throw new Error('Empty caption');
    } catch (err: any) {
      console.log(`${provider.name} caption failed:`, err.message);
      throw err;
    }
  });

  let bestCaption = '';
  let usedProvider = '';

  try {
    const result = await Promise.any(promises);
    bestCaption = result.caption;
    usedProvider = result.provider;
  } catch (err) {
    console.log('All caption providers failed');
    bestCaption = 'Mème généré par KLIP';
    usedProvider = 'fallback';
  }

  try {
    const imageBuffer = await generateImageWithDalle(bestCaption);
    return { imageBuffer, caption: bestCaption, provider: usedProvider };
  } catch (err: any) {
    console.log('DALL-E image generation failed:', err.message);
    try {
      console.log('Falling back to HuggingFace for image generation...');
      const imageBuffer = await generateImageWithHuggingFace(bestCaption);
      return { imageBuffer, caption: bestCaption, provider: usedProvider + '_hf' };
    } catch (hfErr: any) {
      console.log('HuggingFace image generation failed:', hfErr.message);
      throw new Error('Impossible de générer l\'image du mème. Tous les services IA ont échoué.');
    }
  }
};
