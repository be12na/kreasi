export interface ImageData {
  base64: string;
  mimeType: string;
}

export interface Look {
  imageUrl: string;
  videoPrompt: string | null;
  name?: string;
  ratio?: string;
}
