import React from 'react';
import { ControlSettings } from './ControlSettings';
import type { GenerationMode } from '../App';
import { SceneCreatorSettings } from './SceneCreatorSettings';
import { ThemeExplorerSettings } from './ThemeExplorerSettings';


interface Step3_CustomizeProps {
  theme: string;
  setTheme: (theme: string) => void;
  lighting: string;
  setLighting: (lighting: string) => void;
  scenePrompt: string;
  setScenePrompt: (prompt: string) => void;
  artisticStyle: string;
  setArtisticStyle: (style: string) => void;
  onGenerate: () => void;
  onBack: () => void;
  isLoading: boolean;
  generationMode: GenerationMode;
}

export const Step3_Customize: React.FC<Step3_CustomizeProps> = ({
    theme,
    setTheme,
    lighting,
    setLighting,
    scenePrompt,
    setScenePrompt,
    artisticStyle,
    setArtisticStyle,
    onGenerate,
    onBack,
    isLoading,
    generationMode
}) => {
  
  const showStandardSettings = ['lookbook', 'b-roll', 'pose', 'campaign'].includes(generationMode);

  const getButtonText = () => {
    if (isLoading) return 'Membuat...';
    switch (generationMode) {
      case 'lookbook': return 'Generate Outfit Studio';
      case 'b-roll': return 'Generate Product Shots';
      case 'pose': return 'Generate Ragam Pose';
      case 'scene': return 'Generate Scene';
      case 'campaign': return 'Generate Campaign Kit';
      case 'theme': return 'Generate Styles';
      default: return 'Generate';
    }
  };

  const getTitle = () => {
     switch (generationMode) {
      case 'scene': return 'Jelaskan Scenenya';
      case 'theme': return 'Pilih Gaya Kamu';
      default: return 'Kustomisasi Look Kamu';
    }
  }

  const getDescription = () => {
      switch (generationMode) {
      case 'scene': return 'Tulis deskripsi detail tentang background atau lingkungan baru kamu.';
      case 'theme': return 'Pilih satu gaya artistik buat di-apply ke gambarmu.';
      default: return 'Atur tema dan lighting buat photoshoot virtual-mu.';
    }
  }


  return (
    <div className="w-full bg-white/50 border-2 border-[#1E8449] rounded-xl shadow-[8px_8px_0px_#1E8449] p-6 md:p-8 space-y-8">
        <div className="text-center">
            <h3 className="text-2xl font-bold text-[#3A3A3A]">{getTitle()}</h3>
            <p className="text-lg text-[#3A3A3A]/80 mt-2">{getDescription()}</p>
        </div>
        
        { showStandardSettings && (
            <ControlSettings 
                theme={theme}
                setTheme={setTheme}
                lighting={lighting}
                setLighting={setLighting}
            />
        )}

        { generationMode === 'scene' && (
            <SceneCreatorSettings 
                prompt={scenePrompt}
                setPrompt={setScenePrompt}
            />
        )}

        { generationMode === 'theme' && (
            <ThemeExplorerSettings 
                style={artisticStyle}
                setStyle={setArtisticStyle}
            />
        )}


        <div className="flex justify-between items-center pt-4">
             <button
                onClick={onBack}
                className="bg-[#FEF9E7] hover:bg-[#FEF9E7]/80 text-[#3A3A3A] font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 ease-in-out border-2 border-[#1E8449]"
            >
                Kembali
            </button>
            <button
                onClick={onGenerate}
                disabled={isLoading}
                className="bg-[#1E8449] hover:bg-[#1e8449e0] disabled:bg-[#3A3A3A]/30 disabled:shadow-none disabled:cursor-not-allowed disabled:text-[#3A3A3A]/70 text-[#FEF9E7] font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 ease-in-out border-2 border-[#1E8449] shadow-[4px_4px_0px_#F1C40F] hover:shadow-[2px_2px_0px_#F1C40F] hover:translate-x-0.5 hover:translate-y-0.5"
            >
                {getButtonText()}
            </button>
        </div>
    </div>
  );
};