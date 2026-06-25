import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export const runFaceSwap = async (sourceBuffer: Buffer, faceBuffer: Buffer): Promise<Buffer> => {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN non configuré');
  }

  const sourceBase64 = sourceBuffer.toString('base64');
  const faceBase64 = faceBuffer.toString('base64');

  const output = await replicate.run(
    'lucataco/faceswap:9a429854a403902c0e7daf7ba67c4ec3a5b9fd0e4c49c957c85e2b9ab34cd5b1',
    {
      input: {
        source_image: `data:image/png;base64,${sourceBase64}`,
        target_image: `data:image/png;base64,${faceBase64}`,
      },
    }
  );

  if (typeof output === 'string') {
    const axios = (await import('axios')).default;
    const response = await axios.get(output, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  }

  throw new Error('Replicate a retourné un format inattendu');
};
