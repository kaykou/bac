import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, Move } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCrop: (croppedImageBase64: string) => void;
  onCancel: () => void;
  aspectRatio?: number; // Default 16/9
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCrop, onCancel, aspectRatio = 16/9 }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Width of the editing window
  const CONTAINER_WIDTH = 600; 
  const CONTAINER_HEIGHT = CONTAINER_WIDTH / aspectRatio;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx || !img) return;

    // Set canvas size to match the container (or higher res multiplier)
    canvas.width = CONTAINER_WIDTH;
    canvas.height = CONTAINER_HEIGHT;

    // Fill background (in case image doesn't cover)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the image with current transforms
    // The visual transform is: translate(x, y) scale(zoom)
    // We replicate this on the canvas
    
    // We need to draw the image centered relative to the transform
    // But our CSS transform logic is simple translation from top-left.
    
    // Simply: drawImage(img, x, y, width * zoom, height * zoom)
    const renderW = img.naturalWidth * (CONTAINER_WIDTH / img.naturalWidth) * zoom; // Approximation based on visual fit usually 'cover'
    // Actually, in the HTML render below, the image width is not fixed to container.
    // Let's rely on the rendered dimensions.
    
    const renderedWidth = img.width * zoom;
    const renderedHeight = img.height * zoom;

    // Draw
    ctx.drawImage(img, position.x, position.y, renderedWidth, renderedHeight);

    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    onCrop(base64);
  };

  // Reset position when zoom changes to prevent losing the image
  useEffect(() => {
    if(imageRef.current) {
        // Optional: Logic to keep image in bounds could go here
    }
  }, [zoom]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Move className="w-5 h-5 text-bac-blue" />
                Ajuster la miniature
            </h3>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        {/* Editor Area */}
        <div className="p-6 bg-gray-50 flex flex-col items-center justify-center select-none">
            <div 
                ref={containerRef}
                style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT }}
                className="relative bg-black overflow-hidden rounded-lg shadow-inner cursor-move border-2 border-dashed border-gray-300"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <img 
                    ref={imageRef}
                    src={imageSrc} 
                    alt="To Crop"
                    draggable={false}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                        transformOrigin: 'top left',
                        width: '100%', // Base width matches container
                        height: 'auto', // Preserve aspect ratio
                        userSelect: 'none'
                    }}
                    className="absolute top-0 left-0 transition-transform duration-75 ease-linear pointer-events-none"
                />
                
                {/* Overlay Grid (Rule of Thirds) */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    <div className="w-full h-1/3 border-b border-white"></div>
                    <div className="w-full h-1/3 border-b border-white top-1/3 absolute"></div>
                    <div className="h-full w-1/3 border-r border-white absolute top-0 left-0"></div>
                    <div className="h-full w-1/3 border-r border-white absolute top-0 left-1/3"></div>
                </div>
            </div>

            {/* Controls */}
            <div className="w-full max-w-[600px] mt-6 flex items-center gap-4 px-4">
                <ZoomIn className="w-5 h-5 text-gray-400" />
                <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.1" 
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-bac-blue h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-500 w-12 text-right">
                    {Math.round(zoom * 100)}%
                </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Glissez l'image pour la positionner</p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
            <button 
                onClick={onCancel}
                className="px-6 py-2 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
                Annuler
            </button>
            <button 
                onClick={handleCrop}
                className="px-6 py-2 bg-bac-blue text-white font-bold rounded-xl hover:bg-sky-700 shadow-lg shadow-bac-blue/20 flex items-center gap-2"
            >
                <Check className="w-4 h-4" />
                Valider
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;