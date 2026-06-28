import axios from 'axios';

export const generateCaptionWithGroq = async (
  type: 'text' | 'image' | 'prompt',
  content: string | Buffer,
  _country: string,
  culturalPrompt: string
): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY non configuré');
  }

  const textContent = typeof content === 'string' ? content : '[contenu image]';

  const promptText = type === 'text'
    ? `Analyse ce texte de conversation et génère une légende humoristique pour un mème. ${culturalPrompt}\n\nTexte: ${textContent}\n\nRéponds UNIQUEMENT avec la légende.`
    : type === 'image'
    ? `Analyse cette image et génère une légende humoristique pour en faire un mème. ${culturalPrompt}\n\nRéponds UNIQUEMENT avec la légende.`
    : `Génère une légende de mème à partir de cette description: ${textContent}. ${culturalPrompt}\n\nRéponds UNIQUEMENT avec la légende.`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: promptText }],
      max_tokens: 256,
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

  return response.data.choices?.[0]?.message?.content || '';
};
