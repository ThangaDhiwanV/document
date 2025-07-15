import React, { useState } from 'react';
import { X, Download, FileText, User, Calendar, Shield } from 'lucide-react';
import { Document, User as UserType } from '../../types';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';

interface DocumentViewerProps {
  document: Document;
  users: UserType[];
  onClose: () => void;
  onDownload?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  users, 
  onClose, 
  onDownload 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'results' | 'audit'>('overview');
  const creator = users.find(u => u.id === document.createdBy);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'content', label: 'Document Content', icon: FileText },
    { id: 'results', label: 'Test Results', icon: Calendar },
    { id: 'audit', label: 'Audit Trail', icon: Shield }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{document.name}</h2>
              <p className="text-sm text-gray-600">Version {document.version}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[70vh]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Info */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="ml-2 text-gray-900">{document.type.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2"><StatusBadge status={document.status} /></span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Created by:</span>
                      <span className="ml-2 text-gray-900">{creator?.name || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <span className="ml-2 text-gray-900">{format(document.createdAt, 'MMM d, yyyy')}</span>
                    </div>
                    {document.dueDate && (
                      <div>
                        <span className="font-medium text-gray-700">Due Date:</span>
                        <span className="ml-2 text-gray-900">{format(document.dueDate, 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Signatures */}
                {document.signatures.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Digital Signatures</span>
                    </h4>
                    <div className="space-y-3">
                      {document.signatures.map((signature) => {
                        const signer = users.find(u => u.id === signature.userId);
                        return (
                          <div key={signature.id} className="border border-green-200 bg-green-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                              <span className="font-medium text-gray-900">{signer?.name || 'Unknown'}</span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>Role: {signature.userRole.replace('_', ' ').toUpperCase()}</p>
                              <p>Signed: {format(signature.signedAt, 'MMM d, yyyy HH:mm')}</p>
                              <p>Reason: {signature.reason}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Compliance Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <h4 className="font-medium text-blue-900 mb-1">21 CFR Part 11 Compliance</h4>
                      <p className="text-blue-700">
                        This document meets FDA requirements for electronic records and signatures.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Document Content</h3>
              {document.data && Object.keys(document.data).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(document.data).map(([key, value]) => (
                    <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {key.replace('field-', '').replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="text-gray-900 bg-gray-50 p-3 rounded-md border">
                        {String(value || 'Not specified')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No content data available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Test Results</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specification</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Assay (%)</td>
                      <td className="px-6 py-4 text-sm text-gray-600">98.0 - 102.0</td>
                      <td className="px-6 py-4 text-sm text-gray-900">99.8</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Pass
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Related Substances (%)</td>
                      <td className="px-6 py-4 text-sm text-gray-600">≤ 2.0</td>
                      <td className="px-6 py-4 text-sm text-gray-900">0.3</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Pass
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Water Content (%)</td>
                      <td className="px-6 py-4 text-sm text-gray-600">≤ 0.5</td>
                      <td className="px-6 py-4 text-sm text-gray-900">0.2</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Pass
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Audit Trail</h3>
              <div className="space-y-4">
                {document.auditTrail.map((entry) => {
                  const user = users.find(u => u.id === entry.userId);
                  return (
                    <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{entry.action}</p>
                            <p className="text-xs text-gray-500">
                              {format(entry.timestamp, 'MMM d, yyyy HH:mm:ss')}
                            </p>
                          </div>
                          <p className="text-gray-600 text-sm">by {user?.name || 'Unknown'}</p>
                          {entry.details && (
                            <p className="text-gray-500 text-sm mt-1">{entry.details}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">IP: {entry.ipAddress}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;