import React from 'react';
import { ImageUploader } from './ImageUploader';
import { ImageSlot } from './ImageSlot';
import type { GenerationMode } from '../App';

interface Step2_UploadProps {
  generationMode: GenerationMode;
  onModelUpload: (file: File) => void;
  onModelRemove: () => void;
  modelPreviewUrl: string | null;
  productPreviews: (string | null)[];
  onProductUpload: (file: File, index: number) => void;
  onProductRemove: (index: number) => void;
  onAddProductSlot: () => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

export const Step2_Upload: React.FC<Step2_UploadProps> = ({
  generationMode,
  onModelUpload,
  onModelRemove,
  modelPreviewUrl,
  productPreviews,
  onProductUpload,
  onProductRemove,
  onAddProductSlot,
  onNext,
  onBack,
  canProceed,
}) => {
  const isLookbookMode = generationMode === 'lookbook';
  const isPoseMode = generationMode === 'pose';
  const isSingleProductMode = ['b-roll', 'scene', 'campaign', 'theme'].includes(generationMode);

  const getProductUploaderTitle = () => {
    switch (generationMode) {
      case 'b-roll': return "1. Upload Produk Kamu";
      case 'scene': return "1. Upload Subjek Kamu";
      case 'campaign': return "1. Upload Produk Utama";
      case 'theme': return "1. Upload Gambar Kamu";
      default: return "1. Upload Produk";
    }
  };

  const getProductUploaderDescription = () => {
     switch (generationMode) {
      case 'b-roll':
      case 'campaign':
        return "Baju, tas, sepatu, dll. Background putih hasilnya lebih oke.";
      case 'scene':
        return "Bisa produk atau orang. Background-nya bakal diganti.";
      case 'theme':
        return "Gambar apa aja yang mau kamu ubah jadi gaya artistik.";
      default:
        return "Pilih produk utama.";
    }
  }


  return (
    <div className="w-full bg-white/50 border-2 border-[#1E8449] rounded-xl shadow-[8px_8px_0px_#1E8449] p-6 md:p-8 space-y-8">
      
        {/* --- MODEL UPLOADER (Lookbook & Pose) --- */}
        {(isLookbookMode || isPoseMode) && (
          <ImageUploader 
            id="model-uploader"
            title="1. Upload Model Kamu"
            description="Foto orang yang jelas & high-res ya."
            onImageUpload={onModelUpload}
            onImageRemove={onModelRemove}
            previewUrl={modelPreviewUrl}
          />
        )}

        {/* --- SINGLE GENERIC UPLOADER (B-roll, Scene, Campaign, Theme) --- */}
        {isSingleProductMode && (
          <ImageUploader 
            id="product-uploader"
            title={getProductUploaderTitle()}
            description={getProductUploaderDescription()}
            onImageUpload={(file) => onProductUpload(file, 0)}
            onImageRemove={() => onProductRemove(0)}
            previewUrl={productPreviews[0]}
          />
        )}
      
        {/* --- LOOKBOOK MULTI-PRODUCT UPLOAD SECTION --- */}
        {isLookbookMode && (
          <div className="rounded-lg border-2 border-[#1E8449] overflow-hidden">
            <div className="bg-[#1E8449] text-[#FEF9E7] p-4">
              <h3 className="text-lg font-semibold">2. Upload Produk Kamu</h3>
              <p className="text-sm text-[#FEF9E7]/80">Produk utama & maks. 3 aksesoris. Background putih hasilnya lebih oke.</p>
            </div>
            <div className="p-4 bg-white/50 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {productPreviews.map((previewUrl, index) => (
                  <ImageSlot
                    key={index}
                    id={`product-uploader-${index}`}
                    onUpload={(file) => onProductUpload(file, index)}
                    onRemove={() => onProductRemove(index)}
                    previewUrl={previewUrl}
                    placeholderText={index === 0 ? 'Produk Utama' : `Aksesoris ${index + 1}`}
                    isRemovable={index > 0}
                  />
                ))}
              </div>
              {isLookbookMode && productPreviews.length < 4 && (
                <button 
                    onClick={onAddProductSlot}
                    className="w-full flex items-center justify-center p-4 border-2 border-dashed border-[#1E8449]/50 rounded-lg text-[#3A3A3A]/80 hover:border-[#1E8449] hover:text-[#3A3A3A] transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Tambah Aksesoris</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
            <button
                onClick={onBack}
                className="bg-[#FEF9E7] hover:bg-[#FEF9E7]/80 text-[#3A3A3A] font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 ease-in-out border-2 border-[#1E8449]"
            >
                Kembali
            </button>
            <button
                onClick={onNext}
                disabled={!canProceed}
                className="bg-[#1E8449] hover:bg-[#1e8449e0] disabled:bg-[#3A3A3A]/30 disabled:shadow-none disabled:cursor-not-allowed disabled:text-[#3A3A3A]/70 text-[#FEF9E7] font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 ease-in-out border-2 border-[#1E8449] shadow-[4px_4px_0px_#F1C40F] hover:shadow-[2px_2px_0px_#F1C40F] hover:translate-x-0.5 hover:translate-y-0.5"
            >
                Lanjut
            </button>
        </div>
    </div>
  );
};