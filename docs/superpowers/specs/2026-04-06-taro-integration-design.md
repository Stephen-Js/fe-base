# Taro 集成设计文档

## 概述

在现有 fe-base monorepo 项目中集成 Taro，新增微信小程序 + H5 应用入口，实现跨端代码复用。

## 目标

- 支持微信小程序 + H5 双端输出
- 最大化复用现有共享包
- 预留多端扩展空间（支付宝、抖音等）

## 约束

### 技术约束

1. **React 版本冲突**：Taro 目前不支持 React 19（[GitHub Issue #16996](https://github.com/NervJS/taro/issues/16996)），需采用独立依赖树策略
2. **路由系统不兼容**：Taro 使用自有路由系统，无法使用 Next.js 的 `next/navigation`
3. **UI 组件不互通**：`@repo/ui` (shadcn/Radix) 有 DOM 依赖，无法用于小程序

### 设计决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 应用目录 | `apps/taro` | 按技术栈命名，预留其他 Taro 项目位置 |
| UI 组件方案 | NutUI + 自定义封装 | 混合方案，平衡效率和定制需求 |
| 路由策略 | 分离职责，不抽象 | 避免过度设计，应用层各自处理跳转 |
| React 版本 | Taro 独立使用 React 18 | 避免版本冲突，保证稳定性 |

## 架构设计

### 目录结构

```
apps/
├── web/              # 现有 Next.js 应用 (React 19)
├── mobile/           # 现有 Expo 应用 (React 19)
├── desktop/          # 现有 Tauri 应用 (React 19)
└── taro/             # 🆕 Taro 应用 (React 18 独立依赖树)
    ├── src/
    │   ├── pages/
    │   │   ├── index/
    │   │   │   ├── index.tsx
    │   │   │   └── index.config.ts
    │   │   └── login/
    │   │       ├── index.tsx
    │   │       └── index.config.ts
    │   ├── hooks/           # Taro 专属 hooks
    │   ├── app.config.ts
    │   ├── app.tsx
    │   └── app.scss
    ├── project.config.json
    └── package.json

packages/
├── ui-taro/          # 🆕 Taro UI 组件包 (React 18)
│   └── src/
│       ├── components/
│       └── index.ts
├── api/              # ✅ Taro 可复用
├── store/            # ✅ Taro 可复用
├── types/            # ✅ Taro 可复用
├── utils/            # ✅ Taro 可复用
├── hooks/            # ❌ Taro 暂不复用
├── ui/               # ❌ Taro 不复用
└── ...
```

### 可复用包评估

| 包 | 可复用 | 原因 |
|----|--------|------|
| `@repo/api` | ✅ | 只有 axios，无 React 依赖 |
| `@repo/store` | ✅ | zustand 无 DOM，React peer 宽松 |
| `@repo/types` | ✅ | 纯类型定义 |
| `@repo/utils` | ✅ | 无 DOM 依赖 |
| `@repo/hooks` | ❌ | 依赖 `next/navigation` |
| `@repo/ui` | ❌ | shadcn/Radix 有 DOM 依赖 |
| `@repo/services` | ✅ | API 封装，无 React 依赖 |

### 依赖配置

```yaml
# apps/taro/package.json
{
  "name": "@repo/taro",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@tarojs/taro": "^4.0.0",
    "@tarojs/components": "^4.0.0",
    "@tarojs/runtime": "^4.0.0",
    "@nutui/nutui-react-taro": "^2.0.0",
    "@repo/api": "workspace:*",
    "@repo/store": "workspace:*",
    "@repo/types": "workspace:*",
    "@repo/utils": "workspace:*",
    "@repo/ui-taro": "workspace:*"
  }
}

# packages/ui-taro/package.json
{
  "name": "@repo/ui-taro",
  "peerDependencies": {
    "react": "^18.0.0",
    "@tarojs/taro": ">=3.0.0"
  }
}
```

### 职责分离策略

路由相关逻辑采用职责分离，不创建统一抽象层：

```typescript
// @repo/hooks - 只保留纯逻辑（两端都可用的部分）
export function resolveAuthGuardRedirect({
  mode,
  isAuthenticated,
  isHydrated,
}) {
  if (mode === 'protected' && !isAuthenticated) return '/login'
  if (mode === 'guest' && isAuthenticated) return '/'
  return null
}

// apps/taro/src/hooks - Taro 专属跳转逻辑
export function useAuthGuard() {
  const { isAuthenticated, isHydrated } = useAuthStore()
  
  useEffect(() => {
    const target = resolveAuthGuardRedirect({ mode, isAuthenticated, isHydrated })
    if (target) {
      Taro.redirectTo({ url: target })
    }
  }, [isAuthenticated, isHydrated])
}
```

## 演进路径

### 阶段 1（当前）：独立依赖树

- Taro 使用 React 18
- 复用 `@repo/api`, `@repo/store`, `@repo/types`, `@repo/utils`
- Taro 专属 hooks 放 `apps/taro/src/hooks/`
- 监控 [Taro GitHub Issue #16996](https://github.com/NervJS/taro/issues/16996) 进展

### 阶段 2（Taro 支持 React 19 后）

- 升级 Taro 应用到 React 19
- 合并 `apps/taro/src/hooks/` 到 `@repo/hooks`
- 评估是否需要统一路由抽象层
- 完整复用所有共享包

### 多端扩展预留

```
apps/
├── taro/           # 微信小程序 + H5
├── taro-alipay/    # 支付宝小程序（未来）
└── taro-tt/        # 抖音小程序（未来）
```

## 验证清单

- [ ] Taro 应用初始化成功
- [ ] 微信小程序编译通过
- [ ] H5 编译通过
- [ ] `@repo/api` 在 Taro 中正常工作
- [ ] `@repo/store` 在 Taro 中正常工作
- [ ] `@repo/ui-taro` 组件库可用
- [ ] 热更新正常

## 风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| Taro React 19 支持延迟 | 中 | 中 | 保持独立依赖树，监控 issue |
| 多 React 版本冲突 | 低 | 高 | pnpm workspace 隔离，独立依赖树 |
| NutUI 组件不满足需求 | 中 | 中 | 自定义组件封装在 `@repo/ui-taro` |
| 小程序 API 差异 | 高 | 低 | 在 `apps/taro/src/hooks/` 中适配 |

## 参考资料

- [Taro 官方文档](https://docs.taro.zone/)
- [Taro React 19 支持 Issue](https://github.com/NervJS/taro/issues/16996)
- [NutUI Taro 版本](https://nutui.jd.com/taro/react/2x/)
- [React 19 发布公告](https://zh-hans.react.dev/blog/2024/12/05/react-19)
