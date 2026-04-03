# Demo 目录说明

## 目录定位

`demo/` 是当前仓库中用于验证高不确定性能力的实验层。

它的职责不是承载正式业务功能，也不是替代 `packages/*`、`apps/*` 或 `packages/pages/*`，而是：

- 在能力进入正式资产前，先隔离不确定性
- 用最小但完整的方式验证能力边界
- 沉淀验证结果、限制和集成建议
- 为后续正式版本提供可复用的决策记忆

简化理解：

- `docs/*`：定义和记录
- `demo/*`：隔离验证
- `packages/*`：沉淀正式能力
- `packages/pages/*` / `apps/*`：组合和展示能力

---

## 什么时候需要创建 Demo

满足以下任一条件时，建议优先创建 Demo：

- 团队没做过该能力
- 做完后的结果不可预期
- 依赖外部系统或复杂交互行为
- 多模块、多端或多层协作存在明显集成风险
- 需要先验证边界，再决定是否沉淀到正式资产

以下情况通常不需要 Demo：

- 已验证模式下的常规开发
- 样式微调
- 常规 CRUD
- 明确可预期的组件扩展、路由接线、类型调整

判断标准统一为：

> 做完之后，结果是否足够可预期。

---

## 目录结构

每个 Demo 统一使用如下结构：

```text
demo/
├── README.md
├── demo-{capability}/
│   ├── context/
│   ├── src/ 或 doc/
│   └── README.md
```

### 各部分含义

- `context/`
  - 记录输入材料，例如需求摘要、参考资料、约束条件、已有实现
- `src/`
  - 用于代码型 Demo 的实验实现
- `doc/`
  - 用于方案型或分析型 Demo 的验证记录
- `README.md`
  - 记录该 Demo 的结论、限制、沉淀建议和踩坑

---

## 命名规范

统一命名格式：

```text
demo-{能力关键词}
```

要求：

- 使用 `kebab-case`
- 表达“能力”，不要表达“具体业务页面”
- 名称能让人快速理解验证目标

### 示例

- `demo-drag-canvas`
- `demo-layout-history`
- `demo-json-form-schema-boundary`
- `demo-token-cross-platform-bridge`

---

## 状态规范

每个 Demo 只能处于以下三种状态之一：

### `active`

- 当前有效
- 可作为后续能力建设依据

### `superseded`

- 已被新 Demo 替代
- 保留供历史参考

README 开头标注：

```md
> ⚠️ 本 Demo 已被 `demo-xxx` 取代
```

### `archived`

- 已归档
- 仅供历史记录使用

README 开头标注：

```md
> 📦 本 Demo 已归档，仅供历史参考
```

---

## README 模板

每个 Demo 的 `README.md` 至少包含以下内容：

```md
# demo-{name}

## 目标

一句话说明该 Demo 解决什么问题。

## 为什么需要这个 Demo

说明该问题的不确定性来源。

## 输入

- 需求背景
- 约束条件
- 参考资料

## 核心方案

说明关键设计决策。

## 验证方式

说明如何运行、如何观察、如何判断通过。

## 验证结果

说明最终结果和结论。

## 已知限制

说明边界条件和不适用场景。

## 沉淀建议

说明应沉淀到哪个 package / page / app。

## 踩坑记录

说明过程中遇到的关键问题。
```

---

## 推荐工作流

建议采用以下流程：

```text
想法 / 需求
  -> 写 spec
  -> 做 Demo 判定
  -> 若需 Demo，则创建 demo/demo-xxx
  -> 完成验证并写 README
  -> 将稳定方案沉淀到 packages/*
  -> 在 packages/pages/* 或 apps/* 中做集成展示
  -> 随产品版本迭代
```

---

## 当前约束

- Demo 不是正式共享包，不作为长期资产发布面
- Demo 可以依赖仓内 `packages/*`，但不应反向成为正式包的隐式依赖
- Demo 应聚焦单能力，避免做成大而全的场景页
- 没有 README 的 Demo 视为未完成

---

## 索引建议

后续新增 Demo 时，建议在本文件维护一个简短索引，例如：

| Demo | 状态 | 目标 | 建议沉淀位置 |
|------|------|------|-------------|
| `demo-drag-canvas` | active | 验证拖拽落点和容器行为 | `packages/ui` |
| `demo-layout-history` | active | 验证撤销/重做模型 | `packages/hooks` |
| `demo-xxx` | superseded | 被新方案替代 | - |

---

## 相关文档

- [Demo管理规范-v1.md](/Users/sunny/work2026/fe-base/docs/Demo管理规范-v1.md)
- [Demo驱动方法论与当前项目对照分析.md](/Users/sunny/work2026/fe-base/docs/Demo驱动方法论与当前项目对照分析.md)
- [当前项目作为前端资产产品时的Demo开发与管理建议.md](/Users/sunny/work2026/fe-base/docs/当前项目作为前端资产产品时的Demo开发与管理建议.md)
