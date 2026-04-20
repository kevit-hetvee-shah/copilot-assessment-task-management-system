/** Add / Edit task modal with animated backdrop, validation, and keyboard support. */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { Task, TaskCreatePayload, TaskStatus, TaskUpdatePayload } from '../types/task'

interface TaskModalProps {
  /** Whether the modal is visible */
  open: boolean
  /** Task to edit; null when creating a new task */
  editingTask: Task | null
  onClose: () => void
  onAdd: (payload: TaskCreatePayload) => Promise<void>
  onEdit: (id: string, payload: TaskUpdatePayload) => Promise<void>
}

interface FormState {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: TaskStatus
}

const DEFAULT_FORM: FormState = { title: '', description: '', priority: 'medium', status: 'todo' }

function CloseIcon(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Modal dialog for creating or editing a task.
 * Closes on Escape key or backdrop click.
 * Validates that the title is non-empty before submission.
 */
export function TaskModal({ open, editingTask, onClose, onAdd, onEdit }: TaskModalProps): React.ReactElement | null {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [titleError, setTitleError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const isEditing = editingTask !== null

  // Sync form when task or open state changes
  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title,
        description: editingTask.description ?? '',
        priority: editingTask.priority,
        status: editingTask.status,
      })
    } else {
      setForm(DEFAULT_FORM)
    }
    setTitleError('')
  }, [editingTask, open])

  // Auto-focus title field
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => titleRef.current?.focus(), 60)
      return () => clearTimeout(id)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleField = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'title') setTitleError('')
  }, [])

  const handleBackdrop = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = form.title.trim()
    if (!trimmed) {
      setTitleError('Title is required.')
      titleRef.current?.focus()
      return
    }
    setSubmitting(true)
    try {
      if (isEditing && editingTask) {
        await onEdit(editingTask.id, {
          title: trimmed,
          description: form.description.trim() || undefined,
          priority: form.priority,
          status: form.status,
        })
      } else {
        await onAdd({
          title: trimmed,
          description: form.description.trim() || undefined,
          priority: form.priority,
          status: form.status,
        })
      }
      onClose()
    } finally {
      setSubmitting(false)
    }
  }, [form, isEditing, editingTask, onAdd, onEdit, onClose])

  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        {/* Header */}
        <div className="modal__header">
          <div>
            <h2 className="modal__title" id="modal-title">
              {isEditing ? 'Edit Task' : 'New Task'}
            </h2>
            <p className="modal__subtitle">
              {isEditing ? 'Update the task details below.' : 'Fill in the details to create a task.'}
            </p>
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal__body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="modal-title-input">
                Title <span className="form-label__required">*</span>
              </label>
              <input
                ref={titleRef}
                id="modal-title-input"
                type="text"
                className={`form-input${titleError ? ' form-input--error' : ''}`}
                placeholder="What needs to be done?"
                value={form.title}
                onChange={(e) => handleField('title', e.target.value)}
                maxLength={200}
                aria-describedby={titleError ? 'title-err' : undefined}
                aria-invalid={!!titleError}
              />
              {titleError && (
                <span className="form-error" id="title-err" role="alert">⚠ {titleError}</span>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="modal-desc">Description</label>
              <textarea
                id="modal-desc"
                className="form-textarea"
                placeholder="Add details (optional)"
                rows={3}
                value={form.description}
                onChange={(e) => handleField('description', e.target.value)}
                maxLength={1000}
              />
            </div>

            {/* Priority — segmented radio buttons */}
            <div className="form-group">
              <span className="form-label">Priority</span>
              <div className="priority-group" role="radiogroup" aria-label="Priority">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <label key={p} className="priority-option">
                    <input
                      type="radio"
                      name="priority"
                      className="priority-option__input"
                      value={p}
                      checked={form.priority === p}
                      onChange={() => handleField('priority', p)}
                    />
                    <span className={`priority-option__label priority-option__label--${p}`}>
                      <span className={`priority-option__dot priority-dot--${p}`} />
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status — only in edit mode */}
            {isEditing && (
              <div className="form-group">
                <label className="form-label" htmlFor="modal-status">Status</label>
                <select
                  id="modal-status"
                  className="form-select"
                  value={form.status}
                  onChange={(e) => handleField('status', e.target.value as TaskStatus)}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting
                ? <><span className="spinner spinner--sm" /> Saving…</>
                : isEditing ? 'Update Task' : 'Save Task'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
