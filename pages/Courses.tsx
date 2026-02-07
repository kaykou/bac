import React, { useState, useEffect } from 'react';
import CourseCard from '../components/CourseCard';
import { Search, Filter, Plus, BookOpen, Clock, Loader2, ArrowLeft, Video, FileText, Download, PlayCircle, Eye } from 'lucide-react';
import { User, Resource, Course } from '../types';
import { api } from '../services/api';
import FilePreviewModal from '../components/FilePreviewModal';

interface CoursesProps {
  user: User | null;
  onRequireAuth: () => void;
}

const Courses: React.FC<CoursesProps> = ({ user, onRequireAuth }) => {
  const [search, setSearch] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for adding a course (teacher only)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseImage, setNewCourseImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // State for viewing a specific course (Folder content)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  useEffect(() => {
      fetchCourses();
  }, []);

  const fetchCourses = async () => {
      setIsLoading(true);
      try {
          const data = await api.getResources();
          setResources(data);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCourseTitle) return;
      setIsProcessing(true);

      const newFolder: Resource = {
          id: 'course-' + Date.now(),
          title: newCourseTitle,
          description: newCourseDesc,
          type: 'FOLDER',
          category: 'COURS',
          date: new Date().toISOString().split('T')[0],
          url: newCourseImage || undefined 
      };

      try {
          await api.addResource(newFolder);
          await fetchCourses();
          setShowAddModal(false);
          setNewCourseTitle('');
          setNewCourseDesc('');
          setNewCourseImage(null);
      } catch (e) {
          console.error(e);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if(ev.target?.result) setNewCourseImage(ev.target.result as string);
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const openResource = (res: Resource) => {
      if (!user) {
          onRequireAuth();
          return;
      }
      setPreviewResource(res);
  };

  // Filter Logic
  // 1. Get Top Level Courses (Folders with category 'COURS')
  const courses = resources.filter(r => r.type === 'FOLDER' && r.category === 'COURS' && (!r.parentId));
  
  // 2. Get Content for Selected Course
  const courseContent = selectedCourseId 
      ? resources.filter(r => r.parentId === selectedCourseId) 
      : [];

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  // If a course is selected, show its content view
  if (selectedCourseId) {
      const activeCourse = resources.find(r => r.id === selectedCourseId);
      
      return (
          <div className="max-w-7xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
              <button 
                onClick={() => setSelectedCourseId(null)}
                className="flex items-center gap-2 text-brand-500 hover:text-bac-blue transition-colors font-bold mb-4"
              >
                  <ArrowLeft className="w-5 h-5" />
                  Retour aux cours
              </button>

              <div className="bg-white rounded-3xl border border-brand-200 overflow-hidden shadow-sm">
                  <div className="aspect-[21/9] relative bg-brand-900">
                      {activeCourse?.url && (
                          <img src={activeCourse.url} alt={activeCourse.title} className="w-full h-full object-cover opacity-60" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                          <div className="inline-block px-3 py-1 bg-bac-blue rounded-lg text-xs font-bold uppercase tracking-wider mb-3">Cours</div>
                          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">{activeCourse?.title}</h1>
                          <p className="text-lg text-gray-200 max-w-3xl">{activeCourse?.description}</p>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                      <h2 className="text-2xl font-bold text-brand-900 mb-6 flex items-center gap-2">
                          <BookOpen className="w-6 h-6 text-bac-blue" />
                          Contenu du Chapitre
                      </h2>
                      
                      {courseContent.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-3xl border border-brand-100 text-brand-400">
                              Ce cours ne contient encore aucun fichier.
                          </div>
                      ) : (
                          courseContent.map((item) => (
                              <div key={item.id} className="group flex items-center justify-between p-4 bg-white border border-brand-200 rounded-2xl hover:border-bac-blue/50 hover:shadow-md transition-all">
                                  <div className="flex items-center gap-4">
                                      <div className={`p-3 rounded-xl ${
                                          item.type === 'VIDEO' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-600'
                                      }`}>
                                          {item.type === 'VIDEO' ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                      </div>
                                      <div>
                                          <h3 className="font-bold text-brand-900 group-hover:text-bac-blue transition-colors">{item.title}</h3>
                                          <p className="text-sm text-brand-500">{item.type} • {item.size || 'Fichier'}</p>
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => openResource(item)}
                                    className="px-4 py-2 bg-brand-50 hover:bg-bac-blue hover:text-white text-brand-600 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                                  >
                                      {item.type === 'VIDEO' || item.type === 'PDF' ? (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            Ouvrir
                                        </>
                                      ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            Télécharger
                                        </>
                                      )}
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
                  
                  <div className="space-y-6">
                      <div className="bg-white p-6 rounded-3xl border border-brand-200 shadow-sm sticky top-24">
                          <h3 className="font-bold text-brand-900 mb-4">Informations</h3>
                          <div className="space-y-4 text-sm text-brand-600">
                              <div className="flex justify-between py-2 border-b border-brand-50">
                                  <span>Chapitres/Fichiers</span>
                                  <span className="font-bold text-brand-900">{courseContent.length}</span>
                              </div>
                              <div className="flex justify-between py-2 border-b border-brand-50">
                                  <span>Dernière mise à jour</span>
                                  <span className="font-bold text-brand-900">{activeCourse?.date}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <FilePreviewModal 
                resource={previewResource} 
                onClose={() => setPreviewResource(null)} 
              />
          </div>
      );
  }

  // MAIN LIST VIEW
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-brand-900 font-serif flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-bac-blue" />
                Catalogue des Cours
            </h1>
            <p className="text-brand-500 mt-1">Accédez à vos modules de physique et chimie.</p>
        </div>
        
        <div className="flex gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                <input 
                    type="text" 
                    placeholder="Rechercher un cours..." 
                    className="pl-10 pr-4 py-2.5 bg-white border border-brand-200 rounded-xl text-brand-900 placeholder-brand-400 focus:outline-none focus:border-bac-blue w-64 focus:ring-1 focus:ring-bac-blue shadow-sm transition-all focus:w-72"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {user?.role === 'TEACHER' && (
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-bac-blue hover:bg-sky-700 text-white rounded-xl font-medium transition-colors shadow-md shadow-bac-blue/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter Cours</span>
                </button>
            )}
        </div>
      </div>

      {isLoading ? (
          <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-bac-blue animate-spin" />
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((folder) => {
                // Adapt Resource (Folder) to Course Interface for Card
                const courseProps: Course = {
                    id: folder.id,
                    title: folder.title,
                    description: folder.description || '',
                    thumbnail: folder.url || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
                    instructor: 'Mr. Dhafer',
                    students: 0,
                    modules: resources.filter(r => r.parentId === folder.id).length,
                    tags: ['Physique']
                };

                return (
                  <CourseCard 
                    key={folder.id} 
                    course={courseProps} 
                    onClick={() => setSelectedCourseId(folder.id)}
                  />
                );
            })}
            
            {filteredCourses.length === 0 && (
                 <div className="col-span-full text-center py-20 text-brand-400 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-brand-300" />
                    </div>
                    <p>Aucun cours trouvé. {user?.role === 'TEACHER' ? 'Créez-en un !' : ''}</p>
                 </div>
            )}
          </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-brand-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-brand-900">Nouveau Cours</h3>
                    <button onClick={() => setShowAddModal(false)}><ArrowLeft className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titre du Cours</label>
                        <input 
                            type="text" 
                            required
                            value={newCourseTitle} 
                            onChange={e => setNewCourseTitle(e.target.value)}
                            placeholder="Ex: Mécanique Quantique"
                            className="w-full bg-gray-50 border border-brand-200 rounded-xl px-4 py-2 text-brand-900 focus:outline-none focus:border-bac-blue focus:ring-1 focus:ring-bac-blue"
                            disabled={isProcessing}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <textarea 
                            value={newCourseDesc} 
                            onChange={e => setNewCourseDesc(e.target.value)}
                            placeholder="Description brève du module..."
                            className="w-full bg-gray-50 border border-brand-200 rounded-xl px-4 py-2 text-brand-900 focus:outline-none focus:border-bac-blue focus:ring-1 focus:ring-bac-blue h-20 resize-none"
                            disabled={isProcessing}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Miniature (Optionnel)</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-bac-blue file:text-white hover:file:bg-sky-700"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full py-3 bg-bac-blue text-white rounded-xl font-bold mt-4 flex justify-center disabled:opacity-70"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer le Cours"}
                    </button>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};

export default Courses;