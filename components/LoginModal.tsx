import React, { useState } from 'react';
import { Atom, User as UserIcon, Lock, Mail, ArrowRight, BookOpen, GraduationCap, Radio, X, AlertCircle, Loader2 } from 'lucide-react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (isSignup && !name) {
       setError("Veuillez entrer votre nom.");
       return;
    }

    setIsLoading(true);

    try {
        let user;
        if (isSignup) {
            user = await api.register(name, email, password);
        } else {
            user = await api.login(email, password);
        }
        onLogin(user);
        onClose();
        resetForm();
    } catch (err: any) {
        setError(err.message || "Une erreur est survenue.");
    } finally {
        setIsLoading(false);
    }
  };

  const resetForm = () => {
      setName('');
      setEmail('');
      setPassword('');
      setError(null);
      setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-900/60 backdrop-blur-sm cursor-pointer" 
        onClick={!isLoading ? onClose : undefined} 
      />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-brand-100 z-10 animate-[fadeIn_0.3s_ease-out]">
        
        {/* CLOSE BUTTON - Fixed Visibility */}
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 z-[110] p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
          type="button"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Left Side */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-bac-blue to-sky-600 p-10 flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8">
                    <div className="bg-white/20 px-2 py-1 rounded text-sm font-bold backdrop-blur-md">
                         BAC
                    </div>
                    <span className="font-bold text-2xl font-serif">PhysiqueChimie.tn</span>
                </div>
                
                <h2 className="text-3xl font-bold mb-4">
                    {isSignup ? "Rejoignez l'élite." : "Bon retour."}
                </h2>
                <p className="text-white/90 text-lg leading-relaxed">
                    Accédez aux ressources exclusives, aux vidéos et au laboratoire en direct.
                </p>
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold">Bibliothèque</p>
                        <p className="text-sm text-white/80">Cours et PDFs gratuits.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-brand-900 mb-2">
                    {isSignup ? "Créer un compte" : "Connexion requise"}
                </h3>
                <p className="text-brand-500 text-sm">
                    {isSignup ? "Remplissez vos informations pour commencer." : "Connectez-vous pour accéder à ce contenu."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 p-2 bg-brand-50 rounded-xl mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white text-bac-blue flex items-center justify-center shadow-sm">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-brand-700">Espace Étudiant</span>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center gap-2 animate-pulse">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {isSignup && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-600 uppercase tracking-wide">Nom complet</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                            <input 
                                type="text" 
                                maxLength={20}
                                className="w-full bg-brand-50 border border-brand-200 rounded-xl py-2.5 pl-9 pr-4 text-brand-900 focus:outline-none focus:border-bac-blue focus:ring-1 focus:ring-bac-blue transition-all placeholder-brand-300 text-sm"
                                placeholder="Votre nom"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-600 uppercase tracking-wide">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                        <input 
                            type="email" 
                            maxLength={50}
                            className="w-full bg-brand-50 border border-brand-200 rounded-xl py-2.5 pl-9 pr-4 text-brand-900 focus:outline-none focus:border-bac-blue focus:ring-1 focus:ring-bac-blue transition-all placeholder-brand-300 text-sm"
                            placeholder="exemple@physique.tn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            maxLength={50}
                            className="w-full bg-brand-50 border border-brand-200 rounded-xl py-2.5 pl-9 pr-4 text-brand-900 focus:outline-none focus:border-bac-blue focus:ring-1 focus:ring-bac-blue transition-all placeholder-brand-300 text-sm"
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
                    className="w-full py-3 bg-bac-blue hover:bg-sky-700 text-white rounded-xl font-bold text-base shadow-lg shadow-bac-blue/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Traitement...
                        </>
                    ) : (
                        <>
                            {isSignup ? "S'inscrire" : "Se connecter"}
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-brand-500 text-xs">
                    {isSignup ? "Déjà membre ?" : "Pas de compte ?"}
                    <button 
                        onClick={() => {
                            setIsSignup(!isSignup);
                            setError(null);
                        }}
                        disabled={isLoading}
                        className="ml-2 text-bac-blue hover:text-sky-700 font-bold hover:underline disabled:opacity-50"
                    >
                        {isSignup ? "Connectez-vous" : "Inscrivez-vous"}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;