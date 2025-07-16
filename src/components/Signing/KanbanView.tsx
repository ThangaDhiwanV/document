import React from 'react';
import { useDrop } from 'react-dnd';
import { Clock, User, FileText, PenTool, Eye, Download, AlertTriangle, Calendar, Building } from 'lucide-react';
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
  onDelete: (documentId: string) => void;
  onMoveDocument: (documentId: string, newStatus: DocumentStatus, newAssignee?: string, newType?: DocumentType) => void;
}

interface DraggableDocumentCardProps {
  document: Document;
  users: UserType[];
  onSign: (documentId: string) => void;
  onPreview: (documentId: string) => void;
  onDownload: (documentId: string) => void;
  downloadingId: string | null;
  onDelete: (documentId: string) => void;
}

const DraggableDocumentCard: React.FC<DraggableDocumentCardProps> = ({
  document,
  users,
  onSign,
  onPreview,
  onDownload,
  downloadingId,
  onDelete
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
      style={{ minWidth: '280px', maxWidth: '320px' }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 min-w-0 flex-1 overflow-hidden">
          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <h4 className="text-sm font-medium text-gray-900 truncate flex-1" title={document.name}>
            {document.name}
          </h4>
        </div>
        {isUrgent && (
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 ml-1" />
        )}
      </div>

      <div className="space-y-1 mb-2 text-xs text-gray-600 overflow-hidden">
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="font-medium truncate ml-1 max-w-[120px]">{document.type.replace('_', ' ').toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Version:</span>
          <span className="font-medium">{document.version}</span>
        </div>
        <div className="flex justify-between">
          <span>Created by:</span>
          <span className="font-medium truncate ml-1 max-w-[120px]">{creator?.name || 'Unknown'}</span>
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
  groupBy: 'status' | 'type' | 'assignee';
  onSign: (documentId: string) => void;
  onPreview: (documentId: string) => void;
  onDownload: (documentId: string) => void;
  downloadingId: string | null;
  onDelete: (documentId: string) => void;
  onMoveDocument: (documentId: string, newStatus: DocumentStatus, newAssignee?: string, newType?: DocumentType) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  id,
  title,
  color,
  documents,
  users,
  groupBy,
  onSign,
  onPreview,
  onDownload,
  downloadingId,
  onDelete,
  onMoveDocument
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'document',
    drop: (item: any) => {
      const documentId = item.id || item;
      
      // Update document based on groupBy type
      if (groupBy === 'status') {
        onMoveDocument(documentId, id as DocumentStatus);
      } else if (groupBy === 'type') {
        // Keep current status, update type
        onMoveDocument(documentId, 'draft', undefined, id as DocumentType);
      } else if (groupBy === 'assignee') {
        // Keep current status, update assignee
        onMoveDocument(documentId, 'draft', id === 'unassigned' ? '' : id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const documentId = e.dataTransfer.getData('text/plain');
    
    if (documentId) {
      // Update document based on groupBy type
      if (groupBy === 'status') {
        onMoveDocument(documentId, id as DocumentStatus);
      } else if (groupBy === 'type') {
        // Keep current status, update type
        onMoveDocument(documentId, 'draft', undefined, id as DocumentType);
      } else if (groupBy === 'assignee') {
        // Keep current status, update assignee
        onMoveDocument(documentId, 'draft', id === 'unassigned' ? '' : id);
      }
    }
  };

  return (
    <div
      ref={drop}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex-shrink-0 w-80 ${color} rounded-lg border-2 p-3 transition-all duration-200 overflow-hidden ${
        isOver ? 'border-blue-400 bg-blue-50 shadow-lg scale-105' : ''
      }`}
      style={{ minHeight: '400px', maxHeight: '600px' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          {groupBy === 'status' && <FileText className="w-4 h-4" />}
          {groupBy === 'type' && <Building className="w-4 h-4" />}
          {groupBy === 'assignee' && <User className="w-4 h-4" />}
          <span className="truncate">{title}</span>
        </h3>
        <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm">
          {documents.length}
        </span>
      </div>
      
      <div 
        className="space-y-2 overflow-y-auto overflow-x-hidden" 
        style={{ maxHeight: '520px' }}
      >
        {documents.map((document) => (
          <DraggableDocumentCard
            key={document.id}
            document={document}
            users={users}
            onSign={onSign}
            onPreview={onPreview}
            onDownload={onDownload}
            downloadingId={downloadingId}
            onDelete={onDelete}
          />
        ))}
        
        {documents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No documents</p>
            <p className="text-xs mt-1">Drag documents here</p>
          </div>
        )}
      </div>
      
      {isOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-lg border-2 border-dashed border-blue-400 flex items-center justify-center">
          <div className="text-blue-600 font-medium">Drop document here</div>
        </div>
      )}

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
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
  onDelete,
  onMoveDocument
}) => {
  const getGroupedDocuments = () => {
    switch (groupBy) {
      case 'status':
        const statusColumns: { status: DocumentStatus; title: string; color: string }[] = [
          { status: 'draft', title: 'Draft', color: 'bg-gray-50 border-gray-300' },
          { status: 'under_review', title: 'Under Review', color: 'bg-yellow-50 border-yellow-300' },
          { status: 'approved', title: 'Approved', color: 'bg-blue-50 border-blue-300' },
          { status: 'pending_signature', title: 'Pending Signature', color: 'bg-orange-50 border-orange-300' },
          { status: 'signed', title: 'Signed', color: 'bg-green-50 border-green-300' },
          { status: 'rejected', title: 'Rejected', color: 'bg-red-50 border-red-300' }
        ];
        return statusColumns.map(column => ({
          id: column.status,
          title: column.title,
          color: column.color,
          documents: documents.filter(doc => doc.status === column.status)
        }));

      case 'type':
        const typeColumns: { type: DocumentType; title: string; color: string }[] = [
          { type: 'test_method', title: 'Test Methods', color: 'bg-blue-50 border-blue-300' },
          { type: 'coa', title: 'Certificates of Analysis', color: 'bg-green-50 border-green-300' },
          { type: 'sop', title: 'SOPs', color: 'bg-purple-50 border-purple-300' },
          { type: 'protocol', title: 'Protocols', color: 'bg-indigo-50 border-indigo-300' },
          { type: 'specification', title: 'Specifications', color: 'bg-pink-50 border-pink-300' },
          { type: 'report', title: 'Reports', color: 'bg-yellow-50 border-yellow-300' }
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
            color: 'bg-gray-50 border-gray-300',
            documents: docs
          };
        });

        if (unassignedDocs.length > 0) {
          columns.push({
            id: 'unassigned',
            title: 'Unassigned',
            color: 'bg-gray-50 border-gray-300',
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-1">
        <div className="flex space-x-3 pb-2 min-w-max" style={{ height: 'calc(100vh - 200px)' }}>
        {groupedData.map((group) => (
          <DroppableColumn
            key={group.id}
            id={group.id}
            title={group.title}
            color={group.color}
            documents={group.documents}
            users={users}
            groupBy={groupBy}
            onSign={onSign}
            onPreview={onPreview}
            onDownload={onDownload}
            downloadingId={downloadingId}
            onDelete={onDelete}
            onMoveDocument={onMoveDocument}
          />
        ))}
        </div>
      </div>
      
      <style jsx>{`
        /* Hide scrollbars for webkit browsers */
        div::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbars for Firefox */
        div {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default KanbanView;