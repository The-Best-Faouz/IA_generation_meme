import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export const analyzeImageWithGemini = async (imageBuffer: Buffer, prompt: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY non configuré');
  }

  const base64Image = imageBuffer.toString('base64');

  const response = await axios.post(
    `${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/png',
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    },
    { timeout: 15000 }
  );

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Analyse indisponible';
};
