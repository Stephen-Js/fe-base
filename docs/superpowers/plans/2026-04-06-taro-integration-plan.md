# Taro 集成实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 fe-base monorepo 中集成 Taro 应用，支持微信小程序 + H5 双端输出，复用现有共享包。

**Architecture:** Taro 应用独立使用 React 18 依赖树，通过 pnpm workspace 复用 `@repo/api`、`@repo/store`、`@repo/types`、`@repo/services` 等无 DOM 依赖的包。新建 `@repo/ui-taro` 作为 Taro 端 UI 组件包。

**Tech Stack:** Taro 4.x, React 18.3, NutUI, pnpm workspace, Turborepo

---

## File Structure

```
apps/taro/                           # 新建 Taro 应用
├── src/
│   ├── pages/
│   │   └── index/
│   │       ├── index.tsx
│   │       └── index.config.ts
│   ├── hooks/                       # Taro 专属 hooks
│   ├── app.config.ts
│   ├── app.tsx
│   └── app.scss
├── config/
│   └── index.ts
├── project.config.json
├── package.json
└── tsconfig.json

packages/ui-taro/                    # 新建 Taro UI 组件包
├── src/
│   ├── components/
│   │   └── index.ts
│   └── index.ts
├── package.json
└── tsconfig.json

# 修改的文件
package.json                         # 添加 taro 相关脚本
turbo.json                           # 添加 taro 构建任务
```

---

## Task 1: 创建 @repo/ui-taro 包

**Files:**
- Create: `packages/ui-taro/package.json`
- Create: `packages/ui-taro/tsconfig.json`
- Create: `packages/ui-taro/src/index.ts`
- Create: `packages/ui-taro/src/components/index.ts`

- [ ] **Step 1: 创建包目录和 package.json**

```json
{
  "name": "@repo/ui-taro",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    },
    "./components": {
      "types": "./src/components/index.ts",
      "import": "./src/components/index.ts"
    }
  },
  "scripts": {
    "type-check": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@nutui/nutui-react-taro": "^2.7.0",
    "@tarojs/components": "^4.0.0",
    "@tarojs/taro": "^4.0.0",
    "@repo/types": "workspace:*",
    "@repo/utils": "workspace:*"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/react": "^18.3.0",
    "react": "^18.3.1",
    "typescript": "^5.7.2"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "@tarojs/taro": ">=3.0.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022"],
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: 创建 src/index.ts 入口文件**

```typescript
// @repo/ui-taro 入口文件
// 导出 NutUI 组件和自定义组件
export * from './components'
```

- [ ] **Step 4: 创建 src/components/index.ts 组件入口**

```typescript
// 组件导出入口
// 后续添加自定义组件时从此处导出

