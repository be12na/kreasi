import React, { useState } from 'react';
import { Spinner } from './Spinner';
import type { Look } from '../types';
import { ImageZoomModal } from './ImageZoomModal';

interface ResultDisplayProps {
  lookbook: Look[] | null;
  isLoading: boolean;
  error: string | null;
  onGeneratePrompt: (index: number) => void;
  promptLoadingIndex: number | null;
  generationMode: 'lookbook' | 'b-roll' | 'pose' | 'scene' | 'campaign' | 'theme';
  onStartOver: () => void;
}

const LoadingMessage: React.FC = () => {
    const messages = [
        "AI stylist lagi siap-siap...",
        "Lagi ngeracik konten buat kamu...",
        "Nyari angle yang paling pas...",
        "Keajaiban butuh waktu sebentar...",
        "Menata setiap detail...",
        "Menyusun showcase keren buatmu..."
    ];
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMessage(messages[Math.floor(Math.random() * messages.length)]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return <p className="text-[#3A3A3A]/80 mt-4 text-lg">{message}</p>;
}

const LookCard: React.FC<{ look: Look; index: number; onGeneratePrompt: (index: number) => void; isLoading: boolean; onZoom: (imageUrl: string) => void; generationMode: ResultDisplayProps['generationMode']; }> = ({ look, index, onGeneratePrompt, isLoading, onZoom, generationMode }) => {
    const [copied, setCopied] = useState(false);
    const showPromptButton = generationMode === 'lookbook' || generationMode === 'pose';

    const handleCopy = () => {
        if (look.videoPrompt) {
            navigator.clipboard.writeText(look.videoPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const ZoomButton: React.FC<{ isSecondary?: boolean }> = ({ isSecondary = false }) => (
        <button
            onClick={() => onZoom(look.imageUrl)}
            className={`font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm border-2 border-[#1E8449] w-full ${isSecondary ? 'bg-[#F1C40F] hover:bg-[#f1c40fe0] text-[#3A3A3A]' : 'bg-[#FEF9E7] hover:bg-[#FEF9E7]/80 text-[#3A3A3A]'}`}
            aria-label={`Zoom in look ${index + 1}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <span>Zoom</span>
        </button>
    );

    const DownloadButton: React.FC<{ isSecondary?: boolean }> = ({ isSecondary = false }) => (
        <a
            href={look.imageUrl}
            download={`look-${index + 1}.png`}
            className={`font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm border-2 border-[#1E8449] w-full ${isSecondary ? 'bg-[#F1C40F] hover:bg-[#f1c40fe0] text-[#3A3A3A]' : 'bg-[#FEF9E7] hover:bg-[#FEF9E7]/80 text-[#3A3A3A]'}`}
            aria-label={`Download look ${index + 1}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Download</span>
        </a>
    );

    return (
        <div className="relative group overflow-hidden rounded-lg border-2 border-[#1E8449] bg-gray-100 shadow-[4px_4px_0px_#1E8449]">
            {look.name && (
                <div className="absolute top-2 left-2 bg-[#F1C40F] text-[#3A3A3A] text-xs font-bold px-2 py-1 rounded-full z-10">
                    {look.name}
                </div>
            )}
            <img src={look.imageUrl} alt={`Look ${index + 1}`} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-[#3A3A3A]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                {look.videoPrompt ? (
                    <div className="text-center text-[#FEF9E7] p-2 flex flex-col justify-center items-center h-full w-full">
                        <p className="text-sm mb-3 font-mono flex-grow overflow-y-auto custom-scrollbar">{look.videoPrompt}</p>
                        <div className="w-full space-y-2 mt-auto">
                            <button
                                onClick={handleCopy}
                                className="bg-[#FEF9E7] hover:bg-[#FEF9E7]/80 text-[#3A3A3A] font-bold py-2 px-4 rounded-lg transition-all text-sm border-2 border-[#1E8449] w-full"
                            >
                                {copied ? 'Copied!' : 'Copy Prompt'}
                            </button>
                             <ZoomButton isSecondary={true} />
                            <DownloadButton isSecondary={true} />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-3 w-4/5">
                        <ZoomButton />
                        <DownloadButton />
                        {showPromptButton && (
                            <button
                                onClick={() => onGeneratePrompt(index)}
                                disabled={isLoading}
                                className="bg-[#F1C40F] hover:bg-[#f1c40fe0] text-[#3A3A3A] font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm border-2 border-[#1E8449] disabled:bg-[#3A3A3A]/40"
                                aria-label={`Buat prompt video untuk look ${index + 1}`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Membuat...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 3.5a1.5 1.5 0 011.5 1.5v1.41a3.501 3.501 0 00-2.532 1.222l-.678.79a.5.5 0 01-.88.002l-.68-.79A3.5 3.5 0 004 6.41V5A1.5 1.5 0 015.5 3.5h3zm-2.5 7.5a.5.5 0 000 1h5a.5.5 0 000-1h-5z" />
                                            <path fillRule="evenodd" d="M2 5a3 3 0 013-3h6a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V5zm3-1a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V5a1 1 0 00-1-1H5z" clipRule="evenodd" />
                                        </svg>
                                        <span>Buat Prompt</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ lookbook, isLoading, error, onGeneratePrompt, promptLoadingIndex, generationMode, onStartOver }) => {
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  
  const handleZoomIn = (imageUrl: string) => {
    setZoomedImageUrl(imageUrl);
  };

  const handleZoomOut = () => {
    setZoomedImageUrl(null);
  };

  const getTitle = () => {
    switch (generationMode) {
        case 'lookbook': return 'Outfit Studio Kamu!';
        case 'pose': return 'Ragam Pose Kamu!';
        case 'b-roll': return 'Your Product Shots!';
        case 'scene': return 'Your New Scenes!';
        case 'campaign': return 'Your Campaign Kit!';
        case 'theme': return 'Your Artistic Styles!';
        default: return 'Your Results!';
    }
  }
  
  const gridClasses = generationMode === 'campaign' 
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-start" 
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8";


  return (
    <div className="w-full bg-white/50 border-2 border-[#1E8449] rounded-xl shadow-[8px_8px_0px_#1E8449] p-4 md:p-6 flex justify-center items-center text-center">
      <div className="w-full">
        {isLoading && (
          <div className="flex flex-col items-center min-h-[400px] justify-center">
            <Spinner />
            <LoadingMessage />
          </div>
        )}

        {error && !isLoading && (
          <div className="min-h-[400px] flex flex-col justify-center items-center">
            <div className="text-red-700 bg-red-100 p-6 rounded-lg border-2 border-red-700 w-full max-w-lg">
              <p className="font-semibold text-lg">Waduh, ada error</p>
              <p className="mt-2">{error}</p>
            </div>
            <button
                onClick={onStartOver}
                className="mt-8 bg-[#1E8449] hover:bg-[#1e8449e0] text-[#FEF9E7] font-bold py-3 px-10 rounded-lg text-lg transition-all duration-200 ease-in-out border-2 border-[#1E8449] shadow-[4px_4px_0px_#F1C40F] hover:shadow-[2px_2px_0px_#F1C40F] hover:translate-x-0.5 hover:translate-y-0.5"
            >
              Coba Lagi Yuk
            </button>
          </div>
        )}

        {!isLoading && !error && lookbook && lookbook.length > 0 && (
          <div>
            <h3 className="text-3xl md:text-4xl font-bold mb-2 text-[#3A3A3A]">
              {getTitle()}
            </h3>
            <p className="text-lg text-[#3A3A3A]/80 mb-8">Hasilnya udah siap! Kamu bisa download, zoom, atau bikin video prompt.</p>

            <div className={gridClasses}>
              {lookbook.map((look, index) => (
                <LookCard 
                    key={index}
                    look={look}
                    index={index}
                    onGeneratePrompt={onGeneratePrompt}
                    isLoading={promptLoadingIndex === index}
                    onZoom={handleZoomIn}
                    generationMode={generationMode}
                />
              ))}
            </div>
            <div className="mt-12 text-center">
                <button
                    onClick={onStartOver}
                    className="bg-[#F1C40F] hover:bg-[#f1c40fe0] text-[#3A3A3A] font-bold py-3 px-10 rounded-lg text-lg transition-all duration-200 ease-in-out border-2 border-[#1E8449] shadow-[4px_4px_0px_#1E8449] hover:shadow-[2px_2px_0px_#1E8449] hover:translate-x-0.5 hover:translate-y-0.5"
                >
                    Bikin Lagi
                </button>
            </div>
          </div>
        )}
      </div>
       <ImageZoomModal imageUrl={zoomedImageUrl} onClose={handleZoomOut} />
    </div>
  );
};