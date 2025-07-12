import React from 'react';
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
}

const KanbanView: React.FC<KanbanViewProps> = ({
  documents,
  users,
  groupBy,
  onSign,
  onPreview,
  onDownload,
  downloadingId
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

        // Add unassigned column if there are unassigned documents
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

  const DocumentCard: React.FC<{ document: Document }> = ({ document }) => {
    const isUrgent = document.dueDate && new Date(document.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const creator = users.find(u => u.id === document.createdBy);

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <h4 className="text-sm font-medium text-gray-900 truncate">{document.name}</h4>
          </div>
          {isUrgent && (
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Type:</span>
            <span className="font-medium">{document.type.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Version:</span>
            <span className="font-medium">{document.version}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Created by:</span>
            <span className="font-medium">{creator?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Created:</span>
            <span className="font-medium">{format(document.createdAt, 'MMM d')}</span>
          </div>
          {document.dueDate && (
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Due:</span>
              <span className={`font-medium ${isUrgent ? 'text-red-600' : ''}`}>
                {format(document.dueDate, 'MMM d')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <StatusBadge status={document.status} />
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPreview(document.id)}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload(document.id)}
              disabled={downloadingId === document.id}
              className="p-1 text-green-600 hover:text-green-900 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
              title="Download"
            >
              <Download className={`w-4 h-4 ${downloadingId === document.id ? 'animate-spin' : ''}`} />
            </button>
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

        {document.signatures.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
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

  const groupedData = getGroupedDocuments();

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {groupedData.map((group) => (
        <div key={group.id} className="flex-shrink-0 w-80">
          <div className={`rounded-lg border-2 ${group.color} p-4 h-full`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{group.title}</h3>
              <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                {group.documents.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {group.documents.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
              
              {group.documents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanView;