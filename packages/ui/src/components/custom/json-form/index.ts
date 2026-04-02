/**
 * JsonForm - JSON 驱动的动态表单组件
 *
 * 基于 react-hook-form 和 Zod 的表单解决方案
 * 支持通过 JSON 配置动态渲染表单字段
 *
 * @example
 * ```tsx
 * import { JsonForm } from '@repo/ui/custom/json-form'
 * import { z } from 'zod'
 *
 * const formConfig = {
 *   fields: [
 *     {
 *       name: 'username',
 *       type: 'text',
 *       label: '用户名',
 *       required: true,
 *       grid: { span: 6 },
 *       validation: z.string().min(3, '用户名至少3个字符'),
 *     },
 *     {
 *       name: 'email',
 *       type: 'email',
 *       label: '邮箱',
 *       grid: { span: 6 },
 *       validation: z.string().email('邮箱格式不正确'),
 *     },
 *     {
 *       name: 'role',
 *       type: 'select',
 *       label: '角色',
 *       options: [
 *         { label: '管理员', value: 'admin' },
 *         { label: '用户', value: 'user' },
 *       ],
 *       grid: { span: 6 },
 *     },
 *   ],
 *   submit: {
 *     text: '提交',
 *     api: { url: '/api/users', method: 'POST' },
 *   },
 * }
 *
 * // 使用方式 1：纯配置模式
 * <JsonForm config={formConfig} />
 *
 * // 使用方式 2：自定义提交
 * <JsonForm config={formConfig} onSubmit={(data) => console.log(data)} />
 *
 * // 使用方式 3：外部消费表单状态
 * <JsonForm
 *   config={formConfig}
 *   onValuesChange={(values) => console.log(values)}
 *   formRef={formRef}
 * />
 * ```
 */

// 字段渲染器导出（用于自定义扩展）
export {
  CheckboxField,
  DateField,
  RadioField,
  SelectField,
  SwitchField,
  TextareaField,
  TextField,
  UploadField,
} from './fields'
// 主组件导出
export { JsonForm } from './json-form'
// 类型导出
export type {
  ApiConfig,
  ButtonVariant,
  FieldConfig,
  FieldType,
  FormData,
  GridConfig,
  JsonFormConfig,
  JsonFormProps,
  SelectOption,
  SubmitConfig,
} from './types'
// 工具函数导出
export {
  buildSchema,
  getDefaultValues,
  getGridStyle,
  isMultiSelectField,
  isSelectField,
  mergeConfig,
  submitToApi,
} from './utils'
