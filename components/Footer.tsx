import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FEF9E7] border-t border-[#1E8449]/20 mt-12">
      <div className="container max-w-screen-xl mx-auto px-4 py-6 text-center text-[#3A3A3A]/70">
        <p>© {new Date().getFullYear()} Cepat Digital Studio. Powered by Google Gemini. Dibuat oleh <strong className="font-semibold text-[#3A3A3A]">Cepat Digital Teknologi</strong>.</p>
        <p className="text-sm mt-2">Versi 1.0</p>
      </div>
    </footer>
  );
};