import React from 'react';
import { Users, Clock } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-white border border-brand-200 rounded-3xl overflow-hidden hover:border-bac-light/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-bac-blue/10 cursor-pointer flex flex-col h-full"
    >
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bac-blue/90 to-transparent opacity-60" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-2 mb-2">
            {course.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-white/20 text-white rounded-md backdrop-blur-md border border-white/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-bac-blue mb-2 group-hover:text-bac-light transition-colors line-clamp-2">{course.title}</h3>
        <p className="text-sm text-brand-500 mb-4 line-clamp-2 flex-1">{course.description}</p>
        
        <div className="flex items-center justify-between text-xs font-semibold text-brand-400 border-t border-brand-100 pt-4 mt-auto">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-bac-light" />
            <span>{course.students.toLocaleString()} élèves</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-bac-light" />
            <span>{course.modules} Chapitres</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;