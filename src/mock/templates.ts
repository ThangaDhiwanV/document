import { DocumentTemplate } from '../types';

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
      }
    ],
    sections: [
      { id: 'general', name: 'General Information', order: 1, fields: ['field-1'] },
      { id: 'chromatography', name: 'Chromatography Parameters', order: 2, fields: ['field-2'] }
    ],
    createdBy: '2',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isActive: true
  }
];