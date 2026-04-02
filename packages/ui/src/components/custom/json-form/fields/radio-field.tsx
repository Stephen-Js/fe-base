/**
 * 单选按钮字段渲染器
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
import { RadioGroup, RadioGroupItem } from '@repo/ui/shadcn/radio-group'
import type { Control, FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

interface RadioFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function RadioField({ field, control }: RadioFieldProps) {
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
            <RadioGroup
              onValueChange={rhfField.onChange}
              defaultValue={rhfField.value as string}
              disabled={field.disabled}
              className="flex flex-col space-y-1"
              {...(field.props as Record<string, unknown>)}
            >
              {field.options?.map((option) => (
                <FormItem
                  key={String(option.value)}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem value={String(option.value)} disabled={option.disabled} />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-normal">{option.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          {field.description && <FormDescription>{field.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
