import React from 'react';
import { MOCK_COURSES } from '../constants';
import CourseCard from '../components/CourseCard';
import { Activity, Calendar, TrendingUp, Video, Brain, Zap, Target, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';

interface DashboardProps {
  user: User | null;
  onRequireAuth: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onRequireAuth }) => {
  const navigate = useNavigate();

  const handleActionClick = (action: () => void) => {
    if (!user) {
      onRequireAuth();
    } else {
      action();
    }
  };

  const goToLive = () => {
    navigate('/live');
  };

  return (
    <div className="space-y-24 pb-20 animate-[fadeIn_0.5s_ease-out]">
      
      {/* 1. HERO SECTION */}
      <div className="relative pt-8 md:pt-16 pb-12">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-bac-light/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-bac-blue/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-100 shadow-sm text-bac-blue text-sm font-semibold mb-4 animate-float">
                <Sparkles className="w-4 h-4 text-bac-light" />
                <span>La plateforme n°1 pour le Bac en Tunisie</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-serif text-bac-blue leading-tight">
                {!user ? (
                    <>
                        L'Excellence en <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-bac-light to-bac-blue">Sciences Physiques</span>
                    </>
                ) : (
                    <>
                        {user.role === 'TEACHER' ? 'Tableau de Bord' : 'Mon Espace'} <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-bac-light to-bac-blue">Personnel</span>
                    </>
                )}
            </h1>
            
            <p className="text-lg md:text-xl text-brand-600 max-w-2xl mx-auto leading-relaxed">
                {!user 
                ? 'Accédez aux meilleurs cours, séries d\'exercices corrigées et séances de laboratoire en direct pour garantir votre réussite au Baccalauréat.' 
                : (user.role === 'TEACHER' 
                    ? 'Pilotez votre classe virtuelle, analysez les performances et inspirez la prochaine génération de scientifiques.' 
                    : 'Reprenez votre progression là où vous l\'avez laissée et préparez-vous efficacement.')}
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
                {!user ? (
                    <>
                        <button onClick={onRequireAuth} className="px-8 py-4 bg-bac-blue hover:bg-sky-800 text-white rounded-2xl font-bold shadow-xl shadow-bac-blue/20 transition-all hover:scale-105 flex items-center gap-2">
                            Commencer maintenant
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button onClick={() => navigate('/courses')} className="px-8 py-4 bg-white border border-brand-200 text-bac-blue hover:bg-brand-50 rounded-2xl font-bold transition-all flex items-center gap-2 hover:shadow-lg">
                            <BookOpen className="w-5 h-5" />
                            Voir les cours
                        </button>
                    </>
                ) : user.role === 'TEACHER' ? (
                     <button 
                        onClick={goToLive} 
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-xl shadow-red-500/30 transition-all hover:scale-105 flex items-center gap-2"
                    >
                        <Video className="w-5 h-5" />
                        Lancer un Live
                    </button>
                ) : (
                    <button onClick={() => navigate('/courses')} className="px-8 py-4 bg-bac-blue hover:bg-sky-800 text-white rounded-2xl font-bold shadow-xl shadow-bac-blue/20 transition-all hover:scale-105">
                        Reprendre les cours
                    </button>
                )}
            </div>
        </div>

        {/* Floating Stats Bar */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
            {[
            { icon: Activity, label: 'Élèves Actifs', value: '1,240', color: 'text-bac-light', border: 'group-hover:border-bac-light' },
            { icon: TrendingUp, label: 'Taux de réussite', value: '98%', color: 'text-emerald-500', border: 'group-hover:border-emerald-400' },
            { icon: Calendar, label: 'Séances Live', value: '+50h', color: 'text-purple-500', border: 'group-hover:border-purple-400' },
            ].map((stat, i) => (
            <div key={i} className={`group bg-white/60 backdrop-blur-md border border-white/50 p-6 rounded-3xl flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-brand-900/5 hover:shadow-xl border-l-4 ${stat.border}`}>
                <div className={`p-3 rounded-2xl bg-white shadow-sm ${stat.color}`}>
                    <stat.icon className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-sm font-bold text-brand-400 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-black text-bac-blue mt-0.5">{stat.value}</p>
                </div>
            </div>
            ))}
        </div>
      </div>

      {/* 2. TEACHER PORTFOLIO SECTION */}
      <div className="relative max-w-6xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-r from-bac-blue to-bac-light opacity-5 rounded-[3rem] -z-10 rotate-1"></div>
          <div className="bg-white border border-brand-100 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 shadow-2xl shadow-brand-900/5 overflow-hidden relative">
             
             {/* Decorative Circles */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-bac-light/10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-bac-blue/5 rounded-full -translate-x-1/3 translate-y-1/3"></div>

             {/* Photo Area */}
             <div className="relative shrink-0 w-64 h-64 md:w-80 md:h-80 group cursor-pointer">
                 <div className="absolute inset-0 bg-gradient-to-tr from-bac-blue to-bac-light rounded-full blur-[20px] opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                 <img 
                    src="./teacher.jpg" 
                    alt="Mr. Dhafer Bahroun" 
                    className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-2xl z-10 transition-transform duration-500 group-hover:scale-[1.02]"
                 />
                 <div className="absolute bottom-4 right-0 bg-white shadow-lg border border-brand-100 px-6 py-3 rounded-2xl z-20 flex flex-col items-center animate-[bounce_3s_infinite]">
                    <span className="text-2xl font-black text-bac-blue">20+</span>
                    <span className="text-[10px] text-brand-500 uppercase font-bold tracking-widest">Ans d'Exp.</span>
                 </div>
             </div>

             {/* Content Area */}
             <div className="text-center md:text-left z-10 flex-1">
                 <div className="inline-block px-3 py-1 rounded-full bg-bac-blue/10 text-bac-blue text-sm font-bold mb-4">
                    Professeur Principal
                 </div>
                 <h2 className="text-4xl md:text-5xl font-bold text-bac-blue mb-4 font-serif">Mr. Dhafer Bahroun</h2>
                 <p className="text-lg font-medium text-bac-light mb-6 flex items-center justify-center md:justify-start gap-2">
                    <Zap className="w-5 h-5 fill-current" /> Expert en Pédagogie des Sciences
                 </p>
                 <p className="text-brand-600 leading-relaxed mb-8 text-lg">
                     "La physique n'est pas qu'une suite de formules, c'est une façon de voir le monde. 
                     Mon objectif est de rendre chaque concept limpide et chaque problème surmontable. 
                     Ensemble, nous transformerons votre appréhension en passion et vos efforts en réussite."
                 </p>
                 
                 <div className="flex flex-wrap justify-center md:justify-start gap-3">
                     {['Mécanique & Cinématique', 'Électromagnétisme', 'Thermodynamique', 'Ondes'].map(tag => (
                        <span key={tag} className="px-4 py-2 bg-brand-50 rounded-xl text-sm font-semibold text-brand-600 border border-brand-100 hover:border-bac-light hover:text-bac-blue transition-colors cursor-default">
                            {tag}
                        </span>
                     ))}
                 </div>
             </div>
          </div>
      </div>

      {/* 3. METHODOLOGY SECTION */}
      <div className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold text-bac-blue font-serif">Notre Méthodologie</h2>
            <p className="text-brand-500 text-lg max-w-2xl mx-auto">Une approche structurée en trois étapes pour garantir l'assimilation complète du programme.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
              
              {/* Step 1 */}
              <div className="group bg-white border border-brand-100 p-8 rounded-[2rem] shadow-lg hover:shadow-bac-light/20 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                      <Brain className="w-32 h-32 text-bac-blue" />
                  </div>
                  <div className="w-14 h-14 bg-blue-50 text-bac-blue rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                      <Brain className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-800 mb-3 group-hover:text-bac-blue transition-colors">1. Comprendre</h3>
                  <p className="text-brand-500 leading-relaxed">
                      Des cours vidéo détaillés qui décomposent les concepts complexes en éléments simples. Visualisez pour mieux retenir.
                  </p>
              </div>

              {/* Step 2 */}
              <div className="group bg-white border border-brand-100 p-8 rounded-[2rem] shadow-lg hover:shadow-bac-light/20 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                      <Target className="w-32 h-32 text-bac-blue" />
                  </div>
                  <div className="w-14 h-14 bg-cyan-50 text-bac-light rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-cyan-100">
                      <Target className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-800 mb-3 group-hover:text-bac-light transition-colors">2. Appliquer</h3>
                  <p className="text-brand-500 leading-relaxed">
                      Des séries d'exercices progressifs, du plus simple au type Bac, corrigés en détail pour maîtriser les méthodes de résolution.
                  </p>
              </div>

              {/* Step 3 */}
              <div className="group bg-white border border-brand-100 p-8 rounded-[2rem] shadow-lg hover:shadow-bac-light/20 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                      <Zap className="w-32 h-32 text-bac-blue" />
                  </div>
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-purple-100">
                      <Zap className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-800 mb-3 group-hover:text-purple-600 transition-colors">3. Exceler</h3>
                  <p className="text-brand-500 leading-relaxed">
                      Des séances live interactives pour poser vos questions, approfondir les subtilités et parfaire votre préparation aux examens.
                  </p>
              </div>

          </div>
      </div>

      {/* 4. COURSES PREVIEW */}
      <div className="space-y-8 pt-10 border-t border-brand-100">
        <div className="flex justify-between items-end px-4">
          <div>
              <h2 className="text-3xl font-bold text-bac-blue font-serif mb-2">
                {user?.role === 'TEACHER' ? 'Vos Cours Actifs' : 'Cours à la Une'}
              </h2>
              <p className="text-brand-500">Découvrez nos modules les plus populaires.</p>
          </div>
          <Link to="/courses" className="px-5 py-2.5 rounded-xl bg-white border border-brand-200 text-bac-blue font-bold hover:bg-bac-blue hover:text-white transition-all shadow-sm flex items-center gap-2">
             Tout voir <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_COURSES.slice(0, 3).map((course) => (
            <CourseCard 
                key={course.id} 
                course={course} 
                onClick={() => handleActionClick(() => console.log('Ouvrir cours', course.id))}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;