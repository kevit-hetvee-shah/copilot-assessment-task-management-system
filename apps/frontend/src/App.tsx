/**
 * Root application component.
 * Wires together header, stats, filters, task table, modal and toasts.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './index.css'

import { fetchStats } from './api/tasks'
import { useTasks } from './hooks/useTasks'
import type { Task, TaskCreatePayload, TaskPriority, TaskStatus, TaskUpdatePayload } from './types/task'

import { FilterBar } from './components/FilterBar'
import { TaskModal } from './components/TaskModal'
import { TaskTable } from './components/TaskTable'
import { ToastContainer } from './components/Toast'
import type { ToastItem, ToastType } from './components/Toast'

// ── Helpers ────────────────────────────────────────────────────
function uid(): string { return Math.random().toString(36).slice(2, 9) }

// ── Logo SVG ───────────────────────────────────────────────────
function LogoMark(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10.5L8 14.5L16 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon(): React.ReactElement {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ── Types ──────────────────────────────────────────────────────
interface Stats { total: number; todo: number; inProgress: number; done: number }

/**
 * Root component. Manages filter state, modal state, toasts and stats.
 * All task mutations go through the useTasks hook.
 */
function App(): React.ReactElement {
  // Filters (client-side)
  const [searchQuery, setSearchQuery]     = useState('')
  const [statusFilter, setStatusFilter]   = useState<TaskStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')

  // Modal
  const [modalOpen, setModalOpen]   = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([])

  // Stats
  const [stats, setStats] = useState<Stats>({ total: 0, todo: 0, inProgress: 0, done: 0 })

  // Tasks — always fetch the full list and filter client-side for live search
  const { tasks, loading, error, addTask, editTask, removeTask, markComplete } = useTasks()

  // ── Toast helpers ────────────────────────────────────────────
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToasts((prev) => [...prev, { id: uid(), message, type }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Surface hook errors
  const prevError = useRef<string | null>(null)
  useEffect(() => {
    if (error && error !== prevError.current) {
      showToast(error, 'error')
      prevError.current = error
    }
  }, [error, showToast])

  // ── Stats ────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const raw = await fetchStats()
      const d = raw as Record<string, unknown>
      const byStatus = (d.by_status ?? {}) as Record<string, number>
      setStats({
        total: typeof d.total === 'number' ? d.total : 0,
        todo: byStatus['todo'] ?? 0,
        inProgress: byStatus['in-progress'] ?? 0,
        done: byStatus['done'] ?? 0,
      })
    } catch { /* stats are non-critical */ }
  }, [])

  useEffect(() => { loadStats() }, [loadStats, tasks])

  // ── Client-side filtering ────────────────────────────────────
  const filteredTasks = useMemo(() => {
    let result = tasks
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q),
      )
    }
    if (statusFilter)   result = result.filter((t) => t.status === statusFilter)
    if (priorityFilter) result = result.filter((t) => t.priority === priorityFilter)
    return result
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  // ── Modal handlers ───────────────────────────────────────────
  const openAdd  = useCallback(() => { setEditingTask(null); setModalOpen(true) }, [])
  const openEdit = useCallback((task: Task) => { setEditingTask(task); setModalOpen(true) }, [])
  const closeModal = useCallback(() => { setModalOpen(false); setEditingTask(null) }, [])

  // ── CRUD handlers ─────────────────────────────────────────────
  const handleAdd = useCallback(async (payload: TaskCreatePayload) => {
    await addTask(payload)
    showToast('Task created successfully!', 'success')
  }, [addTask, showToast])

  const handleEdit = useCallback(async (id: string, payload: TaskUpdatePayload) => {
    await editTask(id, payload)
    showToast('Task updated successfully!', 'success')
  }, [editTask, showToast])

  const handleDelete = useCallback((task: Task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return
    removeTask(task.id)
      .then(() => showToast('Task deleted.', 'info'))
      .catch(() => showToast('Failed to delete task.', 'error'))
  }, [removeTask, showToast])

  const handleComplete = useCallback((task: Task) => {
    markComplete(task.id)
      .then(() => showToast(`"${task.title}" moved forward! ✓`, 'success'))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Failed to update task.'
        showToast(msg, 'error')
      })
  }, [markComplete, showToast])

  const clearFilters = useCallback(() => {
    setSearchQuery(''); setStatusFilter(''); setPriorityFilter('')
  }, [])

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <div className="header-logo" aria-hidden="true"><LogoMark /></div>
            <div>
              <div className="header-title">TaskFlow</div>
              <div className="header-subtitle">Manage your work, one task at a time</div>
            </div>
          </div>
          <button className="btn btn--primary" onClick={openAdd}>
            <PlusIcon />
            <span className="btn-label">Add Task</span>
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="app-main">
        {/* Stats bar */}
        <div className="stats-bar" role="region" aria-label="Task statistics">
          <div className="stat-card stat-card--total">
            <div className="stat-card__value">{stats.total}</div>
            <div className="stat-card__label">Total</div>
          </div>
          <div className="stat-card stat-card--todo">
            <div className="stat-card__value">{stats.todo}</div>
            <div className="stat-card__label">To Do</div>
          </div>
          <div className="stat-card stat-card--in-progress">
            <div className="stat-card__value">{stats.inProgress}</div>
            <div className="stat-card__label">In Progress</div>
          </div>
          <div className="stat-card stat-card--done">
            <div className="stat-card__value">{stats.done}</div>
            <div className="stat-card__label">Done</div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onClear={clearFilters}
        />

        {/* Section header */}
        <div className="section-header">
          <h1 className="section-title">Tasks</h1>
          {!loading && (
            <span className="section-count">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          )}
        </div>

        {/* Table */}
        <TaskTable
          tasks={filteredTasks}
          loading={loading}
          onEdit={openEdit}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onAddFirst={openAdd}
        />
      </main>

      {/* ── Modal ── */}
      <TaskModal
        open={modalOpen}
        editingTask={editingTask}
        onClose={closeModal}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} onClose={dismissToast} />
    </div>
  )
}

export default App
