import React, { ReactNode, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Radio, BookOpen, LogOut, LogIn, FileText, Menu, X, Facebook, Youtube, Lock, Atom, ChevronRight, Mail, Phone, ShieldCheck, MessageCircle, Video, GraduationCap } from 'lucide-react';
import { User } from '../types';
import { getDailyFact } from '../utils/dailyScience';

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
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dailyFact = getDailyFact();
  const DailyIcon = dailyFact.icon;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Accueil', path: '/' },
    { icon: BookOpen, label: 'Cours', path: '/courses' },
    { icon: FileText, label: 'Séries', path: '/resources' },
    { icon: GraduationCap, label: 'Sujets Bac', path: '/sujets-bac' },
    { icon: Video, label: 'Vidéos', path: '/videos' },
    { icon: MessageCircle, label: 'Forum', path: '/forum' },
  ];

  if (user?.role === 'TEACHER') {
    navItems.push({ icon: ShieldCheck, label: 'Tableau de Bord', path: '/dashboard' });
  }

  const isTeacher = user?.role === 'TEACHER';
  const isLiveAccessible = isTeacher || isLiveActive;

  // Helper to generate correct gradient classes from base bg class (e.g. 'bg-blue-50')
  const getGradientClass = (bgClass: string) => {
      const color = bgClass.replace('bg-', '').replace('-50', '');
      return `bg-gradient-to-br from-${color}-400 to-${color}-600`;
  };

  const bubbleGradient = getGradientClass(dailyFact.bg);

  return (
    <div className="min-h-screen bg-transparent text-brand-900 font-sans selection:bg-bac-light/30 flex flex-col">
      {/* Top Navigation Bar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md border-brand-100 py-3 shadow-md shadow-brand-900/5' 
            : 'bg-white/80 backdrop-blur-sm border-transparent py-5 shadow-sm'
        }`}
      >
        <div className="w-full max-w-[98%] mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Logo Section */}
          <div 
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 select-none cursor-pointer"
          >
            <style>{`
              @keyframes bubble-rise {
                0% { transform: translateY(4px) scale(0.5); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(-8px) scale(1.1); opacity: 0; }
              }
            `}</style>
            
            <div className="relative">
              <div className="bg-bac-light text-white px-3 py-1.5 rounded-tl-2xl rounded-br-2xl font-bold text-xl shadow-lg relative z-10 transition-all duration-300 group-hover:shadow-bac-light/40 group-hover:rotate-3">
                  BAC
              </div>
              <div className="absolute inset-0 -z-0">
                  <div className="absolute top-1/2 left-1/2 w-12 h-12 border border-bac-blue/20 rounded-full -translate-x-1/2 -translate-y-1/2 animate-[spin_4s_linear_infinite]"></div>
              </div>
            </div>

            <div className="flex flex-col leading-none">
                <div className="flex items-end font-serif font-bold text-2xl text-bac-blue tracking-tight">
                    <span>Physiq</span>
                    <span className="text-bac-light">ue</span>
                    <span className="ml-[1px]">Chimie</span>
                    <span className="text-bac-light text-lg ml-0.5">.tn</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-400 font-semibold group-hover:text-bac-light transition-colors pl-1">
                  L'excellence Scientifique
                </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-2 bg-brand-50/50 p-1.5 rounded-2xl border border-brand-200/50 backdrop-blur-sm">
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
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* FLOATING BUBBLE - DAILY SCIENCE */}
            <button 
                onClick={() => navigate('/daily-science')}
                className="hidden md:flex relative group items-center gap-3 px-1 pr-4 py-1 bg-white border border-brand-100 rounded-full shadow-lg hover:shadow-xl hover:border-bac-light/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
                {/* Glowing Background Effect */}
                <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${bubbleGradient}`}></div>
                
                {/* Icon Circle */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md relative overflow-hidden ${bubbleGradient}`}>
                    <DailyIcon className="w-5 h-5 relative z-10 animate-pulse" />
                    <div className="absolute inset-0 bg-white/20 animate-[spin_3s_linear_infinite] opacity-30"></div>
                </div>

                <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Info du Jour</span>
                    <span className="text-sm font-bold text-brand-900 group-hover:text-bac-blue transition-colors max-w-[100px] truncate">
                        {dailyFact.title}
                    </span>
                </div>
            </button>

            {/* Live Button */}
            {isLiveAccessible && (
                <NavLink
                  to="/live"
                  className={({ isActive }) => `
                      hidden sm:flex relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 items-center gap-2 overflow-hidden
                      ${isActive 
                        ? 'bg-red-600 text-white shadow-md shadow-red-500/30' 
                        : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'
                      }
                  `}
                >
                    <Radio className={`w-4 h-4 ${!isTeacher ? 'animate-pulse' : ''}`} />
                    <span className="relative z-10">Direct</span>
                    {(!isTeacher || isLiveActive) && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    )}
                </NavLink>
            )}

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-brand-200">
                 <div className="relative group">
                    <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-bac-light to-bac-blue flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white group-hover:ring-bac-light transition-all">
                       {user.name.charAt(0)}
                    </button>
                    <div className="absolute right-0 top-full mt-4 w-48 bg-white border border-brand-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                       <div className="px-4 py-3 border-b border-brand-50">
                           <p className="text-sm font-bold text-brand-900">{user.name}</p>
                           <p className="text-xs text-brand-500">{user.role === 'TEACHER' ? 'Professeur' : 'Étudiant'}</p>
                       </div>
                       <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 text-left last:rounded-b-xl">
                          <LogOut className="w-4 h-4" />
                          Se déconnecter
                       </button>
                    </div>
                 </div>
              </div>
            ) : (
              <button
                onClick={onLoginRequest}
                className="px-5 py-2.5 rounded-xl bg-bac-blue hover:bg-sky-700 text-white font-bold text-sm transition-all shadow-md shadow-bac-blue/20 flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
                className="xl:hidden p-2 text-brand-600 hover:text-bac-blue bg-brand-50 rounded-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
         <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl xl:hidden pt-28 px-6 animate-[fadeIn_0.2s_ease-out]">
            <nav className="flex flex-col gap-3">
               {/* Mobile Bubble */}
               <NavLink
                   to="/daily-science"
                   onClick={() => setMobileMenuOpen(false)}
                   className={`p-4 rounded-xl text-lg font-bold flex items-center gap-4 border shadow-sm ${dailyFact.navBg} ${dailyFact.navText} border-transparent`}
               >
                   <DailyIcon className={`w-6 h-6 fill-current ${dailyFact.iconClass}`} />
                   <span>Info du jour: {dailyFact.title}</span>
               </NavLink>

               {navItems.map((item) => (
                 <NavLink
                   key={item.path}
                   to={item.path}
                   onClick={() => setMobileMenuOpen(false)}
                   className={({ isActive }) => `
                     p-4 rounded-xl text-lg font-bold flex items-center gap-4 transition-colors
                     ${isActive ? 'bg-bac-blue text-white shadow-lg shadow-bac-blue/30' : 'bg-brand-50 text-brand-600'}
                   `}
                 >
                   <item.icon className="w-6 h-6" />
                   {item.label}
                 </NavLink>
               ))}
            </nav>
         </div>
      )}

      {/* Main Content */}
      <main className="pt-28 flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div key={location.pathname} className="animate-[pageEnter_0.5s_cubic-bezier(0.2,0.8,0.2,1)_forwards]">
            {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-900 text-white pt-16 pb-8 border-t border-brand-800 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                 
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
                        <a href="https://www.facebook.com/profile.php?id=61557001837844" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a href="https://www.youtube.com/@bacphysiquechimietn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-brand-400 hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-1">
                            <Youtube className="w-5 h-5" />
                        </a>
                    </div>
                 </div>

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

                 <div>
                    <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-bac-light" /> Contact
                    </h4>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-brand-400 text-sm">
                            <Phone className="w-5 h-5 text-bac-light shrink-0" />
                            <span>+216 54 835 839</span>
                        </li>
                        <li className="flex items-center gap-3 text-brand-400 text-sm">
                            <Mail className="w-5 h-5 text-bac-light shrink-0" />
                            <span>mohameddhaferbahroun@gmail.com</span>
                        </li>
                    </ul>
                 </div>

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