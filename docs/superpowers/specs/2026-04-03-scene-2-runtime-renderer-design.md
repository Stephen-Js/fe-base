# Drag Layout Scene 2 运行时协议渲染设计文档

## 概述

在 `DragLayoutScene2Page` 中为 `ready` 状态的实例增加最小可运行协议渲染能力。当前阶段不抽公共 renderer，而是在页面内根据 `renderSchema`、`dataSchema`、`actionSchema` 直接渲染 `@repo/ui` 中已有的 JSON 驱动组件。

第一版支持：

- `table`
- `form`
- `composite`

其中 `composite` 第一版只支持“表格 + 编辑弹窗表单”这一种组合模式。

## 目标

- `ready` 状态不再只显示摘要，而是渲染真实组件
- `table` 协议可渲染 `DataTable`
- `form` 协议可渲染 `JsonForm`
- `composite` 协议可渲染表格 + 编辑弹窗表单
- 表格弹窗表单提交时调用 `actionSchema.submit.api`
- 提交成功后刷新主数据源

## 非目标

- 不抽公共 schema renderer 组件
- 不支持多种 `composite` 组合模式
- 不支持多数据源
- 不支持删除、新建、批量操作
- 不支持右侧属性面板编辑协议

## 推荐方案

将运行时协议渲染逻辑先放在 `DragLayoutScene2Page` 内部，以最小成本验证协议设计与 `@repo/ui` JSON 驱动组件是否匹配。

原因：

- 当前协议仍在收敛中
- 先在页面里验证比提前抽象公共渲染器更稳
- 等 `table / form / composite` 跑顺后再抽公共层更合理

## 渲染映射

### 1. `table`

映射：

- `renderSchema.kind === 'table'`
- `renderSchema.props.columns` -> `DataTable.columns`
- `renderSchema.props.actions` -> `DataTable.actions`
- `dataSchema` -> 表格数据源

### 2. `form`

映射：

- `renderSchema.kind === 'form'`
- `renderSchema.props.fields` -> `JsonForm.config.fields`

### 3. `composite`

第一版只支持：

- `renderSchema.props.table`
- `renderSchema.props.modalForm`
- `renderSchema.props.modal`

映射关系：

- `table` -> `DataTable`
- `modalForm` -> 弹窗内 `JsonForm`
- `modal` -> 弹窗配置

## 数据加载策略

当前详情协议中：

- `renderSchema` 负责渲染结构
- `dataSchema` 负责单个主数据源
- `actionSchema` 负责交互动作

第一版运行时约束：

- 主数据源用于表格数据
- `DataTable` 数据在实例运行态内维护
- 不支持一个实例多个远程数据源
- 远程表格数据优先按服务端分页处理

### 主数据源加载

实例进入 `ready` 后：

- 若 `dataSchema.mode === 'remote'`，再请求主数据源
- 若 `dataSchema.mode === 'static'`，优先使用 `mockData`
- 若 `dataSchema.source.pagination.enabled === true`，请求时附带页码与每页条数

这里的 `ready` 语义是：

- 组件详情接口已成功返回
- 渲染协议、数据协议、动作协议已可用

并不代表：

- 远程主数据源已经完成加载

因此对于远程数据模式，`ready` 后仍需要继续请求 `dataSchema.source`，待主数据源返回后才真正渲染表格中的数据。

### 服务端分页

第一版分页策略：

- 由页面维护实例级分页状态
- `DataTable` 使用受控分页模式展示当前页与总数
- 切换页码或每页条数时，重新请求主数据源
- `pageSize` 变化时重置到第一页

实例级分页状态建议至少包含：

- `page`
- `pageSize`
- `total`

### 主数据源刷新

当 `composite` 中表单提交成功后：

- 调用 `actionSchema.submit.api`
- 成功后重新请求当前页主数据源刷新表格

不在当前阶段做局部乐观更新。

## 动作协议最小支持

当前仅支持以下动作：

### `edit`

含义：

- 打开编辑弹窗
- 使用当前行数据作为表单默认值

### `submit`

含义：

- 调用动作中定义的提交接口
- 成功后关闭弹窗
- 刷新当前实例主数据源

## 与 `table-form-demo-page` 的兼容性

第一版 `composite` 目标就是对齐 `table-form-demo-page` 的结构：

- 表格列配置
- 表格操作栏配置
- 弹窗表单字段配置
- 弹窗文案配置
- 提交动作 API

这意味着该协议可以直接承载“JSON 驱动表格 CRUD 组件”的最小可运行版本。

## 页面内运行态

除了已有的：

- `layoutItems`
- `instances`

还需要为每个 `ready` 实例维护运行时数据，例如：

- 表格数据
- 是否正在加载主数据源
- 当前编辑中的行数据
- 当前分页状态与总数

建议以实例 `id` 为 key 存储运行态，而不是把运行态塞进 `instances` 基础协议对象里。

## 文件规划

```text
packages/pages/src/drag-layout-scene-2-page.tsx
  页面内最小协议渲染器
  table / form / composite 三种渲染分支
  composite 第一版支持 table + modalForm
```

## 验证建议

至少验证以下几点：

- `table` 协议可正常渲染 `DataTable`
- `form` 协议可正常渲染 `JsonForm`
- `composite` 协议可显示表格
- 当 `dataSchema.mode === 'remote'` 时，会继续请求主数据源并渲染返回数据
- 当开启服务端分页时，会按当前页和 pageSize 请求主数据源
- 切换分页后会重新请求主数据源并更新表格
- 点击编辑可打开表单弹窗
- 提交时调用 `actionSchema.submit.api`
- 提交成功后表格当前页主数据源会刷新
