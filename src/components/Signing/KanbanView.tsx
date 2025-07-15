import React, { useState } from 'react';
import { Document } from '../../types';
import StatusBadge from '../Documents/StatusBadge';
import { Calendar, User, FileText, Clock, AlertCircle } from 'lucide-react';

interface KanbanViewProps {
  documents: Document[];
  groupBy: 'status' | 'type' | 'assignee' | 'priority';
  onDocumentUpdate: (documentId: string, updates: Partial<Document>) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({
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
          { id: 'under_review', title: 'Under Review', color: 'bg-yellow-100' },
          { id: 'approved', title: 'Approved', color: 'bg-green-100' },
          { id: 'pending_signature', title: 'Pending Signature', color: 'bg-blue-100' },
          { id: 'signed', title: 'Signed', color: 'bg-purple-100' },
          { id: 'rejected', title: 'Rejected', color: 'bg-red-100' }
        ];
      case 'type':
        return [
          { id: 'test_method', title: 'Test Methods', color: 'bg-blue-100' },
          { id: 'coa', title: 'COAs', color: 'bg-green-100' },
          { id: 'sop', title: 'SOPs', color: 'bg-purple-100' },
          { id: 'protocol', title: 'Protocols', color: 'bg-yellow-100' },
          { id: 'specification', title: 'Specifications', color: 'bg-indigo-100' },
          { id: 'report', title: 'Reports', color: 'bg-pink-100' }
        ];
      case 'assignee':
        const assignees = Array.from(new Set(documents.map(doc => doc.assignedTo).flat().filter(Boolean)));
        return [
          { id: 'unassigned', title: 'Unassigned', color: 'bg-gray-100' },
          ...assignees.map(assignee => ({
            id: assignee,
            title: assignee,
            color: 'bg-blue-100'
          }))
        ];
      case 'priority':
        return [
          { id: 'urgent', title: 'Urgent', color: 'bg-red-100' },
          { id: 'normal', title: 'Normal', color: 'bg-green-100' }
        ];
      default:
        return [];
    }
  };

  const getDocumentPriority = (doc: Document): 'urgent' | 'normal' => {
    if (!doc.dueDate) return 'normal';
    const dueDate = new Date(doc.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 ? 'urgent' : 'normal';
  };

  const getDocumentsForColumn = (columnId: string) => {
    return documents.filter(doc => {
      switch (groupBy) {
        case 'status':
          return doc.status === columnId;
        case 'type':
          return doc.type === columnId;
        case 'assignee':
          return columnId === 'unassigned' ? doc.assignedTo.length === 0 : doc.assignedTo.includes(columnId);
        case 'priority':
          return getDocumentPriority(doc) === columnId;
        default:
          return false;
      }
    });
  };

  const handleDragStart = (e: React.DragEvent, document: Document) => {
    setDraggedDocument(document);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', document.id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over if we're leaving the column entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedDocument) return;

    const updates: Partial<Document> = {};
    
    switch (groupBy) {
      case 'status':
        if (draggedDocument.status !== columnId) {
          updates.status = columnId as Document['status'];
        }
        break;
      case 'type':
        if (draggedDocument.type !== columnId) {
          updates.type = columnId as Document['type'];
        }
        break;
      case 'assignee':
        if (columnId === 'unassigned') {
          if (draggedDocument.assignedTo.length > 0) {
            updates.assignedTo = [];
          }
        } else {
          if (!draggedDocument.assignedTo.includes(columnId)) {
            updates.assignedTo = [columnId];
          }
        }
        break;
      case 'priority':
        // Priority is calculated based on due date, so we adjust the due date
        const today = new Date();
        if (columnId === 'urgent') {
          // Set due date to tomorrow to make it urgent
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          updates.dueDate = tomorrow;
        } else {
          // Set due date to next week to make it normal priority
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          updates.dueDate = nextWeek;
        }
        break;
    }

    if (Object.keys(updates).length > 0) {
      onDocumentUpdate(draggedDocument.id, updates);
    }

    setDraggedDocument(null);
  };

  const getPriorityIcon = (dueDate?: Date) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (diffDays <= 3) return <Clock className="w-4 h-4 text-orange-500" />;
    return null;
  };

  const columns = getColumns();

  return (
    <div className="h-full overflow-hidden">
      <div className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto pb-4 h-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
              className={`flex-shrink-0 w-72 sm:w-80 ${column.color} rounded-lg p-3 sm:p-4 transition-all duration-200 ${
                isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50 scale-105' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{column.title}</h3>
                <span className="bg-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium text-gray-600">
                  {columnDocuments.length}
                </span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {columnDocuments.map(document => (
                  <div
                    key={document.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, document)}
                    className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2">
                        {document.name}
                      </h4>
                      {document.dueDate && getPriorityIcon(document.dueDate)}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 capitalize truncate">
                        {document.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={document.status} />
                    </div>

                    {document.assignedTo.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-600 truncate">
                          {document.assignedTo.join(', ')}
                        </span>
                      </div>
                    )}

                    {document.dueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
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
                    <p className="text-xs sm:text-sm">No documents</p>
                    {isDragOver && (
                      <p className="text-xs text-blue-600 mt-1">Drop here to move</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanView;