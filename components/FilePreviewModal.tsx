import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import { Resource } from '../types';

interface FilePreviewModalProps {
  resource: Resource | null;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ resource, onClose }) => {
  if (!resource) return null;

  const handleDownload = () => {
    if (resource.url) {
        const link = document.createElement('a');
        link.href = resource.url;
        link.download = `${resource.title}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header - Fixed Height & Z-Index to stay on top */}
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-gray-100 bg-white z-20 relative shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
                 <div className={`p-2 rounded-lg ${
                     resource.type === 'VIDEO' ? 'bg-purple-50 text-purple-600' : 
                     resource.type === 'IMAGE' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                 }`}>
                     <FileText className="w-5 h-5" />
                 </div>
                 <h3 className="font-bold text-gray-900 truncate pr-4">{resource.title}</h3>
            </div>
            <div className="flex gap-2 shrink-0">
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-lg transition-colors"
                    title="Télécharger"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Télécharger</span>
                </button>
                <button 
                    onClick={onClose}
                    className="p-2 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Content Area - Flexible height, handled overflow */}
        <div className="flex-1 bg-black flex items-center justify-center p-0 overflow-hidden relative min-h-[300px]">
            {resource.type === 'VIDEO' && resource.url ? (
                <video 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                >
                    <source src={resource.url} />
                    Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
            ) : resource.type === 'IMAGE' && resource.url ? (
                <div className="w-full h-full flex items-center justify-center p-4 bg-gray-100/50">
                    <img src={resource.url} alt={resource.title} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                </div>
            ) : resource.type === 'PDF' && resource.url ? (
                <iframe src={resource.url} className="w-full h-full bg-white" title="PDF Viewer" />
            ) : (
                <div className="text-center p-10 bg-white w-full h-full flex flex-col items-center justify-center">
                    <p className="text-gray-500 mb-4">Prévisualisation non disponible pour ce type de fichier.</p>
                    <button onClick={handleDownload} className="px-6 py-3 bg-bac-blue text-white rounded-xl font-bold hover:bg-sky-700 transition-colors">
                        Télécharger le fichier
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;