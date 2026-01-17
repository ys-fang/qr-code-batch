import type { QRCodeEntry } from '../types';
import { QRCodePreview } from './QRCodePreview';

interface DataInputTableProps {
  entries: QRCodeEntry[];
  onUpdateEntry: (id: string, field: keyof QRCodeEntry, value: string) => void;
  onAddEntry: () => void;
  onRemoveEntry: (id: string) => void;
  onGenerated: (id: string, dataUrl: string) => void;
}

export function DataInputTable({
  entries,
  onUpdateEntry,
  onAddEntry,
  onRemoveEntry,
  onGenerated,
}: DataInputTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 w-12">
              #
            </th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
              連結 (URL)
            </th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 w-36">
              檔案名稱
            </th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700 w-28">
              標籤文字
              <span className="block text-xs font-normal text-gray-500">
                (最多4字)
              </span>
            </th>
            <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 w-28">
              QR Code
            </th>
            <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 w-16">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                {index + 1}
              </td>
              <td className="border border-gray-200 px-2 py-2">
                <input
                  type="url"
                  value={entry.url}
                  onChange={(e) => onUpdateEntry(entry.id, 'url', e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </td>
              <td className="border border-gray-200 px-2 py-2">
                <input
                  type="text"
                  value={entry.filename}
                  onChange={(e) => onUpdateEntry(entry.id, 'filename', e.target.value)}
                  placeholder="自訂檔名"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </td>
              <td className="border border-gray-200 px-2 py-2">
                <input
                  type="text"
                  value={entry.label}
                  onChange={(e) => onUpdateEntry(entry.id, 'label', e.target.value.substring(0, 4))}
                  placeholder="標籤"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center"
                  style={{ fontFamily: '"Microsoft JhengHei", "PingFang TC", "Noto Sans TC", sans-serif' }}
                />
              </td>
              <td className="border border-gray-200 px-2 py-2">
                <div className="flex justify-center">
                  <QRCodePreview entry={entry} onGenerated={onGenerated} />
                </div>
              </td>
              <td className="border border-gray-200 px-2 py-2 text-center">
                <button
                  onClick={() => onRemoveEntry(entry.id)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition-colors"
                  title="刪除此列"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <button
          onClick={onAddEntry}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          新增一列
        </button>
      </div>
    </div>
  );
}
