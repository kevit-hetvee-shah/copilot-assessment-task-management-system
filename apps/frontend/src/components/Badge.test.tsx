/**
 * Tests for PriorityBadge and StatusBadge components.
 * Verifies correct labels and CSS classes for every status/priority value.
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PriorityBadge, StatusBadge } from './Badge'

describe('PriorityBadge', () => {
  it('renders "High" with class badge--high for high priority', () => {
    render(<PriorityBadge priority="high" />)
    const el = screen.getByText('High')
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('badge--high')
  })

  it('renders "Medium" with class badge--medium for medium priority', () => {
    render(<PriorityBadge priority="medium" />)
    const el = screen.getByText('Medium')
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('badge--medium')
  })

  it('renders "Low" with class badge--low for low priority', () => {
    render(<PriorityBadge priority="low" />)
    const el = screen.getByText('Low')
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('badge--low')
  })
})

describe('StatusBadge', () => {
  it('renders "To Do" with class badge--todo for todo status', () => {
    render(<StatusBadge status="todo" />)
    const el = screen.getByText('To Do')
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('badge--todo')
  })

  it('renders "In Progress" with class badge--in-progress for in-progress status', () => {
    render(<StatusBadge status="in-progress" />)
    const el = screen.getByText('In Progress')
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('badge--in-progress')
  })

  it('renders "Done" with class badge--done for done status', () => {
    render(<StatusBadge status="done" />)
    const el = screen.getByText('Done')
    expect(el).toBeInTheDocument()
    expect(el).toHaveClass('badge--done')
  })
})

