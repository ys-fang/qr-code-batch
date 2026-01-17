import QRCode from 'qrcode';
import type { QRCodeConfig } from '../types';
import { DEFAULT_CONFIG } from '../types';

export async function generateQRCodeWithLabel(
  url: string,
  label: string,
  config: QRCodeConfig = DEFAULT_CONFIG
): Promise<string> {
  const { size, qrSize, labelFontSize, margin } = config;

  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Fill white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, size, size);

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: qrSize,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });

  // Load QR code image
  const qrImage = new Image();
  await new Promise<void>((resolve, reject) => {
    qrImage.onload = () => resolve();
    qrImage.onerror = reject;
    qrImage.src = qrDataUrl;
  });

  // Calculate QR code position (centered, slightly above center)
  const qrX = (size - qrSize) / 2;
  const qrY = (size - qrSize) / 2 - margin;

  // Draw QR code
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

  // Draw label if provided (max 4 characters)
  if (label) {
    const displayLabel = label.substring(0, 4);

    ctx.fillStyle = '#000000';
    ctx.font = `bold ${labelFontSize}px "Microsoft JhengHei", "PingFang TC", "Noto Sans TC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const textY = qrY + qrSize + 10;
    ctx.fillText(displayLabel, size / 2, textY);
  }

  return canvas.toDataURL('image/png');
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = dataUrl;
  link.click();
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  const u8arr = new Uint8Array(bstr.length);

  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new Blob([u8arr], { type: mime });
}
