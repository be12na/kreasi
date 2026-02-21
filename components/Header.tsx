import React from 'react';

interface HeaderProps {
  onChangeApiKey?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onChangeApiKey }) => {
  return (
    <header className="bg-[#1E8449] border-b border-[#F1C40F]/50 sticky top-0 z-50">
      <div className="container max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
           <svg className="w-8 h-8" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
              <style>
                {`
                  .cdt-text { font-family: sans-serif; font-weight: bold; font-size: 70px; }
                `}
              </style>
              <text x="0" y="70" className="cdt-text" fill="#FEF9E7">C</text>
              <text x="35" y="70" className="cdt-text" fill="#F1C40F">D</text>
              <text x="75" y="70" className="cdt-text" fill="#FEF9E7">T</text>
            </svg>
          <h1 className="text-xl font-bold text-[#FEF9E7] flex items-baseline">
            <span>Cepat Digital Studio</span>
            <span className="text-sm font-light text-[#FEF9E7]/80 ml-2">by Cepat Digital Teknologi</span>
          </h1>
        </div>
        {onChangeApiKey && (
          <button
            onClick={onChangeApiKey}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#FEF9E7]/80 hover:text-[#FEF9E7] hover:bg-white/10 rounded-lg transition-all"
            title="Ganti API Key"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            API Key
          </button>
        )}
      </div>
    </header>
  );
};