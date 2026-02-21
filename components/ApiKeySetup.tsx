import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'kreasi_gemini_api_keys';

export const getStoredApiKeys = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const keys = JSON.parse(stored) as string[];
      return keys.filter(k => k.trim().length > 0);
    }
  } catch {}
  return [];
};

export const saveApiKeys = (keys: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys.filter(k => k.trim().length > 0)));
};

interface ApiKeySetupProps {
  onKeysReady: (keys: string[]) => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onKeysReady }) => {
  const [keys, setKeys] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const stored = getStoredApiKeys();
    if (stored.length > 0) {
      setKeys(stored);
    }
  }, []);

  const handleKeyChange = (index: number, value: string) => {
    const newKeys = [...keys];
    newKeys[index] = value.trim();
    setKeys(newKeys);
    setError(null);
  };

  const addKeySlot = () => {
    if (keys.length < 5) {
      setKeys([...keys, '']);
    }
  };

  const removeKeySlot = (index: number) => {
    if (keys.length > 1) {
      setKeys(keys.filter((_, i) => i !== index));
    }
  };

  const validateKey = async (key: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
      );
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    const validKeys = keys.filter(k => k.trim().length > 0);
    if (validKeys.length === 0) {
      setError('Masukkan minimal 1 API Key.');
      return;
    }

    setValidating(true);
    setError(null);

    const results: { key: string; valid: boolean }[] = [];
    for (const key of validKeys) {
      const valid = await validateKey(key);
      results.push({ key, valid });
    }

    const validatedKeys = results.filter(r => r.valid).map(r => r.key);
    const invalidCount = results.filter(r => !r.valid).length;

    if (validatedKeys.length === 0) {
      setError(`Semua API Key tidak valid (${invalidCount} key gagal). Pastikan key-mu benar.`);
      setValidating(false);
      return;
    }

    if (invalidCount > 0) {
      // Some valid, some not — proceed with valid ones
      setError(null);
    }

    saveApiKeys(validatedKeys);
    setValidating(false);
    onKeysReady(validatedKeys);
  };

  const validKeyCount = keys.filter(k => k.trim().length > 0).length;

  return (
    <div className="min-h-screen bg-[#FEF9E7] flex flex-col">
      {/* Header */}
      <header className="bg-[#1E8449] border-b border-[#F1C40F]/50 sticky top-0 z-50">
        <div className="container max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="70" fill="#FEF9E7" style={{ fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '70px' }}>C</text>
              <text x="35" y="70" fill="#F1C40F" style={{ fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '70px' }}>D</text>
              <text x="75" y="70" fill="#FEF9E7" style={{ fontFamily: 'sans-serif', fontWeight: 'bold', fontSize: '70px' }}>T</text>
            </svg>
            <h1 className="text-xl font-bold text-[#FEF9E7] flex items-baseline">
              <span>Cepat Digital Studio</span>
              <span className="text-sm font-light text-[#FEF9E7]/80 ml-2">by Cepat Digital Teknologi</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container max-w-screen-xl mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* API Key Card */}
          <div className="bg-white rounded-xl border-2 border-gray-900 shadow-[6px_6px_0px_#D4AC0D] p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1E8449]/10 rounded-full mb-4">
                <svg className="w-8 h-8 text-[#1E8449]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Masukkan API Key Gemini</h2>
              <p className="text-gray-500 mt-2">Kamu butuh API Key dari Google AI Studio untuk menggunakan fitur AI. Bisa masukkan beberapa key sekaligus untuk auto-failover.</p>
            </div>

            {/* Key Inputs */}
            <div className="space-y-3">
              {keys.map((key, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1E8449] text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <input
                    type="password"
                    value={key}
                    onChange={(e) => handleKeyChange(index, e.target.value)}
                    placeholder={`API Key #${index + 1}`}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#1E8449] focus:ring-2 focus:ring-[#1E8449]/20 outline-none transition-all text-sm font-mono"
                  />
                  {keys.length > 1 && (
                    <button
                      onClick={() => removeKeySlot(index)}
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                      title="Hapus key ini"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add More Button */}
            {keys.length < 5 && (
              <button
                onClick={addKeySlot}
                className="mt-3 flex items-center gap-2 text-sm text-[#1E8449] hover:text-[#145A32] font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Tambah API Key (Backup / Failover)
              </button>
            )}

            {/* Info Badge */}
            <div className="mt-4 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-700">
                <strong>Multi API Key:</strong> Jika kamu punya beberapa key, sistem akan otomatis pindah ke key berikutnya jika salah satu gagal (quota habis, error, dll). API Key disimpan di browser-mu saja, tidak dikirim ke server manapun.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={validating || validKeyCount === 0}
              className="mt-6 w-full py-3 px-6 bg-[#1E8449] text-white font-bold rounded-lg border-2 border-gray-900 shadow-[4px_4px_0px_#111827] hover:shadow-[2px_2px_0px_#111827] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {validating ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memvalidasi API Key...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mulai Berkreasi ({validKeyCount} key)
                </>
              )}
            </button>
          </div>

          {/* Tutorial Card */}
          <div className="bg-white rounded-xl border-2 border-gray-900 shadow-[6px_6px_0px_#D4AC0D] p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#D4AC0D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Cara Mendapatkan API Key Gemini (Gratis)
            </h3>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AC0D] text-white flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-semibold text-gray-900">Buka Google AI Studio</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Kunjungi{' '}
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-[#1E8449] font-semibold underline hover:text-[#145A32]">
                      aistudio.google.com/apikey
                    </a>
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AC0D] text-white flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-semibold text-gray-900">Login dengan Akun Google</p>
                  <p className="text-sm text-gray-600 mt-1">Gunakan akun Google-mu yang sudah ada. Pastikan sudah login.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AC0D] text-white flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-semibold text-gray-900">Klik "Create API Key"</p>
                  <p className="text-sm text-gray-600 mt-1">Pilih project yang ada atau buat project baru, lalu klik <strong>"Create API key in new project"</strong>.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AC0D] text-white flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <p className="font-semibold text-gray-900">Copy API Key</p>
                  <p className="text-sm text-gray-600 mt-1">Salin API Key yang muncul (awalan <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">AIzaSy...</code>) lalu paste di form di atas.</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#D4AC0D] text-white flex items-center justify-center text-sm font-bold">5</div>
                <div>
                  <p className="font-semibold text-gray-900">(Opsional) Buat Beberapa Key</p>
                  <p className="text-sm text-gray-600 mt-1">Untuk menghindari limit quota, kamu bisa buat beberapa key dari project berbeda dan masukkan semuanya di atas. Sistem akan otomatis ganti ke key lain jika salah satu gagal.</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 bg-[#FEF9E7] rounded-lg p-4 border border-[#D4AC0D]/30">
              <p className="text-sm font-semibold text-gray-900 mb-2">💡 Tips:</p>
              <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                <li>API Key Gemini <strong>gratis</strong> dengan limit penggunaan tertentu per hari.</li>
                <li>Jangan share API Key-mu ke orang lain.</li>
                <li>Jika quota habis, tunggu 1 menit atau gunakan key dari akun Google berbeda.</li>
                <li>API Key disimpan di browser (localStorage) — tidak dikirim ke server kami.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
