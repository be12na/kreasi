import React from 'react';

export const Header: React.FC = () => {
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
      </div>
    </header>
  );
};