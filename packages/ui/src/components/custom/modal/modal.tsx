import NiceModal, { useModal } from '@ebay/nice-modal-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/shadcn/dialog'
import type { ReactNode } from 'react'

export interface ModalProps {
  /** 弹窗标题 */
  title?: ReactNode
  /** 弹窗描述内容 */
  description?: ReactNode
  /** 自定义内容区域 */
  children?: ReactNode
  /** 弹窗是否可点击遮罩关闭，默认为 true */
  closable?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义弹窗宽度 */
  width?: string | number
  /** 弹窗关闭后的回调 */
  afterClose?: () => void
}

const Modal = NiceModal.create<ModalProps>(
  ({ title, description, children, closable = true, className, width, afterClose }) => {
    const modal = useModal()

    const handleClose = () => {
      if (closable) {
        modal.hide()
      }
    }

    const handleOpenChange = (open: boolean) => {
      if (!open && closable) {
        handleClose()
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
          {children}
        </DialogContent>
      </Dialog>
    )
  }
)

export { Modal }
