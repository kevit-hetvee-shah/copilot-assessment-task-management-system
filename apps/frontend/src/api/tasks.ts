/**
 * HTTP client wrappers for the Task Management API.
 * All functions return the unwrapped `data` field from the response envelope.
 */
import axios from 'axios'
import type { APIResponse, Task, TaskCreatePayload, TaskUpdatePayload } from '../types/task'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

/** Fetch all tasks with optional status / priority filters. */
export async function fetchTasks(filters?: {
  status?: string
  priority?: string
}): Promise<Task[]> {
  const { data } = await client.get<APIResponse<Task[]>>('/tasks', { params: filters })
  return data.data
}

/** Fetch a single task by ID. */
export async function fetchTask(id: string): Promise<Task> {
  const { data } = await client.get<APIResponse<Task>>(`/tasks/${id}`)
  return data.data
}

/** Create a new task. */
export async function createTask(payload: TaskCreatePayload): Promise<Task> {
  const { data } = await client.post<APIResponse<Task>>('/tasks', payload)
  return data.data
}

/** Update an existing task. */
export async function updateTask(id: string, payload: TaskUpdatePayload): Promise<Task> {
  const { data } = await client.put<APIResponse<Task>>(`/tasks/${id}`, payload)
  return data.data
}

/** Delete a task. */
export async function deleteTask(id: string): Promise<void> {
  await client.delete(`/tasks/${id}`)
}

/** Advance a task through the status workflow. */
export async function completeTask(id: string): Promise<Task> {
  const { data } = await client.post<APIResponse<Task>>(`/tasks/${id}/complete`)
  return data.data
}

/** Fetch task statistics grouped by status and priority. */
export async function fetchStats(): Promise<Record<string, unknown>> {
  const { data } = await client.get<APIResponse<Record<string, unknown>>>('/tasks/stats')
  return data.data
}
