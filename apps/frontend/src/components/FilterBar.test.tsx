/**
 * Tests for FilterBar component.
 * Verifies search input, status/priority dropdowns, and clear button behaviour.
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FilterBar } from './FilterBar'

const baseProps = {
  searchQuery: '',
  statusFilter: '' as const,
  priorityFilter: '' as const,
  onSearchChange: vi.fn(),
  onStatusChange: vi.fn(),
  onPriorityChange: vi.fn(),
  onClear: vi.fn(),
}

describe('FilterBar', () => {
  it('renders search input, status select, and priority select', () => {
    render(<FilterBar {...baseProps} />)
    expect(screen.getByPlaceholderText('Search tasks…')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter by priority')).toBeInTheDocument()
  })

  it('calls onSearchChange when user types in the search box', async () => {
    const onSearchChange = vi.fn()
    render(<FilterBar {...baseProps} onSearchChange={onSearchChange} />)
    await userEvent.type(screen.getByPlaceholderText('Search tasks…'), 'buy')
    expect(onSearchChange).toHaveBeenCalled()
  })

  it('calls onStatusChange when status filter changes', async () => {
    const onStatusChange = vi.fn()
    render(<FilterBar {...baseProps} onStatusChange={onStatusChange} />)
    await userEvent.selectOptions(screen.getByLabelText('Filter by status'), 'todo')
    expect(onStatusChange).toHaveBeenCalledWith('todo')
  })

  it('calls onPriorityChange when priority filter changes', async () => {
    const onPriorityChange = vi.fn()
    render(<FilterBar {...baseProps} onPriorityChange={onPriorityChange} />)
    await userEvent.selectOptions(screen.getByLabelText('Filter by priority'), 'high')
    expect(onPriorityChange).toHaveBeenCalledWith('high')
  })

  it('does NOT show Clear button when no filter is active', () => {
    render(<FilterBar {...baseProps} />)
    expect(screen.queryByText('Clear')).not.toBeInTheDocument()
  })

  it('shows Clear button when searchQuery is non-empty', () => {
    render(<FilterBar {...baseProps} searchQuery="hello" />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('shows Clear button when statusFilter is active', () => {
    render(<FilterBar {...baseProps} statusFilter="todo" />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  it('calls onClear when Clear button is clicked', async () => {
    const onClear = vi.fn()
    render(<FilterBar {...baseProps} searchQuery="x" onClear={onClear} />)
    await userEvent.click(screen.getByText('Clear'))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})

