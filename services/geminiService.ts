import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse, Part, GenerateImagesResponse } from "@google/genai";
import type { ImageData, Look } from "../types";

// ===== Model Configuration (Free Tier Compatible) =====
// Image generation model — must support responseModalities IMAGE
const IMAGE_MODEL = 'gemini-2.0-flash-exp';
// Text-only model for video prompt generation
const TEXT_MODEL = 'gemini-2.0-flash';
// Max images per generation batch (free tier friendly)
const MAX_IMAGES_PER_BATCH = 3;

// ===== Multi-Key Management =====
let apiKeys: string[] = [];
let currentKeyIndex = 0;
let failedKeys = new Set<string>();

export const setApiKeys = (keys: string[]) => {
  apiKeys = keys.filter(k => k.trim().length > 0);
  currentKeyIndex = 0;
  failedKeys.clear();
};

export const getApiKeys = (): string[] => apiKeys;

const getNextValidKey = (): string => {
  if (apiKeys.length === 0) {
    throw new Error('Belum ada API Key. Silakan masukkan API Key Gemini terlebih dahulu.');
  }

  // Try to find a key that hasn't permanently failed
  for (let i = 0; i < apiKeys.length; i++) {
    const idx = (currentKeyIndex + i) % apiKeys.length;
    if (!failedKeys.has(apiKeys[idx])) {
      currentKeyIndex = idx;
      return apiKeys[idx];
    }
  }

  // All keys failed, reset and try from beginning
  failedKeys.clear();
  currentKeyIndex = 0;
  return apiKeys[0];
};

const markKeyFailed = (key: string) => {
  failedKeys.add(key);
  // Move to next key
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
};

const createAiClient = (apiKey: string): GoogleGenAI => {
  return new GoogleGenAI({ apiKey });
};

// Delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if error is a rate limit / quota / transient error worth retrying
const isRateLimitError = (msg: string): boolean => {
  return msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource exhausted') || msg.includes('429') || msg.includes('too many requests');
};

const isKeyInvalidError = (msg: string): boolean => {
  return msg.includes('api key not valid') || msg.includes('permission denied') || msg.includes('api_key_invalid');
};

// Model not available errors — should not retry or failover
const isModelError = (msg: string): boolean => {
  return (msg.includes('model') && (msg.includes('not found') || msg.includes('not supported'))) || msg.includes('404');
};

// Execute with auto-failover + retry with exponential backoff
const withFailover = async <T>(operation: (ai: GoogleGenAI) => Promise<T>): Promise<T> => {
  let lastError: Error | null = null;
  const MAX_RETRIES_PER_KEY = 4;
  const BASE_DELAY_MS = 15000; // 15 seconds base delay for rate limit (free tier needs longer waits)

  // Try each key
  for (let keyAttempt = 0; keyAttempt < apiKeys.length; keyAttempt++) {
    const key = getNextValidKey();
    const ai = createAiClient(key);

    // Retry loop per key (for rate limit / transient errors)
    for (let retry = 0; retry < MAX_RETRIES_PER_KEY; retry++) {
      try {
        return await operation(ai);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const msg = lastError.message.toLowerCase();

        // Invalid key → mark failed, switch to next key immediately
        if (isKeyInvalidError(msg)) {
          console.warn(`API Key #${keyAttempt + 1} tidak valid, pindah ke key berikutnya...`);
          markKeyFailed(key);
          break; // Exit retry loop, try next key
        }

        // Model not available → throw immediately, no retry
        if (isModelError(msg)) {
          throw new Error(`Model AI tidak tersedia: ${lastError.message}. Pastikan API Key-mu dari Google AI Studio.`);
        }

        // Rate limit → retry with backoff on same key
        if (isRateLimitError(msg)) {
          const waitTime = BASE_DELAY_MS * Math.pow(2, retry); // 5s, 10s, 20s
          console.warn(`Rate limit pada Key #${keyAttempt + 1}, retry ${retry + 1}/${MAX_RETRIES_PER_KEY} setelah ${waitTime / 1000}s...`);
          await delay(waitTime);
          continue; // Retry same key
        }

        // Other errors (safety, content, etc) → don't retry
        throw lastError;
      }
    }

    // If we exhausted retries for this key on rate limit, try next key
    if (lastError && isRateLimitError(lastError.message.toLowerCase())) {
      console.warn(`Key #${keyAttempt + 1} masih rate limited setelah ${MAX_RETRIES_PER_KEY} percobaan, pindah ke key berikutnya...`);
      markKeyFailed(key);
      continue;
    }
  }

  // All keys exhausted
  if (lastError) {
    const msg = lastError.message.toLowerCase();
    if (isKeyInvalidError(msg)) {
      throw new Error('Semua API Key tidak valid. Coba cek atau ganti API Key-mu.');
    }
    if (isRateLimitError(msg)) {
      throw new Error('Semua API Key kena rate limit. Coba tunggu 1-2 menit lalu coba lagi, atau tambah API Key dari akun Google berbeda.');
    }
    throw lastError;
  }
  throw new Error('Tidak ada API Key yang tersedia.');
};

