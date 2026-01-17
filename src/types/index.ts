export interface QRCodeEntry {
  id: string;
  url: string;
  filename: string;
  label: string; // Up to 4 Traditional Chinese characters
  generated?: boolean;
  dataUrl?: string;
}

export interface QRCodeConfig {
  size: number;
  qrSize: number;
  labelFontSize: number;
  margin: number;
}

export const DEFAULT_CONFIG: QRCodeConfig = {
  size: 800,
  qrSize: 560, // 70% of 800
  labelFontSize: 60,
  margin: 40,
};
