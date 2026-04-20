/**
 * Tests for the tasks API client layer.
 * Mocks axios to verify correct URLs, methods, and response unwrapping.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios')
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
  return {
    default: {
      ...actual.default,
      create: vi.fn(() => mockInstance),
    },
    __mockInstance: mockInstance,
  }
})

// Re-import AFTER mock is set up
const { fetchTasks, fetchTask, createTask, updateTask, deleteTask, completeTask, fetchStats } =
  await import('./tasks')

// Grab the mock axios instance
const { __mockInstance: client } = await import('axios') as any

const MOCK_TASK = {
  id: '1',
  title: 'Test',
  description: undefined,
  status: 'todo' as const,
  priority: 'medium' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('fetchTasks', () => {
  it('calls GET /tasks and returns data.data', async () => {
    client.get.mockResolvedValue({ data: { data: [MOCK_TASK] } })
    const result = await fetchTasks()
    expect(client.get).toHaveBeenCalledWith('/tasks', { params: undefined })
    expect(result).toEqual([MOCK_TASK])
  })

  it('passes filters as params', async () => {
    client.get.mockResolvedValue({ data: { data: [] } })
    await fetchTasks({ status: 'todo', priority: 'high' })
    expect(client.get).toHaveBeenCalledWith('/tasks', {
      params: { status: 'todo', priority: 'high' },
    })
  })
})

describe('fetchTask', () => {
  it('calls GET /tasks/:id and returns data.data', async () => {
    client.get.mockResolvedValue({ data: { data: MOCK_TASK } })
    const result = await fetchTask('1')
    expect(client.get).toHaveBeenCalledWith('/tasks/1')
    expect(result).toEqual(MOCK_TASK)
  })
})

describe('createTask', () => {
  it('calls POST /tasks with payload and returns data.data', async () => {
    client.post.mockResolvedValue({ data: { data: MOCK_TASK } })
    const result = await createTask({ title: 'New Task' })
    expect(client.post).toHaveBeenCalledWith('/tasks', { title: 'New Task' })
    expect(result).toEqual(MOCK_TASK)
  })
})

describe('updateTask', () => {
  it('calls PUT /tasks/:id with payload and returns data.data', async () => {
    const updated = { ...MOCK_TASK, title: 'Updated' }
    client.put.mockResolvedValue({ data: { data: updated } })
    const result = await updateTask('1', { title: 'Updated' })
    expect(client.put).toHaveBeenCalledWith('/tasks/1', { title: 'Updated' })
    expect(result).toEqual(updated)
  })
})

describe('deleteTask', () => {
  it('calls DELETE /tasks/:id', async () => {
    client.delete.mockResolvedValue({})
    await deleteTask('1')
    expect(client.delete).toHaveBeenCalledWith('/tasks/1')
  })
})

describe('completeTask', () => {
  it('calls POST /tasks/:id/complete and returns data.data', async () => {
    const done = { ...MOCK_TASK, status: 'done' as const }
    client.post.mockResolvedValue({ data: { data: done } })
    const result = await completeTask('1')
    expect(client.post).toHaveBeenCalledWith('/tasks/1/complete')
    expect(result).toEqual(done)
  })
})

describe('fetchStats', () => {
  it('calls GET /tasks/stats and returns data.data', async () => {
    const stats = { total: 2, by_status: {}, by_priority: {} }
    client.get.mockResolvedValue({ data: { data: stats } })
    const result = await fetchStats()
    expect(client.get).toHaveBeenCalledWith('/tasks/stats')
    expect(result).toEqual(stats)
  })
})

