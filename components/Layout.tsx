import React, { ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Radio, BookOpen, Users, LogOut, LogIn, FileText, Menu, X, Facebook, Youtube, Lock, Atom, Zap, ChevronRight, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: ReactNode;
  user: User | null;
  onLogout: () => void;
  onLoginRequest: () => void;
  onAdminRequest: () => void;
  isLiveActive: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onLoginRequest, onAdminRequest, isLiveActive }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll on route change for smooth transition feel
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Accueil', path: '/' },
    { icon: BookOpen, label: 'Cours', path: '/courses' },
    { icon: FileText, label: 'Séries', path: '/resources' },
  ];

  if (user?.role === 'TEACHER') {
    navItems.push({ icon: ShieldCheck, label: 'Tableau de Bord', path: '/dashboard' });
  }

  const isTeacher = user?.role === 'TEACHER';
  
  // Logic to determine if Live button is accessible
  // Teacher can always access. Students only if isLiveActive is true.
  const isLiveAccessible = isTeacher || isLiveActive;

  return (
    <div className="min-h-screen bg-brand-50 text-brand-900 font-sans selection:bg-bac-light/30 flex flex-col">
      {/* Top Navigation Bar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md border-brand-100 py-3 shadow-md shadow-brand-900/5' 
            : 'bg-white border-transparent py-5 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Section with Custom Physics/Chemistry Typography */}
          <div className="group flex items-center gap-3 select-none cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
            <style>{`
              @keyframes bubble-rise {
                0% { transform: translateY(4px) scale(0.5); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(-8px) scale(1.1); opacity: 0; }
              }
            `}</style>
            
            <div className="relative">
              {/* Main Badge */}
              <div className="bg-bac-light text-white px-3 py-1.5 rounded-tl-2xl rounded-br-2xl font-bold text-xl shadow-lg relative z-10 transition-all duration-300 group-hover:shadow-bac-light/40 group-hover:rotate-3">
                  BAC
              </div>
              
              {/* Physics Animations (Orbits) */}
              <div className="absolute inset-0 -z-0">
                  <div className="absolute top-1/2 left-1/2 w-12 h-12 border border-bac-blue/20 rounded-full -translate-x-1/2 -translate-y-1/2 animate-[spin_4s_linear_infinite]"></div>
                  <div className="absolute top-1/2 left-1/2 w-16 h-16 border border-bac-light/20 rounded-full -translate-x-1/2 -translate-y-1/2 animate-[spin_6s_linear_infinite_reverse]"></div>
              </div>
            </div>

            <div className="flex flex-col leading-none">
                {/* Text Logo with Integrated Icons */}
                <div className="flex items-end font-serif font-bold text-2xl text-bac-blue tracking-tight group-hover:text-sky-700 transition-colors">
                    <span>Physiq</span>
                    
                    {/* Custom 'u' as Liquid Container - Resized to match x-height */}
                    <div className="relative mx-[0.5px] w-[11px] h-[13px] border-2 border-bac-blue border-t-0 rounded-b-[5px] overflow-hidden mb-[3px] bg-white">
                         {/* Liquid Level */}
                         <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-bac-light/40 border-t border-bac-light/60 flex justify-center">
                            {/* Rising Bubbles */}
                            <div className="absolute bottom-0 left-0.5 w-[1.5px] h-[1.5px] bg-bac-blue rounded-full" style={{animation: 'bubble-rise 2s infinite linear'}}></div>
                            <div className="absolute bottom-0 right-0.5 w-[1.5px] h-[1.5px] bg-bac-blue rounded-full" style={{animation: 'bubble-rise 2.5s infinite linear 0.8s'}}></div>
                         </div>
                    </div>

                    <span>e</span>
                    
                    {/* The 'C' and 'h' */}
                    <span className="ml-[1px]">Ch</span>
                    
                    {/* Custom 'i' with Atom Dot - Resized */}
                    <div className="relative mx-[1px] flex flex-col items-center justify-end h-[24px]">
                        {/* Atom Icon as Dot - Smaller size, moved up 1px */}
                        <Atom className="w-3 h-3 text-bac-light animate-[spin_4s_linear_infinite] absolute top-[3px]" />
                        {/* Stem of the 'i' */}
                        <div className="w-[3px] h-[11px] bg-bac-blue rounded-sm mb-[2px]"></div>
                    </div>

                    <span>mie</span>
                    
                    <span className="text-bac-light text-lg ml-0.5">.tn</span>
                </div>
                
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-400 font-semibold group-hover:text-bac-light transition-colors pl-1">
                  L'excellence Scientifique
                </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-brand-50 p-1.5 rounded-2xl border border-brand-200">
             {navItems.map((item) => {
               const isActive = location.pathname === item.path;
               return (
                 <NavLink
                   key={item.path}
                   to={item.path}
                   className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                     isActive 
                       ? 'bg-white text-bac-blue shadow-md shadow-brand-200/50' 
                       : 'text-brand-500 hover:text-bac-blue hover:bg-white/60'
                   }`}
                 >
                   <item.icon className={`w-4 h-4 ${isActive ? 'text-bac-light' : ''}`} />
                   {item.label}
                 </NavLink>
               );
             })}
             
             {/* Special Direct Button */}
             <div className="w-px h-6 bg-brand-200 mx-2"></div>
             
             {isLiveAccessible ? (
                <NavLink
                  to="/live"
                  className={({ isActive }) => `
                      relative px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden group
                      ${isActive 
                        ? 'bg-red-600 text-white shadow-md shadow-red-500/30' 
                        : 'bg-red-50 text-red-500 hover:bg-red-100'
                      }
                  `}
                >
                    <Radio className={`w-4 h-4 ${!isTeacher ? 'animate-pulse' : ''}`} />
                    <span className="relative z-10">Direct</span>
                    {(!isTeacher || isLiveActive) && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    )}
                </NavLink>
             ) : (
                <div 
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-brand-100 text-brand-400 flex items-center gap-2 cursor-not-allowed opacity-75"
                  title="Aucun direct en cours"
                >
                    <Lock className="w-4 h-4" />
                    <span>Hors ligne</span>
                </div>
             )}
          </nav>

          {/* User / Login Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                 <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-bold text-bac-blue">{user.name}</span>
                    <span className="text-xs text-brand-400 font-semibold">{user.role === 'TEACHER' ? 'Professeur' : 'Étudiant'}</span>
                 </div>
                 <div className="relative group">
                    <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-bac-light to-bac-blue flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white group-hover:ring-bac-light transition-all">
                       {user.name.charAt(0)}
                    </button>
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-brand-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                       <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 text-left first:rounded-t-xl last:rounded-b-xl">
                          <LogOut className="w-4 h-4" />
                          Se déconnecter
                       </button>
                    </div>
                 </div>
              </div>
            ) : (
              <button
                onClick={onLoginRequest}
                className="px-6 py-2.5 rounded-xl bg-bac-blue hover:bg-sky-700 text-white font-bold text-sm transition-all shadow-md shadow-bac-blue/20 flex items-center gap-2 hover:-translate-y-0.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
                className="md:hidden p-2 text-brand-600 hover:text-bac-blue"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
         <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl md:hidden pt-24 px-6 animate-[fadeIn_0.2s_ease-out]">
            <nav className="flex flex-col gap-4">
               {navItems.map((item) => (
                 <NavLink
                   key={item.path}
                   to={item.path}
                   onClick={() => setMobileMenuOpen(false)}
                   className={({ isActive }) => `
                     p-4 rounded-xl text-lg font-bold flex items-center gap-4 transition-colors
                     ${isActive ? 'bg-bac-blue text-white' : 'bg-brand-50 text-brand-600'}
                   `}
                 >
                   <item.icon className="w-6 h-6" />
                   {item.label}
                 </NavLink>
               ))}
               
               {isLiveAccessible ? (
                   <NavLink
                       to="/live"
                       onClick={() => setMobileMenuOpen(false)}
                       className="p-4 rounded-xl text-lg font-bold bg-red-600 text-white flex items-center gap-4 shadow-lg shadow-red-500/30"
                     >
                       <Radio className="w-6 h-6" />
                       Direct En Cours
                   </NavLink>
               ) : (
                   <div className="p-4 rounded-xl text-lg font-bold bg-brand-100 text-brand-400 flex items-center gap-4">
                       <Lock className="w-6 h-6" />
                       Direct (Hors ligne)
                   </div>
               )}
            </nav>
         </div>
      )}

      {/* Main Content with top padding for fixed header */}
      <main className="pt-24 flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Page Transition Wrapper */}
        <div key={location.pathname} className="animate-[pageEnter_0.5s_cubic-bezier(0.2,0.8,0.2,1)_forwards]">
            {children}
        </div>
      </main>

      {/* Professional Dark Footer */}
      <footer className="bg-brand-900 text-white pt-16 pb-8 border-t border-brand-800 relative overflow-hidden">
         {/* Background Pattern */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                 
                 {/* Brand Column */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-bac-light text-white px-2 py-1 rounded-tl-lg rounded-br-lg font-bold text-lg shadow-lg shadow-bac-blue/50">
                            BAC
                        </div>
                        <span className="font-serif font-bold text-xl text-white tracking-tight">PhysiqueChimie.tn</span>
                    </div>
                    <p className="text-brand-400 text-sm leading-relaxed">
                        La plateforme éducative de référence en Tunisie pour les sciences physiques. Excellence, pédagogie et innovation au service de votre réussite.
                    </p>
                    <div className="flex gap-4">
                        <a 
                          href="https://www.facebook.com/profile.php?id=61557001837844" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1"
                        >
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a 
                          href="https://www.youtube.com/@bacphysiquechimietn" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-400 hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-1"
                        >
                            <Youtube className="w-5 h-5" />
                        </a>
                    </div>
                 </div>

                 {/* Quick Links */}
                 <div>
                    <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-bac-light" /> Navigation
                    </h4>
                    <ul className="space-y-3">
                        {[
                            { label: 'Accueil', path: '/' },
                            { label: 'Cours Vidéo', path: '/courses' },
                            { label: 'Séries & PDFs', path: '/resources' },
                        ].map(link => (
                            <li key={link.path}>
                                <NavLink to={link.path} className="text-brand-400 hover:text-bac-light transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 bg-brand-700 rounded-full group-hover:bg-bac-light transition-colors"></span>
                                    {link.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                 </div>

                 {/* Contact Info */}
                 <div>
                    <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-bac-light" /> Contact
                    </h4>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-brand-400 text-sm">
                            <MapPin className="w-5 h-5 text-bac-light shrink-0" />
                            <span>123 Avenue de la République,<br/>Tunis, Tunisie</span>
                        </li>
                        <li className="flex items-center gap-3 text-brand-400 text-sm">
                            <Phone className="w-5 h-5 text-bac-light shrink-0" />
                            <span>+216 71 000 000</span>
                        </li>
                        <li className="flex items-center gap-3 text-brand-400 text-sm">
                            <Mail className="w-5 h-5 text-bac-light shrink-0" />
                            <span>contact@bacphysique.tn</span>
                        </li>
                    </ul>
                 </div>

                 {/* Admin Area */}
                 <div>
                    <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-bac-light" /> Administration
                    </h4>
                    <p className="text-brand-400 text-sm mb-4">
                        Accès réservé au corps enseignant pour la gestion des cours et des ressources.
                    </p>
                    <button 
                        onClick={onAdminRequest}
                        className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-brand-800 hover:bg-bac-blue text-white py-3 rounded-xl transition-all shadow-lg hover:shadow-bac-blue/30 border border-brand-700 hover:border-bac-blue"
                    >
                        <Lock className="w-4 h-4" />
                        <span>Espace Enseignant</span>
                    </button>
                 </div>
             </div>

             <div className="border-t border-brand-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-500">
                 <p>&copy; {new Date().getFullYear()} Bac Physique Chimie TN. Tous droits réservés.</p>
                 <div className="flex gap-6">
                     <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
                     <a href="#" className="hover:text-white transition-colors">Politique de Confidentialité</a>
                     <a href="#" className="hover:text-white transition-colors">CGU</a>
                 </div>
             </div>
         </div>
      </footer>
    </div>
  );
};

export default Layout;