# QR Code 批次產生器

一個現代化的網頁應用程式，用於批次產生帶有繁體中文標籤的 QR Code 圖片。

## 功能特色

- **批次產生**：一次輸入多個網址，同時產生多個 QR Code
- **繁體中文標籤**：每個 QR Code 下方可顯示最多 4 個繁體中文字
- **自訂檔名**：可為每個 QR Code 指定自訂檔案名稱
- **高解析度輸出**：800 x 800 像素，適合印刷使用
- **單獨/批次下載**：點擊單一 QR Code 可單獨下載，或一鍵打包下載全部
- **即時預覽**：輸入資料後即時顯示 QR Code 預覽

## 技術堆疊

- **框架**: React 19 + TypeScript
- **建置工具**: Vite
- **樣式**: Tailwind CSS v4
- **QR Code 產生**: qrcode
- **批次下載**: JSZip + file-saver

## 安裝與執行

```bash
# 安裝依賴套件
npm install

# 開發模式執行
npm run dev

# 建置正式版本
npm run build

# 預覽正式版本
npm run preview
```

## 使用說明

1. 在「連結」欄位輸入您想要轉換的網址
2. (選填) 輸入自訂檔案名稱
3. (選填) 輸入最多 4 個繁體中文字作為標籤，會顯示在 QR Code 下方
4. 系統會自動產生 800x800 像素的 QR Code 圖片
5. 點擊 QR Code 可單獨下載，或點擊「全部下載」打包成 ZIP

## 部署

此專案可輕鬆部署至各種靜態網站託管服務：

- **Vercel**: 連結 GitHub 後自動部署
- **Netlify**: 拖放 `dist` 資料夾或連結 GitHub
- **GitHub Pages**: 使用 GitHub Actions 自動部署

## 專案結構

```
src/
├── components/
│   ├── DataInputTable.tsx   # 資料輸入表格元件
│   └── QRCodePreview.tsx    # QR Code 預覽元件
├── types/
│   └── index.ts             # TypeScript 型別定義
├── utils/
│   ├── qrGenerator.ts       # QR Code 產生邏輯
│   └── batchDownload.ts     # 批次下載功能
├── App.tsx                  # 主應用程式元件
├── main.tsx                 # 應用程式進入點
└── index.css                # 全域樣式 (Tailwind)
```

## 授權

MIT License
