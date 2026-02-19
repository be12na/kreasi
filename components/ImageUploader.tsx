import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  id: string;
  title: string;
  description: string;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  previewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, description, onImageUpload, onImageRemove, previewUrl }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDragEvents = useCallback((e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [handleDragEvents, onImageUpload]);

  const uploaderClasses = `relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 bg-[#FEF9E7] ${isDragging ? 'border-[#F1C40F] bg-[#FEF9E7]' : 'border-[#1E8449]/50 hover:border-[#1E8449]'}`;
  
  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onImageRemove();
  };

  return (
    <div className="rounded-lg border-2 border-[#1E8449] overflow-hidden flex flex-col">
      <div className="bg-[#1E8449] text-[#FEF9E7] p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-[#FEF9E7]/80">{description}</p>
      </div>
      <div className="p-4">
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
              <button
                onClick={handleRemoveClick}
                className="absolute top-2 right-2 bg-[#1E8449]/80 hover:bg-[#1E8449] text-[#FEF9E7] rounded-full p-1.5 transition-colors"
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
              <svg className="w-10 h-10 mb-4 text-[#3A3A3A]/50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
              </svg>
              <p className="mb-2 text-sm text-[#3A3A3A]/70"><span className="font-semibold text-[#3A3A3A]">Klik buat upload</span> atau drag & drop</p>
              <p className="text-xs text-[#3A3A3A]/50">PNG, JPG, atau WEBP</p>
            </div>
          )}
          <input id={id} type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
        </label>
      </div>
    </div>
  );
};