// Run tasks sequentially with delay between each to avoid rate limits
// Returns partial results (successful ones) instead of failing everything
const runSequential = async <T>(tasks: (() => Promise<T>)[], delayBetweenMs: number = 6000): Promise<T[]> => {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i++) {
    try {
      const result = await tasks[i]();
      results.push(result);
    } catch (error) {
      console.warn(`Task ${i + 1}/${tasks.length} gagal:`, error instanceof Error ? error.message : error);
      // If first task fails, throw immediately (likely a permanent error)
      if (i === 0 && results.length === 0) throw error;
      // Otherwise continue with remaining tasks
    }
    // Add delay between requests (not after the last one)
    if (i < tasks.length - 1) {
      await delay(delayBetweenMs);
    }
  }
  return results;
};


const lookPrompts = [
  "in a confident walking pose on a city street, full-body shot.",
  "in a dynamic studio shot with a solid, light-colored background.",
  "in a close-up shot focusing on the details of the fashion item.",
];

const brollPrompts = [
  "in an extreme close-up shot, highlighting the material, texture, and intricate details of the product.",
  "showcased on a geometric pedestal (e.g., marble, wood, or metal) with professional, focused studio lighting that creates elegant shadows.",
  "in a contextually relevant lifestyle scene. The background should logically match the product's category (e.g., a stylish desk for a gadget, a serene bathroom for a cosmetic product).",
];

const posePrompts = [
    "striking a dynamic action pose, as if captured mid-motion.",
    "a powerful, confident stance with hands on hips.",
    "a graceful, elegant pose with arms outstretched or in a dance-like position.",
];

const campaignKitFormats = [
  { name: 'IG Post (Square)', ratio: '1:1', promptSuffix: 'as a clean, minimalist Instagram square post. Centered product. Ample copy space.'},
  { name: 'Story / Reel (Portrait)', ratio: '9:16', promptSuffix: 'as a vibrant, eye-catching Instagram Story. Dynamic composition.'},
  { name: 'Web Banner (Landscape)', ratio: '16:9', promptSuffix: 'as a professional website hero banner. Product on the right, copy space on the left.'},
  { name: 'Ads Banner (Landscape)', ratio: '4:3', promptSuffix: 'as a compelling digital ad banner. Clear lighting, simple background.'},
];

const themeExplorerStyles: { [key: string]: string } = {
  'Cat Air': 'A delicate watercolor painting of the product, with soft washes and subtle color bleeds on textured paper.',
  'Cyberpunk': 'The product in a futuristic, neon-lit cyberpunk city alley, with rain-slicked streets and holographic advertisements.',
  'Komik Vintage': 'The product illustrated in a vintage comic book style, with bold outlines, halftone dot patterns (Ben-Day dots), and a limited, vibrant color palette.',
  'Claymation (Tanah Liat)': 'A charming stop-motion claymation scene featuring the product, with visible fingerprints and a handcrafted aesthetic.',
  'Fantasi Gelap': 'The product in a dark, moody fantasy setting, surrounded by ancient ruins and mystical glowing elements, cinematic lighting.',
  'Seni Pixel': 'A retro 16-bit pixel art representation of the product, as if from a classic video game.',
};


