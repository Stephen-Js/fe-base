/**
 * 文本域字段渲染器
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
import { Textarea } from '@repo/ui/shadcn/textarea'
import type { Control, FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

interface TextareaFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function TextareaField({ field, control }: TextareaFieldProps) {
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
            <Textarea
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
