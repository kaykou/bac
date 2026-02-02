import React, { useState } from 'react';
import { MOCK_COURSES } from '../constants';
import CourseCard from '../components/CourseCard';
import { Search, Filter, Plus, BookOpen, Clock } from 'lucide-react';
import { User } from '../types';

interface CoursesProps {
  user: User | null;
  onRequireAuth: () => void;
}

const Courses: React.FC<CoursesProps> = ({ user, onRequireAuth }) => {
  const [search, setSearch] = useState('');

  const handleCourseClick = (courseId: string) => {
    if (!user) {
      onRequireAuth();
    } else {
      // Simulate navigation to course player/details
      alert(`Navigation vers le module de cours: ${courseId}\n(Fonctionnalité simulée)`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-brand-900 font-serif flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-bac-blue" />
                Catalogue des Cours
            </h1>
            <p className="text-brand-500 mt-1">Accédez à des centaines d'heures de formation vidéo.</p>
        </div>
        
        <div className="flex gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                <input 
                    type="text" 
                    placeholder="Rechercher un chapitre..." 
                    className="pl-10 pr-4 py-2.5 bg-white border border-brand-200 rounded-xl text-brand-900 placeholder-brand-400 focus:outline-none focus:border-bac-blue w-64 focus:ring-1 focus:ring-bac-blue shadow-sm transition-all focus:w-72"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <button className="p-2.5 bg-white border border-brand-200 rounded-xl text-brand-500 hover:text-bac-blue hover:border-bac-blue transition-colors shadow-sm">
                <Filter className="w-5 h-5" />
            </button>
            {user?.role === 'TEACHER' && (
                <button className="flex items-center gap-2 px-4 py-2.5 bg-bac-blue hover:bg-sky-700 text-white rounded-xl font-medium transition-colors shadow-md shadow-bac-blue/20">
                    <Plus className="w-4 h-4" />
                    <span>Nouveau Cours</span>
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_COURSES.filter(c => c.title.toLowerCase().includes(search.toLowerCase())).map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onClick={() => handleCourseClick(course.title)}
          />
        ))}
        {MOCK_COURSES.length === 0 && (
             <div className="col-span-full text-center py-20 text-brand-400 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-brand-300" />
                </div>
                <p>Aucun cours trouvé correspondant à votre recherche.</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default Courses;