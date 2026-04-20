/** Task table — renders task rows with Edit, Complete, and Delete actions. */
import React from 'react'
import { Badge } from './Badge'
import type { Task } from '../types/task'

interface TaskTableProps {
  tasks: Task[]
  loading: boolean
  onEdit: (task: Task) => void
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskTable({ tasks, loading, onEdit, onComplete, onDelete }: TaskTableProps): React.ReactElement {
  if (loading) {
    return <p aria-busy="true">Loading tasks…</p>
  }

  if (tasks.length === 0) {
    return <p>No tasks found. Add one to get started!</p>
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
          <th style={{ padding: '0.5rem' }}>Title</th>
          <th style={{ padding: '0.5rem' }}>Priority</th>
          <th style={{ padding: '0.5rem' }}>Status</th>
          <th style={{ padding: '0.5rem' }}>Created</th>
          <th style={{ padding: '0.5rem' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
            <td style={{ padding: '0.5rem' }}>{task.title}</td>
            <td style={{ padding: '0.5rem' }}><Badge type="priority" value={task.priority} /></td>
            <td style={{ padding: '0.5rem' }}><Badge type="status" value={task.status} /></td>
            <td style={{ padding: '0.5rem', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
              {new Date(task.createdAt).toLocaleDateString()}
            </td>
            <td style={{ padding: '0.5rem', display: 'flex', gap: '0.4rem' }}>
              <button onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}>Edit</button>
              {task.status !== 'done' && (
                <button onClick={() => onComplete(task.id)} aria-label={`Complete ${task.title}`}>Complete</button>
              )}
              <button onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`} style={{ color: 'var(--color-priority-high)' }}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
