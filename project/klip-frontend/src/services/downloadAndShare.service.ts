import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export interface ShareOptions {
  imageUrl: string;
  caption?: string;
  asSticker?: boolean;
}

export const DownloadAndShareService = {
  async downloadImage(imageUrl: string): Promise<string> {
    try {
      const fileName = `klip_meme_${Date.now()}.jpg`;
      const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      const downloadResult = await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: cachePath,
      }).promise;

      if (downloadResult.statusCode !== 200) {
        throw new Error(`Failed to download image, status code: ${downloadResult.statusCode}`);
      }

      return cachePath;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },

  async shareAsSticker(imageUrl: string, caption?: string): Promise<void> {
    try {
      const localPath = await this.downloadImage(imageUrl);

      await Share.open({
        url: `file://${localPath}`,
        title: 'Partager sur WhatsApp',
        message: caption || 'Regarde ce meme genere avec KLIP !',
        type: 'image/jpeg',
        failOnCancel: false,
      });
    } catch (error) {
      console.error('Share sticker failed:', error);
      throw error;
    }
  },

  async shareAsImage(imageUrl: string, caption?: string): Promise<void> {
    try {
      const localPath = await this.downloadImage(imageUrl);

      await Share.open({
        url: `file://${localPath}`,
        title: 'Partager sur WhatsApp',
        message: caption || 'Regarde ce meme genere avec KLIP !',
        type: 'image/jpeg',
        failOnCancel: false,
      });
    } catch (error) {
      console.error('Share image failed:', error);
      throw error;
    }
  },

  async shareWhatsApp(options: ShareOptions): Promise<void> {
    const { imageUrl, caption, asSticker = true } = options;

    if (asSticker) {
      await this.shareAsSticker(imageUrl, caption);
    } else {
      await this.shareAsImage(imageUrl, caption);
    }
  },
};
