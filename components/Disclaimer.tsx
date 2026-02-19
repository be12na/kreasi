
import React from 'react';

export const Disclaimer: React.FC = () => {
  return (
    <section className="mt-16 md:mt-24">
      <div className="bg-[#F1C40F]/10 border-2 border-[#F1C40F] rounded-xl p-6 shadow-[8px_8px_0px_#F1C40F]">
        <div className="flex items-start space-x-4">
          <div>
            <svg className="w-8 h-8 text-[#F1C40F]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#3A3A3A] mb-2">
              Sekilas Info!
            </h2>
            <p className="text-[#3A3A3A]/90 mb-4">
              Anda saat ini menggunakan aplikasi ini di lingkungan pengembangan khusus yang disediakan oleh <strong>Google AI Studio</strong>. Harap perhatikan hal-hal berikut:
            </p>
            <ul className="list-disc list-inside space-y-3 text-[#3A3A3A]/90">
              <li>
                <strong className="font-semibold text-[#3A3A3A]">Memerlukan Akun Google:</strong> Anda harus masuk ke akun Google untuk menjalankan aplikasi ini.
                 <p className="text-sm italic text-[#3A3A3A]/70 pl-1">
                  <strong>Requires Google Account:</strong> You must be logged into a Google account to run this app.
                </p>
              </li>
              <li>
                <strong className="font-semibold text-[#3A3A3A]">Tidak Perlu Kunci API:</strong> Lingkungan ini sudah dikonfigurasi sebelumnya. Anda dapat menjelajahi dan menghasilkan konten dengan bebas tanpa memerlukan kunci API Anda sendiri.
                <p className="text-sm italic text-[#3A3A3A]/70 pl-1">
                  <strong>No API Key Needed:</strong> This environment is pre-configured. You can explore and generate content freely without needing your own API key.
                </p>
              </li>
              <li>
                <strong className="font-semibold text-[#3A3A3A]">Sesi Bersifat Sementara:</strong> Gambar yang Anda unggah dan hasil yang dibuat tidak disimpan. Data akan hilang jika Anda menutup atau me-refresh tab browser ini.
                <p className="text-sm italic text-[#3A3A3A]/70 pl-1">
                  <strong>Temporary Sessions:</strong> Your uploaded images and generated results are not saved. They will be lost if you close or refresh this browser tab.
                </p>
              </li>
              <li>
                <strong className="font-semibold text-[#3A3A3A]">Untuk Eksplorasi:</strong> Pengaturan ini sangat cocok untuk mencoba aplikasi, belajar dari kodenya, dan bereksperimen dengan kemampuannya.
                 <p className="text-sm italic text-[#3A3A3A]/70 pl-1">
                  <strong>For Exploration:</strong> This setup is perfect for trying out the app, learning from its code, and experimenting with its capabilities.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};