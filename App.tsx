
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { generateLookbook, generateBroll, generateVideoPrompt, generatePoses, generateScene, generateCampaignKit, generateThemeExploration, setApiKeys } from './services/geminiService';
import type { ImageData, Look } from './types';
import { Stepper } from './components/Stepper';
import { Step1_ModeSelection } from './components/Step1_ModeSelection';
import { Step2_Upload } from './components/Step2_Upload';
import { Step3_Customize } from './components/Step3_Customize';
import { ResultDisplay } from './components/ResultDisplay';
import { ApiKeySetup, getStoredApiKeys } from './components/ApiKeySetup';


export type GenerationMode = 'lookbook' | 'b-roll' | 'pose' | 'scene' | 'campaign' | 'theme';

const VALID_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const STEPS = ['Pilih Mode', 'Upload Asset', 'Kustomisasi', 'Hasil'];

const App: React.FC = () => {
  const [apiKeysReady, setApiKeysReady] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [modelImage, setModelImage] = useState<ImageData | null>(null);
  const [modelImagePreview, setModelImagePreview] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<(ImageData | null)[]>([null]);
  const [productImagePreviews, setProductImagePreviews] = useState<(string | null)[]>([null]);
  const [lookbook, setLookbook] = useState<Look[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [promptLoadingIndex, setPromptLoadingIndex] = useState<number | null>(null);
  const [theme, setTheme] = useState<string>('Studio Profesional');
  const [lighting, setLighting] = useState<string>('Cahaya Alami');
  const [generationMode, setGenerationMode] = useState<GenerationMode>('lookbook');

  // New states for new modes
  const [scenePrompt, setScenePrompt] = useState<string>('');
  const [artisticStyle, setArtisticStyle] = useState<string>('Cat Air');

  // Auto-load stored API keys on mount
  useEffect(() => {
    const stored = getStoredApiKeys();
    if (stored.length > 0) {
      setApiKeys(stored);
      setApiKeysReady(true);
    }
  }, []);

  const handleKeysReady = (keys: string[]) => {
    setApiKeys(keys);
    setApiKeysReady(true);
  };

  const handleChangeApiKey = () => {
    setApiKeysReady(false);
    resetState();
  };

  const resetState = () => {
    setCurrentStep(1);
    setModelImage(null);
    setModelImagePreview(null);
    setProductImages([null]);
    setProductImagePreviews([null]);
    setLookbook(null);
    setIsLoading(false);
    setError(null);
    setPromptLoadingIndex(null);
    setTheme('Studio Profesional');
    setLighting('Cahaya Alami');
    setScenePrompt('');
    setArtisticStyle('Cat Air');
  };

  const goToNextStep = () => setCurrentStep(prev => prev + 1);
  const goToPrevStep = () => setCurrentStep(prev => prev - 1);
  
  const fileToImageData = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const mimeType = result.split(';')[0].split(':')[1];
        const base64 = result.split(',')[1];
        resolve({ base64, mimeType });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleModelImageUpload = useCallback(async (file: File) => {
    if (!VALID_MIME_TYPES.includes(file.type)) {
      setError(`Tipe file tidak didukung: '${file.type}'. Harap unggah file PNG, JPG, atau WEBP.`);
      return;
    }
    setError(null);
    setModelImagePreview(URL.createObjectURL(file));
    const imageData = await fileToImageData(file);
    setModelImage(imageData);
  }, []);
  
  const handleModelImageRemove = useCallback(() => {
    setModelImage(null);
    setModelImagePreview(null);
  }, []);

  const handleProductImageUpload = useCallback(async (file: File, index: number) => {
    if (!VALID_MIME_TYPES.includes(file.type)) {
      setError(`Tipe file tidak didukung: '${file.type}'. Harap unggah file PNG, JPG, atau WEBP.`);
      return;
    }
    setError(null);
    const newPreviews = [...productImagePreviews];
    newPreviews[index] = URL.createObjectURL(file);
    setProductImagePreviews(newPreviews);

    const imageData = await fileToImageData(file);
    const newImages = [...productImages];
    newImages[index] = imageData;
    setProductImages(newImages);
  }, [productImages, productImagePreviews]);
  
  const handleProductImageRemove = useCallback((index: number) => {
    if (index === 0) {
        const newPreviews = [...productImagePreviews];
        newPreviews[0] = null;
        setProductImagePreviews(newPreviews);
        
        const newImages = [...productImages];
        newImages[0] = null;
        setProductImages(newImages);
    } else {
        setProductImagePreviews(prev => prev.filter((_, i) => i !== index));
        setProductImages(prev => prev.filter((_, i) => i !== index));
    }
  }, [productImages, productImagePreviews]);
  
  const handleAddProductSlot = useCallback(() => {
    if (productImages.length < 4) {
      setProductImages(prev => [...prev, null]);
      setProductImagePreviews(prev => [...prev, null]);
    }
  }, [productImages.length]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setLookbook(null);
    goToNextStep(); // Move to the results step

    try {
      let results: Look[] | null = null;
      switch (generationMode) {
        case 'lookbook':
          const validProductImages = productImages.filter(Boolean) as ImageData[];
          results = (await generateLookbook(modelImage!, validProductImages, theme, lighting)).map(url => ({ imageUrl: url, videoPrompt: null }));
          break;
        case 'b-roll':
           results = (await generateBroll(productImages[0]!, theme, lighting)).map(url => ({ imageUrl: url, videoPrompt: null }));
          break;
        case 'pose':
           results = (await generatePoses(modelImage!, theme, lighting)).map(url => ({ imageUrl: url, videoPrompt: null }));
          break;
        case 'scene':
           results = (await generateScene(productImages[0]!, scenePrompt)).map(url => ({ imageUrl: url, videoPrompt: null }));
          break;
        case 'campaign':
           results = await generateCampaignKit(productImages[0]!, theme, lighting);
          break;
        case 'theme':
           results = (await generateThemeExploration(productImages[0]!, artisticStyle)).map(url => ({ imageUrl: url, videoPrompt: null }));
          break;
        default:
          throw new Error("Mode pembuatan tidak valid.");
      }
      
      if (results && results.length > 0) {
        setLookbook(results);
      } else {
        setError("AI tidak dapat menghasilkan gambar. Coba lagi dengan gambar atau pengaturan yang berbeda.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePrompt = async (index: number) => {
    if (!lookbook) {
       setError("Tidak dapat membuat prompt tanpa lookbook.");
       return;
    }
    
    setPromptLoadingIndex(index);
    try {
      const look = lookbook[index];
      const response = await fetch(look.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `look-${index}.png`, { type: blob.type });
      const imageData = await fileToImageData(file);
      
      const prompt = await generateVideoPrompt(imageData, theme, lighting);

      setLookbook(currentLookbook => {
        if (!currentLookbook) return null;
        const newLookbook = [...currentLookbook];
        newLookbook[index] = { ...newLookbook[index], videoPrompt: prompt };
        return newLookbook;
      });

    } catch (err) {
      console.error("Gagal membuat prompt video:", err);
    } finally {
      setPromptLoadingIndex(null);
    }
  };

  const canProceedFromUpload = (generationMode === 'lookbook' 
      ? (!!modelImage && !!productImages[0])
      : (generationMode === 'pose' ? !!modelImage : !!productImages[0])
  );

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return <Step1_ModeSelection onModeSelect={(mode) => { setGenerationMode(mode); goToNextStep(); }} />;
      case 2:
        return <Step2_Upload 
            generationMode={generationMode}
            onModelUpload={handleModelImageUpload}
            onModelRemove={handleModelImageRemove}
            modelPreviewUrl={modelImagePreview}
            productPreviews={productImagePreviews}
            onProductUpload={handleProductImageUpload}
            onProductRemove={handleProductImageRemove}
            onAddProductSlot={handleAddProductSlot}
            onNext={goToNextStep}
            onBack={goToPrevStep}
            canProceed={canProceedFromUpload}
        />;
      case 3:
        return <Step3_Customize
            theme={theme}
            setTheme={setTheme}
            lighting={lighting}
            setLighting={setLighting}
            scenePrompt={scenePrompt}
            setScenePrompt={setScenePrompt}
            artisticStyle={artisticStyle}
            setArtisticStyle={setArtisticStyle}
            onGenerate={handleGenerate}
            onBack={goToPrevStep}
            isLoading={isLoading}
            generationMode={generationMode}
        />;
      case 4:
        return <ResultDisplay
            lookbook={lookbook}
            isLoading={isLoading}
            error={error}
            onGeneratePrompt={handleGeneratePrompt}
            promptLoadingIndex={promptLoadingIndex}
            generationMode={generationMode}
            onStartOver={resetState}
        />;
      default:
        return null;
    }
  };

  return (
    <>
      {!apiKeysReady ? (
        <ApiKeySetup onKeysReady={handleKeysReady} />
      ) : (
        <div className="bg-[#FEF9E7] min-h-screen flex flex-col font-sans">
          <Header onChangeApiKey={handleChangeApiKey} />
          <main className="flex-grow container max-w-screen-xl mx-auto px-4 py-8 md:py-12">
            <div className="max-w-screen-lg mx-auto flex flex-col items-center space-y-8 md:space-y-12">
              <Stepper steps={STEPS} currentStep={currentStep} />
              {renderStepContent()}
            </div>
          </main>
          <Footer />
        </div>
      )}
    </>
  );
};

export default App;