import axios from 'axios';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
