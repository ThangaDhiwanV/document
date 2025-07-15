import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DocumentHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-600">Manage your pharmaceutical documents and templates</p>
      </div>
      <button
        onClick={() => navigate('/form-builder')}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>New Document</span>
      </button>
    </div>
  );
};

export default DocumentHeader;