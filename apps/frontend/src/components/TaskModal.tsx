/** Add / Edit task modal form. */
import React, { useEffect, useState } from 'react'
import type { Task, TaskCreatePayload, TaskPriority, TaskStatus, TaskUpdatePayload } from '../types/task'

interface TaskModalProps {
  task?: Task | null          // if provided → edit mode; null/undefined → create mode
  onSubmit: (payload: TaskCreatePayload | TaskUpdatePayload) => Promise<void>
  onClose: () => void
}

const DEFAULT_FORM: TaskCreatePayload = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
}

export function TaskModal({ task, onSubmit, onClose }: TaskModalProps): React.ReactElement {
  const [form, setForm] = useState<TaskCreatePayload>(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (task) {
      setForm({ title: task.title, description: task.description ?? '', status: task.status, priority: task.priority })
    } else {
      setForm(DEFAULT_FORM)
    }
  }, [task])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(form)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={task ? 'Edit task' : 'Add task'}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
    >
      <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: '8px', width: '100%', maxWidth: '480px' }}>
        <h2 style={{ marginBottom: '1rem' }}>{task ? 'Edit Task' : 'Add Task'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label>
            Title *
            <input required name="title" value={form.title} onChange={handleChange}
              style={{ display: 'block', width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </label>
          <label>
            Description
            <textarea name="description" value={form.description ?? ''} onChange={handleChange} rows={3}
              style={{ display: 'block', width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
          </label>
          <label>
            Priority
            <select name="priority" value={form.priority} onChange={handleChange}
              style={{ display: 'block', width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          {task && (
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}
                style={{ display: 'block', width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
