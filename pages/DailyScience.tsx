import React from 'react';
import { Lightbulb, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDailyFact } from '../utils/dailyScience';

const DailyScience: React.FC = () => {
  const navigate = useNavigate();
  
  // Get data from shared utility
  const dailyFact = getDailyFact();
  const Icon = dailyFact.icon;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-[fadeIn_0.5s_ease-out]">
        <button 
            onClick={() => navigate('/')} 
            className="absolute top-24 left-4 md:left-8 flex items-center gap-2 text-brand-500 hover:text-bac-blue font-bold transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
            Retour
        </button>

        <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-brand-100 relative">
            {/* Cute Header Background */}
            <div className={`h-40 ${dailyFact.bg} w-full relative overflow-hidden flex items-center justify-center transition-colors duration-500`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                
                {/* Main Icon Container */}
                <div className={`w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg ${dailyFact.color}`}>
                    <Icon className="w-12 h-12" />
                </div>
            </div>

            <div className="p-8 md:p-12 text-center">
                <div className="inline-block px-4 py-1.5 rounded-full bg-brand-50 text-brand-500 font-bold text-xs uppercase tracking-widest mb-4">
                    La Science du Jour
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-brand-900 font-serif mb-6 leading-tight">
                    {dailyFact.title}
                </h1>

                <p className="text-lg text-brand-600 leading-relaxed mb-8">
                    {dailyFact.content}
                </p>

                <div className="bg-gradient-to-r from-bac-light/10 to-bac-blue/10 p-6 rounded-2xl border border-bac-light/20 relative">
                    <Lightbulb className="w-6 h-6 text-yellow-500 absolute -top-3 -left-3 bg-white rounded-full p-1 shadow-sm" />
                    <p className="text-sm font-bold text-brand-700 italic">
                        " {dailyFact.fact} "
                    </p>
                </div>
            </div>
            
            <div className="bg-brand-50 p-4 text-center text-xs text-brand-400 font-bold border-t border-brand-100">
                Revenez demain pour une nouvelle découverte !
            </div>
        </div>
    </div>
  );
};

export default DailyScience;