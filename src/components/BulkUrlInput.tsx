import { useState, useRef, useCallback, useEffect } from 'react';

interface BulkUrlInputProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (entries: { url: string; filename: string; label: string }[]) => void;
}

interface RowData {
  url: string;
  filename: string;
  label: string;
}

const INITIAL_ROWS = 10;
const COLUMNS = ['url', 'filename', 'label'] as const;
const COLUMN_HEADERS = ['網址', '檔案名稱', '標籤（4字）'];

function createEmptyRows(count: number): RowData[] {
  return Array.from({ length: count }, () => ({
    url: '',
    filename: '',
    label: '',
  }));
}

export function BulkUrlInput({ isOpen, onClose, onImport }: BulkUrlInputProps) {
  const [rows, setRows] = useState<RowData[]>(() => createEmptyRows(INITIAL_ROWS));
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setRows(createEmptyRows(INITIAL_ROWS));
      setSelectedCell(null);
    }
  }, [isOpen]);

  const updateCell = useCallback((rowIndex: number, column: typeof COLUMNS[number], value: string) => {
    setRows((prev) => {
      const newRows = [...prev];
      const newValue = column === 'label' ? value.substring(0, 4) : value;
      newRows[rowIndex] = { ...newRows[rowIndex], [column]: newValue };
      return newRows;
    });
  }, []);

  const addRows = useCallback((count: number) => {
    setRows((prev) => [...prev, ...createEmptyRows(count)]);
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent, rowIndex: number, colIndex: number) => {
    const clipboardData = e.clipboardData.getData('text');
    if (!clipboardData) return;

    // Check if it's multi-line or tab-separated data (from spreadsheet)
    const lines = clipboardData.split(/\r?\n/).filter((line) => line.length > 0);

    if (lines.length > 1 || clipboardData.includes('\t')) {
      e.preventDefault();

      const parsedRows: RowData[] = lines.map((line) => {
        const cells = line.split('\t');
        return {
          url: cells[0]?.trim() || '',
          filename: cells[1]?.trim() || '',
          label: (cells[2]?.trim() || '').substring(0, 4),
        };
      });

      setRows((prev) => {
        const newRows = [...prev];

        // Insert parsed data starting from current row
        parsedRows.forEach((data, i) => {
          const targetRow = rowIndex + i;
          if (targetRow < newRows.length) {
            // Starting from the column where paste occurred
            if (colIndex === 0) {
              newRows[targetRow] = data;
            } else if (colIndex === 1) {
              newRows[targetRow] = {
                ...newRows[targetRow],
                filename: data.url,
                label: data.filename.substring(0, 4)
              };
            } else {
              newRows[targetRow] = {
                ...newRows[targetRow],
                label: data.url.substring(0, 4)
              };
            }
          } else {
            newRows.push(data);
          }
        });

        // Add extra empty rows if needed
        const emptyRowsNeeded = Math.max(0, 3 - (newRows.length - rowIndex - parsedRows.length));
        if (emptyRowsNeeded > 0) {
          newRows.push(...createEmptyRows(emptyRowsNeeded));
        }

        return newRows;
      });
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    const lastRowIndex = rows.length - 1;
    const lastColIndex = COLUMNS.length - 1;

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Move backward
        if (colIndex > 0) {
          setSelectedCell({ row: rowIndex, col: colIndex - 1 });
        } else if (rowIndex > 0) {
          setSelectedCell({ row: rowIndex - 1, col: lastColIndex });
        }
      } else {
        // Move forward
        if (colIndex < lastColIndex) {
          setSelectedCell({ row: rowIndex, col: colIndex + 1 });
        } else if (rowIndex < lastRowIndex) {
          setSelectedCell({ row: rowIndex + 1, col: 0 });
        } else {
          // At last cell, add new row
          addRows(1);
          setSelectedCell({ row: rowIndex + 1, col: 0 });
        }
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex < lastRowIndex) {
        setSelectedCell({ row: rowIndex + 1, col: colIndex });
      } else {
        addRows(1);
        setSelectedCell({ row: rowIndex + 1, col: colIndex });
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIndex < lastRowIndex) {
        setSelectedCell({ row: rowIndex + 1, col: colIndex });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        setSelectedCell({ row: rowIndex - 1, col: colIndex });
      }
    }
  }, [rows.length, addRows]);

  // Focus selected cell
  useEffect(() => {
    if (selectedCell && tableRef.current) {
      const input = tableRef.current.querySelector(
        `input[data-row="${selectedCell.row}"][data-col="${selectedCell.col}"]`
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }
  }, [selectedCell]);

  const handleImport = useCallback(() => {
    const validEntries = rows.filter((row) => row.url.trim().length > 0);
    if (validEntries.length > 0) {
      onImport(validEntries);
      onClose();
    }
  }, [rows, onImport, onClose]);

  const clearAll = useCallback(() => {
    setRows(createEmptyRows(INITIAL_ROWS));
    setSelectedCell(null);
  }, []);

  const validCount = rows.filter((row) => row.url.trim().length > 0).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">批次匯入網址</h2>
            <p className="text-sm text-gray-500 mt-1">
              直接從 Google 試算表或 Excel 貼上資料，或在下方表格中輸入
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Spreadsheet Grid */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            <table ref={tableRef} className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="w-12 px-2 py-2 text-center text-xs font-medium text-gray-500 border-r border-b border-gray-300">
                    #
                  </th>
                  {COLUMN_HEADERS.map((header, i) => (
                    <th
                      key={header}
                      className={`px-3 py-2 text-left text-xs font-medium text-gray-600 border-b border-gray-300 ${
                        i < COLUMN_HEADERS.length - 1 ? 'border-r' : ''
                      } ${i === 0 ? 'w-1/2' : i === 1 ? 'w-1/3' : 'w-24'}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-blue-50/30">
                    <td className="px-2 py-0 text-center text-xs text-gray-400 border-r border-b border-gray-200 bg-gray-50">
                      {rowIndex + 1}
                    </td>
                    {COLUMNS.map((col, colIndex) => (
                      <td
                        key={col}
                        className={`p-0 border-b border-gray-200 ${
                          colIndex < COLUMNS.length - 1 ? 'border-r' : ''
                        }`}
                      >
                        <input
                          type="text"
                          data-row={rowIndex}
                          data-col={colIndex}
                          value={row[col]}
                          onChange={(e) => updateCell(rowIndex, col, e.target.value)}
                          onPaste={(e) => handlePaste(e, rowIndex, colIndex)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                          onFocus={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                          placeholder={colIndex === 0 ? 'https://...' : colIndex === 2 ? '最多4字' : ''}
                          className={`w-full px-3 py-2 text-sm border-0 outline-none focus:bg-blue-50 focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                            selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                              ? 'bg-blue-50'
                              : ''
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Rows Button */}
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={() => addRows(10)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              新增 10 列
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              清空全部
            </button>
          </div>

          {/* Tips */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            <p className="font-medium mb-1">使用提示：</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>從 Google 試算表或 Excel 複製資料後，點擊任一儲存格並貼上 (Ctrl+V / Cmd+V)</li>
              <li>按 Tab 鍵在欄位間移動，按 Enter 鍵移到下一列</li>
              <li>標籤欄位最多 4 個字元</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="text-sm text-gray-500">
            {validCount > 0 ? (
              <span>
                已填入 <span className="font-semibold text-blue-600">{validCount}</span> 筆有效資料
              </span>
            ) : (
              <span>尚未輸入任何資料</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleImport}
              disabled={validCount === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              匯入 {validCount > 0 && `(${validCount} 筆)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
