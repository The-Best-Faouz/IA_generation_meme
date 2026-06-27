import axios from 'axios';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const generateWithGemini = async (
  type: 'text' | 'image' | 'prompt',
  content: string | Buffer,
  _country: string,
  culturalPrompt: string
): Promise<{ imageBuffer: Buffer; caption: string }> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY non configuré');
  }

  const promptText = type === 'text'
    ? `Analyse ce texte de conversation et génère un mème humoristique. ${culturalPrompt}\n\nTexte: ${content}`
    : type === 'image'
    ? `Analyse cette image et génère un texte humoristique pour en faire un mème. ${culturalPrompt}`
    : `Génère un mème à partir de cette description: ${content}. ${culturalPrompt}`;

  const response = await axios.post(
    `${GEMINI_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.9 },
    },
    { timeout: 8000 }
  );

  const caption = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Mème généré par KLIP';

  const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#6366f1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif">${caption.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text></svg>`;
  const imageBuffer = Buffer.from(placeholderSvg);

  return { imageBuffer, caption };
};
