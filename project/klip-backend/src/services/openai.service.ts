import axios from 'axios';

export const generateWithOpenAI = async (
  type: 'text' | 'image' | 'prompt',
  content: string | Buffer,
  _country: string,
  culturalPrompt: string
): Promise<{ imageBuffer: Buffer; caption: string }> => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY non configuré');
  }

  const promptText = type === 'text'
    ? `Analyse ce texte de conversation et génère un mème humoristique. ${culturalPrompt}\n\nTexte: ${content}`
    : type === 'image'
    ? `Analyse cette image et génère un texte humoristique pour en faire un mème. ${culturalPrompt}`
    : `Génère un mème à partir de cette description: ${content}. ${culturalPrompt}`;

  const chatResponse = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o',
      messages: [{ role: 'user', content: promptText }],
      max_tokens: 1024,
      temperature: 0.9,
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 8000,
    }
  );

  const caption = chatResponse.data.choices?.[0]?.message?.content || 'Mème généré par KLIP';

  const imageResponse = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      model: 'dall-e-3',
      prompt: `Mème humoristique: ${caption}`,
      n: 1,
      size: '512x512',
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    }
  );

  const imageUrl = imageResponse.data.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error('DALL-E a échoué à générer l\'image');
  }

  const imageDownload = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
  const imageBuffer = Buffer.from(imageDownload.data, 'binary');

  return { imageBuffer, caption };
};
