import axios from 'axios';

export const generateWithHuggingFace = async (
  type: 'text' | 'image' | 'prompt',
  content: string | Buffer,
  _country: string,
  culturalPrompt: string
): Promise<{ imageBuffer: Buffer; caption: string }> => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY non configuré');
  }

  const promptText = type === 'text'
    ? `Analyse ce texte de conversation et génère un mème humoristique. ${culturalPrompt}\n\nTexte: ${content}`
    : type === 'image'
    ? `Analyse cette image et génère un texte humoristique pour en faire un mème. ${culturalPrompt}`
    : `Génère un mème à partir de cette description: ${content}. ${culturalPrompt}`;

  const response = await axios.post(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    { inputs: promptText },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 8000,
    }
  );

  const generated = response.data?.[0]?.generated_text || response.data?.generated_text || 'Mème généré par KLIP';
  const caption = generated.replace(promptText, '').trim() || generated;

  const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#10b981"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif">${caption.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text></svg>`;
  const imageBuffer = Buffer.from(placeholderSvg);

  return { imageBuffer, caption };
};
