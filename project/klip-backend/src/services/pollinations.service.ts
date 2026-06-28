import axios from 'axios';

export const generateImageWithPollinations = async (prompt: string): Promise<Buffer> => {
  const imageUrl = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=512&height=512&nofeed=true`;
  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 60000,
  });

  return Buffer.from(response.data, 'binary');
};
