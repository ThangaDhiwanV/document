import React from 'react';
import { useDrop } from 'react-dnd';
import { Clock, User, FileText, PenTool, Eye, Download, AlertTriangle, Calendar, Building } from 'lucide-react';
import { Document, User as UserType, DocumentStatus, DocumentType } from '../../types';
import { format } from 'date-fns';
import StatusBadge from '../documents/StatusBadge';

interface KanbanViewProps {
  documents: Document[];
  users: UserType[];
  groupBy: 'status' | 'type' | 'assignee';
  onSign: (documentId: string) => void;
  onPreview: (documentId: string) => void;
  onDownload: (documentId: string) => void;
  downloadingId: string | null;
  onMoveDocument: (documentId: string, newStatus: DocumentStatus, newAssignee?: string, newType?: DocumentType) => void;
}

interface DraggableDocumentCardProps {
  document: Document;
  users: UserType[];
  onSign: (documentId: string) => void;
  onPreview: (documentId: string) => void;
  onDownload: (documentId: string) => void;
  downloadingId: string | null;
}

const DraggableDocumentCard: React.FC<DraggableDocumentCardProps> = ({
  document,
  users,
  onSign,
  onPreview,
  onDownload,
  downloadingId
}) => {
  const isUrgent = document.dueDate && new Date(document.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const creator = users.find(u => u.id === document.createdBy);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', document.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all cursor-move group"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <h4 className="text-sm font-medium text-gray-900 truncate" title={document.name}>
            {document.name}
          </h4>
        </div>
        {isUrgent && (
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 ml-1" />
        )}
      </div>

      <div className="space-y-1 mb-2 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="font-medium truncate ml-1">{document.type.replace('_', ' ').toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Version:</span>
          <span className="font-medium">{document.version}</span>
        </div>
        <div className="flex justify-between">
          <span>Created by:</span>
          <span className="font-medium truncate ml-1">{creator?.name || 'Unknown'}</span>
        </div>
        <div className="flex justify-between">
          <span>Created:</span>
          <span className="font-medium">{format(document.createdAt, 'MMM d')}</span>
        </div>
        {document.dueDate && (
          <div className="flex justify-between">
            <span>Due:</span>
            <span className={`font-medium ${isUrgent ? 'text-red-600' : ''}`}>
              {format(document.dueDate, 'MMM d')}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-2">
        <StatusBadge status={document.status} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPreview(document.id)}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Preview"
          >
            <Eye className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDownload(document.id)}
            disabled={downloadingId === document.id}
            className="p-1 text-green-600 hover:text-green-900 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
            title="Download"
          >
            <Download className={`w-3 h-3 ${downloadingId === document.id ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {(document.status === 'pending_signature' || document.status === 'under_review') && (
          <button
            onClick={() => onSign(document.id)}
            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            Sign
          </button>
        )}
      </div>
    </div>
  );
};

const KanbanView: React.FC<KanbanViewProps> = ({
  documents,
  users,
  groupBy,
  onSign,
  onPreview,
  onDownload,
  downloadingId,
  onMoveDocument
}) => {
  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="flex space-x-4 pb-4 min-w-max h-full">
        {/* Kanban columns will be rendered here */}
      </div>
    </div>
  );
};

export default KanbanView;