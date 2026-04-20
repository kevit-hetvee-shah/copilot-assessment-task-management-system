/**
 * useTasks — custom hook for fetching and mutating tasks.
 * Exposes loading state, error state, and CRUD actions.
 */
import { useCallback, useEffect, useState } from 'react'
import {
  createTask,
  deleteTask,
  completeTask,
  fetchTasks,
  updateTask,
} from '../api/tasks'
import type { Task, TaskCreatePayload, TaskUpdatePayload } from '../types/task'

interface UseTasksOptions {
  status?: string
  priority?: string
}

interface UseTasksReturn {
  tasks: Task[]
  loading: boolean
  error: string | null
  refresh: () => void
  addTask: (payload: TaskCreatePayload) => Promise<void>
  editTask: (id: string, payload: TaskUpdatePayload) => Promise<void>
  removeTask: (id: string) => Promise<void>
  markComplete: (id: string) => Promise<void>
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTasks(options)
      setTasks(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [options.status, options.priority]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load()
  }, [load])

  const addTask = async (payload: TaskCreatePayload) => {
    await createTask(payload)
    await load()
  }

  const editTask = async (id: string, payload: TaskUpdatePayload) => {
    await updateTask(id, payload)
    await load()
  }

  const removeTask = async (id: string) => {
    await deleteTask(id)
    await load()
  }

  const markComplete = async (id: string) => {
    await completeTask(id)
    await load()
  }

  return { tasks, loading, error, refresh: load, addTask, editTask, removeTask, markComplete }
}
