/**
 * 开关字段渲染器
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
import { Switch } from '@repo/ui/shadcn/switch'
import type { Control, FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

interface SwitchFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function SwitchField({ field, control }: SwitchFieldProps) {
  return (
    <FormField
      control={control}
      name={field.name as FieldPath<Record<string, unknown>>}
      render={({ field: rhfField }) => (
        <FormItem className={`flex flex-row items-center justify-between ${field.className ?? ''}`}>
          <div className="space-y-0.5">
            {field.label && (
              <FormLabel>
                {field.label}
                {field.required && <span className="ml-1 text-destructive">*</span>}
              </FormLabel>
            )}
            {field.description && <FormDescription>{field.description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={rhfField.value as boolean}
              onCheckedChange={rhfField.onChange}
              disabled={field.disabled}
              {...(field.props as Record<string, unknown>)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