const parseAndThrowEnhancedError = (error: unknown) => {
    console.error("Gemini Service Error:", error);
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('api key not valid')) {
            throw new Error('API Key-mu nggak valid nih. Coba cek lagi ya, atau buat key baru di aistudio.google.com/apikey');
        }
        if (message.includes('permission denied') || message.includes('origin')) {
            throw new Error('Request API-mu diblokir. Coba buat API Key baru tanpa batasan domain di Google Cloud Console.');
        }
        if (message.includes('quota') || message.includes('rate limit') || message.includes('resource exhausted') || message.includes('429')) {
            throw new Error('Kuota API habis. Free tier Gemini punya limit harian. Coba tunggu 1-2 menit, atau buat API Key baru dari akun Google yang berbeda.');
        }
        if (message.includes('model') && (message.includes('not found') || message.includes('not supported'))) {
            throw new Error('Model AI tidak tersedia di API Key kamu. Pastikan kamu pakai API Key dari aistudio.google.com/apikey (bukan Google Cloud biasa).');
        }
        // If the error is one of our custom, more specific errors, just re-throw it
        throw error;
    }
    throw new Error("Gagal nyambung ke layanan AI. Mungkin lagi sibuk atau gambarnya kurang pas.");
}

const processImageEditResponse = (response: GenerateContentResponse): string => {
    if (response.promptFeedback?.blockReason) {
        throw new Error(`Request kamu diblokir sama filter keamanan (${response.promptFeedback.blockReason}). Coba pakai gambar atau tema lain ya.`);
    }

    if (!response.candidates || response.candidates.length === 0) {
        throw new Error("AI-nya nggak ngasih respons. Coba lagi nanti ya.");
    }

    const candidate = response.candidates[0];
    const finishReason = candidate.finishReason;

    if (finishReason && finishReason !== 'STOP' && finishReason !== 'FINISH_REASON_UNSPECIFIED') {
        if (finishReason === 'SAFETY') {
            const blockedCategory = candidate.safetyRatings?.find(r => r.blocked)?.category;
            if (blockedCategory) {
                 throw new Error(`Gambarmu diblokir karena kebijakan keamanan soal: ${blockedCategory}. Coba pakai gambar atau prompt lain.`);
            }
            throw new Error("Gambarnya nggak bisa dibuat karena melanggar kebijakan keamanan. Coba pakai gambar atau prompt lain ya.");
        }
        throw new Error(`Prosesnya berhenti karena: ${finishReason}. Coba lagi atau ganti input-mu.`);
    }

    if (candidate.content && candidate.content.parts) {
        const imagePart = candidate.content.parts.find(part => part.inlineData?.data);
        if (imagePart?.inlineData) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
        
        const textPart = candidate.content.parts.find(part => part.text);
        if (textPart?.text) {
            const truncatedText = textPart.text.length > 150 ? `${textPart.text.substring(0, 150)}...` : textPart.text;
            throw new Error(`AI-nya malah ngasih teks, bukan gambar: "${truncatedText}". Coba ganti tema atau gambarmu.`);
        }
    }

    throw new Error("Model AI nggak ngasih gambar yang valid. Mungkin kena filter keamanan internal. Coba lagi pakai gambar lain.");
}

// FIX: Removed promptFeedback check as it does not exist on type GenerateImagesResponse.
const processImageGenResponse = (response: GenerateImagesResponse): string => {
    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Model AI tidak menghasilkan gambar. Mungkin prompt Anda diblokir karena alasan keamanan. Coba lagi dengan prompt atau gambar yang berbeda.");
    }
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};


const generateSingleLook = async (
  modelImage: ImageData,
  productImages: ImageData[],
  stylePrompt: string,
  theme: string,
  lighting: string
): Promise<string> => {
    
  let promptSegment = "wearing the main fashion item from the second image";
  if (productImages.length > 1) {
      promptSegment += " and the accessories from the subsequent images";
  }

  const prompt = `Create a new, photorealistic image of the model from the first image ${promptSegment} ${stylePrompt}. The photoshoot theme is '${theme}' with '${lighting}'. The overall style should be suitable for a high-end fashion lookbook. The background must match the theme.`;

  const modelImagePart: Part = {
    inlineData: { data: modelImage.base64, mimeType: modelImage.mimeType },
  };

  const textPart: Part = { text: prompt };

  const productImageParts: Part[] = productImages.map(image => ({
    inlineData: { data: image.base64, mimeType: image.mimeType },
  }));

  const parts: Part[] = [modelImagePart, textPart, ...productImageParts];

  return withFailover(async (ai) => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
        imageConfig: {
          aspectRatio: "9:16"
        }
      },
    });

    return processImageEditResponse(response);
  });
};


