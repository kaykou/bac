import React, { useState, useEffect } from 'react';
import { FileText, Download, Lock, Video, Image as ImageIcon, Link as LinkIcon, ExternalLink, Loader2, FolderOpen, ChevronRight, Home, Eye } from 'lucide-react';
import { User, Resource } from '../types';
import { api } from '../services/api';
import FilePreviewModal from '../components/FilePreviewModal';

interface ResourcesProps {
  user: User | null;
  onRequireAuth: () => void;
}

const Resources: React.FC<ResourcesProps> = ({ user, onRequireAuth }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  useEffect(() => {
      const loadResources = async () => {
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
      loadResources();
  }, []);

  const handleAction = (resource: Resource) => {
    if (!user) {
      onRequireAuth();
      return;
    }

    if (resource.type === 'FOLDER') {
        setCurrentFolderId(resource.id);
        return;
    }
    
    // Open preview modal for supported types
    setPreviewResource(resource);
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'VIDEO': return <Video className="w-8 h-8" />;
          case 'IMAGE': return <ImageIcon className="w-8 h-8" />;
          case 'LINK': return <LinkIcon className="w-8 h-8" />;
          case 'FOLDER': return <FolderOpen className="w-8 h-8" />;
          default: return <FileText className="w-8 h-8" />;
      }
  };

  const getColor = (type: string) => {
      switch(type) {
          case 'VIDEO': return 'bg-purple-50 text-purple-500 border-purple-100';
          case 'IMAGE': return 'bg-blue-50 text-blue-500 border-blue-100';
          case 'LINK': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
          case 'FOLDER': return 'bg-yellow-50 text-yellow-500 border-yellow-100';
          default: return 'bg-red-50 text-red-500 border-red-100';
      }
  };

  // --- FILTER LOGIC ---
  // Show items where parentId matches currentFolderId
  // If currentFolderId is null, show items where parentId is NULL/undefined AND not category 'COURS' (Courses have their own page)
  const displayedResources = resources.filter(r => {
      if (currentFolderId) {
          return r.parentId === currentFolderId;
      }
      return (!r.parentId) && r.category !== 'COURS'; // Top level, exclude courses
  });

  const getCurrentFolderTitle = () => {
      if (!currentFolderId) return 'Racine';
      return resources.find(r => r.id === currentFolderId)?.title || 'Dossier';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-[fadeIn_0.5s_ease-out]">
      <div className="border-b border-brand-200 pb-4">
           <h1 className="text-4xl font-bold text-brand-900 mb-2 font-serif">Ressources Pédagogiques</h1>
           
           {/* Breadcrumb / Navigation */}
           <div className="flex items-center gap-2 mt-4 text-sm font-bold">
               <button 
                  onClick={() => setCurrentFolderId(null)}
                  className={`flex items-center gap-1 hover:text-bac-blue transition-colors ${!currentFolderId ? 'text-bac-blue' : 'text-brand-400'}`}
               >
                   <Home className="w-4 h-4" />
                   Ressources
               </button>
               {currentFolderId && (
                   <>
                       <ChevronRight className="w-4 h-4 text-brand-300" />
                       <span className="text-bac-blue px-2 py-1 bg-brand-100 rounded-md">
                           {getCurrentFolderTitle()}
                       </span>
                   </>
               )}
           </div>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-brand-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-bac-blue" />
              <p>Chargement des ressources...</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedResources.map((resource) => (
                <div key={resource.id} className="bg-white border border-brand-200 rounded-3xl overflow-hidden hover:shadow-xl hover:border-bac-light/50 transition-all duration-300 group flex flex-col cursor-pointer" onClick={() => handleAction(resource)}>
                    {/* Render Image for Folder if exists */}
                    {resource.type === 'FOLDER' && resource.url ? (
                        <div className="aspect-video relative overflow-hidden">
                             <img src={resource.url} alt={resource.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                             <div className="absolute bottom-4 left-4 text-white">
                                 <FolderOpen className="w-6 h-6 mb-2" />
                                 <h4 className="font-bold text-lg leading-tight">{resource.title}</h4>
                             </div>
                        </div>
                    ) : (
                        <div className="p-6 pb-0 flex items-start justify-between">
                            <div className={`p-4 border rounded-2xl group-hover:scale-105 transition-all shadow-sm ${getColor(resource.type)}`}>
                                {getIcon(resource.type)}
                            </div>
                        </div>
                    )}
                    
                    <div className="p-6 flex-1 flex flex-col">
                        {(!resource.url || resource.type !== 'FOLDER') && (
                            <h4 className="font-bold text-brand-800 text-xl mb-2 group-hover:text-bac-blue transition-colors line-clamp-1">{resource.title}</h4>
                        )}
                        <p className="text-sm text-brand-500 line-clamp-2 mb-4 flex-1">
                            {resource.description || 'Aucune description'}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-50">
                             <span className="text-xs font-bold text-brand-400 bg-brand-50 px-2 py-1 rounded-lg uppercase tracking-wider">{resource.category || 'Général'}</span>
                             <button 
                                className="text-bac-blue hover:text-sky-700 font-bold text-sm flex items-center gap-1"
                            >
                                {resource.type === 'FOLDER' ? "Ouvrir" : "Voir"}
                                {resource.type === 'FOLDER' ? <ChevronRight className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            {displayedResources.length === 0 && (
                <div className="col-span-full text-center py-20 text-brand-400">
                    Dossier vide.
                </div>
            )}
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal 
          resource={previewResource} 
          onClose={() => setPreviewResource(null)} 
      />
    </div>
  );
};

export default Resources;