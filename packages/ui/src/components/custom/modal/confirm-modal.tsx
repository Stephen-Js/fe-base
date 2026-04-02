import NiceModal, { useModal } from '@ebay/nice-modal-react'
import type { ButtonProps } from '@repo/ui/shadcn/button'
import { Button } from '@repo/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/shadcn/dialog'
import type { ReactNode } from 'react'

export interface ConfirmModalProps {
  /** 弹窗标题 */
  title?: ReactNode
  /** 弹窗描述内容 */
  description?: ReactNode
  /** 自定义内容区域 */
  content?: ReactNode
  /** 确认按钮文字，默认为 '确认' */
  confirmText?: string
  /** 取消按钮文字，默认为 '取消' */
  cancelText?: string
  /** 确认按钮变体样式 */
  confirmVariant?: ButtonProps['variant']
  /** 取消按钮变体样式 */
  cancelVariant?: ButtonProps['variant']
  /** 是否显示取消按钮，默认为 true */
  showCancel?: boolean
  /** 确认按钮是否加载中 */
  confirmLoading?: boolean
  /** 点击确认按钮的回调 */
  onConfirm?: () => void | Promise<void>
  /** 点击取消按钮的回调 */
  onCancel?: () => void | Promise<void>
  /** 弹窗关闭后的回调 */
  afterClose?: () => void
  /** 弹窗是否可点击遮罩关闭，默认为 true */
  closable?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义弹窗宽度 */
  width?: string | number
}

const ConfirmModal = NiceModal.create<ConfirmModalProps>(
  ({
    title,
    description,
    content,
    confirmText = '确认',
    cancelText = '取消',
    confirmVariant = 'default',
    cancelVariant = 'outline',
    showCancel = true,
    confirmLoading = false,
    onConfirm,
    onCancel,
    afterClose,
    closable = true,
    className,
    width,
  }) => {
    const modal = useModal()

    const handleConfirm = async () => {
      try {
        await onConfirm?.()
        modal.resolve(true)
      } finally {
        modal.hide()
      }
    }

    const handleCancel = async () => {
      try {
        await onCancel?.()
        modal.resolve(false)
      } finally {
        modal.hide()
      }
    }

    const handleOpenChange = (open: boolean) => {
      if (!open && closable) {
        handleCancel()
      }
    }

    const handleAfterClose = () => {
      modal.remove()
      afterClose?.()
    }

    return (
      <Dialog open={modal.visible} onOpenChange={handleOpenChange}>
        <DialogContent
          className={className}
          style={width ? { maxWidth: width } : undefined}
          onInteractOutside={(e) => {
            if (!closable) {
              e.preventDefault()
            }
          }}
          onCloseAutoFocus={() => {
            handleAfterClose()
          }}
        >
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
          )}
          {content && <div className="py-2">{content}</div>}
          <DialogFooter>
            {showCancel && (
              <Button variant={cancelVariant} onClick={handleCancel}>
                {cancelText}
              </Button>
            )}
            <Button variant={confirmVariant} onClick={handleConfirm} disabled={confirmLoading}>
              {confirmLoading ? '处理中...' : confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
)

export { ConfirmModal }
