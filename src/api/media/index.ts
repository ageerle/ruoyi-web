import type {
  ImageGenerationDTO,
  MediaGenerationResponse,
  MediaModelOption,
  MediaType,
  SpeechGenerationDTO,
  VideoGenerationDTO,
} from './types';
import { get, post } from '@/utils/request';
import { readMediaApiResult } from './response';

export function getMediaModels(category: MediaType) {
  return readMediaApiResult<MediaModelOption[]>(get<MediaModelOption[]>('/media/models', { category }).json());
}

export function generateImage(data: ImageGenerationDTO) {
  return readMediaApiResult<MediaGenerationResponse>(post<MediaGenerationResponse>('/media/image', data, { timeout: 180000 }).json());
}

export function generateVideo(data: VideoGenerationDTO) {
  return readMediaApiResult<MediaGenerationResponse>(post<MediaGenerationResponse>('/media/video', data, { timeout: 180000 }).json());
}

export function generateSpeech(data: SpeechGenerationDTO) {
  return readMediaApiResult<MediaGenerationResponse>(post<MediaGenerationResponse>('/media/speech', data, { timeout: 180000 }).json());
}

export function getPrediction(params: { model: string; predictionId: string }) {
  return readMediaApiResult<MediaGenerationResponse>(get<MediaGenerationResponse>('/media/prediction', params, { timeout: 30000 }).json());
}

export function getVideoResult(params: { model: string; videoId: string }) {
  return readMediaApiResult<MediaGenerationResponse>(get<MediaGenerationResponse>('/media/video', params, { timeout: 30000 }).json());
}
