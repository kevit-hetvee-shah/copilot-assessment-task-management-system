/** Stacking toast notifications with auto-dismiss and progress bar. */
import React, { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  toast: ToastItem
  onClose: (id: string) => void
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onClose: (id: string) => void
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
}

/**
 * Single toast notification. Auto-dismisses after 4 seconds with an
 * animated progress bar. Can also be manually dismissed.
 */
function Toast({ toast, onClose }: ToastProps): React.ReactElement {
  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), 4000)
    return () => clearTimeout(t)
  }, [toast.id, onClose])

  return (
    <div className={`toast toast--${toast.type}`} role="alert" aria-live="polite">
      <div className="toast__inner">
        <span className="toast__icon" aria-hidden="true">{ICONS[toast.type]}</span>
        <p className="toast__message">{toast.message}</p>
        <button
          className="toast__close"
          onClick={() => onClose(toast.id)}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
      <div className="toast__progress" aria-hidden="true" />
    </div>
  )
}

/**
 * Container that renders a stack of toast notifications in the bottom-right corner.
 */
export function ToastContainer({ toasts, onClose }: ToastContainerProps): React.ReactElement | null {
  if (toasts.length === 0) return null
  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  )
}
