import React from 'react';
import { useDrop } from 'react-dnd';
import { Clock, User, FileText, PenTool, Eye, Download, AlertTriangle } from 'lucide-react';
import { Document, User as UserType, DocumentStatus, DocumentType } from '../../types';
import { format } from 'date-fns';
import StatusBadge from '../Documents/StatusBadge';

interface KanbanViewProps {
  documents: Document[];
  users: UserType[];
  groupBy: 'status' | 'type' | 'assignee';
  onSign: (documentId: string) => void;
  onPreview: (documentId: string) => void;
  onDownload: (documentId: string) => void;
  downloadingId: string | null;
  onMoveDocument: (documentId: string, newStatus: DocumentStatus) => void;
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

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all cursor-move"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', document.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <h4 className="text-sm font-medium text-gray-900 truncate">{document.name}</h4>
        </div>
        {isUrgent && (
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 ml-1" />
        )}
      </div>

      <div className="space-y-1 mb-3 text-xs text-gray-600">
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

      {document.signatures.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-1">
            <PenTool className="w-3 h-3 text-green-600" />
            <span className="text-xs text-gray-600">
              {document.signatures.length} signature{document.signatures.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface DroppableColumnProps {
  id: string;
  title: string;
  color: string;
  documents: Document[];
  users: UserType[];
  onSign: (documentId: string) => void;
  onPreview: (documentId: string) => void;
  onDownload: (documentId: string) => void;
  downloadingId: string | null;
  onMoveDocument: (documentId: string, newStatus: DocumentStatus) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  id,
  title,
  color,
  documents,
  users,
  onSign,
  onPreview,
  onDownload,
  downloadingId,
  onMoveDocument
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'document',
    drop: (item: { id: string }) => {
      if (id === 'draft' || id === 'under_review' || id === 'approved' || id === 'pending_signature' || id === 'signed' || id === 'rejected') {
        onMoveDocument(item.id, id as DocumentStatus);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  return (
    <div
      ref={drop}
      className={`flex-shrink-0 w-80 ${color} rounded-lg border-2 p-4 h-full ${
        isOver ? 'border-blue-400 bg-blue-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-700">
          {documents.length}
        </span>
      </div>
      
      <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
        {documents.map((document) => (
          <DraggableDocumentCard
            key={document.id}
            document={document}
            users={users}
            onSign={onSign}
            onPreview={onPreview}
            onDownload={onDownload}
            downloadingId={downloadingId}
          />
        ))}
        
        {documents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No documents</p>
          </div>
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
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const getGroupedDocuments = () => {
    switch (groupBy) {
      case 'status':
        const statusColumns: { status: DocumentStatus; title: string; color: string }[] = [
          { status: 'draft', title: 'Draft', color: 'bg-gray-100 border-gray-300' },
          { status: 'under_review', title: 'Under Review', color: 'bg-yellow-100 border-yellow-300' },
          { status: 'approved', title: 'Approved', color: 'bg-blue-100 border-blue-300' },
          { status: 'pending_signature', title: 'Pending Signature', color: 'bg-orange-100 border-orange-300' },
          { status: 'signed', title: 'Signed', color: 'bg-green-100 border-green-300' },
          { status: 'rejected', title: 'Rejected', color: 'bg-red-100 border-red-300' }
        ];
        return statusColumns.map(column => ({
          id: column.status,
          title: column.title,
          color: column.color,
          documents: documents.filter(doc => doc.status === column.status)
        }));

      case 'type':
        const typeColumns: { type: DocumentType; title: string; color: string }[] = [
          { type: 'test_method', title: 'Test Methods', color: 'bg-blue-100 border-blue-300' },
          { type: 'coa', title: 'Certificates of Analysis', color: 'bg-green-100 border-green-300' },
          { type: 'sop', title: 'SOPs', color: 'bg-purple-100 border-purple-300' },
          { type: 'protocol', title: 'Protocols', color: 'bg-indigo-100 border-indigo-300' },
          { type: 'specification', title: 'Specifications', color: 'bg-pink-100 border-pink-300' },
          { type: 'report', title: 'Reports', color: 'bg-yellow-100 border-yellow-300' }
        ];
        return typeColumns.map(column => ({
          id: column.type,
          title: column.title,
          color: column.color,
          documents: documents.filter(doc => doc.type === column.type)
        }));

      case 'assignee':
        const assigneeGroups = new Map<string, Document[]>();
        const unassignedDocs: Document[] = [];
        
        documents.forEach(doc => {
          if (doc.assignedTo.length === 0) {
            unassignedDocs.push(doc);
          } else {
            doc.assignedTo.forEach(userId => {
              if (!assigneeGroups.has(userId)) {
                assigneeGroups.set(userId, []);
              }
              assigneeGroups.get(userId)!.push(doc);
            });
          }
        });

        const columns = Array.from(assigneeGroups.entries()).map(([userId, docs]) => {
          const user = users.find(u => u.id === userId);
          return {
            id: userId,
            title: user?.name || 'Unknown User',
            color: 'bg-gray-100 border-gray-300',
            documents: docs
          };
        });

        if (unassignedDocs.length > 0) {
          columns.push({
            id: 'unassigned',
            title: 'Unassigned',
            color: 'bg-gray-100 border-gray-300',
            documents: unassignedDocs
          });
        }

        return columns;

      default:
        return [];
    }
  };

  const groupedData = getGroupedDocuments();

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex space-x-6 pb-6 min-w-max">
        {groupedData.map((group) => (
          <DroppableColumn
            key={group.id}
            id={group.id}
            title={group.title}
            color={group.color}
            documents={group.documents}
            users={users}
            onSign={onSign}
            onPreview={onPreview}
            onDownload={onDownload}
            downloadingId={downloadingId}
            onMoveDocument={onMoveDocument}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanView;