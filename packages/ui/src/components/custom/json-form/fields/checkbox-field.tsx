/**
 * 复选框字段渲染器
 */

'use client'

import { Checkbox } from '@repo/ui/shadcn/checkbox'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/shadcn/form'
import type { Control, FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

interface CheckboxFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function CheckboxField({ field, control }: CheckboxFieldProps) {
  return (
    <FormField
      control={control}
      name={field.name as FieldPath<Record<string, unknown>>}
      render={({ field: rhfField }) => (
        <FormItem
          className={`flex flex-row items-start space-x-3 space-y-0 ${field.className ?? ''}`}
        >
          <FormControl>
            <Checkbox
              checked={rhfField.value as boolean}
              onCheckedChange={rhfField.onChange}
              disabled={field.disabled}
              {...(field.props as Record<string, unknown>)}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {field.label && (
              <FormLabel className="cursor-pointer">
                {field.label}
                {field.required && <span className="ml-1 text-destructive">*</span>}
              </FormLabel>
            )}
            {field.description && <FormDescription>{field.description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
