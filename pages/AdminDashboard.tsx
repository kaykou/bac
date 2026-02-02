import React, { useState, useEffect, useRef } from 'react';
import { Resource, User, ResourceType, ResourceCategory } from '../types';
import { 
  FileText, Video, Image as ImageIcon, Trash2, UploadCloud, X, 
  CheckCircle2, Loader2, File, FolderOpen, 
  BarChart2, UserPlus, Mail, Calendar, FolderPlus, Radio, Wifi
} from 'lucide-react';
import { api } from '../services/api';
import { globalSocket } from '../App';

interface AdminDashboardProps {
  user: User | null;
  onRequireAuth: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onRequireAuth }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [onlineStudents, setOnlineStudents] = useState<any[]>([]);
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState<ResourceCategory>('COURS');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderDesc, setFolderDesc] = useState('');
  const [folderCat, setFolderCat] = useState<ResourceCategory>('COURS');
  const [activeFilter, setActiveFilter] = useState<ResourceCategory | 'ALL'>('ALL');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'TEACHER') {
      onRequireAuth();
    }
  }, [user, onRequireAuth]);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [fetchedResources, fetchedStudents] = await Promise.all([
                api.getResources(),
                api.getStudents()
            ]);
            setResources(fetchedResources);
            setRegisteredStudents(fetchedStudents);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();

    const handleOnlineUpdate = (users: any[]) => {
        const students = users.filter(u => u.role === 'STUDENT');
        const uniqueStudents = Array.from(new Map(students.map(item => [item.userId, item])).values());
        setOnlineStudents(uniqueStudents);
    };

    globalSocket.on('online-users-update', handleOnlineUpdate);
    return () => {
        globalSocket.off('online-users-update', handleOnlineUpdate);
    };
  }, []);

  if (!user || user.role !== 'TEACHER') return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (res: Resource) => {
    if (res.type === 'FOLDER') return <FolderOpen className="w-8 h-8 text-yellow-500 fill-yellow-100" />;
    if (res.type === 'IMAGE') return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (res.type === 'VIDEO') return <Video className="w-8 h-8 text-purple-500" />;
    if (res.type === 'PDF') return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const determineResourceType = (file: File): ResourceType => {
      if (file.type.startsWith('image/')) return 'IMAGE';
      if (file.type.startsWith('video/')) return 'VIDEO';
      return 'PDF'; 
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Helper to convert file to Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePublishFiles = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);

    try {
        for (const file of selectedFiles) {
            // Convert to Base64 before sending
            const base64Url = await convertToBase64(file);

            const newResource: Resource = {
                id: Date.now().toString() + Math.random().toString(),
                title: file.name.split('.')[0], 
                description: uploadDescription || 'Fichier importé',
                type: determineResourceType(file),
                category: uploadCategory,
                date: new Date().toISOString().split('T')[0],
                size: formatFileSize(file.size),
                url: base64Url // Send actual data
            };
            await api.addResource(newResource);
        }
        const updated = await api.getResources();
        setResources(updated);
        setSelectedFiles([]);
        setUploadDescription('');
        alert(`${selectedFiles.length} fichiers publiés !`);
    } catch (e) {
        alert("Erreur lors de la publication. Vérifiez la taille des fichiers.");
        console.error(e);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!folderName) return;
      setIsProcessing(true);

      const newFolder: Resource = {
          id: 'folder-' + Date.now(),
          title: folderName,
          description: folderDesc || 'Dossier de ressources',
          type: 'FOLDER',
          category: folderCat,
          date: new Date().toISOString().split('T')[0]
      };

      try {
          await api.addResource(newFolder);
          const updated = await api.getResources();
          setResources(updated);
          setShowFolderModal(false);
          setFolderName('');
          setFolderDesc('');
      } catch (e) {
          console.error(e);
      } finally {
          setIsProcessing(false);
      }
  };

  const deleteResource = async (id: string) => {
    if (confirm('Supprimer définitivement cet élément ?')) {
      setIsProcessing(true);
      try {
          await api.deleteResource(id);
          const updated = await api.getResources();
          setResources(updated);
      } catch(e) {
          console.error(e);
      } finally {
          setIsProcessing(false);
      }
    }
  };

  const filteredResources = resources.filter(r => activeFilter === 'ALL' || r.category === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 px-8 py-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500 w-6 h-6" />
                    Centre de Contrôle
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    <span className="font-bold text-bac-blue">{onlineStudents.length}</span> élève(s) en ligne actuellement.
                </p>
            </div>
            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setShowStudentsModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-white border border-brand-200 text-brand-700 rounded-xl text-sm font-bold transition-all shadow-sm"
                 >
                    <UserPlus className="w-4 h-4" />
                    Inscrits ({registeredStudents.length})
                 </button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-brand-200 p-6">
                 <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-emerald-500 animate-pulse" />
                    En Direct ({onlineStudents.length})
                </h2>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide min-h-[60px]">
                    {onlineStudents.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Aucun élève connecté.</p>
                    ) : (
                        onlineStudents.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-full animate-[fadeIn_0.5s]">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm font-bold text-emerald-800">{s.name}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={() => setShowFolderModal(true)}
                    disabled={isLoading || isProcessing}
                    className="flex-1 py-4 bg-white border border-brand-200 hover:border-bac-blue text-brand-700 hover:text-bac-blue rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 transition-all font-bold disabled:opacity-50"
                >
                    <FolderPlus className="w-6 h-6" />
                    Nouveau Dossier
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-bac-blue" />
                    Importer du contenu
                </h2>
                
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 relative
                        ${isDragging 
                            ? 'border-bac-blue bg-blue-50/50 scale-[1.01]' 
                            : 'border-gray-300 hover:border-bac-blue hover:bg-gray-50'
                        }
                    `}
                >
                    {isProcessing && (
                         <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                             <Loader2 className="w-10 h-10 text-bac-blue animate-spin" />
                             <span className="text-bac-blue font-bold mt-2">Traitement en cours...</span>
                         </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        multiple 
                        className="hidden" 
                        onChange={handleFileSelect}
                        disabled={isProcessing}
                    />
                    <div className="w-16 h-16 bg-blue-100 text-bac-blue rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium text-gray-900">Cliquez ou glissez vos fichiers ici</p>
                    <p className="text-gray-500 text-sm mt-2">Supporte: PDF, MP4, JPG, PNG (Max 50MB)</p>
                </div>
            </div>

            {selectedFiles.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            Prêt à publier ({selectedFiles.length})
                         </h3>
                         <button 
                            onClick={() => setSelectedFiles([])}
                            disabled={isProcessing}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                         >
                            Tout effacer
                         </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-4">
                        {selectedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-3 rounded-xl group hover:border-bac-blue/30 transition-all">
                                <div className="shrink-0">
                                    {getFileIcon({ type: determineResourceType(file) } as Resource)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 text-sm truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                                <button onClick={() => removeFile(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                             <label className="text-xs font-bold text-gray-500 uppercase">Section cible</label>
                             <select 
                                value={uploadCategory}
                                onChange={(e) => setUploadCategory(e.target.value as ResourceCategory)}
                                className="w-full bg-gray-100 border-none font-bold text-gray-800 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-bac-blue cursor-pointer"
                            >
                                <option value="COURS">Cours</option>
                                <option value="SERIES">Séries</option>
                                <option value="DEVOIRS">Devoirs</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Description (Optionnel)</label>
                            <input 
                                type="text" 
                                value={uploadDescription}
                                onChange={(e) => setUploadDescription(e.target.value)}
                                placeholder="Ex: Chapitre 1 - Mécanique"
                                className="w-full bg-gray-100 border-none text-gray-800 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-bac-blue"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handlePublishFiles}
                        disabled={isProcessing}
                        className="w-full mt-6 px-6 py-3 bg-bac-blue hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg shadow-bac-blue/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                        Publier {selectedFiles.length} Fichier(s)
                    </button>
                </div>
            )}
        </div>

        <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <BarChart2 className="w-5 h-5 text-purple-500 mb-2" />
                    <div className="text-2xl font-black text-gray-900">
                        {isLoading ? '...' : '1.2k'}
                    </div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Vues ce mois</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <Radio className="w-5 h-5 text-red-500 mb-2" />
                    <div className="text-2xl font-black text-gray-900">
                        {isLoading ? '...' : resources.length}
                    </div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Ressources</div>
                </div>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                <div className="p-5 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-4">Gestion des Ressources</h2>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {(['ALL', 'COURS', 'SERIES', 'DEVOIRS'] as const).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                className={`px-3 py-1 text-xs font-bold rounded-full border transition-all whitespace-nowrap ${
                                    activeFilter === cat 
                                    ? 'bg-bac-blue text-white border-bac-blue' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {cat === 'ALL' ? 'Tout' : cat}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                            <Loader2 className="w-8 h-8 text-bac-blue animate-spin" />
                        </div>
                    )}

                    {!isLoading && filteredResources.map((res) => (
                        <div key={res.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-default">
                             <div className="flex items-center gap-3 overflow-hidden">
                                 <div className={`p-2 rounded-lg shrink-0 ${
                                     res.type === 'FOLDER' ? 'bg-yellow-50 text-yellow-500' :
                                     res.type === 'PDF' ? 'bg-red-50 text-red-500' : 
                                     res.type === 'VIDEO' ? 'bg-purple-50 text-purple-500' : 
                                     'bg-blue-50 text-blue-500'
                                 }`}>
                                     {getFileIcon(res)}
                                 </div>
                                 <div className="min-w-0">
                                     <p className="text-sm font-bold text-gray-700 truncate">{res.title}</p>
                                     <p className="text-[10px] text-gray-400">
                                        <span className="uppercase font-bold text-gray-500 mr-1">{res.category || 'Général'}</span>
                                        • {res.date}
                                        {res.description && <span className="block truncate opacity-75">{res.description}</span>}
                                     </p>
                                 </div>
                             </div>
                             
                             <button 
                                onClick={() => deleteResource(res.id)}
                                disabled={isProcessing}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                        </div>
                    ))}
                    {!isLoading && filteredResources.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            Aucun élément dans cette section.
                        </div>
                    )}
                </div>
             </div>
        </div>
      </div>
      {showStudentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-brand-100 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-xl font-bold text-brand-900">Liste des Inscrits</h3>
                        <p className="text-sm text-brand-500">Tous les comptes étudiants enregistrés (Base de données).</p>
                    </div>
                    <button onClick={() => setShowStudentsModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-brand-500" />
                    </button>
                </div>
                
                <div className="p-0 overflow-y-auto">
                    {registeredStudents.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">
                            Aucun élève inscrit pour le moment.
                        </div>
                    ) : (
                        registeredStudents.map((student, index) => (
                            <div key={index} className="flex items-center justify-between p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-bac-blue text-white flex items-center justify-center font-bold text-lg">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-900 text-lg">{student.name}</h4>
                                        <div className="flex items-center gap-4 text-sm text-brand-500">
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {student.email}
                                            </div>
                                            {student.date && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {student.date}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}
      {showFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-brand-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-brand-900 flex items-center gap-2">
                        <FolderPlus className="w-6 h-6 text-bac-blue" />
                        Nouveau Dossier
                    </h3>
                    <button onClick={() => setShowFolderModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleCreateFolder} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom du dossier</label>
                        <input 
                            type="text" 
                            required
                            value={folderName} 
                            onChange={e => setFolderName(e.target.value)}
                            placeholder="Ex: Thermodynamique Chap. 1"
                            className="w-full bg-gray-50 border border-brand-200 rounded-xl px-4 py-2 text-brand-900 focus:outline-none focus:border-bac-blue focus:ring-1 focus:ring-bac-blue"
                            disabled={isProcessing}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <textarea 
                            value={folderDesc} 
                            onChange={e => setFolderDesc(e.target.value)}
                            placeholder="Brève description..."
                            className="w-full bg-gray-50 border border-brand-200 rounded-xl px-4 py-2 text-brand-900 focus:outline-none focus:border-bac-blue focus:ring-1 focus:ring-bac-blue h-20 resize-none"
                            disabled={isProcessing}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Emplacement</label>
                        <select 
                            value={folderCat} 
                            onChange={e => setFolderCat(e.target.value as ResourceCategory)}
                            className="w-full bg-gray-50 border border-brand-200 rounded-xl px-4 py-2 text-brand-900 focus:outline-none focus:border-bac-blue focus:ring-1 focus:ring-bac-blue"
                            disabled={isProcessing}
                        >
                            <option value="COURS">Cours</option>
                            <option value="SERIES">Séries</option>
                            <option value="DEVOIRS">Devoirs</option>
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full py-3 bg-bac-blue text-white rounded-xl font-bold mt-4 flex justify-center disabled:opacity-70"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer le dossier"}
                    </button>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};
export default AdminDashboard;