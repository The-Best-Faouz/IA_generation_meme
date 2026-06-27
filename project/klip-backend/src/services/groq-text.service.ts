import axios from 'axios';

export const generateWithGroq = async (
  type: 'text' | 'image' | 'prompt',
  content: string | Buffer,
  _country: string,
  culturalPrompt: string
): Promise<{ imageBuffer: Buffer; caption: string }> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY non configuré');
  }

  const textContent = typeof content === 'string' ? content : '[contenu binaire]';

  const promptText = type === 'text'
    ? `Analyse ce texte de conversation et génère un mème humoristique. ${culturalPrompt}\n\nTexte: ${textContent}`
    : type === 'image'
    ? `Analyse cette image et génère un texte humoristique pour en faire un mème. ${culturalPrompt}`
    : `Génère un mème à partir de cette description: ${textContent}. ${culturalPrompt}`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: promptText }],
      max_tokens: 1024,
      temperature: 0.9,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );

  const caption = response.data.choices?.[0]?.message?.content || 'Mème généré par KLIP';

  const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#f59e0b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif">${caption.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text></svg>`;
  const imageBuffer = Buffer.from(placeholderSvg);

  return { imageBuffer, caption };
};
