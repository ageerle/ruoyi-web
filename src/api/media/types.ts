export type MediaType = 'audio' | 'image' | 'video';
export type MediaQueryType = 'prediction' | 'video';

export interface MediaModelOption {
  modelName: string;
  modelDescribe?: string | null;
  providerCode: string;
  supported: boolean;
  queryType?: MediaQueryType | null;
}

export interface MediaGenerationResponse {
  type?: MediaType;
  mimeType?: string;
  url?: string;
  b64Json?: string;
  dataUrl?: string;
  id?: string;
  status?: string;
  lastFrameUrl?: string;
  rawResponse?: string;
}

export interface ImageGenerationDTO {
  model: string;
  prompt: string;
  size?: string;
  seed?: number;
}

export interface VideoGenerationDTO {
  model: string;
  prompt: string;
  size?: string;
  seconds?: number;
  quality?: string;
}

export interface SpeechGenerationDTO {
  model: string;
  input: string;
  voice?: string;
  responseFormat?: string;
  speed?: number;
  instructions?: string;
}
