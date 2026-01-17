import { useState, useCallback } from 'react';
import type { QRCodeEntry } from './types';
import { DataInputTable } from './components/DataInputTable';
import { BulkUrlInput } from './components/BulkUrlInput';
import { downloadAllAsZip } from './utils/batchDownload';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function createEmptyEntry(): QRCodeEntry {
  return {
    id: generateId(),
    url: '',
    filename: '',
    label: '',
    generated: false,
  };
}

function App() {
  const [entries, setEntries] = useState<QRCodeEntry[]>([
    createEmptyEntry(),
    createEmptyEntry(),
    createEmptyEntry(),
  ]);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBulkInput, setShowBulkInput] = useState(false);

  const handleUpdateEntry = useCallback(
    (id: string, field: keyof QRCodeEntry, value: string) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? { ...entry, [field]: value, generated: field === 'url' || field === 'label' ? false : entry.generated }
            : entry
        )
      );
    },
    []
  );

  const handleAddEntry = useCallback(() => {
    setEntries((prev) => [...prev, createEmptyEntry()]);
  }, []);

  const handleRemoveEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const filtered = prev.filter((entry) => entry.id !== id);
      return filtered.length === 0 ? [createEmptyEntry()] : filtered;
    });
  }, []);

  const handleGenerated = useCallback((id: string, dataUrl: string) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, generated: true, dataUrl } : entry
      )
    );
  }, []);

  const handleBulkImport = useCallback(
    (importedEntries: { url: string; filename: string; label: string }[]) => {
      const newEntries = importedEntries.map((data) => ({
        id: generateId(),
        url: data.url,
        filename: data.filename,
        label: data.label,
        generated: false,
      }));
      setEntries((prev) => {
        // Remove empty entries at the end, then add new ones
        const nonEmptyPrev = prev.filter((e) => e.url || e.filename || e.label);
        return [...nonEmptyPrev, ...newEntries];
      });
    },
    []
  );

  const handleDownloadAll = async () => {
    setDownloading(true);
    setError(null);
    try {
      await downloadAllAsZip(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const generatedCount = entries.filter((e) => e.generated).length;
  const totalWithUrl = entries.filter((e) => e.url).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                QR Code 批次產生器
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                輸入連結、檔名與標籤文字，即可批次產生 QR Code 圖片
              </p>
            </div>
            <div className="flex items-center gap-4">
              {generatedCount > 0 && (
                <span className="text-sm text-gray-600">
                  已產生 {generatedCount} / {totalWithUrl} 張
                </span>
              )}
              <button
                onClick={handleDownloadAll}
                disabled={generatedCount === 0 || downloading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-sm"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    下載中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    全部下載 (ZIP)
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h2 className="text-sm font-semibold text-blue-800 mb-2">使用說明</h2>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. 在「連結」欄位輸入您想要轉換的網址</li>
              <li>2. (選填) 輸入自訂檔案名稱</li>
              <li>3. (選填) 輸入最多 4 個繁體中文字作為標籤，會顯示在 QR Code 下方</li>
              <li>4. 系統會自動產生 800x800 像素的 QR Code 圖片</li>
              <li>5. 點擊 QR Code 可單獨下載，或點擊「全部下載」打包成 ZIP</li>
            </ul>
          </div>

          {/* Data Table */}
          <DataInputTable
            entries={entries}
            onUpdateEntry={handleUpdateEntry}
            onAddEntry={handleAddEntry}
            onRemoveEntry={handleRemoveEntry}
            onGenerated={handleGenerated}
            onOpenBulkInput={() => setShowBulkInput(true)}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>QR Code 尺寸：800 x 800 像素 | 適合印刷使用</p>
        </div>
      </main>

      {/* Bulk URL Input Modal */}
      <BulkUrlInput
        isOpen={showBulkInput}
        onClose={() => setShowBulkInput(false)}
        onImport={handleBulkImport}
      />
    </div>
  );
}

export default App;
