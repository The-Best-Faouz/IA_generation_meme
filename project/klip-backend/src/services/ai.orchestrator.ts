import { generateWithGemini } from './gemini.service';
import { generateWithOpenAI } from './openai.service';
import { generateWithHuggingFace } from './huggingface.service';

export interface MemeResult {
  imageBuffer: Buffer;
  caption: string;
  provider: string;
}

export const generateMeme = async (
  type: 'text' | 'image' | 'prompt',
  content: string | Buffer,
  country: string
): Promise<MemeResult> => {
  const culturalPrompt = `Génère un contenu humoristique adapté à la culture de : ${country}. Si le pays est CM (Cameroun), intègre des références locales (noms populaires, expressions locales, contexte africain) si pertinent.`;

  try {
    const result = await generateWithGemini(type, content, country, culturalPrompt);
    console.log('provider: gemini');
    return { ...result, provider: 'gemini' };
  } catch (err: any) {
    console.log('Gemini failed:', err.message);
    try {
      const result = await generateWithOpenAI(type, content, country, culturalPrompt);
      console.log('provider: openai');
      return { ...result, provider: 'openai' };
    } catch (err2: any) {
      console.log('OpenAI failed:', err2.message);
      try {
        const result = await generateWithHuggingFace(type, content, country, culturalPrompt);
        console.log('provider: huggingface');
        return { ...result, provider: 'huggingface' };
      } catch (err3: any) {
        console.log('Tous les providers ont échoué');
        throw new Error('Tous les providers IA ont échoué');
      }
    }
  }
};
