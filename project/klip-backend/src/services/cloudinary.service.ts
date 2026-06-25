import cloudinary from '../config/cloudinary';

export interface CloudinaryResult {
  url: string;
  webpUrl: string;
  publicId: string;
}

export const uploadToCloudinary = async (buffer: Buffer, folder: string): Promise<CloudinaryResult> => {
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
