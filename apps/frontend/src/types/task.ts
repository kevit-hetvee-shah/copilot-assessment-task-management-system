/** TypeScript types matching the backend Task schema exactly. */

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: string
  updatedAt: string
}

export interface TaskCreatePayload {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
}

export interface TaskUpdatePayload {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
}

/** Standard API response envelope */
export interface APIResponse<T = unknown> {
  success: boolean
  data: T
}
