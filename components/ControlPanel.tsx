import React from 'react';
import { ImageUploader } from './ImageUploader';
import { ControlSettings } from './ControlSettings';
import { ModeSelector } from './ModeSelector';
import { ImageSlot } from './ImageSlot';

type GenerationMode = 'lookbook' | 'b-roll' | 'pose';

interface ControlPanelProps {
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;
  onModelUpload: (file: File) => void;
  onModelRemove: () => void;
  modelPreviewUrl: string | null;
  productPreviews: (string | null)[];
  onProductUpload: (file: File, index: number) => void;
  onProductRemove: (index: number) => void;
  onAddProductSlot: () => void;
  theme: string;
  setTheme: (theme: string) => void;
  lighting: string;
  setLighting: (lighting: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  canGenerate: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  generationMode,
  setGenerationMode,
  onModelUpload,
  onModelRemove,
  modelPreviewUrl,
  productPreviews,
  onProductUpload,
  onProductRemove,
  onAddProductSlot,
  theme,
  setTheme,
  lighting,
  setLighting,
  onGenerate,
  isLoading,
  canGenerate,
}) => {
  const isLookbookMode = generationMode === 'lookbook';
  const isBrollMode = generationMode === 'b-roll';
  const isPoseMode = generationMode === 'pose';

  const getButtonText = () => {
    if (isLoading) return 'Membuat...';
    if (isLookbookMode) return 'Buat Lookbook';
    if (isBrollMode) return 'Buat B-roll';
    return 'Buat Pose';
  };

  return (
    <div className="bg-white/50 p-6 rounded-xl border-2 border-[#6D597A] space-y-6 shadow-[8px_8px_0px_#6D597A] transition-all hover:shadow-[4px_4px_0px_#6D597A] hover:translate-x-1 hover:translate-y-1">
      
      <ModeSelector mode={generationMode} setMode={setGenerationMode} />
      
      {/* --- MODEL UPLOADER (Lookbook & Pose) --- */}
      {(isLookbookMode || isPoseMode) && (
        <ImageUploader 
          id="model-uploader"
          title="1. Unggah Model"
          description="Foto orang yang jelas."
          onImageUpload={onModelUpload}
          onImageRemove={onModelRemove}
          previewUrl={modelPreviewUrl}
        />
      )}

      {/* --- B-ROLL / SINGLE PRODUCT UPLOADER --- */}
      {isBrollMode && (
         <ImageUploader 
          id="product-uploader"
          title="1. Unggah Produk"
          description="Pakaian, tas, sepatu, dll."
          onImageUpload={(file) => onProductUpload(file, 0)}
          onImageRemove={() => onProductRemove(0)}
          previewUrl={productPreviews[0]}
        />
      )}
      
      {/* --- LOOKBOOK MULTI-PRODUCT UPLOAD SECTION --- */}
      {isLookbookMode && (
        <div className="rounded-lg border-2 border-[#6D597A] overflow-hidden">
          <div className="bg-[#6D597A] text-[#FDF6F0] p-4">
            <h3 className="text-lg font-semibold">2. Unggah Produk</h3>
            <p className="text-sm text-[#FDF6F0]/80">Produk utama dan hingga 3 aksesori.</p>
          </div>
          <div className="p-4 bg-white/50 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {productPreviews.map((previewUrl, index) => (
                 <ImageSlot
                  key={index}
                  id={`product-uploader-${index}`}
                  onUpload={(file) => onProductUpload(file, index)}
                  onRemove={() => onProductRemove(index)}
                  previewUrl={previewUrl}
                  placeholderText={index === 0 ? 'Produk Utama' : `Aksesori ${index}`}
                  isRemovable={index > 0}
                />
              ))}
            </div>
            {isLookbookMode && productPreviews.length < 4 && (
              <button 
                  onClick={onAddProductSlot}
                  className="w-full flex items-center justify-center p-4 border-2 border-dashed border-[#6D597A]/50 rounded-lg text-[#3A3A3A]/80 hover:border-[#6D597A] hover:text-[#3A3A3A] transition-colors"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tambah Produk Lain</span>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* --- CUSTOMIZE SECTION --- */}
      <div className="rounded-lg border-2 border-[#6D597A] overflow-hidden">
        <div className="bg-[#6D597A] text-[#FDF6F0] p-4">
            <h3 className="text-lg font-semibold">{isLookbookMode ? "3. Sesuaikan Tampilan" : "2. Sesuaikan Tampilan"}</h3>
            <p className="text-sm text-[#FDF6F0]/80">Atur tema dan pencahayaan untuk pemotretan.</p>
        </div>
        <div className="p-4 bg-white/50">
          <ControlSettings 
            theme={theme}
            setTheme={setTheme}
            lighting={lighting}
            setLighting={setLighting}
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isLoading}
          className="bg-[#6D597A] hover:bg-[#6d597ae0] disabled:bg-[#3A3A3A]/30 disabled:shadow-none disabled:cursor-not-allowed disabled:text-[#3A3A3A]/70 text-[#FDF6F0] font-bold py-3 px-10 rounded-lg text-lg transition-all duration-200 ease-in-out border-2 border-[#6D597A] shadow-[4px_4px_0px_#B56576] hover:shadow-[2px_2px_0px_#B56576] hover:translate-x-0.5 hover:translate-y-0.5 w-full"
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};