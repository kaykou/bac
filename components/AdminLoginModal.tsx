import React, { useState } from 'react';
import { Lock, User as UserIcon, X, ShieldCheck, Loader2 } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        // We pass the name (e.g., 'admin') to the login function
        // The API service maps the first argument to 'email' field in JSON
        const user = await api.login(name, password);
        
        if (user.role !== 'TEACHER') {
            throw new Error("Accès non autorisé.");
        }
        
        onLogin(user);
        onClose();
        setName('');
        setPassword('');
    } catch (err) {
        setError('Identifiants incorrects.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm" onClick={!isLoading ? onClose : undefined} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-[fadeIn_0.3s_ease-out] border border-brand-100">
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 z-20 p-2 text-brand-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
            <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-bac-blue/10 rounded-full flex items-center justify-center mb-4 text-bac-blue">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-brand-900">Espace Enseignant</h3>
                <p className="text-brand-500 text-sm">Accès sécurisé</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center animate-pulse">
                        {error}
                    </div>
                )}
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-600 uppercase tracking-wide">Nom d'utilisateur</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                        <input 
                            type="text" 
                            required 
                            className="w-full bg-brand-50 border border-brand-200 rounded-xl py-2.5 pl-9 pr-4 text-brand-900 focus:outline-none focus:border-bac-blue focus:ring-1 focus:ring-bac-blue transition-all"
                            placeholder="Ex: admin"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-600 uppercase tracking-wide">Mot de passe</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                        <input 
                            type="password" 
                            required 
                            className="w-full bg-brand-50 border border-brand-200 rounded-xl py-2.5 pl-9 pr-4 text-brand-900 focus:outline-none focus:border-bac-blue focus:ring-1 focus:ring-bac-blue transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3 bg-bac-blue hover:bg-sky-700 text-white rounded-xl font-bold text-base shadow-lg shadow-bac-blue/25 transition-all hover:-translate-y-0.5 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Connexion...
                        </>
                    ) : (
                        "Accéder au Tableau de Bord"
                    )}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;