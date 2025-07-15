import React from 'react';
import { ChevronUp, ChevronDown, Eye, Edit, Download, Trash2 } from 'lucide-react';
import { Document } from '../../types';
import StatusBadge from './StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';

interface DocumentTableProps {
  documents: Document[];
  loading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  loading,
  sortBy,
  sortOrder,
  onSort,
  onView,
  onEdit,
  onDownload,
  onDelete
}) => {
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getDocumentTypeDisplayName = (type: string) => {
    const typeNames: Record<string, string> = {
      test_method: 'Test Method',
      sop: 'Standard Operating Procedure',
      coa: 'Certificate of Analysis',
      specification: 'Product Specification',
      protocol: 'Validation Protocol',
      report: 'Analytical Report'
    };
    return typeNames[type] || type;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0 z-20">
            <tr>
              {[
                { key: 'Name', label: 'Name' },
                { key: 'Type', label: 'Type' },
                { key: 'Version', label: 'Version' },
                { key: 'Status', label: 'Status' },
                { key: 'Created By', label: 'Created By' },
                { key: 'Assigned To', label: 'Assigned To' },
                { key: 'Created Date', label: 'Created Date' },
                { key: 'Due Date', label: 'Due Date' }
              ].map(({ key, label }) => (
                <th 
                  key={key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => onSort(key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{label}</span>
                    {getSortIcon(key)}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 border-b border-gray-200">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{doc.name}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {getDocumentTypeDisplayName(doc.type)}
                </td>
                <td className="px-4 py-3 text-gray-600">{doc.version}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-4 py-3 text-gray-600">{doc.createdBy}</td>
                <td className="px-4 py-3 text-gray-600">{doc.assignedTo.join(', ')}</td>
                <td className="px-4 py-3 text-gray-600">{doc.createdAt.toLocaleDateString()}</td>
                <td className="px-4 py-3 text-gray-600">
                  {doc.dueDate ? doc.dueDate.toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(doc.id)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(doc.id)}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDownload(doc.id)}
                      className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentTable;