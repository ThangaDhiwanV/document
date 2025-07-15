import React, { useState } from 'react';
import { ArrowLeft, Download, Shield, Clock, User } from 'lucide-react';
import { Document } from '../../types';
import { format } from 'date-fns';

interface DocuSealFormProps {
  document: Document;
  onComplete: () => void;
  onCancel: () => void;
}

const DocuSealForm: React.FC<DocuSealFormProps> = ({ 
  document, 
  onComplete, 
  onCancel 
}) => {
  const [isSigning, setIsSigning] = useState(false);
  const [signatureReason, setSignatureReason] = useState('');
  const [formData, setFormData] = useState(document.data || {});

  const handleSign = async () => {
    if (!signatureReason.trim()) {
      alert('Please provide a reason for signing this document.');
      return;
    }

    setIsSigning(true);
    
    // Simulate DocuSeal signing process
    setTimeout(() => {
      setIsSigning(false);
      onComplete();
    }, 2000);
  };

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Queue</span>
            </button>
            <div className="h-4 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{document.name}</h1>
              <p className="text-sm text-gray-600">Version {document.version}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Secure Signing Environment</span>
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Document Content</h2>
                <p className="text-gray-600">Please review and complete all required fields before signing.</p>
              </div>

              {/* Simulated Form Fields based on document data */}
              <div className="space-y-6">
                {Object.entries(formData).map(([fieldId, value]) => (
                  <div key={fieldId} className="border-b border-gray-100 pb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {fieldId.replace('field-', '').replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="text"
                      value={value as string}
                      onChange={(e) => updateFormData(fieldId, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}

                {/* Additional sample fields for demonstration */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Results Summary
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                      placeholder="Enter test results summary..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality Assessment
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select assessment...</option>
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                      <option value="conditional">Conditional Pass</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Signature Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Digital Signature</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Signing <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={signatureReason}
                      onChange={(e) => setSignatureReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select reason...</option>
                      <option value="qa_approval">QA Approval</option>
                      <option value="method_validation">Method Validation</option>
                      <option value="data_review">Data Review</option>
                      <option value="final_approval">Final Approval</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Signature Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Signer:</strong> Dr. Sarah Chen (QA Officer)</p>
                      <p><strong>Date:</strong> {format(new Date(), 'MMMM d, yyyy HH:mm:ss')}</p>
                      <p><strong>IP Address:</strong> 192.168.1.101</p>
                      <p><strong>Location:</strong> Quality Control Lab, Building A</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSign}
                    disabled={isSigning || !signatureReason}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isSigning || !signatureReason
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isSigning ? 'Signing Document...' : 'Sign Document'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Document Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{document.type.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-orange-600">Pending Signature</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{document.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{format(new Date(document.createdAt), 'MMM d, yyyy')}</span>
                </div>
                {document.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due:</span>
                    <span className="font-medium text-red-600">
                      {format(new Date(document.dueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Audit Trail</h3>
              <div className="space-y-3">
                {document.auditTrail.map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{entry.action}</p>
                      <p className="text-gray-600">
                        {format(new Date(entry.timestamp), 'MMM d, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-900 mb-1">21 CFR Part 11 Compliance</h4>
                  <p className="text-blue-700">
                    This document signing process meets FDA 21 CFR Part 11 requirements for electronic records and signatures.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocuSealForm;