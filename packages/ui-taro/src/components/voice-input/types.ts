// 语音输入组件类型定义

export const VoiceInputStatus = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
} as const

export type VoiceInputStatus = typeof VoiceInputStatus[keyof typeof VoiceInputStatus]

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

export interface VoiceInputRef {
  /** 开始录音 */
  start: () => Promise<void>
  /** 停止录音 */
  stop: () => Promise<void>
  /** 当前状态 */
  status: VoiceInputStatus
}
