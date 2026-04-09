# Taro H5 启动与聊天协议加固 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 去掉 Taro H5 启动脚本中的平台依赖，并为聊天协议 reducer 增加顺序校验和非法事件防御，使开发链路和协议层都更接近可落地状态。

**Architecture:** 启动脚本改为纯 Node 端口探测，不再依赖外部系统命令。聊天 reducer 在现有 `messages[]` 状态模型上增加 `lastSeqByMessageId` 和 `errors` 跟踪，对重复、乱序、未知 message/chunk 进行显式处理与测试覆盖。

**Tech Stack:** Node.js, Taro, TypeScript, Vitest

---

## 文件结构与职责

- Modify: `apps/taro/scripts/dev-h5.mjs`
  - 改为跨平台端口探测
- Modify: `apps/taro/src/hooks/chat-stream-reducer.ts`
  - 增加顺序保护和错误记录
- Modify: `apps/taro/src/hooks/chat-stream-reducer.test.ts`
  - 增加乱序、未知消息、未知 chunk 测试
- Optional Modify: `apps/taro/src/hooks/use-stream-chat.ts`
  - 仅当 reducer 状态新增字段影响使用方时做最小适配

## Task 1: 跨平台端口探测

**Files:**
- Modify: `apps/taro/scripts/dev-h5.mjs`

- [ ] **Step 1: 先写一个最小验证思路**

目标行为：
- 端口空闲时启动成功
- 端口占用时在脚本层直接失败
- 不依赖 `lsof`

- [ ] **Step 2: 用纯 Node `net` 改写端口探测**

```js
import net from 'node:net'

function ensurePortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer()

    server.once('error', (error) => {
      reject(error)
    })

    server.listen(port, '0.0.0.0', () => {
      server.close((closeError) => {
        if (closeError) {
          reject(closeError)
          return
        }
        resolve(undefined)
      })
    })
  })
}
```

- [ ] **Step 3: 保持启动命令仍然是标准 Taro CLI**

```js
spawn('pnpm', ['exec', 'taro', 'build', '--type', 'h5', '--watch', '--port', String(PORT)], ...)
```

- [ ] **Step 4: 手工验证**

Run:

```bash
pnpm dev:taro:h5
```

Expected:
- 空闲时固定在 `10086`
- 端口被占用时脚本直接失败

## Task 2: reducer 顺序与错误处理

**Files:**
- Modify: `apps/taro/src/hooks/chat-stream-reducer.ts`
- Modify: `apps/taro/src/hooks/chat-stream-reducer.test.ts`

- [ ] **Step 1: 先写失败测试**

新增测试覆盖：
- 同一 `messageId` 的乱序事件会被拒绝
- 给不存在的 `messageId` 发 chunk 事件会被记录为错误
- 给不存在的 `chunkId` 发 patch 事件会被记录为错误

- [ ] **Step 2: 扩展状态结构**

```ts
export interface ChatState {
  messages: ChatMessageData[]
  seenEventIds: string[]
  lastSeqByMessageId: Record<string, number>
  errors: string[]
}
```

- [ ] **Step 3: 在 `applyChatStreamEvent` 中增加守卫**

核心规则：
- `eventId` 重复直接忽略
- `seq <= lastSeqByMessageId[messageId]` 视为乱序/重复，记录错误并忽略
- `chunk_appended` / `chunk_patched` / `message_completed` / `message_failed` 若目标消息不存在，记录错误
- `chunk_patched` 若目标 chunk 不存在，记录错误

- [ ] **Step 4: 运行测试和类型检查**

Run:

```bash
pnpm test apps/taro/src/hooks/chat-stream-reducer.test.ts
pnpm --filter @repo/taro type-check
```

Expected: PASS

## Task 3: 总体验证

**Files:**
- Modify only if needed

- [ ] **Step 1: 跑受影响测试**

Run:

```bash
pnpm test apps/taro/src/hooks/chat-stream-reducer.test.ts apps/taro/src/h5-port-config.test.ts
```

Expected: PASS

- [ ] **Step 2: 跑 Taro 类型检查**

Run:

```bash
pnpm --filter @repo/taro type-check
```

Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add apps/taro/scripts/dev-h5.mjs apps/taro/src/hooks/chat-stream-reducer.ts apps/taro/src/hooks/chat-stream-reducer.test.ts docs/superpowers/plans/2026-04-09-taro-hardening-plan.md
git commit -m "refactor(taro): harden h5 startup and chat reducer"
```

## 自检

- 覆盖了已确认的两个高优先级问题
- 不扩大范围到 UI 细节和更多业务重构
- 验证命令清晰，适合 inline 执行

