export enum ModelAbilityEnum {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  SPEECH = 'SPEECH',
}

export interface ModelAbilityMetaItem {
  key: ModelAbilityEnum
  label: string
  icon: string
}

export const ModelAbilityMeta: Record<ModelAbilityEnum, ModelAbilityMetaItem> = {
  [ModelAbilityEnum.IMAGE]: {
    key: ModelAbilityEnum.IMAGE,
    label: '图片理解',
    icon: 'ri:image-line',
  },
  [ModelAbilityEnum.VIDEO]: {
    key: ModelAbilityEnum.VIDEO,
    label: '视频理解',
    icon: 'ri:film-line',
  },
  [ModelAbilityEnum.SPEECH]: {
    key: ModelAbilityEnum.SPEECH,
    label: '语音',
    icon: 'bi:mic',
  },
}; 