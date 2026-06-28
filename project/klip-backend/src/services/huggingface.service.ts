import axios from 'axios';

export const generateCaptionWithHuggingFace = async (
  type: 'text' | 'image' | 'prompt',
  content: string | Buffer,
  _country: string,
  culturalPrompt: string
): Promise<string> => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY non configuré');
  }

  const textContent = typeof content === 'string' ? content : '[contenu image]';

  const promptText = type === 'text'
    ? `Analyse ce texte de conversation et génère une légende humoristique pour un mème. ${culturalPrompt}\n\nTexte: ${textContent}\n\nRéponds UNIQUEMENT avec la légende.`
    : type === 'image'
    ? `Analyse cette image et génère une légende humoristique pour en faire un mème. ${culturalPrompt}\n\nRéponds UNIQUEMENT avec la légende.`
    : `Génère une légende de mème à partir de cette description: ${textContent}. ${culturalPrompt}\n\nRéponds UNIQUEMENT avec la légende.`;

  const response = await axios.post(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    { inputs: promptText },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 15000,
    }
  );

  const generated = response.data?.[0]?.generated_text || response.data?.generated_text || '';
  return generated.replace(promptText, '').trim() || generated;
};

export const generateImageWithHuggingFace = async (prompt: string): Promise<Buffer> => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('HUGGINGFACE_API_KEY non configuré');
  }

  const response = await axios.post(
    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
    { inputs: `Meme humoristique: ${prompt}` },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      responseType: 'arraybuffer',
      timeout: 30000,
    }
  );

  if (!response.data) {
    throw new Error('HuggingFace a échoué à générer l\'image');
  }

  return Buffer.from(response.data, 'binary');
};
