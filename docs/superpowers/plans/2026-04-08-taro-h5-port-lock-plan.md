# Taro H5 固定端口配置 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Taro H5 开发服务端口固定为 `10086`，在端口被占用时直接失败，不再自动漂移到其他端口，同时验证现有启动方式不是 hack，并确认热更新仍然可用。

**Architecture:** 在 Taro 开发配置层显式声明 H5 dev server 端口与严格端口策略，而不是依赖默认行为。验证分两部分：一部分看配置是否生效并在端口占用时失败，另一部分看 `taro build --type h5 --watch` 在当前项目里是否仍然提供 Vite HMR。

**Tech Stack:** Taro 4, Vite runner, TypeScript, shell verification

---

## 文件结构与职责

- Modify: `apps/taro/config/dev.ts`
  - 为 H5 开发环境显式配置端口与严格端口策略
- Optional Modify: `apps/taro/package.json`
  - 只有当脚本层需要额外参数时才改；若配置层足够则不改
- Optional Create: `apps/taro/src/h5-port-config.test.ts`
  - 如果需要增加静态配置测试，可用来断言 dev 配置包含固定端口

## Task 1: 配置固定端口

**Files:**
- Modify: `apps/taro/config/dev.ts`

- [ ] **Step 1: 写一个最小静态测试或配置断言**

```ts
import devConfig from '../config/dev'
import { describe, expect, it } from 'vitest'

describe('taro h5 dev config', () => {
  it('locks the h5 port to 10086', () => {
    expect(devConfig.h5).toMatchObject({
      port: 10086,
      strictPort: true,
    })
  })
})
```

- [ ] **Step 2: 运行测试，确认当前失败**

Run: `pnpm test apps/taro/src/h5-port-config.test.ts`
Expected: FAIL，因为当前没有端口配置

- [ ] **Step 3: 在 `apps/taro/config/dev.ts` 中补充 H5 端口配置**

```ts
export default {
  mini: {},
  h5: {
    port: 10086,
    strictPort: true,
  },
}
```

- [ ] **Step 4: 运行静态测试验证**

Run: `pnpm test apps/taro/src/h5-port-config.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add apps/taro/config/dev.ts apps/taro/src/h5-port-config.test.ts
git commit -m "fix(taro): lock h5 dev port to 10086"
```

## Task 2: 验证端口占用时失败

**Files:**
- No code changes required

- [ ] **Step 1: 启动一个临时本地服务占用 `10086`**

Run:

```bash
python3 -m http.server 10086
```

Expected: 本地 `10086` 被占用

- [ ] **Step 2: 在另一个会话启动 Taro H5**

Run:

```bash
pnpm dev:taro:h5
```

Expected: 明确报端口占用失败，而不是自动切到 `10087`

- [ ] **Step 3: 释放临时端口占用**

Run: 结束 `python3 -m http.server 10086`

- [ ] **Step 4: 记录结论**

Expected:

- 配置生效
- 行为符合“固定端口，冲突即失败”

## Task 3: 验证启动方式与热更新

**Files:**
- No persistent code changes required

- [ ] **Step 1: 启动 H5 开发服务**

Run:

```bash
pnpm dev:taro:h5
```

Expected: 服务监听在 `http://localhost:10086/`

- [ ] **Step 2: 验证启动方式不是 hack**

Check:

- `apps/taro/package.json` 使用的是 `taro build --type h5 --watch`
- 当前项目依赖使用的是 `@tarojs/vite-runner`

Expected:

- 这是 Taro 4 H5 标准开发启动链路
- 不是运行时补丁或临时脚本拼接

- [ ] **Step 3: 验证热更新**

Action:

- 临时修改一个可见文案，例如首页标题或聊天页标题
- 观察 dev server 日志是否出现 HMR / update
- 刷新前确认页面内容自动更新
- 恢复修改

Expected:

- 页面触发热更新
- 不需要重启 dev server

- [ ] **Step 4: 汇总验证结果**

Expected:

- 启动方式：标准，不是 hack
- 热更新：可用

## 自检

- 覆盖了用户要求的三点：固定端口、非 hack 判断、热更新验证
- 没有引入多余范围
- 如果配置层已足够，不改脚本层，避免过度设计

