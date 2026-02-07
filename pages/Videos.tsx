import React, { useState, useEffect, useRef } from 'react';
import { Video, UploadCloud, Loader2, PlayCircle, Eye, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { User, Resource } from '../types';
import { api } from '../services/api';
import FilePreviewModal from '../components/FilePreviewModal';
import ImageCropper from '../components/ImageCropper';

interface VideosProps {
  user: User | null;
  onRequireAuth: () => void;
}

const Videos: React.FC<VideosProps> = ({ user, onRequireAuth }) => {
  const [videos, setVideos] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<Resource | null>(null);
  
  // Upload State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // Cropper State
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
        const all = await api.getResources();
        setVideos(all.filter(r => r.type === 'VIDEO'));
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          setPendingVideoFile(file);
          setVideoTitle(file.name.split('.')[0]); // Default title
          setUploadModalOpen(true);
          e.target.value = ''; // Reset input
      }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  // Instead of setting preview directly, set it for cropping
                  setRawImageForCrop(ev.target.result as string);
              }
          };
          reader.readAsDataURL(file);
          e.target.value = ''; // Reset so same file triggers change again if needed
      }
  };

  const handleCropComplete = (croppedBase64: string) => {
      setThumbnailPreview(croppedBase64);
      setRawImageForCrop(null);
  };

  const handlePublish = async () => {
      if (!pendingVideoFile || !videoTitle) return;
      setIsProcessing(true);

      try {
          // 1. Convert Video to Base64
          const videoReader = new FileReader();
          videoReader.readAsDataURL(pendingVideoFile);
          
          videoReader.onload = async () => {
              const base64Url = videoReader.result as string;
              
              const newResource: Resource = {
                id: Date.now().toString() + Math.random().toString(),
                title: videoTitle, 
                description: 'Vidéo ajoutée par le professeur',
                type: 'VIDEO',
                category: 'COURS',
                date: new Date().toISOString().split('T')[0],
                size: (pendingVideoFile.size / (1024*1024)).toFixed(2) + ' MB',
                url: base64Url,
                thumbnail: thumbnailPreview || undefined, // Store thumbnail
                parentId: null
              };

              await api.addResource(newResource);
              await fetchVideos();
              
              // Reset
              setUploadModalOpen(false);
              setPendingVideoFile(null);
              setVideoTitle('');
              setThumbnailPreview(null);
              setRawImageForCrop(null);
              alert("Vidéo publiée avec succès !");
              setIsProcessing(false);
          };
      } catch(e) {
          alert("Erreur lors de l'upload.");
          setIsProcessing(false);
      }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(confirm("Supprimer cette vidéo ?")) {
          try {
              await api.deleteResource(id);
              fetchVideos();
          } catch(e) {
              console.error(e);
          }
      }
  };

  const handleOpenVideo = (video: Resource) => {
      if (!user) {
          onRequireAuth();
      } else {
          setPreviewVideo(video);
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
        <div className="flex justify-between items-center border-b border-brand-200 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-brand-900 font-serif flex items-center gap-3">
                    <Video className="w-8 h-8 text-bac-blue" />
                    Vidéothèque
                </h1>
                <p className="text-brand-500 mt-2">Replays des cours et explications détaillées.</p>
            </div>
            
            {user?.role === 'TEACHER' && (
                <div>
                    <input 
                        type="file" 
                        ref={videoInputRef}
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoSelect}
                        disabled={isProcessing}
                    />
                    <button 
                        onClick={() => videoInputRef.current?.click()}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-6 py-3 bg-bac-blue hover:bg-sky-700 text-white rounded-xl font-bold shadow-lg shadow-bac-blue/20 transition-all disabled:opacity-70"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                        Ajouter une vidéo
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
                {videos.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-brand-100">
                        <Video className="w-12 h-12 text-brand-200 mx-auto mb-4" />
                        <p className="text-brand-400">Aucune vidéo disponible pour le moment.</p>
                    </div>
                ) : (
                    videos.map(video => (
                        <div 
                            key={video.id}
                            onClick={() => handleOpenVideo(video)}
                            className="group bg-white border border-brand-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            <div className="aspect-video bg-gray-100 relative flex items-center justify-center">
                                {video.thumbnail ? (
                                    <img src={video.thumbnail} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" alt={video.title} />
                                ) : (
                                    <video src={video.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center text-bac-blue shadow-lg group-hover:scale-110 transition-transform">
                                        <PlayCircle className="w-8 h-8 fill-current" />
                                    </div>
                                </div>
                                
                                {user?.role === 'TEACHER' && (
                                    <button 
                                        onClick={(e) => handleDelete(e, video.id)}
                                        className="absolute top-2 right-2 p-2 bg-white text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-sm"
                                        title="Supprimer la vidéo"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-brand-900 text-lg mb-1 line-clamp-1">{video.title}</h3>
                                <p className="text-sm text-brand-500 line-clamp-2 mb-3">{video.description}</p>
                                <div className="flex items-center justify-between text-xs font-semibold text-brand-400">
                                    <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md uppercase">Vidéo</span>
                                    <span>{video.date}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* Upload Modal */}
        {uploadModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-brand-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-brand-900">Publier une vidéo</h3>
                        <button onClick={() => setUploadModalOpen(false)} disabled={isProcessing}>
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titre de la vidéo</label>
                            <input 
                                type="text" 
                                value={videoTitle}
                                onChange={(e) => setVideoTitle(e.target.value)}
                                className="w-full bg-gray-50 border border-brand-200 rounded-xl px-4 py-2 text-brand-900 focus:outline-none focus:border-bac-blue"
                                disabled={isProcessing}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Miniature (Optionnel)</label>
                            <div 
                                onClick={() => thumbnailInputRef.current?.click()}
                                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-bac-blue hover:bg-blue-50 transition-colors relative overflow-hidden"
                            >
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                                        <span className="text-xs text-gray-500">Cliquez pour ajouter une image</span>
                                    </>
                                )}
                                <input 
                                    type="file" 
                                    ref={thumbnailInputRef}
                                    onChange={handleThumbnailSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            {thumbnailPreview && (
                                <button 
                                    onClick={() => setRawImageForCrop(thumbnailPreview)}
                                    className="text-xs text-bac-blue font-bold mt-1 hover:underline"
                                >
                                    Ajuster l'image
                                </button>
                            )}
                        </div>

                        <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 font-medium">
                            Fichier sélectionné: {pendingVideoFile?.name}
                        </div>

                        <button 
                            onClick={handlePublish}
                            disabled={isProcessing || !videoTitle}
                            className="w-full py-3 bg-bac-blue text-white rounded-xl font-bold mt-2 flex justify-center items-center gap-2 disabled:opacity-70"
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publier maintenant"}
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {/* Image Cropper Modal */}
        {rawImageForCrop && (
            <ImageCropper 
                imageSrc={rawImageForCrop}
                onCancel={() => setRawImageForCrop(null)}
                onCrop={handleCropComplete}
                aspectRatio={16/9}
            />
        )}

        <FilePreviewModal 
            resource={previewVideo} 
            onClose={() => setPreviewVideo(null)} 
        />
    </div>
  );
};

export default Videos;