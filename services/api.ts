import { User, Resource } from '../types';

class ApiService {
  
  // --- AUTHENTICATION ---

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

    const user: User = await res.json();
    this.setSession(user);
    return user;
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

    const user: User = await res.json();
    this.setSession(user);
    return user;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('bac_current_session');
  }

  getCurrentSession(): User | null {
    try {
      const saved = localStorage.getItem('bac_current_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private setSession(user: User) {
    localStorage.setItem('bac_current_session', JSON.stringify(user));
  }

  // --- RESOURCES (DATABASE) ---

  async getResources(): Promise<Resource[]> {
    const res = await fetch('/api/resources');
    if (!res.ok) return [];
    return await res.json();
  }

  async addResource(resource: Resource): Promise<Resource[]> {
    await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resource)
    });
    // Return updated list
    return this.getResources();
  }

  async deleteResource(id: string): Promise<Resource[]> {
    await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    return this.getResources();
  }

  // --- STUDENTS (DATABASE) ---

  async getStudents(): Promise<any[]> {
    const res = await fetch('/api/users/students');
    if (!res.ok) return [];
    return await res.json();
  }
}

export const api = new ApiService();