// 重新导出 NutUI 常用组件
export * from '@nutui/nutui-react-taro'
```

- [ ] **Step 5: Commit**

```bash
git add packages/ui-taro/
git commit -m "feat: add @repo/ui-taro package for Taro UI components"
```

---

## Task 2: 创建 apps/taro 应用

**Files:**
- Create: `apps/taro/package.json`
- Create: `apps/taro/tsconfig.json`
- Create: `apps/taro/config/index.ts`
- Create: `apps/taro/project.config.json`
- Create: `apps/taro/src/app.tsx`
- Create: `apps/taro/src/app.config.ts`
- Create: `apps/taro/src/app.scss`
- Create: `apps/taro/src/pages/index/index.tsx`
- Create: `apps/taro/src/pages/index/index.config.ts`

- [ ] **Step 1: 创建 apps/taro/package.json**

```json
{
  "name": "@repo/taro",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev:weapp": "taro build --type weapp --watch",
    "dev:h5": "taro build --type h5 --watch",
    "build:weapp": "taro build --type weapp",
    "build:h5": "taro build --type h5",
    "type-check": "tsc --noEmit",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@nutui/nutui-react-taro": "^2.7.0",
    "@tarojs/components": "^4.0.0",
    "@tarojs/helper": "^4.0.0",
    "@tarojs/plugin-framework-react": "^4.0.0",
    "@tarojs/plugin-platform-weapp": "^4.0.0",
    "@tarojs/plugin-platform-h5": "^4.0.0",
    "@tarojs/react": "^4.0.0",
    "@tarojs/runtime": "^4.0.0",
    "@tarojs/shared": "^4.0.0",
    "@tarojs/taro": "^4.0.0",
    "@repo/api": "workspace:*",
    "@repo/services": "workspace:*",
    "@repo/store": "workspace:*",
    "@repo/types": "workspace:*",
    "@repo/ui-taro": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@babel/core": "^7.27.0",
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@tarojs/cli": "^4.0.0",
    "@types/react": "^18.3.0",
    "sass": "^1.77.0",
    "typescript": "^5.7.2",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: 创建 tsconfig.json**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022"],
    "types": ["node"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "config/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: 创建 config/index.ts 构建配置**

```typescript
import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import devConfig from './dev'
import prodConfig from './prod'

// https://taro-docs.jd.com/docs/nextjs#%E4%BF%AE%E6%94%B9-taro-%E9%A1%B9%E7%9B%AE%E9%85%8D%E7%BD%AE
export default defineConfig(async (env, { envMode }) => {
  const config: UserConfigExport = {
    projectName: 'taro',
    date: '2026-4-6',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-html'],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {}
    },
    framework: 'react',
    compiler: {
      type: 'webpack5',
      prebundle: { enable: false }
    },
    cache: {
      enable: false
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin, [
          {
            configFile: './tsconfig.json'
          }
        ])
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin, [
          {
            configFile: './tsconfig.json'
          }
        ])
      }
    }
  }
  
  return envMode === 'development' ? { ...config, ...devConfig } : { ...config, ...prodConfig }
})
```

- [ ] **Step 4: 创建 config/dev.ts 开发配置**

```typescript
export default {
  mini: {},
  h5: {}
}
```

- [ ] **Step 5: 创建 config/prod.ts 生产配置**

```typescript
export default {
  mini: {},
  h5: {
    /**
     * WebpackChain 插件已经禁用了 publicPath 配置，需要额外配置 publicPath
     */
    publicPath: './'
  }
}
```

- [ ] **Step 6: 创建 project.config.json 微信小程序配置**

```json
{
  "miniprogramRoot": "dist/",
  "projectname": "fe-base-taro",
  "description": "fe-base taro application",
  "appid": "wx0000000000000000",
  "setting": {
    "urlCheck": false,
    "es6": false,
    "enhance": false,
    "postcss": false,
    "preloadBackgroundData": false,
    "minified": false,
    "newFeature": false,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInDebug": false,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "useIsolateContext": true,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "showES6CompileOption": false,
    "minifyWXML": true
  },
  "compileType": "miniprogram",
  "condition": {}
}
```

- [ ] **Step 7: 创建 src/app.tsx 应用入口**

```tsx
import { Component } from 'react'
import './app.scss'

class App extends Component {
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App
```

- [ ] **Step 8: 创建 src/app.config.ts 应用配置**

```typescript
export default defineAppConfig({
  pages: [
    'pages/index/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'fe-base',
    navigationBarTextStyle: 'black'
  }
})

function defineAppConfig(config: any) {
  return config
}
```

- [ ] **Step 9: 创建 src/app.scss 全局样式**

```scss
// 全局样式
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
}
```

- [ ] **Step 10: 创建 src/pages/index/index.tsx 首页**

```tsx
import { View, Text } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import { useAuthStore } from '@repo/store'
import './index.scss'

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
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
        <Button type="primary">开始使用</Button>
      </View>
    </View>
  )
}
```

- [ ] **Step 11: 创建 src/pages/index/index.scss 页面样式**

```scss
.index {
  padding: 40px;
  
  &__header {
    text-align: center;
    margin-bottom: 40px;
  }
  
  &__title {
    display: block;
    font-size: 36px;
    font-weight: bold;
    color: #333;
  }
  
  &__subtitle {
    display: block;
    font-size: 28px;
    color: #666;
    margin-top: 16px;
  }
  
  &__content {
    padding: 40px 0;
    text-align: center;
  }
  
  &__actions {
    margin-top: 40px;
  }
}
```

- [ ] **Step 12: 创建 src/pages/index/index.config.ts 页面配置**

```typescript
export default definePageConfig({
  navigationBarTitleText: '首页'
})

function definePageConfig(config: any) {
  return config
}
```

- [ ] **Step 13: 创建 src/hooks 目录占位**

```typescript
// apps/taro/src/hooks/index.ts
// Taro 专属 hooks
// 复用 @repo/hooks 中的纯逻辑，在此处理跳转

export * from './use-auth-guard'
```

- [ ] **Step 14: 创建 src/hooks/use-auth-guard.ts**

```typescript
import { useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@repo/store'

type AuthGuardMode = 'protected' | 'guest'

type UseAuthGuardOptions = {
  mode: AuthGuardMode
  protectedRedirectTo?: string
  guestRedirectTo?: string
}

/**
 * 解析认证守卫重定向目标（纯逻辑，可复用）
 */
export function resolveAuthGuardRedirect(
  mode: AuthGuardMode,
  isAuthenticated: boolean,
  isHydrated: boolean
): string | null {
  if (!isHydrated) {
    return null
  }

  if (mode === 'protected' && !isAuthenticated) {
    return '/pages/login/index'
  }

  if (mode === 'guest' && isAuthenticated) {
    return '/pages/index/index'
  }

  return null
}

/**
 * Taro 认证守卫 Hook
 * 注意：使用 Taro 路由 API，不依赖 next/navigation
 */
export function useAuthGuard({
  mode,
  protectedRedirectTo = '/pages/login/index',
  guestRedirectTo = '/pages/index/index',
}: UseAuthGuardOptions) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])

  useEffect(() => {
    const target = resolveAuthGuardRedirect(mode, isAuthenticated, isHydrated)

    if (target) {
      const redirectUrl = target === '/pages/login/index' 
        ? protectedRedirectTo 
        : guestRedirectTo
      
      Taro.redirectTo({ url: redirectUrl })
    }
  }, [mode, isAuthenticated, isHydrated, protectedRedirectTo, guestRedirectTo])

  return {
    isAuthenticated,
    isHydrated,
  }
}
```

- [ ] **Step 15: Commit**

```bash
git add apps/taro/
git commit -m "feat: add Taro application with weapp and h5 support"
```

---

## Task 3: 更新根配置

**Files:**
- Modify: `package.json`
- Modify: `turbo.json`

- [ ] **Step 1: 更新根 package.json 添加 Taro 脚本**

在 `scripts` 中添加：

```json
{
  "scripts": {
    "dev:taro": "pnpm --filter @repo/taro dev:weapp",
    "dev:taro:h5": "pnpm --filter @repo/taro dev:h5",
    "build:taro": "pnpm --filter @repo/taro build:weapp",
    "build:taro:h5": "pnpm --filter @repo/taro build:h5"
  }
}
```

- [ ] **Step 2: 更新 turbo.json 添加 Taro 任务**

```json
{
  "tasks": {
    "build:weapp": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "build:h5": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json turbo.json
git commit -m "feat: add taro build scripts to root config"
```

---

## Task 4: 安装依赖并验证

**Files:**
- 无新增文件

- [ ] **Step 1: 安装依赖**

```bash
pnpm install
```

Expected: 安装成功，无 peer dependency 冲突错误

- [ ] **Step 2: 类型检查 ui-taro 包**

```bash
pnpm --filter @repo/ui-taro type-check
```

Expected: 通过

- [ ] **Step 3: 类型检查 taro 应用**

```bash
pnpm --filter @repo/taro type-check
```

Expected: 通过

- [ ] **Step 4: 构建微信小程序**

```bash
pnpm --filter @repo/taro build:weapp
```

Expected: 构建成功，生成 `apps/taro/dist/` 目录

- [ ] **Step 5: 验证构建产物**

检查 `apps/taro/dist/` 目录下是否生成微信小程序文件：
- `app.js`
- `app.json`
- `app.wxss`
- `pages/index/index.js`
- `pages/index/index.json`
- `pages/index/index.wxml`
- `pages/index/index.wxss`

Expected: 文件存在

---

## Task 5: 添加 .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: 更新 .gitignore 添加 Taro 构建产物**

在 `.gitignore` 中添加：

```gitignore
# Taro
apps/taro/dist/
apps/taro/node_modules/
apps/taro/.temp/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add taro dist to gitignore"
```

---

## Verification Checklist

- [ ] `pnpm install` 无错误
- [ ] `@repo/ui-taro` 类型检查通过
- [ ] `@repo/taro` 类型检查通过
- [ ] 微信小程序构建成功
- [ ] H5 构建成功（可选）
- [ ] 构建产物正确生成

---

## Notes

1. **React 版本隔离**：Taro 应用使用 React 18，与主项目的 React 19 隔离。pnpm workspace 会正确处理版本依赖。

2. **复用的包**：
   - `@repo/api` ✅ 无 React 依赖
   - `@repo/store` ✅ zustand 宽松 peer
   - `@repo/types` ✅ 纯类型
   - `@repo/services` ✅ 无 React 依赖
   - `@repo/utils` ⚠️ 有 tailwind-merge，小程序端样式处理需注意

3. **不复用的包**：
   - `@repo/hooks` ❌ 依赖 `next/navigation`
   - `@repo/ui` ❌ DOM 依赖

4. **演进路径**：监控 [Taro React 19 Issue](https://github.com/NervJS/taro/issues/16996)，待支持后可升级并完整复用 `@repo/hooks`。
