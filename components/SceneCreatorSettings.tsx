import React from 'react';

interface SceneCreatorSettingsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export const SceneCreatorSettings: React.FC<SceneCreatorSettingsProps> = ({ prompt, setPrompt }) => {
  return (
    <div>
      <label htmlFor="scene-prompt" className="block text-sm font-medium text-[#3A3A3A]/80 mb-2">
        Jelasin scene yang kamu mau
      </label>
      <textarea
        id="scene-prompt"
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full bg-white border-2 border-[#1E8449] text-[#3A3A3A] rounded-lg p-2.5 focus:ring-2 focus:ring-[#F1C40F] focus:border-[#F1C40F] transition"
        placeholder="Contoh: di sebuah kafe yang nyaman di Paris saat hujan, dengan lampu-lampu kota yang buram di luar jendela..."
      />
       <p className="text-xs text-[#3A3A3A]/60 mt-2">
        Tips: Makin detail deskripsimu, makin bagus hasilnya. Coba sebutin lokasi, waktu, cuaca, dan mood-nya.
      </p>
    </div>
  );
};