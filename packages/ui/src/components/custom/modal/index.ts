import NiceModal from '@ebay/nice-modal-react'
import type { FC } from 'react'

import { ConfirmModal, type ConfirmModalProps } from './confirm-modal'
import { Modal, type ModalProps } from './modal'

/** 通用确认弹窗的便捷方法 */
const confirm = (props: ConfirmModalProps): Promise<unknown> => {
  return NiceModal.show(ConfirmModal, props)
}

/** 通用弹窗的便捷方法 */
const show = <P extends object = ModalProps>(component: FC<P>, props?: P): Promise<unknown> => {
  return NiceModal.show(component, props)
}

/** 隐藏弹窗 */
const hide = (component: FC | string): void => {
  NiceModal.hide(component)
}

/** 移除弹窗 */
const remove = (component: FC | string): void => {
  NiceModal.remove(component)
}

/** 注册弹窗 */
const register = (id: string, component: FC): void => {
  NiceModal.register(id, component)
}

export const modal = {
  confirm,
  show,
  hide,
  remove,
  register,
}

// 导出 NiceModal，其中 NiceModal.Provider 需要在应用根节点包裹
export { NiceModal }

export { ConfirmModal, Modal }
export type { ConfirmModalProps, ModalProps }
