import axios from 'axios';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_IMAGE_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';

export const generateCaptionWithGemini = async (
  type: 'text' | 'image' | 'prompt',
  content: string | Buffer,
  _country: string,
  culturalPrompt: string
): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY non configuré');
  }

  const textContent = typeof content === 'string' ? content : '[contenu image]';

  const promptText = type === 'text'
    ? `Analyse ce texte de conversation et génère une légende humoristique pour un mème. ${culturalPrompt}\n\nTexte: ${textContent}\n\nRéponds UNIQUEMENT avec la légende, sans formatage.`
    : type === 'image'
    ? `Analyse cette image et génère une légende humoristique pour en faire un mème. ${culturalPrompt}\n\nRéponds UNIQUEMENT avec la légende.`
    : `Génère une légende de mème à partir de cette description: ${textContent}. ${culturalPrompt}\n\nRéponds UNIQUEMENT avec la légende.`;

  const response = await axios.post(
    `${GEMINI_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { maxOutputTokens: 256, temperature: 0.9 },
    },
    { timeout: 15000 }
  );

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

const findImageData = (value: any): string | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  if (typeof value.data === 'string' && (value.mime_type || value.mimeType || value.type === 'image')) {
    return value.data;
  }

  if (value.output_image?.data) {
    return value.output_image.data;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findImageData(item);
      if (found) {
        return found;
      }
    }
  }

  for (const nested of Object.values(value)) {
    const found = findImageData(nested);
    if (found) {
      return found;
    }
  }

  return null;
};

export const generateImageWithGemini = async (
  prompt: string,
  sourceImage?: Buffer
): Promise<Buffer> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY non configure');
  }

  const input: Array<Record<string, string>> = [
    {
      type: 'text',
      text: `Cree une image de meme carree, expressive, drole et partageable. Style visuel moderne, couleurs nettes, composition lisible sur mobile. N'ajoute pas de texte dans l'image, l'application ajoutera la legende separement. Idee du meme: ${prompt}`,
    },
  ];

  if (sourceImage) {
    input.push({
      type: 'image',
      mime_type: 'image/png',
      data: sourceImage.toString('base64'),
    });
  }

  const response = await axios.post(
    GEMINI_IMAGE_URL,
    {
      model: GEMINI_IMAGE_MODEL,
      input,
      response_format: {
        type: 'image',
        mime_type: 'image/jpeg',
        aspect_ratio: '1:1',
      },
    },
    {
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      timeout: 60000,
    }
  );

  const imageData = findImageData(response.data);
  if (!imageData) {
    throw new Error("Gemini n'a pas renvoye d'image");
  }

  return Buffer.from(imageData, 'base64');
};
