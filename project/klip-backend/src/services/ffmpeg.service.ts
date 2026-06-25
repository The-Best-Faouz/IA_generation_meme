import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export const extractGifFrames = async (gifPath: string, outputDir: string): Promise<string[]> => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const frames: string[] = [];
    ffmpeg(gifPath)
      .on('filenames', (filenames: string[]) => {
        frames.push(...filenames.map((f) => path.join(outputDir, f)));
      })
      .on('end', () => resolve(frames))
      .on('error', reject)
      .output(path.join(outputDir, 'frame-%03d.png'))
      .run();
  });
};

export const createGifFromFrames = async (framePaths: string[], outputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();
    framePaths.forEach((fp) => cmd.input(fp));
    cmd
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .mergeToFile(outputPath, path.dirname(outputPath));
  });
};
