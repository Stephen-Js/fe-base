// babel-preset-taro 已经包含了对 JSX 和 TypeScript 的支持
// 但需要在项目中显式配置
module.exports = {
  presets: [
    [
      'taro',
      {
        framework: 'react',
        ts: true,
      },
    ],
  ],
}
