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
    e.dataTransfer.setData('application/json', JSON.stringify({
      id: document.id,
      type: 'document'
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all cursor-move group"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-start justify-between mb-3">
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

      <div className="space-y-2 mb-3 text-xs text-gray-600">
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

      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={document.status} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPreview(document.id)}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Preview"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDownload(document.id)}
            disabled={downloadingId === document.id}
            className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
            title="Download"
          >
            <Download className={`w-3.5 h-3.5 ${downloadingId === document.id ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {(document.status === 'pending_signature' || document.status === 'under_review') && (
          <button
            onClick={() => onSign(document.id)}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            Sign
          </button>
        )}
      </div>

      {document.signatures.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
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
  onMoveDocument
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'document',
    drop: (item: any) => {
      try {
        const draggedData = typeof item === 'string' ? JSON.parse(item) : item;
        const documentId = draggedData.id;
        
        if (groupBy === 'status' && (id === 'draft' || id === 'under_review' || id === 'approved' || id === 'pending_signature' || id === 'signed' || id === 'rejected')) {
          onMoveDocument(documentId, id as DocumentStatus);
        } else if (groupBy === 'type' && (id === 'test_method' || id === 'coa' || id === 'sop' || id === 'protocol' || id === 'specification' || id === 'report')) {
          onMoveDocument(documentId, 'draft', undefined, id as DocumentType);
        } else if (groupBy === 'assignee') {
          onMoveDocument(documentId, 'draft', id);
        }
      } catch (error) {
        console.error('Error processing drop:', error);
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
    try {
      const data = e.dataTransfer.getData('application/json');
      const draggedData = JSON.parse(data);
      const documentId = draggedData.id;
      
      if (groupBy === 'status' && (id === 'draft' || id === 'under_review' || id === 'approved' || id === 'pending_signature' || id === 'signed' || id === 'rejected')) {
        onMoveDocument(documentId, id as DocumentStatus);
      } else if (groupBy === 'type' && (id === 'test_method' || id === 'coa' || id === 'sop' || id === 'protocol' || id === 'specification' || id === 'report')) {
        onMoveDocument(documentId, 'draft', undefined, id as DocumentType);
      } else if (groupBy === 'assignee') {
        onMoveDocument(documentId, 'draft', id);
      }
    } catch (error) {
      console.error('Error processing drop:', error);
    }
  };

  return (
    <div
      ref={drop}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex-shrink-0 w-80 ${color} rounded-lg border-2 p-4 transition-all duration-200 ${
        isOver ? 'border-blue-400 bg-blue-50 shadow-lg scale-105' : ''
      }`}
      style={{ minHeight: '500px', maxHeight: '600px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          {groupBy === 'status' && <FileText className="w-4 h-4" />}
          {groupBy === 'type' && <Building className="w-4 h-4" />}
          {groupBy === 'assignee' && <User className="w-4 h-4" />}
          <span>{title}</span>
        </h3>
        <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-700 shadow-sm">
          {documents.length}
        </span>
      </div>
      
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '500px' }}>
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
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
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
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="flex space-x-6 pb-6 min-w-max h-full">
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
            onMoveDocument={onMoveDocument}
          />
        ))}
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default KanbanView;