/** Color-coded pill badges for task priority and status. */
import React from 'react'
import type { TaskPriority, TaskStatus } from '../types/task'

interface PriorityBadgeProps {
  /** The priority value to display */
  priority: TaskPriority
}

interface StatusBadgeProps {
  /** The status value to display */
  status: TaskStatus
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
}

/**
 * Renders a color-coded pill badge for task priority.
 */
export function PriorityBadge({ priority }: PriorityBadgeProps): React.ReactElement {
  return (
    <span className={`badge badge--${priority}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

/**
 * Renders a color-coded pill badge with a status dot indicator.
 */
export function StatusBadge({ status }: StatusBadgeProps): React.ReactElement {
  return (
    <span className={`badge badge--${status}`}>
      <span className="badge__dot" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  )
}
