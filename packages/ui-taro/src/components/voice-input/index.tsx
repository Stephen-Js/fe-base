// 语音输入组件
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useRef, useCallback } from 'react'
import { VoiceInputProps, VoiceInputStatus } from './types'
import './index.scss'

// Mock 语音识别结果
const MOCK_VOICE_RESULTS = [
  '今天天气怎么样？',
  '帮我写一首诗',
  '什么是人工智能？',
  '给我讲个笑话',
  '如何学习编程？',
]

export function VoiceInput({
  onResult,
  onIntermediateResult,
  onError,
  disabled = false,
  className = '',
}: VoiceInputProps) {
  const [status, setStatus] = useState<VoiceInputStatus>('idle')
  const [intermediateText, setIntermediateText] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mockTextRef = useRef('')

  // 清理定时器
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // 开始录音（Mock）
  const startRecording = async () => {
    if (disabled || status !== 'idle') return

    try {
      // 请求录音权限（Mock 模式下仍需要权限体验）
      const authSetting = await Taro.getSetting()
      if (authSetting.authSetting['scope.record'] === false) {
        await Taro.authorize({ scope: 'scope.record' })
      }

      setStatus('recording')
      setIntermediateText('')
      
      // 随机选择一个 Mock 结果
      const randomIndex = Math.floor(Math.random() * MOCK_VOICE_RESULTS.length)
      mockTextRef.current = MOCK_VOICE_RESULTS[randomIndex] ?? '你好'
      
      // 模拟实时识别效果：逐字显示
      let charIndex = 0
      timerRef.current = setInterval(() => {
        if (charIndex < mockTextRef.current.length) {
          const partialText = mockTextRef.current.slice(0, charIndex + 1)
          setIntermediateText(partialText)
          onIntermediateResult?.(partialText)
          charIndex++
        }
      }, 100)

    } catch (err) {
      setStatus('idle')
      onError?.(new Error('请授权录音权限'))
    }
  }

  // 停止录音（Mock）
  const stopRecording = async () => {
    if (status !== 'recording') return

    clearTimer()
    setStatus('processing')
    setIntermediateText('')

    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    // 返回最终结果
    onResult(mockTextRef.current)
    setStatus('idle')
  }

  return (
    <View className={`voice-input ${className}`}>
      <View
        className={`voice-input__btn ${status === 'recording' ? 'recording' : ''} ${disabled ? 'disabled' : ''}`}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        onTouchCancel={stopRecording}
      >
        {status === 'idle' && (
          <View className="voice-input__content">
            <Text className="voice-input__icon">🎤</Text>
            <Text className="voice-input__text">按住说话</Text>
          </View>
        )}
        {status === 'recording' && (
          <View className="voice-input__content">
            <Text className="voice-input__icon pulse">🔴</Text>
            <Text className="voice-input__text">松开发送</Text>
            {intermediateText && (
              <Text className="voice-input__preview">{intermediateText}</Text>
            )}
          </View>
        )}
        {status === 'processing' && (
          <View className="voice-input__content">
            <Text className="voice-input__icon">⏳</Text>
            <Text className="voice-input__text">识别中...</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export type { VoiceInputProps, VoiceInputStatus } from './types'
