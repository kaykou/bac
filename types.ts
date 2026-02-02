
export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  students: number;
  modules: number;
  tags: string[];
}

export type ResourceType = 'PDF' | 'LINK' | 'VIDEO' | 'IMAGE' | 'FOLDER';
export type ResourceCategory = 'COURS' | 'SERIES' | 'DEVOIRS';

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  category?: ResourceCategory;
  url?: string; // For links, images, videos
  date: string;
  size?: string;
}

export interface StreamSession {
  id: string;
  title: string;
  isActive: boolean;
  viewers: number;
  duration: string;
}

export interface Spectator {
  id: string;
  name: string;
  isMuted: boolean;
  joinTime: string;
}
