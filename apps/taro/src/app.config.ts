export default defineAppConfig({
  pages: ['pages/index/index', 'pages/chat/index'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'fe-base',
    navigationBarTextStyle: 'black',
  },
})

function defineAppConfig(config: Record<string, unknown>) {
  return config
}
