import { DocumentTemplate } from '../types';
import { config } from '../config/environment';
import { mockTemplates } from '../mock/templates';
import { apiRequest, mockDelay } from './base';

export const templatesApi = {
  async getTemplates(): Promise<DocumentTemplate[]> {
    if (config.isDevelopment) {
      await mockDelay();
      return [...mockTemplates];
    }
    
    return apiRequest<DocumentTemplate[]>('/templates');
  },

  async getTemplateById(id: string): Promise<DocumentTemplate> {
    if (config.isDevelopment) {
      await mockDelay();
      const template = mockTemplates.find(t => t.id === id);
      if (!template) {
        throw new Error('Template not found');
      }
      return template;
    }
    
    return apiRequest<DocumentTemplate>(`/templates/${id}`);
  },

  async createTemplate(template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentTemplate> {
    if (config.isDevelopment) {
      await mockDelay();
      const newTemplate: DocumentTemplate = {
        ...template,
        id: `tmp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockTemplates.push(newTemplate);
      return newTemplate;
    }
    
    return apiRequest<DocumentTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  async updateTemplate(id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    if (config.isDevelopment) {
      await mockDelay();
      const index = mockTemplates.findIndex(t => t.id === id);
      if (index === -1) {
        throw new Error('Template not found');
      }
      
      mockTemplates[index] = {
        ...mockTemplates[index],
        ...updates,
        updatedAt: new Date()
      };
      
      return mockTemplates[index];
    }
    
    return apiRequest<DocumentTemplate>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteTemplate(id: string): Promise<void> {
    if (config.isDevelopment) {
      await mockDelay();
      const index = mockTemplates.findIndex(t => t.id === id);
      if (index === -1) {
        throw new Error('Template not found');
      }
      mockTemplates.splice(index, 1);
      return;
    }
    
    return apiRequest<void>(`/templates/${id}`, {
      method: 'DELETE',
    });
  }
};