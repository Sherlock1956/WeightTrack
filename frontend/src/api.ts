import axios from 'axios';
import { User, WeightRecord, TimeRange, Photo } from './types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 用户相关API
export const userApi = {
  // 获取所有用户
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // 创建新用户
  createUser: async (name: string): Promise<User> => {
    const response = await api.post('/users', { name });
    return response.data;
  },

  // 删除用户
  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};

// 体重记录相关API
export const weightApi = {
  // 获取用户体重记录
  getWeightRecords: async (userId: number, timeRange: TimeRange = 'all'): Promise<WeightRecord[]> => {
    const response = await api.get(`/users/${userId}/weight`, {
      params: { time_range: timeRange }
    });
    return response.data;
  },

  // 添加体重记录
  addWeightRecord: async (userId: number, weight: number, date: string): Promise<WeightRecord> => {
    const response = await api.post(`/users/${userId}/weight`, {
      weight,
      date
    });
    return response.data;
  },

  // 更新体重记录
  updateWeightRecord: async (userId: number, recordId: number, weight: number, date: string): Promise<WeightRecord> => {
    const response = await api.put(`/users/${userId}/weight/${recordId}`, {
      weight,
      date
    });
    return response.data;
  },

  // 删除体重记录
  deleteWeightRecord: async (userId: number, recordId: number): Promise<void> => {
    await api.delete(`/users/${userId}/weight/${recordId}`);
  },
};

export const photoApi = {
  // 获取用户所有照片
  getPhotos: async (userId: number): Promise<Photo[]> => {
    const response = await api.get(`/users/${userId}/photos`);
    return response.data;
  },

  // 上传照片
  uploadPhoto: async (userId: number, file: File, date: string): Promise<Photo> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', date);
    const response = await axios.post(`${API_BASE_URL}/users/${userId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 下载照片
  downloadPhoto: async (photoId: number): Promise<Blob> => {
    const response = await axios.get(`${API_BASE_URL}/photos/${photoId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // 删除照片
  deletePhoto: async (photoId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/photos/${photoId}`);
  },
}; 