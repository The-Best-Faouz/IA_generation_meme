import { getCloudinary } from '../config/cloudinary';

export interface CloudinaryResult {
  url: string;
  webpUrl: string;
  publicId: string;
}

function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'CHANGE_ME' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'CHANGE_ME' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== 'CHANGE_ME'
  );
}

export const uploadToCloudinary = async (buffer: Buffer, folder: string): Promise<CloudinaryResult> => {
  if (!isCloudinaryConfigured()) {
    const base64 = buffer.toString('base64');
    const mime = folder === 'gif' ? 'image/gif' : 'image/webp';
    return {
      url: `data:${mime};base64,${base64}`,
      webpUrl: `data:${mime};base64,${base64}`,
      publicId: `local_${Date.now()}`,
    };
  }

  const cloudinary = getCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `klip/${folder}`,
        format: 'webp',
        width: 512,
        height: 512,
        crop: 'limit',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Upload Cloudinary échoué'));
          return;
        }
        resolve({
          url: result.secure_url,
          webpUrl: result.secure_url.replace(/\.[^.]+$/, '.webp'),
          publicId: result.public_id,
        });
      }
    );
    stream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!isCloudinaryConfigured() || publicId.startsWith('local_')) return;

  const cloudinary = getCloudinary();
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};
