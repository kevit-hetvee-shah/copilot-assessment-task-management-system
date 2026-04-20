/** Color-coded badge for task priority and status values. */
import React from 'react'
import type { TaskPriority, TaskStatus } from '../types/task'

interface BadgeProps {
  type: 'priority' | 'status'
  value: TaskPriority | TaskStatus
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: 'var(--color-priority-high)',
  medium: 'var(--color-priority-medium)',
  low: 'var(--color-priority-low)',
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'var(--color-status-todo)',
  'in-progress': 'var(--color-status-in-progress)',
  done: 'var(--color-status-done)',
}

export function Badge({ type, value }: BadgeProps): React.ReactElement {
  const color = type === 'priority'
    ? PRIORITY_COLORS[value as TaskPriority]
    : STATUS_COLORS[value as TaskStatus]

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#fff',
        backgroundColor: color,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </span>
  )
}
