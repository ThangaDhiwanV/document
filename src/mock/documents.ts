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
  },
  {
    id: 'doc-3',
    templateId: 'tmp-1',
    name: 'Ibuprofen HPLC Method Development',
    type: 'test_method',
    status: 'under_review',
    version: '1.1',
    data: {
      'field-1': 'Ibuprofen',
      'field-2': '4.2',
      'field-3': 'C18'
    },
    signatures: [],
    auditTrail: [
      {
        id: 'audit-3',
        action: 'Document Created',
        userId: '2',
        timestamp: new Date('2024-01-24T10:15:00Z'),
        details: 'Method development document created',
        ipAddress: '192.168.1.102'
      }
    ],
    createdBy: '2',
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24'),
    dueDate: new Date('2024-02-05'),
    assignedTo: ['3', '1']
  },
  {
    id: 'doc-4',
    templateId: 'tmp-2',
    name: 'Metformin Batch COA-2024-002',
    type: 'coa',
    status: 'approved',
    version: '1.0',
    data: {
      'field-5': 'Metformin HCl Tablets 500mg',
      'field-6': 'MET-2024-002',
      'field-7': '2024-01-18'
    },
    signatures: [],
    auditTrail: [
      {
        id: 'audit-4',
        action: 'Document Created',
        userId: '4',
        timestamp: new Date('2024-01-25T08:45:00Z'),
        details: 'COA document created',
        ipAddress: '192.168.1.103'
      }
    ],
    createdBy: '4',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    assignedTo: ['1']
  },
  {
    id: 'doc-5',
    templateId: 'tmp-3',
    name: 'Atorvastatin Stability Study - 12 Months',
    type: 'protocol',
    status: 'draft',
    version: '1.0',
    data: {
      'field-8': 'Atorvastatin Calcium Tablets Stability Study',
      'field-9': '25°C/60% RH'
    },
    signatures: [],
    auditTrail: [
      {
        id: 'audit-5',
        action: 'Document Created',
        userId: '3',
        timestamp: new Date('2024-01-26T11:30:00Z'),
        details: 'Stability protocol draft created',
        ipAddress: '192.168.1.105'
      }
    ],
    createdBy: '3',
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26'),
    dueDate: new Date('2024-02-10'),
    assignedTo: ['1', '5']
  },
  {
    id: 'doc-6',
    templateId: 'tmp-2',
    name: 'Amoxicillin Batch COA-2024-003',
    type: 'coa',
    status: 'pending_signature',
    version: '1.0',
    data: {
      'field-5': 'Amoxicillin Capsules 250mg',
      'field-6': 'AMX-2024-003',
      'field-7': '2024-01-20'
    },
    signatures: [],
    auditTrail: [
      {
        id: 'audit-6',
        action: 'Document Created',
        userId: '2',
        timestamp: new Date('2024-01-27T09:15:00Z'),
        details: 'COA document created for batch AMX-2024-003',
        ipAddress: '192.168.1.106'
      }
    ],
    createdBy: '2',
    createdAt: new Date('2024-01-27'),
    updatedAt: new Date('2024-01-27'),
    dueDate: new Date('2024-01-30'),
    assignedTo: ['1']
  },
  {
    id: 'doc-7',
    templateId: 'tmp-1',
    name: 'Losartan HPLC Assay Method',
    type: 'test_method',
    status: 'rejected',
    version: '1.0',
    data: {
      'field-1': 'Losartan Potassium',
      'field-2': '5.8',
      'field-3': 'C8'
    },
    signatures: [],
    auditTrail: [
      {
        id: 'audit-7',
        action: 'Document Created',
        userId: '2',
        timestamp: new Date('2024-01-20T14:00:00Z'),
        details: 'HPLC method document created',
        ipAddress: '192.168.1.107'
      }
    ],
    createdBy: '2',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22'),
    assignedTo: ['3']
  },
  {
    id: 'doc-8',
    templateId: 'tmp-2',
    name: 'Lisinopril Batch COA-2024-004',
    type: 'coa',
    status: 'signed',
    version: '1.0',
    data: {
      'field-5': 'Lisinopril Tablets 10mg',
      'field-6': 'LIS-2024-004',
      'field-7': '2024-01-22'
    },
    signatures: [
      {
        id: 'sig-2',
        userId: '1',
        userRole: 'qa_officer',
        signedAt: new Date('2024-01-28T11:45:00Z'),
        ipAddress: '192.168.1.109',
        signatureData: 'digital_signature_data_2',
        reason: 'Final QA Release'
      }
    ],
    auditTrail: [
      {
        id: 'audit-8',
        action: 'Document Created',
        userId: '4',
        timestamp: new Date('2024-01-28T08:30:00Z'),
        details: 'COA document created for batch LIS-2024-004',
        ipAddress: '192.168.1.109'
      }
    ],
    createdBy: '4',
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28'),
    assignedTo: ['1', '5']
  },
  {
    id: 'doc-9',
    templateId: 'tmp-1',
    name: 'Warfarin HPLC Stability Indicating Method',
    type: 'test_method',
    status: 'under_review',
    version: '2.0',
    data: {
      'field-1': 'Warfarin Sodium',
      'field-2': '6.2',
      'field-3': 'C18'
    },
    signatures: [],
    auditTrail: [
      {
        id: 'audit-9',
        action: 'Document Created',
        userId: '3',
        timestamp: new Date('2024-01-29T13:20:00Z'),
        details: 'Stability indicating method document created',
        ipAddress: '192.168.1.110'
      }
    ],
    createdBy: '3',
    createdAt: new Date('2024-01-29'),
    updatedAt: new Date('2024-01-29'),
    dueDate: new Date('2024-02-15'),
    assignedTo: ['1', '2']
  },
  {
    id: 'doc-10',
    templateId: 'tmp-2',
    name: 'Simvastatin Batch COA-2024-005',
    type: 'coa',
    status: 'draft',
    version: '1.0',
    data: {
      'field-5': 'Simvastatin Tablets 20mg',
      'field-6': 'SIM-2024-005',
      'field-7': '2024-01-28'
    },
    signatures: [],
    auditTrail: [
      {
        id: 'audit-10',
        action: 'Document Created',
        userId: '2',
        timestamp: new Date('2024-01-30T10:00:00Z'),
        details: 'COA document created for batch SIM-2024-005',
        ipAddress: '192.168.1.111'
      }
    ],
    createdBy: '2',
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-01-30'),
    dueDate: new Date('2024-02-08'),
    assignedTo: ['1']
  },
  {
    id: 'doc-11',
    templateId: 'tmp-3',
    name: 'Omeprazole Dissolution Method Validation',
    type: 'protocol',
    status: 'approved',
    version: '1.1',
    data: {
      'field-8': 'Omeprazole Delayed Release Capsules Dissolution',
      'field-9': '37°C ± 0.5°C'
    },
    signatures: [],
    auditTrail: [
      {
        id: 'audit-11',
        action: 'Document Created',
        userId: '4',
        timestamp: new Date('2024-01-31T14:45:00Z'),
        details: 'Dissolution method validation protocol created',
        ipAddress: '192.168.1.112'
      }
    ],
    createdBy: '4',
    createdAt: new Date('2024-01-31'),
    updatedAt: new Date('2024-01-31'),
    assignedTo: ['2', '3']
  },
  {
    id: 'doc-12',
    templateId: 'tmp-1',
    name: 'Amlodipine HPLC Impurity Method',
    type: 'test_method',
    status: 'pending_signature',
    version: '1.0',
    data: {
      'field-1': 'Amlodipine Besylate',
      'field-2': '4.8',
      'field-3': 'C18'
    },
    signatures: [],
    auditTrail: [
      {
        id: 'audit-12',
        action: 'Document Created',
        userId: '3',
        timestamp: new Date('2024-02-01T09:30:00Z'),
        details: 'HPLC impurity method document created',
        ipAddress: '192.168.1.113'
      }
    ],
    createdBy: '3',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    dueDate: new Date('2024-02-12'),
    assignedTo: ['1']
  },
  {
    id: 'doc-13',
    templateId: 'tmp-2',
    name: 'Clopidogrel Batch COA-2024-006',
    type: 'coa',
    status: 'signed',
    version: '1.0',
    data: {
      'field-5': 'Clopidogrel Bisulfate Tablets 75mg',
      'field-6': 'CLO-2024-006',
      'field-7': '2024-01-30'
    },
    signatures: [
      {
        id: 'sig-3',
        userId: '5',
        userRole: 'quality_manager',
        signedAt: new Date('2024-02-02T16:20:00Z'),
        ipAddress: '192.168.1.114',
        signatureData: 'digital_signature_data_3',
        reason: 'Quality Manager Final Approval'
      }
    ],
    auditTrail: [
      {
        id: 'audit-13',
        action: 'Document Created',
        userId: '2',
        timestamp: new Date('2024-02-02T11:15:00Z'),
        details: 'COA document created for batch CLO-2024-006',
        ipAddress: '192.168.1.114'
      }
    ],
    createdBy: '2',
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-02'),
    assignedTo: ['5']
  },
  {
    id: 'doc-14',
    templateId: 'tmp-3',
    name: 'Metoprolol Bioequivalence Study Protocol',
    type: 'protocol',
    status: 'under_review',
    version: '1.0',
    data: {
      'field-8': 'Metoprolol Tartrate Tablets Bioequivalence Study',
      'field-9': 'Fasted Conditions'
    },
    signatures: [],
    auditTrail: [
      {
        id: 'audit-14',
        action: 'Document Created',
        userId: '4',
        timestamp: new Date('2024-02-03T08:00:00Z'),
        details: 'Bioequivalence study protocol created',
        ipAddress: '192.168.1.115'
      }
    ],
    createdBy: '4',
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-02-03'),
    dueDate: new Date('2024-02-20'),
    assignedTo: ['1', '3', '5']
  },
  {
    id: 'doc-15',
    templateId: 'tmp-1',
    name: 'Furosemide UV Spectrophotometric Method',
    type: 'test_method',
    status: 'draft',
    version: '1.0',
    data: {
      'field-1': 'Furosemide',
      'field-2': 'N/A (UV Method)',
      'field-3': 'N/A'
    },
    signatures: [],
    auditTrail: [
      {
        id: 'audit-15',
        action: 'Document Created',
        userId: '2',
        timestamp: new Date('2024-02-04T15:30:00Z'),
        details: 'UV spectrophotometric method document created',
        ipAddress: '192.168.1.116'
      }
    ],
    createdBy: '2',
    createdAt: new Date('2024-02-04'),
    updatedAt: new Date('2024-02-04'),
    dueDate: new Date('2024-02-18'),
    assignedTo: ['3']
  }
];