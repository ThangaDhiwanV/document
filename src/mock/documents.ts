import { Document } from '../types';

export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    templateId: 'tmp-1',
    name: 'Aspirin HPLC Method Validation',
    type: 'test_method',
    status: 'pending_signature',
    version: '1.0',
    data: {
      'field-1': 'Aspirin (Acetylsalicylic Acid)',
      'field-2': '3.45',
      'field-3': 'C18'
    },
    signatures: [],
    auditTrail: [
      {
        id: 'audit-1',
        action: 'Document Created',
        userId: '2',
        timestamp: new Date('2024-01-22T09:00:00Z'),
        details: 'Initial document creation',
        ipAddress: '192.168.1.100'
      }
    ],
    createdBy: '2',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
    dueDate: new Date('2024-02-01'),
    assignedTo: ['1', '3']
  },
  {
    id: 'doc-2',
    templateId: 'tmp-2',
    name: 'Paracetamol Batch COA-2024-001',
    type: 'coa',
    status: 'signed',
    version: '1.0',
    data: {
      'field-5': 'Paracetamol Tablets 500mg',
      'field-6': 'PCT-2024-001',
      'field-7': '2024-01-15'
    },
    signatures: [
      {
        id: 'sig-1',
        userId: '1',
        userRole: 'qa_officer',
        signedAt: new Date('2024-01-23T14:30:00Z'),
        ipAddress: '192.168.1.101',
        signatureData: 'digital_signature_data_here',
        reason: 'QA Approval'
      }
    ],
    auditTrail: [
      {
        id: 'audit-2',
        action: 'Document Signed',
        userId: '1',
        timestamp: new Date('2024-01-23T14:30:00Z'),
        details: 'QA Officer approval signature',
        ipAddress: '192.168.1.101'
      }
    ],
    createdBy: '2',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-23'),
    assignedTo: ['1']
  }
];