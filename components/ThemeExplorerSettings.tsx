import React from 'react';

interface ThemeExplorerSettingsProps {
  style: string;
  setStyle: (style: string) => void;
}

const styleOptions = [ 'Cat Air', 'Cyberpunk', 'Komik Vintage', 'Claymation (Tanah Liat)', 'Fantasi Gelap', 'Seni Pixel' ];


export const ThemeExplorerSettings: React.FC<ThemeExplorerSettingsProps> = ({ style, setStyle }) => {
  return (
    <div>
      <label htmlFor="style-select" className="block text-sm font-medium text-[#3A3A3A]/80 mb-2">
        Pilih Gaya Artistik
      </label>
      <div className="relative">
        <select
          id="style-select"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full bg-white border-2 border-[#1E8449] text-[#3A3A3A] rounded-lg p-2.5 focus:ring-2 focus:ring-[#F1C40F] focus:border-[#F1C40F] transition appearance-none pr-8"
        >
          {styleOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#1E8449]">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
       <p className="text-xs text-[#3A3A3A]/60 mt-2">
        AI akan membuat beberapa variasi dari gaya yang kamu pilih.
      </p>
    </div>
  );
};