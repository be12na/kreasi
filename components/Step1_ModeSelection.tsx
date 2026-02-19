import React from 'react';
import type { GenerationMode } from '../App';

interface Step1_ModeSelectionProps {
    onModeSelect: (mode: GenerationMode) => void;
}

interface ModeOptionProps {
  title: string;
  description: string;
  onClick: () => void;
}

const ModeOption: React.FC<ModeOptionProps> = ({ title, description, onClick }) => (
  <button
    onClick={onClick}
    className="relative text-left w-full p-6 bg-white/50 rounded-xl border-2 border-[#1E8449] space-y-2 shadow-[8px_8px_0px_#F1C40F] transition-all duration-200 ease-in-out hover:shadow-[4px_4px_0px_#F1C40F] hover:translate-x-1 hover:translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#F1C40F]/50"
  >
    <h3 className="text-xl font-bold text-[#1E8449]">{title}</h3>
    <p className="text-[#3A3A3A]/80">{description}</p>
  </button>
);


export const Step1_ModeSelection: React.FC<Step1_ModeSelectionProps> = ({ onModeSelect }) => {
  return (
    <div className="w-full bg-white/50 border-2 border-[#1E8449] rounded-xl shadow-[8px_8px_0px_#1E8449] p-6 md:p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-[#3A3A3A]">Mulai Berkreasi</h3>
        <p className="text-lg text-[#3A3A3A]/80 mt-2">Pilih jenis konten visual yang mau kamu buat.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModeOption 
          title="Outfit Studio"
          description="Gabungin foto model & produk buat bikin satu set foto fashion yang kece."
          onClick={() => onModeSelect('lookbook')}
        />
        <ModeOption 
          title="Product Shots"
          description="Hasilkan beragam foto produk profesional yang detail dengan latar yang stylish."
          onClick={() => onModeSelect('b-roll')}
        />
        <ModeOption 
          title="Ragam Pose"
          description="Upload foto model buat dapetin berbagai pose dinamis dengan baju & background yang sama persis."
          onClick={() => onModeSelect('pose')}
        />
         <ModeOption 
          title="Scene Creator"
          description="Pindahin produk atau model kamu ke scene atau background baru cuma pakai teks."
          onClick={() => onModeSelect('scene')}
        />
         <ModeOption 
          title="Campaign Kit"
          description="Satu klik buat bikin semua materi iklan: post & story IG, banner web, dll."
          onClick={() => onModeSelect('campaign')}
        />
         <ModeOption 
          title="Theme Explorer"
          description="Ubah fotomu jadi berbagai gaya artistik yang unik, dari cat air sampai cyberpunk."
          onClick={() => onModeSelect('theme')}
        />
      </div>
    </div>
  );
};