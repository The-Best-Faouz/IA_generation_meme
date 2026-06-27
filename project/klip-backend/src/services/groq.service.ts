import axios from 'axios';
import FormData from 'form-data';

export const transcribeAudio = async (audioBuffer: Buffer): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY non configuré');
  }

  const form = new FormData();
  form.append('file', audioBuffer, { filename: 'audio.m4a', contentType: 'audio/m4a' });
  form.append('model', 'whisper-large-v3');
  form.append('language', 'fr');

  const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${apiKey}`,
    },
    timeout: 15000,
  });

  return response.data.text || 'Transcription indisponible';
};