export const generateLookbook = async (
  modelImage: ImageData,
  productImages: ImageData[],
  theme: string,
  lighting: string
): Promise<string[]> => {
  try {
    const tasks = lookPrompts.map(style => 
      () => generateSingleLook(modelImage, productImages, style, theme, lighting)
    );
    
    const imageUrls = await runSequential(tasks);
    
    return imageUrls.filter(url => !!url);

  } catch (error) {
    parseAndThrowEnhancedError(error);
    return []; 
  }
};

const generateSingleBrollShot = async (
  productImage: ImageData,
  stylePrompt: string,
  theme: string,
  lighting: string
): Promise<string> => {
  const prompt = `Generate a new, photorealistic B-roll image of ONLY the product from the provided image. The generated background and props MUST be logically appropriate for the product category (e.g., a handbag on a stylish table, not in a forest). Now, apply this specific style: ${stylePrompt}. The photoshoot theme is '${theme}' with '${lighting}'. The overall style should be suitable for a high-end product showcase. Do NOT include any people or models in the image.`;
  
  const productImagePart: Part = {
    inlineData: { data: productImage.base64, mimeType: productImage.mimeType },
  };
  
  const textPart: Part = { text: prompt };

  return withFailover(async (ai) => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [productImagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
        imageConfig: {
          aspectRatio: "9:16"
        }
      },
    });

    return processImageEditResponse(response);
  });
};

export const generateBroll = async (
  productImage: ImageData,
  theme: string,
  lighting: string
): Promise<string[]> => {
  try {
    const tasks = brollPrompts.map(style => 
      () => generateSingleBrollShot(productImage, style, theme, lighting)
    );
    
    const imageUrls = await runSequential(tasks);
    
    return imageUrls.filter(url => !!url);

  } catch (error) {
    parseAndThrowEnhancedError(error);
    return [];
  }
};

const generateSinglePose = async (
  modelImage: ImageData,
  stylePrompt: string,
  theme: string,
  lighting: string
): Promise<string> => {
  const prompt = `Recreate the exact same model from the image, wearing the same clothes in the same environment. The only thing that should change is their pose. The new pose should be: ${stylePrompt}. The photoshoot theme is '${theme}' with '${lighting}'. Maintain photorealism and consistency with the original image.`;
  
  const modelImagePart: Part = {
    inlineData: { data: modelImage.base64, mimeType: modelImage.mimeType },
  };

  const textPart: Part = { text: prompt };

  return withFailover(async (ai) => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [modelImagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
        imageConfig: {
          aspectRatio: "9:16"
        }
      },
    });

    return processImageEditResponse(response);
  });
};

export const generatePoses = async (
  modelImage: ImageData,
  theme: string,
  lighting: string
): Promise<string[]> => {
  try {
    const tasks = posePrompts.map(style => 
      () => generateSinglePose(modelImage, style, theme, lighting)
    );
    
    const imageUrls = await runSequential(tasks);
    
    return imageUrls.filter(url => !!url);

  } catch (error) {
    parseAndThrowEnhancedError(error);
    return [];
  }
};

export const generateScene = async (
  subjectImage: ImageData,
  scenePrompt: string
): Promise<string[]> => {
  try {
    if (!scenePrompt) {
      throw new Error("Scene prompt tidak boleh kosong.");
    }

    const numImages = Math.min(MAX_IMAGES_PER_BATCH, 2);
    const tasks = Array(numImages).fill(0).map((_, i) => () => {
      const prompt = `Create a photorealistic image placing the main subject from the provided image into the following scene: "${scenePrompt}". Ensure the lighting, shadows, and perspective on the subject are perfectly blended with the new background. Introduce a slight variation in composition or angle for version ${i + 1}.`;
      
      const imagePart: Part = {
        inlineData: { data: subjectImage.base64, mimeType: subjectImage.mimeType },
      };
      const textPart: Part = { text: prompt };

      return withFailover(async (ai) => {
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: IMAGE_MODEL,
          contents: { parts: [imagePart, textPart] },
          config: { 
            responseModalities: [Modality.IMAGE, Modality.TEXT],
            imageConfig: {
              aspectRatio: "9:16"
            } 
          },
        });
        return processImageEditResponse(response);
      });
    });

    const imageUrls = await runSequential(tasks);
    return imageUrls.filter(url => !!url);
  } catch (error) {
    parseAndThrowEnhancedError(error);
    return [];
  }
};

