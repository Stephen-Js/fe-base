# Drag Layout Scene 2 文档导航

该目录用于聚合 [drag-layout-scene-2-page.tsx](/Users/sunny/work2026/fe-base/packages/pages/src/drag-layout-scene-2-page.tsx) 相关的实现文档、对接文档和协议说明，作为 scene 2 的统一入口。

## 推荐阅读顺序

1. [overview.md](/Users/sunny/work2026/fe-base/docs/drag-layout-scene-2/overview.md)
   - 先看功能概览、页面流程、状态模型
2. [backend-api.md](/Users/sunny/work2026/fe-base/docs/drag-layout-scene-2/backend-api.md)
   - 再看后端需要提供哪些接口以及字段约束

## 文档分工

- [overview.md](/Users/sunny/work2026/fe-base/docs/drag-layout-scene-2/overview.md)
  - 场景 2 的功能说明
  - 页面交互与运行流程
  - 前端状态模型
  - 当前能力边界
- [backend-api.md](/Users/sunny/work2026/fe-base/docs/drag-layout-scene-2/backend-api.md)
  - 后端真实接口对接说明
  - 组件列表接口、组件详情接口、主数据源接口、提交接口
  - 分页协议与字段约束

## 相关文档

- 全局组件列表接口文档：[component-palette-api.md](/Users/sunny/work2026/fe-base/docs/api/component-palette-api.md)
- 全局组件详情接口文档：[component-detail-api.md](/Users/sunny/work2026/fe-base/docs/api/component-detail-api.md)
- 运行时设计文档：[2026-04-03-scene-2-runtime-renderer-design.md](/Users/sunny/work2026/fe-base/docs/superpowers/specs/2026-04-03-scene-2-runtime-renderer-design.md)
- 实例详情流设计文档：[2026-04-03-scene-2-instance-detail-flow-design.md](/Users/sunny/work2026/fe-base/docs/superpowers/specs/2026-04-03-scene-2-instance-detail-flow-design.md)

## 维护原则

- 与 `drag-layout-scene-2-page` 强相关的说明，优先收敛到本目录
- `docs/api` 保留全局接口文档
- `docs/superpowers/specs` 保留设计过程文档，不作为日常联调主入口
