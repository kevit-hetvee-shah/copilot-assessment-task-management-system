/** Toast notification component for success / error messages. */
import React, { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = 'error', onClose, duration = 4000 }: ToastProps): React.ReactElement {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const bg = type === 'success' ? '#28a745' : '#dc3545'

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        padding: '0.75rem 1.25rem',
        borderRadius: '6px',
        color: '#fff',
        backgroundColor: bg,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        maxWidth: '360px',
      }}
    >
      {message}
      <button
        onClick={onClose}
        style={{ marginLeft: '1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  )
}
