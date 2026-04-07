// 组件导出入口
// 后续添加自定义组件时从此处导出
import { createElement, type ComponentType } from 'react'
import { Button as TaroifyButton, Input as TaroifyInput } from '@taroify/core'
import type { ButtonProps } from '@taroify/core/button'
import type { InputProps } from '@taroify/core/input'
import '@taroify/core/button/style'
import '@taroify/core/input/style'

const ButtonComponent = TaroifyButton as unknown as ComponentType<ButtonProps>
const InputComponent = TaroifyInput as unknown as ComponentType<InputProps>

export function Button(props: ButtonProps) {
  return createElement(ButtonComponent, props)
}

export function Input(props: InputProps) {
  return createElement(InputComponent, props)
}

// 自定义组件
export { VoiceInput } from './voice-input'
export type { VoiceInputProps, VoiceInputStatus } from './voice-input'

export { ChatMessage } from './chat-message'
export type { ChatMessageProps, ChatMessageData, MessageRole } from './chat-message'
