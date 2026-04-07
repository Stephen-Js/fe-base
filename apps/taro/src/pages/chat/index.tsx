// AI 对话页面
import { View, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useRef, useEffect } from 'react'
import { Button, Input } from '@repo/ui-taro/components'
import { VoiceInput } from '../../components/voice-input'
import { ChatMessage } from '../../components/chat-message'
import { useStreamChat } from '../../hooks/use-stream-chat'
import './index.scss'

export default function ChatPage() {
  const { messages, isStreaming, sendMessage, clearMessages } = useStreamChat({ charDelay: 30 })
  const [textInput, setTextInput] = useState('')
  const scrollViewRef = useRef<string>('')

  // 消息更新时滚动到底部
  useEffect(() => {
    scrollViewRef.current = `msg-${messages.length - 1}`
  }, [messages.length])

  // 语音识别结果
  const handleVoiceResult = (text: string) => {
    sendMessage(text)
  }

  // 文字输入发送
  const handleSend = () => {
    if (textInput.trim() && !isStreaming) {
      sendMessage(textInput.trim())
      setTextInput('')
    }
  }

  // 返回首页
  const handleBack = () => {
    Taro.navigateTo({ url: '/pages/index/index' })
  }

  return (
    <View className="chat-page">
      {/* 顶部导航 */}
      <View className="chat-page__header">
        <View className="chat-page__back" onClick={handleBack}>
          ← 返回
        </View>
        <View className="chat-page__title">AI 助手</View>
        <View className="chat-page__actions">
          <View className="chat-page__clear" onClick={clearMessages}>
            清空
          </View>
        </View>
      </View>

      {/* 消息列表 */}
      <ScrollView
        className="chat-page__messages"
        scrollY
        scrollIntoView={scrollViewRef.current}
        scrollWithAnimation
      >
        {messages.length === 0 && (
          <View className="chat-page__empty">
            <View className="chat-page__empty-icon">💬</View>
            <View className="chat-page__empty-text">
              欢迎使用 AI 助手{'\n'}
              点击下方按钮开始对话
            </View>
            <View className="chat-page__tips">
              <View className="chat-page__tips-title">试试问我：</View>
              <View className="chat-page__tips-item" onClick={() => sendMessage('今天天气怎么样？')}>
                • 今天天气怎么样？
              </View>
              <View className="chat-page__tips-item" onClick={() => sendMessage('什么是人工智能？')}>
                • 什么是人工智能？
              </View>
              <View className="chat-page__tips-item" onClick={() => sendMessage('帮我写一首诗')}>
                • 帮我写一首诗
              </View>
            </View>
          </View>
        )}
        {messages.map((msg, idx) => (
          <View key={msg.id} id={`msg-${idx}`}>
            <ChatMessage
              message={msg}
              isTyping={isStreaming && idx === messages.length - 1 && msg.role === 'assistant'}
            />
          </View>
        ))}
      </ScrollView>

      {/* 底部输入区 */}
      <View className="chat-page__input">
        <View className="chat-page__input-row">
          <Input
            className="chat-page__text-input"
            value={textInput}
            onChange={(event) => setTextInput(event.detail.value)}
            placeholder="输入消息..."
            disabled={isStreaming}
            onConfirm={handleSend}
          />
          <Button
            color="primary"
            size="small"
            onClick={handleSend}
            disabled={!textInput.trim() || isStreaming}
          >
            发送
          </Button>
        </View>
        <VoiceInput
          onResult={handleVoiceResult}
          onError={(err: Error) => Taro.showToast({ title: err.message, icon: 'none' })}
          disabled={isStreaming}
        />
      </View>
    </View>
  )
}
