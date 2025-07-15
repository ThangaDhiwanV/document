import { config } from '../config/environment';
import { 
  documentTypes, 
  documentStatuses, 
  groupByOptions, 
  sortOptions, 
  dateFilterOptions 
} from '../mock/dropdowns';
import { apiRequest, mockDelay } from './base';

export interface DropdownOption {
  value: string;
  label: string;
}

export const dropdownsApi = {
  async getDocumentTypes(): Promise<DropdownOption[]> {
    if (config.isDevelopment) {
      await mockDelay(200);
      return [...documentTypes];
    }
    
    return apiRequest<DropdownOption[]>('/dropdowns/document-types');
  },

  async getDocumentStatuses(): Promise<DropdownOption[]> {
    if (config.isDevelopment) {
      await mockDelay(200);
      return [...documentStatuses];
    }
    
    return apiRequest<DropdownOption[]>('/dropdowns/document-statuses');
  },

  async getGroupByOptions(): Promise<DropdownOption[]> {
    if (config.isDevelopment) {
      await mockDelay(200);
      return [...groupByOptions];
    }
    
    return apiRequest<DropdownOption[]>('/dropdowns/group-by-options');
  },

  async getSortOptions(): Promise<DropdownOption[]> {
    if (config.isDevelopment) {
      await mockDelay(200);
      return [...sortOptions];
    }
    
    return apiRequest<DropdownOption[]>('/dropdowns/sort-options');
  },

  async getDateFilterOptions(): Promise<DropdownOption[]> {
    if (config.isDevelopment) {
      await mockDelay(200);
      return [...dateFilterOptions];
    }
    
    return apiRequest<DropdownOption[]>('/dropdowns/date-filter-options');
  }
};