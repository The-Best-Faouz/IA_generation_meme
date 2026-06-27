import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import crypto from 'crypto';

interface FaceSwapResult {
  imageBuffer: Buffer;
  format: string;
}

async function downloadFile(uri: string): Promise<Buffer> {
  if (uri.startsWith('http')) {
    const response = await axios.get(uri, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }
  return fs.readFileSync(uri);
}

export async function processSticker(
  stickerBuffer: Buffer,
  inputFormat: string
): Promise<{ width: number; height: number; buffer: Buffer }> {
  const image = sharp(stickerBuffer);
  const metadata = await image.metadata();
  const webpBuffer = await image.webp({ quality: 90 }).toBuffer();
  return {
    width: metadata.width || 512,
    height: metadata.height || 512,
    buffer: webpBuffer,
  };
}

export async function swapFaceOnSticker(
  stickerUri: string,
  faceUri: string
): Promise<FaceSwapResult> {
  const stickerBuf = await downloadFile(stickerUri);
  const faceBuf = await downloadFile(faceUri);

  const sticker = sharp(stickerBuf);
  const face = sharp(faceBuf);
  const stickerMeta = await sticker.metadata();
  const faceMeta = await face.metadata();

  const faceSize = Math.min(stickerMeta.width || 512, stickerMeta.height || 512) * 0.4;
  const faceResized = await face.resize(Math.round(faceSize), Math.round(faceSize)).toBuffer();

  const stickerRgba = await sticker
    .ensureAlpha()
    .raw()
    .toBuffer();

  const faceRgba = await sharp(faceResized)
    .ensureAlpha()
    .raw()
    .toBuffer();

  const fw = Math.round(faceSize);
  const fh = Math.round(faceSize);
  const sw = stickerMeta.width || 512;
  const sh = stickerMeta.height || 512;
  const offsetX = Math.round((sw - fw) / 2);
  const offsetY = Math.round((sh - fh) / 3);

  const result = Buffer.alloc(stickerRgba.length);
  stickerRgba.copy(result);

  for (let y = 0; y < fh && y + offsetY < sh; y++) {
    for (let x = 0; x < fw && x + offsetX < sw; x++) {
      const si = ((y + offsetY) * sw + (x + offsetX)) * 4;
      const fi = (y * fw + x) * 4;
      const faceAlpha = faceRgba[fi + 3];
      if (faceAlpha > 30) {
        const blend = faceAlpha / 255;
        result[si] = Math.round(faceRgba[fi] * blend + stickerRgba[si] * (1 - blend));
        result[si + 1] = Math.round(faceRgba[fi + 1] * blend + stickerRgba[si + 1] * (1 - blend));
        result[si + 2] = Math.round(faceRgba[fi + 2] * blend + stickerRgba[si + 2] * (1 - blend));
        result[si + 3] = 255;
      }
    }
  }

  const outputBuffer = await sharp(result, {
    raw: { width: sw, height: sh, channels: 4 },
  }).webp({ quality: 90 }).toBuffer();

  return { imageBuffer: outputBuffer, format: 'webp' };
}

export async function addTextToSticker(
  stickerUri: string,
  text: string
): Promise<FaceSwapResult> {
  const stickerBuf = await downloadFile(stickerUri);
  const metadata = await sharp(stickerBuf).metadata();
  const w = metadata.width || 512;
  const h = metadata.height || 512;

  const fontSize = Math.max(20, Math.round(w / 15));
  const lines = text.length > 30
    ? text.match(/.{1,30}/g) || [text]
    : [text];

  const svgOverlays = lines.map((line, i) => {
    const y = h - (lines.length - i) * (fontSize + 10) - 20;
    return `<text x="${w / 2}" y="${y}" font-size="${fontSize}" font-family="Impact" fill="white" stroke="black" stroke-width="3" text-anchor="middle">${escapeXml(line)}</text>`;
  }).join('');

  const svg = `<svg width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="rgba(0,0,0,0.3)" rx="10"/>
    ${svgOverlays}
  </svg>`;

  const composited = await sharp(stickerBuf)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .webp({ quality: 90 })
    .toBuffer();

  return { imageBuffer: composited, format: 'webp' };
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
