import { User, DocumentTemplate, Document, DocumentType, UserRole } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@pharmalab.com',
    role: 'qa_officer',
    department: 'Quality Assurance',
    avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@pharmalab.com',
    role: 'analyst',
    department: 'Analytical Chemistry',
    avatar: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Dr. Emily Watson',
    email: 'emily.watson@pharmalab.com',
    role: 'reviewer',
    department: 'Method Development',
    avatar: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'James Thompson',
    email: 'james.thompson@pharmalab.com',
    role: 'lab_manager',
    department: 'Laboratory Operations',
    avatar: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '5',
    name: 'Dr. Lisa Park',
    email: 'lisa.park@pharmalab.com',
    role: 'quality_manager',
    department: 'Quality Control',
    avatar: 'https://images.pexels.com/photos/5327589/pexels-photo-5327589.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

export const mockTemplates: DocumentTemplate[] = [
  {
    id: 'tmp-1',
    name: 'HPLC Test Method',
    type: 'test_method',
    version: '1.0',
    fields: [
      {
        id: 'field-1',
        type: 'text',
        label: 'Compound Name',
        required: true,
        section: 'general',
        position: { x: 20, y: 20 },
        size: { width: 300, height: 40 }
      },
      {
        id: 'field-2',
        type: 'number',
        label: 'Retention Time (min)',
        required: true,
        section: 'chromatography',
        position: { x: 20, y: 80 },
        size: { width: 200, height: 40 }
      },
      {
        id: 'field-3',
        type: 'dropdown',
        label: 'Column Type',
        required: true,
        options: ['C18', 'C8', 'Phenyl', 'CN'],
        section: 'chromatography',
        position: { x: 240, y: 80 },
        size: { width: 200, height: 40 }
      },
      {
        id: 'field-4',
        type: 'signature',
        label: 'Analyst Signature',
        required: true,
        section: 'approval',
        position: { x: 20, y: 140 },
        size: { width: 300, height: 80 }
      }
    ],
    sections: [
      { id: 'general', name: 'General Information', order: 1, fields: ['field-1'] },
      { id: 'chromatography', name: 'Chromatography Parameters', order: 2, fields: ['field-2', 'field-3'] },
      { id: 'approval', name: 'Approval', order: 3, fields: ['field-4'] }
    ],
    createdBy: '2',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isActive: true
  },
  {
    id: 'tmp-2',
    name: 'Certificate of Analysis',
    type: 'coa',
    version: '2.1',
    fields: [
      {
        id: 'field-5',
        type: 'text',
        label: 'Product Name',
        required: true,
        section: 'product',
        position: { x: 20, y: 20 },
        size: { width: 300, height: 40 }
      },
      {
        id: 'field-6',
        type: 'text',
        label: 'Batch Number',
        required: true,
        section: 'product',
        position: { x: 340, y: 20 },
        size: { width: 200, height: 40 }
      },
      {
        id: 'field-7',
        type: 'date',
        label: 'Manufacturing Date',
        required: true,
        section: 'product',
        position: { x: 20, y: 80 },
        size: { width: 200, height: 40 }
      }
    ],
    sections: [
      { id: 'product', name: 'Product Information', order: 1, fields: ['field-5', 'field-6', 'field-7'] }
    ],
    createdBy: '1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    isActive: true
  },
  {
    id: 'tmp-3',
    name: 'Stability Study Protocol',
    type: 'protocol',
    version: '1.2',
    fields: [
      {
        id: 'field-8',
        type: 'text',
        label: 'Study Title',
        required: true,
        section: 'study',
        position: { x: 20, y: 20 },
        size: { width: 400, height: 40 }
      },
      {
        id: 'field-9',
        type: 'dropdown',
        label: 'Storage Condition',
        required: true,
        options: ['25°C/60% RH', '30°C/65% RH', '40°C/75% RH', '2-8°C'],
        section: 'study',
        position: { x: 20, y: 80 },
        size: { width: 250, height: 40 }
      }
    ],
    sections: [
      { id: 'study', name: 'Study Parameters', order: 1, fields: ['field-8', 'field-9'] }
    ],
    createdBy: '3',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-18'),
    isActive: true
  }
];

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
      },
      {
        id: 'audit-4',
        action: 'Submitted for Review',
        userId: '2',
        timestamp: new Date('2024-01-24T16:30:00Z'),
        details: 'Document submitted to reviewer',
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
        id: 'audit-5',
        action: 'Document Created',
        userId: '4',
        timestamp: new Date('2024-01-25T08:45:00Z'),
        details: 'COA document created',
        ipAddress: '192.168.1.103'
      },
      {
        id: 'audit-6',
        action: 'Approved',
        userId: '5',
        timestamp: new Date('2024-01-25T14:20:00Z'),
        details: 'Quality Manager approval',
        ipAddress: '192.168.1.104'
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
        id: 'audit-7',
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
        id: 'audit-8',
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
        id: 'audit-9',
        action: 'Document Created',
        userId: '2',
        timestamp: new Date('2024-01-20T14:00:00Z'),
        details: 'HPLC method document created',
        ipAddress: '192.168.1.107'
      },
      {
        id: 'audit-10',
        action: 'Rejected',
        userId: '3',
        timestamp: new Date('2024-01-22T10:30:00Z'),
        details: 'Method requires optimization - retention time too high',
        ipAddress: '192.168.1.108'
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
      },
      {
        id: 'sig-3',
        userId: '5',
        userRole: 'quality_manager',
        signedAt: new Date('2024-01-28T15:20:00Z'),
        ipAddress: '192.168.1.110',
        signatureData: 'digital_signature_data_3',
        reason: 'Quality Manager Approval'
      }
    ],
    auditTrail: [
      {
        id: 'audit-11',
        action: 'Document Created',
        userId: '4',
        timestamp: new Date('2024-01-28T08:30:00Z'),
        details: 'COA document created for batch LIS-2024-004',
        ipAddress: '192.168.1.109'
      },
      {
        id: 'audit-12',
        action: 'Document Signed',
        userId: '1',
        timestamp: new Date('2024-01-28T11:45:00Z'),
        details: 'QA Officer signature applied',
        ipAddress: '192.168.1.109'
      },
      {
        id: 'audit-13',
        action: 'Document Signed',
        userId: '5',
        timestamp: new Date('2024-01-28T15:20:00Z'),
        details: 'Quality Manager final approval',
        ipAddress: '192.168.1.110'
      }
    ],
    createdBy: '4',
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28'),
    assignedTo: ['1', '5']
  }
];

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    admin: 'System Administrator',
    analyst: 'Laboratory Analyst',
    reviewer: 'Method Reviewer',
    qa_officer: 'QA Officer',
    lab_manager: 'Laboratory Manager',
    quality_manager: 'Quality Manager'
  };
  return roleNames[role];
};

export const getDocumentTypeDisplayName = (type: DocumentType): string => {
  const typeNames: Record<DocumentType, string> = {
    test_method: 'Test Method',
    sop: 'Standard Operating Procedure',
    coa: 'Certificate of Analysis',
    specification: 'Product Specification',
    protocol: 'Validation Protocol',
    report: 'Analytical Report'
  };
  return typeNames[type];
};