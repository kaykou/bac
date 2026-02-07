
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
export type ResourceCategory = 'COURS' | 'SERIES' | 'DEVOIRS' | 'SUJETS_BAC';

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  category?: ResourceCategory;
  url?: string; // For links, images, videos
  thumbnail?: string; // New field for video thumbnails
  date: string;
  size?: string;
  parentId?: string | null; // ID of the folder this resource belongs to
  ownerId?: string;
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

export interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  title: string;
  content: string;
  createdAt: string;
  answers: ForumAnswer[];
}

export interface ForumAnswer {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  createdAt: string;
}