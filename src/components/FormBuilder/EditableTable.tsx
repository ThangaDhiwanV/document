import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TableCell {
  id: string;
  content: string;
  style: {
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    borderColor?: string;
    borderWidth?: number;
  };
}

interface TableRow {
  id: string;
  cells: TableCell[];
}

interface EditableTableProps {
  rows: TableRow[];
  columns: number;
  onUpdateTable: (rows: TableRow[], columns: number) => void;
  label: string;
  required?: boolean;
}

const EditableTable: React.FC<EditableTableProps> = ({
  rows: initialRows,
  columns: initialColumns,
  onUpdateTable,
  label,
  required = false
}) => {
  const [rows, setRows] = useState<TableRow[]>(initialRows.length > 0 ? initialRows : [
    {
      id: 'row-1',
      cells: Array.from({ length: initialColumns || 3 }, (_, i) => ({
        id: `cell-1-${i}`,
        content: i === 0 ? 'Parameter' : i === 1 ? 'Specification' : 'Result',
        style: {
          backgroundColor: '#f9fafb',
          fontWeight: 'bold',
          textAlign: 'left' as const,
          borderColor: '#d1d5db',
          borderWidth: 1
        }
      }))
    },
    {
      id: 'row-2',
      cells: Array.from({ length: initialColumns || 3 }, (_, i) => ({
        id: `cell-2-${i}`,
        content: '',
        style: {
          textAlign: 'left' as const,
          borderColor: '#d1d5db',
          borderWidth: 1
        }
      }))
    }
  ]);
  
  const [columns, setColumns] = useState(initialColumns || 3);
  const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; cellIndex: number } | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const updateCell = (rowIndex: number, cellIndex: number, updates: Partial<TableCell>) => {
    const newRows = [...rows];
    if (newRows[rowIndex] && newRows[rowIndex].cells[cellIndex]) {
      newRows[rowIndex].cells[cellIndex] = { ...newRows[rowIndex].cells[cellIndex], ...updates };
    }
    setRows(newRows);
    onUpdateTable(newRows, columns);
  };

  const addRow = () => {
    const newRow: TableRow = {
      id: `row-${Date.now()}`,
      cells: Array.from({ length: columns }, (_, i) => ({
        id: `cell-${Date.now()}-${i}`,
        content: '',
        style: {
          textAlign: 'left' as const,
          borderColor: '#d1d5db',
          borderWidth: 1
        }
      }))
    };
    const newRows = [...rows, newRow];
    setRows(newRows);
    onUpdateTable(newRows, columns);
  };

  const addColumn = () => {
    const newColumns = columns + 1;
    const newRows = rows.map(row => ({
      ...row,
      cells: [
        ...row.cells,
        {
          id: `cell-${Date.now()}-${row.cells.length}`,
          content: '',
          style: {
            textAlign: 'left' as const,
            borderColor: '#d1d5db',
            borderWidth: 1
          }
        }
      ]
    }));
    setColumns(newColumns);
    setRows(newRows);
    onUpdateTable(newRows, newColumns);
  };

  const deleteRow = (rowIndex: number) => {
    if (rows.length > 1) {
      const newRows = rows.filter((_, index) => index !== rowIndex);
      setRows(newRows);
      onUpdateTable(newRows, columns);
      setSelectedCell(null);
    }
  };

  const deleteColumn = (columnIndex: number) => {
    if (columns > 1) {
      const newColumns = columns - 1;
      const newRows = rows.map(row => ({
        ...row,
        cells: row.cells.filter((_, index) => index !== columnIndex)
      }));
      setColumns(newColumns);
      setRows(newRows);
      onUpdateTable(newRows, newColumns);
      setSelectedCell(null);
    }
  };

  const handleCellRightClick = (e: React.MouseEvent, rowIndex: number, cellIndex: number) => {
    e.preventDefault();
    setSelectedCell({ rowIndex, cellIndex });
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const applyCellStyle = (style: Partial<TableCell['style']>) => {
    if (selectedCell) {
      const currentCell = rows[selectedCell.rowIndex]?.cells[selectedCell.cellIndex];
      if (currentCell) {
        updateCell(selectedCell.rowIndex, selectedCell.cellIndex, { 
          style: { ...currentCell.style, ...style }
        });
      }
    }
    setShowContextMenu(false);
  };

  const backgroundColors = [
    '#ffffff', '#f9fafb', '#f3f4f6', '#e5e7eb',
    '#fef2f2', '#fef7f0', '#fffbeb', '#f0fdf4',
    '#eff6ff', '#f5f3ff', '#fdf4ff', '#fdf2f8'
  ];

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Table Toolbar */}
      <div className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 rounded-t-lg border border-gray-300">
        <button
          onClick={addRow}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="w-3 h-3" />
          <span>Row</span>
        </button>
        <button
          onClick={addColumn}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Plus className="w-3 h-3" />
          <span>Column</span>
        </button>
        
        {selectedCell && (
          <>
            <div className="w-px h-4 bg-gray-300"></div>
            <button
              onClick={() => applyCellStyle({ fontWeight: 'bold' })}
              className="p-1 hover:bg-gray-200 rounded"
              title="Bold"
            >
              <Bold className="w-3 h-3" />
            </button>
            <button
              onClick={() => applyCellStyle({ fontStyle: 'italic' })}
              className="p-1 hover:bg-gray-200 rounded"
              title="Italic"
            >
              <Italic className="w-3 h-3" />
            </button>
            <button
              onClick={() => applyCellStyle({ textAlign: 'left' })}
              className="p-1 hover:bg-gray-200 rounded"
              title="Align Left"
            >
              <AlignLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => applyCellStyle({ textAlign: 'center' })}
              className="p-1 hover:bg-gray-200 rounded"
              title="Align Center"
            >
              <AlignCenter className="w-3 h-3" />
            </button>
            <button
              onClick={() => applyCellStyle({ textAlign: 'right' })}
              className="p-1 hover:bg-gray-200 rounded"
              title="Align Right"
            >
              <AlignRight className="w-3 h-3" />
            </button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="border border-gray-300 rounded-b-lg overflow-hidden">
        <table className="w-full">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={cell.id}
                    className={`relative group ${
                      selectedCell?.rowIndex === rowIndex && selectedCell?.cellIndex === cellIndex
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                    style={{
                      backgroundColor: cell.style.backgroundColor,
                      borderColor: cell.style.borderColor,
                      borderWidth: cell.style.borderWidth,
                      borderStyle: 'solid'
                    }}
                    onContextMenu={(e) => handleCellRightClick(e, rowIndex, cellIndex)}
                    onClick={() => setSelectedCell({ rowIndex, cellIndex })}
                  >
                    <input
                      type="text"
                      value={cell.content}
                      onChange={(e) => updateCell(rowIndex, cellIndex, { content: e.target.value })}
                      className="w-full px-2 py-1 bg-transparent border-none focus:outline-none"
                      style={{
                        textAlign: cell.style.textAlign,
                        fontWeight: cell.style.fontWeight,
                        fontStyle: cell.style.fontStyle
                      }}
                      placeholder={rowIndex === 0 ? `Header ${cellIndex + 1}` : `Cell ${rowIndex + 1}-${cellIndex + 1}`}
                    />
                    
                    {/* Row controls */}
                    {cellIndex === 0 && (
                      <div className="absolute left-0 top-0 -ml-8 h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => deleteRow(rowIndex)}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    {/* Column controls */}
                    {rowIndex === 0 && (
                      <div className="absolute top-0 left-0 -mt-8 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => deleteColumn(cellIndex)}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Delete Column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
          onMouseLeave={() => setShowContextMenu(false)}
        >
          <div className="text-xs font-medium text-gray-700 mb-2">Background Color</div>
          <div className="grid grid-cols-6 gap-1 mb-2">
            {backgroundColors.map((color) => (
              <button
                key={color}
                onClick={() => applyCellStyle({ backgroundColor: color })}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={() => applyCellStyle({ borderWidth: 2, borderColor: '#374151' })}
              className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
            >
              Thick Border
            </button>
            <button
              onClick={() => applyCellStyle({ borderWidth: 1, borderColor: '#d1d5db' })}
              className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
            >
              Thin Border
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableTable;