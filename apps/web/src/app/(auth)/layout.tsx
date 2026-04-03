/**
 * 认证布局 - 不包含侧边栏的公共页面
 * 登录页面等无需认证即可访问的页面使用此布局
 */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
