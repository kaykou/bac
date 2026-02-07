import { User, Resource, ForumPost } from '../types';

class ApiService {
  
  // --- AUTHENTICATION ---

  async getMe(): Promise<User | null> {
    try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            return await res.json();
        }
        return null;
    } catch (e) {
        return null;
    }
  }

  async login(email: string, password: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur de connexion");
    }
    return await res.json();
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur d'inscription");
    }
    return await res.json();
  }

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  }

  // --- RESOURCES ---

  async getResources(): Promise<Resource[]> {
    const res = await fetch('/api/resources');
    if (!res.ok) return [];
    return await res.json();
  }

  async addResource(resource: Resource): Promise<Resource[]> {
    const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resource)
    });
    
    if (!res.ok) throw new Error("Erreur upload");
    return this.getResources();
  }

  async deleteResource(id: string): Promise<Resource[]> {
    const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Erreur suppression");
    return this.getResources();
  }

  async getStudents(): Promise<any[]> {
    const res = await fetch('/api/users/students');
    if (!res.ok) return []; 
    return await res.json();
  }

  // --- STATS ---
  async getStats(): Promise<{studentCount: number, resourceCount: number, liveHours: number, successRate: string}> {
      const res = await fetch('/api/stats');
      if (!res.ok) return { studentCount: 0, resourceCount: 0, liveHours: 0, successRate: '0%' };
      return await res.json();
  }

  // --- FORUM ---
  async getForumPosts(): Promise<ForumPost[]> {
      const res = await fetch('/api/forum');
      if (!res.ok) return [];
      return await res.json();
  }

  async createForumPost(title: string, content: string): Promise<void> {
      const res = await fetch('/api/forum/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content })
      });
      if(!res.ok) throw new Error("Erreur post forum");
  }

  async deleteForumPost(id: string): Promise<void> {
    const res = await fetch(`/api/forum/posts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Erreur suppression post");
  }

  async createForumAnswer(postId: string, content: string): Promise<void> {
      const res = await fetch('/api/forum/answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, content })
      });
      if(!res.ok) throw new Error("Erreur réponse forum");
  }
}

export const api = new ApiService();