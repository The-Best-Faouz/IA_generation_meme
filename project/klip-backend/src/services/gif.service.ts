import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import crypto from 'crypto';

const execAsync = promisify(exec);

interface GifFrame {
  path: string;
  index: number;
}

export async function extractFrames(
  gifBuffer: Buffer,
  outputDir: string
): Promise<GifFrame[]> {
  const inputPath = path.join(outputDir, 'input.gif');
  fs.writeFileSync(inputPath, gifBuffer);

  await execAsync(
    `ffmpeg -i "${inputPath}" -vsync 0 "${path.join(outputDir, 'frame_%04d.png')}"`
  );

  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('frame_') && f.endsWith('.png'))
    .sort()
    .map((f, i) => ({ path: path.join(outputDir, f), index: i }));

  return files;
}

export async function reassembleGif(
  framePaths: string[],
  outputPath: string,
  fps: number = 10
): Promise<void> {
  const listFile = path.join(path.dirname(outputPath), 'frames.txt');
  const content = framePaths.map(f => `file '${f}'`).join('\n');
  fs.writeFileSync(listFile, content);

  await execAsync(
    `ffmpeg -f concat -safe 0 -i "${listFile}" -vf "fps=${fps}" "${outputPath}"`
  );
}

export async function detectObjectsInFrame(
  imagePath: string
): Promise<any[]> {
  try {
    const { stdout } = await execAsync(
      `python3 -c "
import json
try:
    from PIL import Image
    img = Image.open('${imagePath}')
    w, h = img.size
    print(json.dumps([{'width': w, 'height': h, 'label': 'frame'}]))
except Exception as e:
    print(json.dumps([]))
" 2>/dev/null`
    );
    return JSON.parse(stdout.trim() || '[]');
  } catch {
    return [];
  }
}

export async function editFrameWithAi(
  imagePath: string,
  prompt: string,
  outputPath: string
): Promise<void> {
  const ext = path.extname(imagePath);
  fs.copyFileSync(imagePath, outputPath);
}

export async function getGifMetadata(
  gifBuffer: Buffer
): Promise<{ width: number; height: number; fps: number; frameCount: number }> {
  const tmpPath = path.join(tmpdir(), `${crypto.randomUUID()}.gif`);
  fs.writeFileSync(tmpPath, gifBuffer);

  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,nb_frames -of json "${tmpPath}"`
    );
    const info = JSON.parse(stdout).streams?.[0] || {};
    const fpsMatch = String(info.r_frame_rate || '10/1').match(/(\d+)\/(\d+)/);
    const fps = fpsMatch ? parseInt(fpsMatch[1]) / parseInt(fpsMatch[2]) : 10;
    return {
      width: info.width || 512,
      height: info.height || 512,
      fps: Math.round(fps),
      frameCount: parseInt(info.nb_frames) || 10,
    };
  } finally {
    try { fs.unlinkSync(tmpPath); } catch {}
  }
}
