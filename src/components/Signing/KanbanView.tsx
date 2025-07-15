import React, { useState } from 'react';
import { Document } from '../../types';
import { StatusBadge } from '../Documents/StatusBadge';
import { Calendar, User, FileText, Clock, AlertCircle } from 'lucide-react';

interface KanbanViewProps {
  documents: Document[];
  groupBy: 'status' | 'type' | 'assignee';
  onDocumentUpdate: (id: string, updates: Partial<Document>) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  documents,
  groupBy,
  onDocumentUpdate
}) => {
  const [draggedDocument, setDraggedDocument] = useState<Document | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const getColumns = () => {
    switch (groupBy) {
      case 'status':
        return [
          { id: 'draft', title: 'Draft', color: 'bg-gray-100' },
          { id: 'under-review', title: 'Under Review', color: 'bg-yellow-100' },
          { id: 'approved', title: 'Approved', color: 'bg-green-100' },
          { id: 'pending-signature', title: 'Pending Signature', color: 'bg-blue-100' },
          { id: 'signed', title: 'Signed', color: 'bg-purple-100' },
          { id: 'rejected', title: 'Rejected', color: 'bg-red-100' }
        ];
      case 'type':
        return [
          { id: 'test-methods', title: 'Test Methods', color: 'bg-blue-100' },
          { id: 'coa', title: 'COAs', color: 'bg-green-100' },
          { id: 'sop', title: 'SOPs', color: 'bg-purple-100' },
          { id: 'protocol', title: 'Protocols', color: 'bg-yellow-100' },
          { id: 'specification', title: 'Specifications', color: 'bg-indigo-100' },
          { id: 'report', title: 'Reports', color: 'bg-pink-100' }
        ];
      case 'assignee':
        const assignees = Array.from(new Set(documents.map(doc => doc.assignedTo).filter(Boolean)));
        return [
          { id: 'unassigned', title: 'Unassigned', color: 'bg-gray-100' },
          ...assignees.map(assignee => ({
            id: assignee,
            title: assignee,
            color: 'bg-blue-100'
          }))
        ];
      default:
        return [];
    }
  };

  const getDocumentsForColumn = (columnId: string) => {
    return documents.filter(doc => {
      switch (groupBy) {
        case 'status':
          return doc.status === columnId;
        case 'type':
          return doc.type === columnId;
        case 'assignee':
          return columnId === 'unassigned' ? !doc.assignedTo : doc.assignedTo === columnId;
        default:
          return false;
      }
    });
  };

  const handleDragStart = (e: React.DragEvent, document: Document) => {
    setDraggedDocument(document);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedDocument) return;

    const updates: Partial<Document> = {};
    
    switch (groupBy) {
      case 'status':
        updates.status = columnId as Document['status'];
        break;
      case 'type':
        updates.type = columnId as Document['type'];
        break;
      case 'assignee':
        updates.assignedTo = columnId === 'unassigned' ? undefined : columnId;
        break;
    }

    onDocumentUpdate(draggedDocument.id, updates);
    setDraggedDocument(null);
  };

  const getPriorityIcon = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (diffDays <= 3) return <Clock className="w-4 h-4 text-orange-500" />;
    return null;
  };

  const columns = getColumns();

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {columns.map(column => {
        const columnDocuments = getDocumentsForColumn(column.id);
        const isDragOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 ${column.color} rounded-lg p-4 ${
              isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{column.title}</h3>
              <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                {columnDocuments.length}
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {columnDocuments.map(document => (
                <div
                  key={document.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, document)}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">
                      {document.name}
                    </h4>
                    {document.dueDate && getPriorityIcon(document.dueDate)}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 capitalize">
                      {document.type.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={document.status} size="sm" />
                  </div>

                  {document.assignedTo && (
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{document.assignedTo}</span>
                    </div>
                  )}

                  {document.dueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        Due: {new Date(document.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {columnDocuments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};