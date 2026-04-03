'use client'

import { apiGet } from '@repo/api'
import type { ComponentPaletteItem, ComponentPaletteListData } from '@repo/types'
import { ThreePaneLayout } from '@repo/ui/custom/three-pane-layout'
import { Button } from '@repo/ui/shadcn/button'
import { useQuery } from '@tanstack/react-query'
import { Columns3, PanelLeft, PanelRight, SquareDashedMousePointer } from 'lucide-react'

interface SectionTitleProps {
  title: string
  subtitle: string
}

function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  )
}

export function DragLayoutScene2Page() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['component-palette'],
    queryFn: () => apiGet<ComponentPaletteListData>('/component-palette'),
  })

  const paletteItems: ComponentPaletteItem[] = data?.data.list ?? []

  return (
    <div className="h-screen w-full bg-muted/30 p-4">
      <ThreePaneLayout className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <ThreePaneLayout.LeftSidebar className="bg-card">
          <div className="flex items-center justify-between border-b border-border p-3">
            <SectionTitle title="组件菜单" subtitle="左侧菜单栏" />
            <ThreePaneLayout.LeftToggle />
          </div>

          <div className="flex-1 space-y-3 overflow-auto p-3">
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Columns3 className="h-4 w-4" />
                基础组件
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                    加载组件列表中...
                  </div>
                </div>
              ) : null}

              {isError ? (
                <div className="space-y-3 rounded-xl border border-border bg-background p-3">
                  <p className="text-sm text-destructive">组件列表加载失败，请重试</p>
                  <Button variant="outline" size="sm" onClick={() => void refetch()}>
                    重试
                  </Button>
                </div>
              ) : null}

              {!isLoading && !isError ? (
                <div className="space-y-2">
                  {paletteItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-dashed border-border bg-background p-3"
                    >
                      <div className="text-sm font-medium text-foreground">{item.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{item.description}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        默认尺寸 {item.defaultSize.w} x {item.defaultSize.h}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </ThreePaneLayout.LeftSidebar>

        <ThreePaneLayout.Main className="bg-background">
          <div className="flex h-full flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <SectionTitle title="拖拽布局场景 2" subtitle="中间整个区域作为画布区域" />
              <Button variant="outline" size="sm">
                预览布局
              </Button>
            </div>

            <div className="flex flex-1 p-6">
              <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40">
                <div className="flex max-w-sm flex-col items-center gap-3 text-center">
                  <SquareDashedMousePointer className="h-10 w-10 text-muted-foreground" />
                  <div className="space-y-1">
                    <div className="text-base font-medium text-foreground">画布区域</div>
                    <div className="text-sm text-muted-foreground">
                      当前阶段只完成三栏布局壳子，后续在这里接入拖拽布局能力。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ThreePaneLayout.Main>

        <ThreePaneLayout.RightSidebar className="bg-card">
          <div className="flex items-center justify-between border-b border-border p-3">
            <SectionTitle title="属性面板" subtitle="右侧固定侧边栏" />
            <ThreePaneLayout.RightToggle />
          </div>

          <div className="flex-1 space-y-3 overflow-auto p-3">
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <PanelLeft className="h-4 w-4" />
                画布信息
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>左栏折叠后缩成窄条，并保留切换按钮。</p>
                <p>右栏折叠后完全隐藏，并在主区域右侧显示贴边展开按钮。</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <PanelRight className="h-4 w-4" />
                配置占位
              </div>
              <div className="space-y-2">
                <div className="h-10 rounded-lg border border-dashed border-border" />
                <div className="h-10 rounded-lg border border-dashed border-border" />
                <div className="h-24 rounded-lg border border-dashed border-border" />
              </div>
            </div>
          </div>
        </ThreePaneLayout.RightSidebar>
      </ThreePaneLayout>
    </div>
  )
}
