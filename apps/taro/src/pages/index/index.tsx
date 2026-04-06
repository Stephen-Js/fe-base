import { Button } from '@nutui/nutui-react-taro'
import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function Index() {
  // TODO: 等 Taro 配置完善后，启用 @repo/store
  const isAuthenticated = false

  // 跳转到 AI 对话页面
  const goToChat = () => {
    Taro.navigateTo({ url: '/pages/chat/index' })
  }

  return (
    <View className="index">
      <View className="index__header">
        <Text className="index__title">fe-base Taro</Text>
        <Text className="index__subtitle">微信小程序 + H5</Text>
      </View>

      <View className="index__content">
        <Text>认证状态: {isAuthenticated ? '已登录' : '未登录'}</Text>
      </View>

      <View className="index__actions">
        <Button type="primary" onClick={goToChat}>
          AI 对话
        </Button>
      </View>
    </View>
  )
}
