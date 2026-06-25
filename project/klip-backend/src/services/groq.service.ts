import axios from 'axios';
import FormData from 'form-data';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export const transcribeAudio = async (audioBuffer: Buffer): Promise<string> => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY non configuré');
  }

  const form = new FormData();
  form.append('file', audioBuffer, { filename: 'audio.m4a', contentType: 'audio/m4a' });
  form.append('model', 'whisper-large-v3');
  form.append('language', 'fr');

  const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    timeout: 15000,
  });

  return response.data.text || 'Transcription indisponible';
};
