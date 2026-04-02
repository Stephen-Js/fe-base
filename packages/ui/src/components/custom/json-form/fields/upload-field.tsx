/**
 * 上传字段渲染器
 */

'use client'

import { Button } from '@repo/ui/shadcn/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/shadcn/form'
import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Control, FieldPath } from 'react-hook-form'
import type { FieldConfig } from '../types'

interface UploadFieldProps {
  field: FieldConfig
  control: Control<Record<string, unknown>>
}

export function UploadField({ field, control }: UploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string>('')

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
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                disabled={field.disabled}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setFileName(file.name)
                    rhfField.onChange(file)
                  }
                }}
                {...(field.props as Record<string, unknown>)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={field.disabled}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                选择文件
              </Button>
              {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
            </div>
          </FormControl>
          {field.description && <FormDescription>{field.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
