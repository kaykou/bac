import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, UploadCloud, Loader2, Trash2, FileText, Download, Eye, X } from 'lucide-react';
import { User, Resource } from '../types';
import { api } from '../services/api';
import FilePreviewModal from '../components/FilePreviewModal';

interface SujetsBacProps {
  user: User | null;
  onRequireAuth: () => void;
}

const SujetsBac: React.FC<SujetsBacProps> = ({ user, onRequireAuth }) => {
  const [sujets, setSujets] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileDesc, setFileDesc] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSujets();
  }, []);

  const fetchSujets = async () => {
    setIsLoading(true);
    try {
        const all = await api.getResources();
        // Filter specifically for SUJETS_BAC category
        setSujets(all.filter(r => r.category === 'SUJETS_BAC'));
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          setFileToUpload(file);
          setFileTitle(file.name.split('.')[0]); // Default title
          setShowUploadModal(true);
          e.target.value = ''; // Reset input
      }
  };

  const handlePublish = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!fileToUpload || !fileTitle) return;
      setIsProcessing(true);

      try {
          const reader = new FileReader();
          reader.readAsDataURL(fileToUpload);
          
          reader.onload = async () => {
              const base64Url = reader.result as string;
              
              const newResource: Resource = {
                id: Date.now().toString() + Math.random().toString(),
                title: fileTitle, 
                description: fileDesc || 'Sujet Bac',
                type: fileToUpload.type.includes('image') ? 'IMAGE' : 'PDF',
                category: 'SUJETS_BAC',
                date: new Date().toISOString().split('T')[0],
                size: (fileToUpload.size / (1024*1024)).toFixed(2) + ' MB',
                url: base64Url,
                parentId: null
              };

              await api.addResource(newResource);
              await fetchSujets();
              
              // Reset
              setShowUploadModal(false);
              setFileToUpload(null);
              setFileTitle('');
              setFileDesc('');
              alert("Sujet publié avec succès !");
          };
      } catch(e) {
          alert("Erreur lors de l'upload.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(confirm("Supprimer ce sujet ?")) {
          try {
              await api.deleteResource(id);
              fetchSujets();
          } catch(e) {
              console.error(e);
          }
      }
  };

  const handleOpenResource = (res: Resource) => {
      if (!user) {
          onRequireAuth();
      } else {
          setPreviewResource(res);
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-200 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-brand-900 font-serif flex items-center gap-3">
                    <GraduationCap className="w-10 h-10 text-bac-blue" />
                    Sujets du Bac
                </h1>
                <p className="text-brand-500 mt-2">Accédez aux annales, examens et corrigés officiels.</p>
            </div>
            
            {user?.role === 'TEACHER' && (
                <div>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={isProcessing}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-6 py-3 bg-bac-blue hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg shadow-bac-blue/20 transition-all disabled:opacity-70"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                        Ajouter un Sujet
                    </button>
                </div>
            )}
        </div>

        {isLoading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-bac-blue animate-spin" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sujets.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-brand-100">
                        <FileText className="w-12 h-12 text-brand-200 mx-auto mb-4" />
                        <p className="text-brand-400">Aucun sujet disponible pour le moment.</p>
                    </div>
                ) : (
                    sujets.map(sujet => (
                        <div 
                            key={sujet.id}
                            onClick={() => handleOpenResource(sujet)}
                            className="group bg-white border border-brand-200 rounded-2xl p-5 hover:shadow-xl hover:border-bac-blue/30 transition-all cursor-pointer flex flex-col relative"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-brand-50 rounded-xl text-bac-blue group-hover:bg-bac-blue group-hover:text-white transition-colors">
                                    <FileText className="w-8 h-8" />
                                </div>
                                {user?.role === 'TEACHER' && (
                                    <button 
                                        onClick={(e) => handleDelete(e, sujet.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            
                            <h3 className="font-bold text-brand-900 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-bac-blue transition-colors">
                                {sujet.title}
                            </h3>
                            <p className="text-sm text-brand-500 line-clamp-2 mb-4 flex-1">
                                {sujet.description}
                            </p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-brand-50 mt-auto">
                                <span className="text-xs font-bold text-brand-400">{sujet.date} • {sujet.size}</span>
                                <button className="text-bac-blue hover:text-sky-700 text-sm font-bold flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    Voir
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-brand-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-brand-900">Publier un Sujet</h3>
                        <button onClick={() => setShowUploadModal(false)} disabled={isProcessing}>
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                    
                    <form onSubmit={handlePublish} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titre du document</label>
                            <input 
                                type="text" 
                                required
                                value={fileTitle}
                                onChange={(e) => setFileTitle(e.target.value)}
                                className="w-full bg-gray-50 border border-brand-200 rounded-xl px-4 py-2 text-brand-900 focus:outline-none focus:border-bac-blue"
                                disabled={isProcessing}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (Année, Section...)</label>
                            <textarea 
                                value={fileDesc}
                                onChange={(e) => setFileDesc(e.target.value)}
                                className="w-full bg-gray-50 border border-brand-200 rounded-xl px-4 py-2 text-brand-900 focus:outline-none focus:border-bac-blue h-24 resize-none"
                                placeholder="Ex: Bac 2023 - Session Principale - Sciences Exp"
                                disabled={isProcessing}
                            />
                        </div>

                        <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 font-medium">
                            Fichier sélectionné: {fileToUpload?.name}
                        </div>

                        <button 
                            type="submit"
                            disabled={isProcessing}
                            className="w-full py-3 bg-bac-blue text-white rounded-xl font-bold mt-2 flex justify-center items-center gap-2 disabled:opacity-70"
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publier maintenant"}
                        </button>
                    </form>
                </div>
            </div>
        )}

        <FilePreviewModal 
            resource={previewResource} 
            onClose={() => setPreviewResource(null)} 
        />
    </div>
  );
};

export default SujetsBac;