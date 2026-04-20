/** Filter bar — status dropdown, priority dropdown, and live search input. */
import React from 'react'
import type { TaskPriority, TaskStatus } from '../types/task'

interface FilterBarProps {
  search: string
  status: TaskStatus | ''
  priority: TaskPriority | ''
  onSearchChange: (v: string) => void
  onStatusChange: (v: TaskStatus | '') => void
  onPriorityChange: (v: TaskPriority | '') => void
}

export function FilterBar({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}: FilterBarProps): React.ReactElement {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <input
        type="search"
        placeholder="Search tasks…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search tasks"
        style={{ flex: '1 1 200px', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
      />

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus | '')}
        aria-label="Filter by status"
        style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
      >
        <option value="">All statuses</option>
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as TaskPriority | '')}
        aria-label="Filter by priority"
        style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
      >
        <option value="">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  )
}
