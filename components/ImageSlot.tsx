import React, { useState, useCallback } from 'react';

interface ImageSlotProps {
  id: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  previewUrl: string | null;
  placeholderText?: string;
  isRemovable?: boolean;
}

export const ImageSlot: React.FC<ImageSlotProps> = ({ id, onUpload, onRemove, previewUrl, placeholderText, isRemovable = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
    e.target.value = '';
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  }, [handleDragEvents, onUpload]);

  const uploaderClasses = `relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 bg-white/50 ${isDragging ? 'border-[#F1C40F] bg-[#FEF9E7]' : 'border-[#1E8449]/50 hover:border-[#1E8449]'}`;
  
  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
  };

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={uploaderClasses}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg p-2" />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-2">
            <svg className="w-8 h-8 mb-3 text-[#3A3A3A]/40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
            </svg>
            <p className="mb-1 text-sm text-[#3A3A3A]/70"><span className="font-semibold text-[#3A3A3A]">Klik buat upload</span></p>
            {placeholderText && <p className="text-xs text-[#3A3A3A]/50">{placeholderText}</p>}
          </div>
        )}
        <input id={id} type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
      </label>
      
      {(previewUrl || isRemovable) && (
           <button
            onClick={handleRemoveClick}
            className="absolute -top-2 -right-2 bg-[#F1C40F] hover:bg-[#f1c40fe0] text-[#3A3A3A] rounded-full p-1 transition-colors z-10 shadow-md"
            aria-label="Hapus"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
      )}

    </div>
  );
};