import React, { useState, useEffect } from 'react';
import { FileText, Download, Lock, Video, Image as ImageIcon, Link as LinkIcon, ExternalLink, Loader2 } from 'lucide-react';
import { User, Resource } from '../types';
import { api } from '../services/api';

interface ResourcesProps {
  user: User | null;
  onRequireAuth: () => void;
}

const Resources: React.FC<ResourcesProps> = ({ user, onRequireAuth }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    
    if (resource.type === 'LINK' || resource.type === 'VIDEO') {
        if (resource.url && !resource.url.startsWith('data:')) {
             window.open(resource.url, '_blank');
        } else if (resource.url && resource.url.startsWith('data:')) {
             // Handle base64 video/link if needed, though usually video opens in new tab
             const w = window.open('about:blank');
             if(w) {
                 w.document.write(`<video src="${resource.url}" controls style="width:100%; height:100%"></video>`);
             }
        }
    } else {
        // Download Logic for Base64 Data
        if (resource.url) {
            const link = document.createElement('a');
            link.href = resource.url;
            link.download = `${resource.title}.${resource.type === 'IMAGE' ? 'jpg' : 'pdf'}`; // Simple extension guess
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert("Erreur: Fichier introuvable.");
        }
    }
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'VIDEO': return <Video className="w-8 h-8" />;
          case 'IMAGE': return <ImageIcon className="w-8 h-8" />;
          case 'LINK': return <LinkIcon className="w-8 h-8" />;
          default: return <FileText className="w-8 h-8" />;
      }
  };

  const getColor = (type: string) => {
      switch(type) {
          case 'VIDEO': return 'bg-purple-50 text-purple-500 border-purple-100';
          case 'IMAGE': return 'bg-blue-50 text-blue-500 border-blue-100';
          case 'LINK': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
          default: return 'bg-red-50 text-red-500 border-red-100';
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-[fadeIn_0.5s_ease-out]">
      <div className="border-b border-brand-200 pb-8">
           <h1 className="text-4xl font-bold text-brand-900 mb-2 font-serif">Ressources Pédagogiques</h1>
           <p className="text-brand-500">Accédez à l'ensemble des documents, vidéos et liens partagés par le professeur.</p>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-brand-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-bac-blue" />
              <p>Chargement des ressources...</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
            {resources.map((resource) => (
                <div key={resource.id} className="bg-white border border-brand-200 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-bac-light hover:shadow-md transition-all">
                    <div className="flex items-start gap-5 mb-4 md:mb-0">
                        <div className={`p-4 border rounded-xl group-hover:scale-105 transition-all shadow-sm ${getColor(resource.type)}`}>
                            {getIcon(resource.type)}
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-800 text-xl mb-2 group-hover:text-bac-blue transition-colors">{resource.title}</h4>
                            <div className="flex flex-wrap gap-3 text-sm text-brand-400 font-medium">
                                <span className="bg-brand-50 px-2 py-1 rounded text-brand-500 font-bold text-xs">{resource.type}</span>
                                <span className="hidden md:inline">•</span>
                                <span>{resource.date}</span>
                                {resource.size && (
                                    <>
                                        <span className="hidden md:inline">•</span>
                                        <span>{resource.size}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => handleAction(resource)}
                            className="flex-1 md:flex-none px-6 py-3 bg-brand-50 border border-brand-200 text-brand-600 hover:text-bac-blue hover:border-bac-blue hover:bg-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
                        >
                            {user ? (
                                resource.type === 'PDF' || resource.type === 'IMAGE' ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />
                            ) : <Lock className="w-4 h-4" />}
                            <span>{user ? (resource.type === 'PDF' || resource.type === 'IMAGE' ? "Télécharger" : "Ouvrir") : "Connexion"}</span>
                        </button>
                    </div>
                </div>
            ))}
            {resources.length === 0 && (
                <div className="text-center py-10 text-brand-400">
                    Aucune ressource disponible pour le moment.
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Resources;