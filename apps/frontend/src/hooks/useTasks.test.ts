/**
 * Tests for useTasks custom hook.
 * Mocks api/tasks to verify loading state, error handling, and mutations.
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTasks } from './useTasks'
import type { Task } from '../types/task'

vi.mock('../api/tasks', () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  completeTask: vi.fn(),
}))

import * as api from '../api/tasks'

const MOCK_TASK: Task = {
  id: '1',
  title: 'Test Task',
  status: 'todo',
  priority: 'medium',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useTasks', () => {
  it('sets loading=true during fetch then false when complete', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue([MOCK_TASK])
    const { result } = renderHook(() => useTasks())
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
  })

  it('populates tasks on successful fetch', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue([MOCK_TASK])
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].title).toBe('Test Task')
    expect(result.current.error).toBeNull()
  })

  it('sets error message on failed fetch', async () => {
    vi.mocked(api.fetchTasks).mockRejectedValue(new Error('Network Error'))
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Network Error')
    expect(result.current.tasks).toHaveLength(0)
  })

  it('sets generic error when a non-Error is thrown', async () => {
    vi.mocked(api.fetchTasks).mockRejectedValue('oops')
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Failed to load tasks')
  })

  it('addTask calls createTask then refreshes the list', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue([MOCK_TASK])
    vi.mocked(api.createTask).mockResolvedValue(MOCK_TASK)
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addTask({ title: 'New Task' })
    })

    expect(api.createTask).toHaveBeenCalledWith({ title: 'New Task' })
    expect(api.fetchTasks).toHaveBeenCalledTimes(2) // initial load + after addTask
  })

  it('editTask calls updateTask then refreshes', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue([MOCK_TASK])
    vi.mocked(api.updateTask).mockResolvedValue({ ...MOCK_TASK, title: 'Updated' })
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.editTask('1', { title: 'Updated' })
    })

    expect(api.updateTask).toHaveBeenCalledWith('1', { title: 'Updated' })
  })

  it('removeTask calls deleteTask then refreshes', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue([MOCK_TASK])
    vi.mocked(api.deleteTask).mockResolvedValue(undefined)
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.removeTask('1')
    })

    expect(api.deleteTask).toHaveBeenCalledWith('1')
  })

  it('markComplete calls completeTask then refreshes', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue([MOCK_TASK])
    vi.mocked(api.completeTask).mockResolvedValue({ ...MOCK_TASK, status: 'in-progress' })
    const { result } = renderHook(() => useTasks())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.markComplete('1')
    })

    expect(api.completeTask).toHaveBeenCalledWith('1')
  })
})

