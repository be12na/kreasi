import React from 'react';

type GenerationMode = 'lookbook' | 'b-roll' | 'pose';

interface ModeSelectorProps {
  mode: GenerationMode;
  setMode: (mode: GenerationMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, setMode }) => {
  const baseButtonClasses = "w-full text-center font-semibold p-3 rounded-lg border-2 border-[#6D597A] transition-all duration-200";
  const activeButtonClasses = "bg-[#6D597A] text-[#FDF6F0] shadow-[2px_2px_0px_#B56576]";
  const inactiveButtonClasses = "bg-white text-[#3A3A3A] hover:bg-white/50";

  return (
    <div className="rounded-lg border-2 border-[#6D597A] overflow-hidden">
        <div className="bg-[#6D597A] text-[#FDF6F0] p-4">
            <h3 className="text-lg font-semibold">Pilih Mode Pembuatan</h3>
            <p className="text-sm text-[#FDF6F0]/80">Pilih apa yang ingin Anda buat.</p>
        </div>
        <div className="p-4 bg-white/50">
            <div className="grid grid-cols-3 gap-4">
                <button 
                    onClick={() => setMode('lookbook')}
                    className={`${baseButtonClasses} ${mode === 'lookbook' ? activeButtonClasses : inactiveButtonClasses}`}
                    aria-pressed={mode === 'lookbook'}
                >
                    Lookbook
                </button>
                <button 
                    onClick={() => setMode('b-roll')}
                    className={`${baseButtonClasses} ${mode === 'b-roll' ? activeButtonClasses : inactiveButtonClasses}`}
                    aria-pressed={mode === 'b-roll'}
                >
                    B-roll
                </button>
                <button 
                    onClick={() => setMode('pose')}
                    className={`${baseButtonClasses} ${mode === 'pose' ? activeButtonClasses : inactiveButtonClasses}`}
                    aria-pressed={mode === 'pose'}
                >
                    Pose
                </button>
            </div>
        </div>
    </div>
  );
};