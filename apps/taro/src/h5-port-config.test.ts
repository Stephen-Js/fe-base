import { describe, expect, it } from 'vitest'
import devConfig from '../config/dev'

describe('taro h5 dev config', () => {
  it('locks the h5 port to 10086 with strict port mode', () => {
    expect(devConfig.h5).toMatchObject({
      devServer: {
        port: 10086,
        strictPort: true,
      },
    })
  })
})
