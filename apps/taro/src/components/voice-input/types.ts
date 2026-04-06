// 语音输入组件类型定义

export const VoiceInputStatus = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
} as const

export type VoiceInputStatusType = typeof VoiceInputStatus[keyof typeof VoiceInputStatus]

export interface VoiceInputProps {
  /** 识别完成回调 */
  onResult: (text: string) => void
  /** 中间结果回调（实时识别时触发） */
  onIntermediateResult?: (text: string) => void
  /** 错误回调 */
  onError?: (error: Error) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  className?: string
}
