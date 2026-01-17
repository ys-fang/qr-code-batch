import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { QRCodeEntry } from '../types';
import { dataUrlToBlob } from './qrGenerator';

export async function downloadAllAsZip(entries: QRCodeEntry[]): Promise<void> {
  const validEntries = entries.filter((e) => e.generated && e.dataUrl);

  if (validEntries.length === 0) {
    throw new Error('No QR codes to download');
  }

  const zip = new JSZip();

  validEntries.forEach((entry, index) => {
    const blob = dataUrlToBlob(entry.dataUrl!);
    const filename = sanitizeFilename(entry.filename || entry.label || `qr_${index + 1}`) + '.png';
    zip.file(filename, blob);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  saveAs(zipBlob, `qr-codes_${timestamp}.zip`);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'qr_code';
}
