export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export type UserRole = 
  | 'admin'
  | 'analyst' 
  | 'reviewer'
  | 'qa_officer'
  | 'lab_manager'
  | 'quality_manager';

export type DocumentType = 
  | 'test_method'
  | 'sop'
  | 'coa'
  | 'specification'
  | 'protocol'
  | 'report';

export type DocumentStatus = 
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'pending_signature'
  | 'signed'
  | 'rejected'
  | 'archived';

export type FieldType = 
  | 'text'
  | 'number'
  | 'date'
  | 'dropdown'
  | 'checkbox'
  | 'textarea'
  | 'signature'
  | 'file_upload'
  | 'rich_text'
  | 'table';

export interface TableCell {
  id: string;
  content: string;
  style: {
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    borderColor?: string;
    borderWidth?: number;
  };
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface TableData {
  rows: TableRow[];
  columns: number;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  section?: string;
  position: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  tableData?: TableData;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentType;
  version: string;
  fields: FormField[];
  sections: DocumentSection[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface DocumentSection {
  id: string;
  name: string;
  order: number;
  fields: string[];
}

export interface Document {
  id: string;
  templateId: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  version: string;
  data: Record<string, any>;
  signatures: Signature[];
  auditTrail: AuditEntry[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  assignedTo: string[];
}

export interface Signature {
  id: string;
  userId: string;
  userRole: UserRole;
  signedAt: Date;
  ipAddress: string;
  signatureData: string;
  reason: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  userId: string;
  timestamp: Date;
  details: string;
  ipAddress: string;
}

export interface SigningWorkflow {
  id: string;
  documentId: string;
  steps: SigningStep[];
  currentStep: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: Date;
  completedAt?: Date;
}

export interface SigningStep {
  id: string;
  order: number;
  role: UserRole;
  userId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  signedAt?: Date;
  comments?: string;
}