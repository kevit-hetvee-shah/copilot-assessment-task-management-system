/** Task list table with skeleton loading, empty state, and row action buttons. */
import React, { useCallback } from 'react'
import type { Task } from '../types/task'
import { PriorityBadge, StatusBadge } from './Badge'

interface TaskTableProps {
  tasks: Task[]
  loading: boolean
  onEdit: (task: Task) => void
  onComplete: (task: Task) => void
  onDelete: (task: Task) => void
  onAddFirst: () => void
}

// ── SVG icon components ────────────────────────────────────────
function EditIcon(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9.5 1.5a1.5 1.5 0 012.12 2.12L4 11.25l-2.75.5.5-2.75L9.5 1.5z"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrashIcon(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 4h10M5.5 4V2.5h3V4M4.5 4v7a.5.5 0 00.5.5h4a.5.5 0 00.5-.5V4"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Formats an ISO timestamp to "Apr 20, 2026" */
function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
  } catch {
    return iso
  }
}

/** Animated skeleton rows shown while loading */
function SkeletonRows(): React.ReactElement {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <tr key={i} className="skeleton-row">
          <td><div className="skeleton skeleton--title" /></td>
          <td><div className="skeleton skeleton--badge" /></td>
          <td><div className="skeleton skeleton--badge" /></td>
          <td><div className="skeleton skeleton--date" /></td>
          <td><div className="skeleton skeleton--actions" /></td>
        </tr>
      ))}
    </>
  )
}

/** A single task row, memoized to avoid unnecessary re-renders */
const TaskRow = React.memo(function TaskRow({
  task,
  onEdit,
  onComplete,
  onDelete,
}: {
  task: Task
  onEdit: (t: Task) => void
  onComplete: (t: Task) => void
  onDelete: (t: Task) => void
}): React.ReactElement {
  const isDone = task.status === 'done'
  const handleEdit     = useCallback(() => onEdit(task),     [task, onEdit])
  const handleComplete = useCallback(() => onComplete(task), [task, onComplete])
  const handleDelete   = useCallback(() => onDelete(task),   [task, onDelete])

  return (
    <tr className={`task-row${isDone ? ' task-row--done' : ''}`}>
      <td className="task-cell-title">
        <div className="task-title">{task.title}</div>
        {task.description && (
          <div className="task-description" title={task.description}>{task.description}</div>
        )}
      </td>
      <td><PriorityBadge priority={task.priority} /></td>
      <td><StatusBadge status={task.status} /></td>
      <td><span className="task-date">{fmtDate(task.createdAt)}</span></td>
      <td>
        <div className="actions">
          <button className="action-btn action-btn--edit" onClick={handleEdit}
            aria-label={`Edit "${task.title}"`} title="Edit task">
            <EditIcon />
          </button>
          {!isDone && (
            <button className="action-btn action-btn--complete" onClick={handleComplete}
              aria-label={`Mark "${task.title}" complete`} title="Mark complete">
              <CheckIcon />
            </button>
          )}
          <button className="action-btn action-btn--delete" onClick={handleDelete}
            aria-label={`Delete "${task.title}"`} title="Delete task">
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  )
})

/**
 * Main task list table. Shows skeleton rows while loading, an empty-state
 * prompt when no tasks exist, and memoized task rows otherwise.
 */
export function TaskTable({ tasks, loading, onEdit, onComplete, onDelete, onAddFirst }: TaskTableProps): React.ReactElement {
  return (
    <div className="task-table-wrapper">
      <table className="task-table" aria-label="Tasks">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col">Created</th>
            <th scope="col"><span className="visually-hidden">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows />
          ) : tasks.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <div className="empty-state">
                  <div className="empty-state__icon" aria-hidden="true">📋</div>
                  <p className="empty-state__title">No tasks yet</p>
                  <p className="empty-state__subtitle">Create your first task to get started.</p>
                  <button className="btn btn--primary btn--sm empty-state__cta" onClick={onAddFirst}>
                    Add your first task →
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onEdit={onEdit}
                onComplete={onComplete}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
