import React, { useEffect } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3A3A3A]/50 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-[#FEF9E7] rounded-xl border-2 border-[#1E8449] shadow-[8px_8px_0px_#1E8449] w-full max-w-lg p-6 m-4 relative text-[#3A3A3A] transition-transform duration-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[#3A3A3A]/50 hover:text-[#3A3A3A] transition-colors p-2 rounded-full"
          aria-label="Tutup modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-3 mb-4">
            <svg className="w-8 h-8 text-[#1E8449]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <h2 className="text-2xl font-bold">Tentang Cepat Digital Studio</h2>
        </div>
        
        <div className="space-y-4 text-[#3A3A3A]/90">
          <p>
            Aplikasi ini adalah generator konten visual canggih yang dirancang untuk pemasar afiliasi, pemilik e-commerce, dan kreator konten.
          </p>
          <p>
            Aplikasi ini memanfaatkan kemampuan mutakhir dari <strong className="text-[#3A3A3A]">AI Gemini Google</strong> untuk membantu Anda membuat citra produk yang menakjubkan dalam hitungan detik.
          </p>
          <div>
            <h3 className="font-bold text-lg text-[#3A3A3A] mb-2">Fitur Utama:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong className="font-semibold">Mode Lookbook:</strong> Unggah model dan produk untuk menghasilkan lookbook fashion lengkap dengan 6 pose dan pengaturan unik.
              </li>
              <li>
                <strong className="font-semibold">Mode B-roll:</strong> Unggah satu produk untuk menghasilkan 6 bidikan B-roll profesional berkualitas tinggi, cocok untuk kategori produk apa pun.
              </li>
               <li>
                <strong className="font-semibold">Prompt Video:</strong> Hasilkan prompt gerakan kreatif secara instan untuk gambar Anda, siap digunakan di platform pembuatan video AI.
              </li>
            </ul>
          </div>
          <p>
            Sesuaikan hasil Anda dengan berbagai tema pemotretan dan gaya pencahayaan agar cocok dengan estetika merek Anda.
          </p>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};