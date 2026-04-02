/**
 * 文本字段渲染器
 * 支持 text、password、email、number 类型
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
import { Input } from '@repo/ui/shadcn/input'
import type { Control, FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

interface TextFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function TextField({ field, control }: TextFieldProps) {
  const inputType = field.type === 'number' ? 'number' : field.type

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
          <FormControl>
            <Input
              type={inputType}
              placeholder={field.placeholder}
              disabled={field.disabled}
              value={rhfField.value as string}
              onChange={rhfField.onChange}
              onBlur={rhfField.onBlur}
              name={rhfField.name}
              ref={rhfField.ref}
              {...(field.props as Record<string, unknown>)}
            />
          </FormControl>
          {field.description && <FormDescription>{field.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
