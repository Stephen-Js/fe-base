/**
 * 下拉选择字段渲染器
 * 支持 select 和 multi-select 类型
 */

'use client'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/shadcn/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/shadcn/select'
import type { Control, FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

interface SelectFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function SelectField({ field, control }: SelectFieldProps) {
  return (
    <FormField
      control={control}
      name={field.name as FieldPath<Record<string, unknown>>}
      render={({ field: rhfField }) => (
        <FormItem className={field.className}>
          {field.label && (
            <FormLabel>
              {field.label}
              {field.required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <Select
            onValueChange={rhfField.onChange}
            defaultValue={rhfField.value as string}
            disabled={field.disabled}
            {...(field.props as Record<string, unknown>)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || '请选择'} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem
                  key={String(option.value)}
                  value={String(option.value)}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.description && <FormDescription>{field.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
