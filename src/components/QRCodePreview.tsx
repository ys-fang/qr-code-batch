import { useState, useEffect } from 'react';
import type { QRCodeEntry } from '../types';
import { generateQRCodeWithLabel, downloadImage } from '../utils/qrGenerator';

interface QRCodePreviewProps {
  entry: QRCodeEntry;
  onGenerated: (id: string, dataUrl: string) => void;
}

export function QRCodePreview({ entry, onGenerated }: QRCodePreviewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entry.url || entry.generated) return;

    const generate = async () => {
      setLoading(true);
      setError(null);
      try {
        const dataUrl = await generateQRCodeWithLabel(entry.url, entry.label);
        onGenerated(entry.id, dataUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [entry.url, entry.label, entry.id, entry.generated, onGenerated]);

  const handleDownload = () => {
    if (entry.dataUrl) {
      const filename = entry.filename || entry.label || `qr_${entry.id}`;
      downloadImage(entry.dataUrl, filename);
    }
  };

  if (!entry.url) {
    return (
      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-xs text-center px-2">
          輸入連結
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-24 h-24 bg-red-50 rounded-lg flex items-center justify-center">
        <span className="text-red-500 text-xs text-center px-2">{error}</span>
      </div>
    );
  }

  if (entry.dataUrl) {
    return (
      <div className="relative group">
        <img
          src={entry.dataUrl}
          alt={`QR Code for ${entry.label || entry.url}`}
          className="w-24 h-24 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={handleDownload}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <button
            onClick={handleDownload}
            className="text-white text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
          >
            下載
          </button>
        </div>
      </div>
    );
  }

  return null;
}
