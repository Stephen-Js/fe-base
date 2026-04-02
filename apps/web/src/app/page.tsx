import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Welcome</h1>
      <p className="text-muted-foreground">场景演示</p>
      <div className="flex gap-4">
        <Link
          href="/drag-layout"
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          拖拽布局场景
        </Link>
        <Link
          href="/table-form-demo"
          className="rounded-lg bg-secondary px-4 py-2 text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          表格表单联动
        </Link>
      </div>
    </main>
  )
}
