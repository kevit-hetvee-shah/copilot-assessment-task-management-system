/** Filter bar: live search input + status and priority dropdown filters. */
import React from 'react'
import type { TaskPriority, TaskStatus } from '../types/task'

interface FilterBarProps {
  searchQuery: string
  statusFilter: TaskStatus | ''
  priorityFilter: TaskPriority | ''
  onSearchChange: (v: string) => void
  onStatusChange: (v: TaskStatus | '') => void
  onPriorityChange: (v: TaskPriority | '') => void
  onClear: () => void
}

function SearchIcon(): React.ReactElement {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon(): React.ReactElement {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path d="M2 4L5.5 7.5L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Renders a search input alongside status and priority select filters.
 * Shows a "Clear" button when any filter is active.
 */
export function FilterBar({
  searchQuery,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onClear,
}: FilterBarProps): React.ReactElement {
  const hasFilters = searchQuery !== '' || statusFilter !== '' || priorityFilter !== ''

  return (
    <div className="filter-bar">
      {/* Live search */}
      <div className="filter-bar__search">
        <span className="filter-bar__search-icon"><SearchIcon /></span>
        <input
          type="search"
          className="filter-bar__search-input"
          placeholder="Search tasks…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search tasks"
        />
      </div>

      <div className="filter-bar__selects">
        {/* Status filter */}
        <div className="filter-group">
          <select
            className="filter-group__select"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as TaskStatus | '')}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <span className="filter-group__arrow"><ChevronIcon /></span>
        </div>

        {/* Priority filter */}
        <div className="filter-group">
          <select
            className="filter-group__select"
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value as TaskPriority | '')}
            aria-label="Filter by priority"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <span className="filter-group__arrow"><ChevronIcon /></span>
        </div>

        {/* Clear button — only when a filter is active */}
        {hasFilters && (
          <button className="btn btn--ghost btn--sm" onClick={onClear} aria-label="Clear all filters">
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
