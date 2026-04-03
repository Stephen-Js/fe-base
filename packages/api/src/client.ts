import type { ApiResponse } from '@repo/types'
import axios, { type AxiosRequestConfig } from 'axios'

interface RuntimeEnv {
  API_URL?: string
  API_TIMEOUT?: string
}

function getRuntimeEnv(): RuntimeEnv {
  if (typeof globalThis === 'undefined') {
    return {}
  }

  const maybeProcess = (
    globalThis as typeof globalThis & {
      process?: { env?: RuntimeEnv }
    }
  ).process

  return maybeProcess?.env ?? {}
}

const runtimeEnv = getRuntimeEnv()

export const apiClient = axios.create({
  baseURL: typeof window !== 'undefined' ? '/api' : runtimeEnv.API_URL,
  timeout: Number(runtimeEnv.API_TIMEOUT) || 30000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器 — 注入 token
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 — 统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const { data } = await apiClient.get<ApiResponse<T>>(url, config)
  return data
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const { data } = await apiClient.post<ApiResponse<T>>(url, body, config)
  return data
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const { data } = await apiClient.put<ApiResponse<T>>(url, body, config)
  return data
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const { data } = await apiClient.delete<ApiResponse<T>>(url, config)
  return data
}