export const generateCampaignKit = async (
  productImage: ImageData,
  theme: string,
  lighting: string
): Promise<Look[]> => {
  try {
    const tasks = campaignKitFormats.map((format) => () => {
      const prompt = `Generate a new, photorealistic image of ONLY the product from the provided image. Photoshoot theme: '${theme}', lighting: '${lighting}'. The overall style should be suitable for a high-end product showcase. Now, format it ${format.promptSuffix}`;
      
      const imagePart: Part = {
        inlineData: { data: productImage.base64, mimeType: productImage.mimeType },
      };
      const textPart: Part = { text: prompt };

      return withFailover(async (ai) => {
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: IMAGE_MODEL,
          contents: { parts: [imagePart, textPart] },
          config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
            imageConfig: {
              aspectRatio: format.ratio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
            }
          },
        });
        const imageUrl = processImageEditResponse(response);
        return { imageUrl, videoPrompt: null, name: format.name, ratio: format.ratio };
      });
    });

    const results = await runSequential(tasks);
    return results.filter(look => !!look.imageUrl);
  } catch (error) {
    parseAndThrowEnhancedError(error);
    return [];
  }
};

// FIX: Switched from generateImages to generateContent for image-to-image tasks. This resolves the error from passing an 'image' parameter and checking for 'promptFeedback'. Looping to generate multiple images.
export const generateThemeExploration = async (
  productImage: ImageData,
  artisticStyle: string
): Promise<string[]> => {
  try {
    const stylePrompt = themeExplorerStyles[artisticStyle];
    if (!stylePrompt) {
      throw new Error("Gaya artistik tidak valid.");
    }
    
    const numImages = Math.min(MAX_IMAGES_PER_BATCH, 2);
    const tasks = Array(numImages).fill(0).map((_, i) => () => {
      const prompt = `Recreate the provided image in this artistic style: "${stylePrompt}". Introduce a slight variation for version ${i + 1}.`;
      
      const imagePart: Part = {
        inlineData: { data: productImage.base64, mimeType: productImage.mimeType },
      };
      const textPart: Part = { text: prompt };

      return withFailover(async (ai) => {
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: IMAGE_MODEL,
          contents: { parts: [imagePart, textPart] },
          config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
            imageConfig: {
              aspectRatio: "1:1"
            }
          },
        });
        return processImageEditResponse(response);
      });
    });

    const imageUrls = await runSequential(tasks);
    return imageUrls.filter(url => !!url);

  } catch (error) {
    parseAndThrowEnhancedError(error);
    return [];
  }
};


export const generateVideoPrompt = async (
    image: ImageData,
    theme: string,
    lighting: string
): Promise<string> => {
    try {
        const prompt = `You are a creative director for a fashion video shoot. Look at this image, which has a theme of '${theme}' and '${lighting}' lighting. Write a short, concise, and dynamic prompt for an Image-to-Video AI model like VEO or Kling. The prompt should describe a subtle movement or action that feels natural to the scene and showcases the product. Output a single sentence only. Do not describe what is already in the image, only describe the action.`;
        
        const imagePart: Part = {
            inlineData: { data: image.base64, mimeType: image.mimeType },
        };
        const textPart: Part = { text: prompt };

        return withFailover(async (ai) => {
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: TEXT_MODEL,
                contents: {
                    parts: [imagePart, textPart],
                },
            });

            if (response.promptFeedback?.blockReason) {
                 throw new Error(`Request prompt video kamu diblokir sama filter keamanan (${response.promptFeedback.blockReason}).`);
            }

            const videoPrompt = response.text?.trim();

            if (!videoPrompt) {
                const candidate = response.candidates?.[0];
                if (candidate?.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'FINISH_REASON_UNSPECIFIED') {
                    throw new Error(`Pembuatan prompt video berhenti karena: ${candidate.finishReason}.`);
                }
                throw new Error("AI gagal membuat prompt video. Responsnya kosong nih.");
            }
            return videoPrompt;
        });

    } catch (error) {
        parseAndThrowEnhancedError(error);
        return "";
    }
};