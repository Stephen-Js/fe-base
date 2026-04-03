/**
 * 登录页面
 * 使用 sign-in-card-2 组件的共享登录页面
 */

'use client'

import { Component as SignInCard2 } from '@repo/ui/shadcn/sign-in-card-2'
import type { SignInCardCredentials } from '@repo/ui/shadcn/sign-in-card-2'

type LoginPageProps = {
  isLoading?: boolean
  errorMessage?: string
  onSubmit?: (credentials: SignInCardCredentials) => Promise<void> | void
}

export function LoginPage({ isLoading, errorMessage, onSubmit }: LoginPageProps) {
  return <SignInCard2 isLoading={isLoading} errorMessage={errorMessage} onSubmit={onSubmit} />
}
