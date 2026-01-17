import { useState } from 'react';

interface BulkUrlInputProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (entries: { url: string; filename: string; label: string }[]) => void;
}

export function BulkUrlInput({ isOpen, onClose, onImport }: BulkUrlInputProps) {
  const [inputText, setInputText] = useState('');
  const [parseMode, setParseMode] = useState<'url-only' | 'with-data'>('url-only');

  if (!isOpen) return null;

  const parseInput = () => {
    const lines = inputText
      .split(/[\r\n]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const entries = lines.map((line) => {
      if (parseMode === 'with-data') {
        // Support tab-separated or comma-separated: URL, filename, label
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        return {
          url: parts[0]?.trim() || '',
          filename: parts[1]?.trim() || '',
          label: (parts[2]?.trim() || '').substring(0, 4),
        };
      } else {
        // URL only mode
        return {
          url: line,
          filename: '',
          label: '',
        };
      }
    });

    // Filter out entries without valid URLs
    const validEntries = entries.filter((e) => e.url.length > 0);

    if (validEntries.length > 0) {
      onImport(validEntries);
      setInputText('');
      onClose();
    }
  };

  const previewCount = inputText
    .split(/[\r\n]+/)
    .filter((line) => line.trim().length > 0).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">批次匯入網址</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Mode Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">匯入模式</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="parseMode"
                  checked={parseMode === 'url-only'}
                  onChange={() => setParseMode('url-only')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">僅網址（每行一個）</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="parseMode"
                  checked={parseMode === 'with-data'}
                  onChange={() => setParseMode('with-data')}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">含檔名與標籤</span>
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            {parseMode === 'url-only' ? (
              <p>請貼上網址清單，每行一個網址。</p>
            ) : (
              <div>
                <p className="mb-2">請貼上資料，每行一筆，欄位以 Tab 或逗號分隔：</p>
                <p className="font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200">
                  網址, 檔案名稱, 標籤文字
                </p>
              </div>
            )}
          </div>

          {/* Textarea */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              parseMode === 'url-only'
                ? 'https://example.com/page1\nhttps://example.com/page2\nhttps://example.com/page3'
                : 'https://example.com/page1, file1, 標籤\nhttps://example.com/page2, file2, 文字'
            }
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          />

          {/* Preview */}
          {previewCount > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              偵測到 <span className="font-semibold text-blue-600">{previewCount}</span> 筆資料
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={parseInput}
            disabled={previewCount === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            匯入 {previewCount > 0 && `(${previewCount} 筆)`}
          </button>
        </div>
      </div>
    </div>
  );
}
