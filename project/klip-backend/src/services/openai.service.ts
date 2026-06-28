import axios from 'axios';

export const generateCaptionWithOpenAI = async (
  type: 'text' | 'image' | 'prompt',
  content: string | Buffer,
  _country: string,
  culturalPrompt: string
): Promise<string> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY non configuré');
  }

  const textContent = typeof content === 'string' ? content : '[contenu image]';

  const promptText = type === 'text'
    ? `Analyse ce texte de conversation et génère une légende humoristique pour un mème. ${culturalPrompt}\n\nTexte: ${textContent}\n\nRéponds UNIQUEMENT avec la légende.`
    : type === 'image'
    ? `Analyse cette image et génère une légende humoristique pour en faire un mème. ${culturalPrompt}\n\nRéponds UNIQUEMENT avec la légende.`
    : `Génère une légende de mème à partir de cette description: ${textContent}. ${culturalPrompt}\n\nRéponds UNIQUEMENT avec la légende.`;

  const chatResponse = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: promptText }],
      max_tokens: 256,
      temperature: 0.9,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    }
  );

  return chatResponse.data.choices?.[0]?.message?.content || '';
};

export const generateImageWithDalle = async (prompt: string): Promise<Buffer> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY non configuré');
  }

  const imageResponse = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      model: 'dall-e-3',
      prompt: `Mème humoristique: ${prompt}`,
      n: 1,
      size: '1024x1024',
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 30000,
    }
  );

  const imageUrl = imageResponse.data.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error('DALL-E a échoué à générer l\'image');
  }

  const imageDownload = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
  return Buffer.from(imageDownload.data, 'binary');
};
