import { User } from '../types';
import { config } from '../config/environment';
import { mockUsers } from '../mock/users';
import { apiRequest, mockDelay } from './base';

export const usersApi = {
  async getUsers(): Promise<User[]> {
    if (config.isDevelopment) {
      await mockDelay();
      return [...mockUsers];
    }
    
    return apiRequest<User[]>('/users');
  },

  async getUserById(id: string): Promise<User> {
    if (config.isDevelopment) {
      await mockDelay();
      const user = mockUsers.find(u => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }
    
    return apiRequest<User>(`/users/${id}`);
  },

  async getCurrentUser(): Promise<User> {
    if (config.isDevelopment) {
      await mockDelay();
      return mockUsers[0]; // Return first user as current user
    }
    
    return apiRequest<User>('/users/me');
  }
};