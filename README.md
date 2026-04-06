# Any Mind

## 项目简介

**Any Mind** 的含义是“任何想法”。

这个项目定位为一个通用的前端能力底座，目标是把分散的前端能力、物料和工程能力沉淀为可复用、可组合、可扩展的基础设施，让不同业务场景都能基于同一套底座快速构建应用。

它不仅是一个业务项目，更偏向一个技术产品。项目的核心价值不是承载某一个单点业务，而是持续提供通用前端能力，例如组件库、页面物料、拖拽场景、表单能力、状态管理、接口封装、设计令牌、多端适配等，从而支持多种业务形态和产品形态的落地。

## 项目定位

Any Mind 希望解决的是前端研发中的复用与组合问题：

- 将通用能力沉淀为共享包，减少重复建设
- 将页面、组件、拖拽布局等能力模块化，提升复用效率
- 通过应用层组合共享能力，快速适配不同业务场景
- 在 Web、Desktop、Mobile 等多端场景中复用一致的能力体系

一句话概括：

> Any Mind 是一个面向多场景、多应用、多端形态的前端能力底座。

## 核心能力

当前仓库已经具备或正在沉淀以下能力方向：

- 组件库能力：通用 UI 组件、表单组件、弹窗能力、图标体系
- 页面物料能力：登录页、组件展示页、表格表单示例页、拖拽布局页等页面级物料
- 拖拽场景能力：面向布局编排和可视化搭建的基础拖拽能力
- 表单能力：JSON Form、数据录入、字段扩展等能力
- 设计系统能力：设计令牌、主题变量、样式基础设施
- 工程通用能力：类型、工具函数、状态管理、国际化、服务层、接口层、Hooks
- 多端承载能力：Web、Desktop、Mobile 三种应用形态

## 架构设计

项目整体采用 Monorepo 架构，并且在职责上分为两层：

### 1. 应用层

应用层主要负责面向具体场景进行能力组合，形成可运行的应用。

当前包括：

- `apps/web`：Web 应用，承载页面展示、组件能力验证、拖拽场景等
- `apps/desktop`：Desktop 应用，基于 Next.js + Tauri 构建桌面端形态
- `apps/mobile`：Mobile 应用，基于 Expo / React Native 构建移动端形态
- `apps/taro`：小程序应用，基于 Taro 构建微信小程序 + H5 跨端形态

应用层本身不追求重复建设能力，而是通过组合共享包中的能力，快速构造不同用途的应用，以适配不同业务场景。

### 2. 共享包层

共享包层主要负责沉淀通用前端能力、基础物料和工程能力，是整个底座的核心。

当前包括：

- `packages/ui`：Web 侧 UI 组件库与自定义能力组件
- `packages/ui-native`：移动端 UI 能力封装
- `packages/ui-taro`：Taro 小程序 UI 组件封装
- `packages/pages`：页面级物料与场景示例
- `packages/ui-tokens`：设计令牌与主题变量
- `packages/api`：接口请求能力与客户端封装
- `packages/services`：业务服务封装层
- `packages/store`：状态管理能力
- `packages/hooks`：通用 Hooks
- `packages/i18n`：国际化能力
- `packages/types`：共享类型定义
- `packages/utils`：通用工具函数

可以这样理解：

- 共享包层负责“提供能力”
- 应用层负责“组合能力”

这种架构使项目既能沉淀稳定的基础能力，也能灵活支持各种业务场景和产品形态。

## 仓库结构

```text
fe-base/
├── apps/
│   ├── web/
│   ├── desktop/
│   ├── mobile/
│   └── taro/
├── packages/
│   ├── api/
│   ├── hooks/
│   ├── i18n/
│   ├── pages/
│   ├── services/
│   ├── store/
│   ├── types/
│   ├── ui/
│   ├── ui-native/
│   ├── ui-taro/
│   ├── ui-tokens/
│   └── utils/
├── tooling/
│   ├── eslint-config/
│   ├── tailwind-config/
│   └── typescript-config/
├── pnpm-workspace.yaml
└── turbo.json
```

## 技术栈

当前项目主要基于以下技术栈构建：

- Monorepo：pnpm workspace + Turbo
- Web / Desktop：Next.js + React 19
- Desktop 容器：Tauri
- Mobile：Expo + React Native
- 小程序：Taro 4.x + React 18
- 样式体系：Tailwind CSS（Web）、Sass（Taro）
- 表单与校验：React Hook Form + Zod
- 状态管理：Zustand
- 代码规范：ESLint + Biome

## 适用场景

Any Mind 面向的不只是单一应用，而是一个可支撑多种场景的前端能力平台，例如：

- 业务中后台系统
- 可视化搭建平台
- 表单与配置驱动场景
- 多端统一能力建设
- 组件库与页面物料沉淀
- 面向不同业务线的应用快速搭建

随着共享能力不断沉淀，应用层可以更低成本地构建新的业务应用，从“做一个项目”逐步走向“搭一个平台”。

## 快速开始

### 环境要求

- Node.js `>= 18`
- pnpm `9.15.0`

### 安装依赖

```bash
pnpm install
```

### 启动开发

启动所有应用：

```bash
pnpm dev
```

启动 Web 应用：

```bash
pnpm dev:web
```

启动 Desktop 应用：

```bash
pnpm dev:pc
```

启动 Mobile 应用：

```bash
pnpm dev:mobile
```

启动 Taro 小程序：

```bash
pnpm dev:taro:weapp    # 微信小程序
pnpm dev:taro:h5       # H5
```

## 常用命令

```bash
pnpm dev
pnpm build
pnpm lint
pnpm type-check
pnpm check
pnpm clean
pnpm build:tokens
pnpm build:icons
pnpm sync:assets
```

## 项目理解

从工程视角看，Any Mind 不是简单的“应用集合”，而是一个持续演进的前端能力底座：

- 它强调能力沉淀，而不是一次性开发
- 它强调共享包复用，而不是项目内复制
- 它强调能力组合，而不是单体式堆叠
- 它强调多场景适配，而不是只服务某一个业务

因此，这个项目的长期方向不是只完成某个页面或某个功能，而是逐步形成一套可支撑各种业务场景的前端基础设施。

## 未来方向

后续可以继续围绕以下方向演进：

- 更完整的组件与物料体系
- 更成熟的拖拽编排与低代码能力
- 更统一的设计系统与主题机制
- 更稳定的多端复用方案
- 更清晰的应用装配方式与能力接入规范
- 更标准化的业务场景模板

## 总结

Any Mind 的核心理念是：

> 将任何想法，沉淀为可复用的前端能力；再通过能力组合，支撑各种应用与业务场景。

它既是一个技术底座，也是一个面向未来扩展的前端产品化工程体系。
