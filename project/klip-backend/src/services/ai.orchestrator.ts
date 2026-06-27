import { generateWithGemini } from './gemini.service';
import { generateWithOpenAI } from './openai.service';
import { generateWithHuggingFace } from './huggingface.service';
import { generateWithGroq } from './groq-text.service';

export interface MemeResult {
  imageBuffer: Buffer;
  caption: string;
  provider: string;
}

const providers: Array<{
  name: string;
  generate: typeof generateWithGroq;
}> = [
  { name: 'groq', generate: generateWithGroq },
  { name: 'gemini', generate: generateWithGemini },
  { name: 'openai', generate: generateWithOpenAI },
  { name: 'huggingface', generate: generateWithHuggingFace },
];

export const generateMeme = async (
  type: 'text' | 'image' | 'prompt',
  content: string | Buffer,
  country: string
): Promise<MemeResult> => {
  const culturalPrompt = `Génère un contenu humoristique adapté à la culture de : ${country}. Si le pays est CM (Cameroun), intègre des références locales (noms populaires, expressions locales, contexte africain) si pertinent.`;

  for (const provider of providers) {
    try {
      const result = await provider.generate(type, content, country, culturalPrompt);
      console.log(`provider: ${provider.name}`);
      return { ...result, provider: provider.name };
    } catch (err: any) {
      console.log(`${provider.name} failed:`, err.message);
    }
  }

  throw new Error('Tous les providers IA ont échoué');
};
