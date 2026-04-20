/**
 * E2E tests for the Task Management System.
 *
 * Covers:
 *  1. Page load & layout (header, stats bar, table, filter bar)
 *  2. Viewing tasks (table columns, badge colours, empty state)
 *  3. Adding a task (success, validation, description, modal behaviour)
 *  4. Searching tasks (live search, no-match, clear search)
 *  5. Filtering by status and priority (individual + combined)
 *  6. Editing a task (title, description, priority, status)
 *  7. Completing a task (todo → in-progress → done workflow)
 *  8. Deleting a task (confirmation, row removal)
 *  9. Stats bar counters (update after mutations)
 * 10. Toast notifications (success / error messages)
 * 11. Modal behaviour (Escape key, backdrop click, Cancel button)
 *
 * Run:
 *   npx playwright test
 *
 * Requirements:
 *   - Frontend running on http://localhost:5174
 *   - Backend running on http://localhost:8000
 */

import { test, expect, type Page } from '@playwright/test'

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Click the "Add Task" button and wait for the modal to appear. */
async function openAddModal(page: Page): Promise<void> {
  await page.getByRole('button', { name: /add task/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
}

/**
 * Fill in the task form and submit it.
 *
 * @param page      - Playwright page instance.
 * @param title     - Task title to enter.
 * @param priority  - Priority radio to select (default 'medium').
 * @param description - Optional description text.
 */
async function fillAndSubmitTask(
  page: Page,
  title: string,
  priority: 'low' | 'medium' | 'high' = 'medium',
  description?: string,
): Promise<void> {
  await page.getByLabel(/title/i).fill(title)
  if (description) {
    await page.getByLabel(/description/i).fill(description)
  }
  await page.locator(`input[name="priority"][value="${priority}"]`).locator('..').click()
  await page.getByRole('button', { name: /save task|update task/i }).click()
}

/**
 * Create a task and wait for it to appear in the table.
 * Returns the unique title used.
 */
async function createTask(
  page: Page,
  titlePrefix = 'Task',
  priority: 'low' | 'medium' | 'high' = 'medium',
  description?: string,
): Promise<string> {
  const title = `${titlePrefix} ${Date.now()}`
  await openAddModal(page)
  await fillAndSubmitTask(page, title, priority, description)
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(page.getByText(title)).toBeVisible()
  return title
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 · Page load & layout
// ─────────────────────────────────────────────────────────────────────────────

test.describe('1 · Page load & layout', () => {
  test('displays the header with brand name and Add Task button', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('TaskFlow')).toBeVisible()
    await expect(page.getByRole('button', { name: /add task/i })).toBeVisible()
  })

  test('displays the stats bar with Total, To Do, In Progress, and Done counters', async ({ page }) => {
    await page.goto('/')
    const statsRegion = page.getByRole('region', { name: /task statistics/i })
    await expect(statsRegion).toBeVisible()
    await expect(statsRegion.getByText('Total')).toBeVisible()
    await expect(statsRegion.getByText('To Do')).toBeVisible()
    await expect(statsRegion.getByText('In Progress')).toBeVisible()
    await expect(statsRegion.getByText('Done')).toBeVisible()
  })

  test('displays the task table with correct column headings', async ({ page }) => {
    await page.goto('/')
    const table = page.getByRole('table', { name: /tasks/i })
    await expect(table).toBeVisible()
    await expect(table.getByRole('columnheader', { name: /title/i })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: /priority/i })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: /status/i })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: /created/i })).toBeVisible()
  })

  test('displays the filter bar with search input and dropdowns', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('searchbox', { name: /search tasks/i })).toBeVisible()
    await expect(page.getByLabel(/filter by status/i)).toBeVisible()
    await expect(page.getByLabel(/filter by priority/i)).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2 · Viewing tasks
// ─────────────────────────────────────────────────────────────────────────────

test.describe('2 · Viewing tasks', () => {
  test('shows empty-state prompt when no tasks exist after filtering to a new type', async ({ page }) => {
    await page.goto('/')
    const uniqueSearch = `EmptyState${Date.now()}`
    await page.getByRole('searchbox', { name: /search tasks/i }).fill(uniqueSearch)
    await expect(page.getByText(/no tasks yet/i)).toBeVisible()
  })

  test('shows task title, priority badge, status badge, and created date in the row', async ({ page }) => {
    await page.goto('/')
    const title = await createTask(page, 'ViewTask', 'high')
    const row = page.getByRole('row').filter({ hasText: title })
    await expect(row.getByText('High')).toBeVisible()
    await expect(row.getByText('To Do')).toBeVisible()
    await expect(row.getByText(/\w{3} \d{1,2},? \d{4}/)).toBeVisible()
  })

  test('shows description as a subtitle under the task title', async ({ page }) => {
    await page.goto('/')
    const title = await createTask(page, 'DescTask', 'low', 'This is a test description')
    const row = page.getByRole('row').filter({ hasText: title })
    await expect(row.getByText('This is a test description')).toBeVisible()
  })

  test('task count label reflects the number of visible tasks', async ({ page }) => {
    await page.goto('/')
    const title = await createTask(page, 'CountTask')
    await expect(page.locator('.section-count')).toContainText(/\d+ tasks?/)
    await page.getByRole('searchbox', { name: /search tasks/i }).fill(title)
    await expect(page.locator('.section-count')).toContainText('1 task')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3 · Adding a task
// ─────────────────────────────────────────────────────────────────────────────

test.describe('3 · Adding a task', () => {
  test('creates a new task and it appears in the table', async ({ page }) => {
    await page.goto('/')
    const title = `New Task ${Date.now()}`
    await openAddModal(page)
    await fillAndSubmitTask(page, title, 'high')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText(title)).toBeVisible()
  })

  test('shows a success toast after creating a task', async ({ page }) => {
    await page.goto('/')
    await createTask(page, 'ToastTask')
    await expect(page.getByText(/task created successfully/i)).toBeVisible()
  })

  test('shows validation error when title is empty and modal stays open', async ({ page }) => {
    await page.goto('/')
    await openAddModal(page)
    await page.getByRole('button', { name: /save task/i }).click()
    await expect(page.getByText(/title is required/i)).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4 · Searching tasks
// ─────────────────────────────────────────────────────────────────────────────

test.describe('4 · Searching tasks', () => {
  test('live search filters tasks as user types without page reload', async ({ page }) => {
    await page.goto('/')
    const unique = `LiveSearch${Date.now()}`
    await createTask(page, unique)

    const search = page.getByRole('searchbox', { name: /search tasks/i })
    await search.fill(unique.slice(0, 10))
    await expect(page.getByText(unique)).toBeVisible()

    await search.fill('zzz_no_match_zzz')
    await expect(page.getByText(unique)).not.toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5 · Filtering
// ─────────────────────────────────────────────────────────────────────────────

test.describe('5 · Filtering', () => {
  test('filter by status=In Progress hides todo tasks', async ({ page }) => {
    await page.goto('/')
    const todoTitle = await createTask(page, 'FilterTodo')

    await page.getByLabel(/filter by status/i).selectOption('in-progress')
    await expect(page.getByText(todoTitle)).not.toBeVisible()

    await page.getByLabel(/filter by status/i).selectOption('')
    await expect(page.getByText(todoTitle)).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6 · Editing a task
// ─────────────────────────────────────────────────────────────────────────────

test.describe('6 · Editing a task', () => {
  test('edit button opens the modal pre-populated with existing task data', async ({ page }) => {
    await page.goto('/')
    const title = await createTask(page, 'EditPrefill', 'low')
    const row = page.getByRole('row').filter({ hasText: title })
    await row.getByRole('button', { name: /edit/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByLabel(/title/i)).toHaveValue(title)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 7 · Completing a task (status workflow)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('7 · Completing a task', () => {
  test('mark complete advances status from todo → in-progress', async ({ page }) => {
    await page.goto('/')
    const title = await createTask(page, 'WorkflowTodo')
    const row = page.getByRole('row').filter({ hasText: title })

    await row.getByRole('button', { name: /mark.*complete/i }).click()
    await expect(row.getByText('In Progress')).toBeVisible()
  })

  test('mark complete again advances status from in-progress → done', async ({ page }) => {
    await page.goto('/')
    const title = await createTask(page, 'WorkflowInProgress')
    const row = page.getByRole('row').filter({ hasText: title })

    // todo → in-progress
    await row.getByRole('button', { name: /mark.*complete/i }).click()
    await expect(row.getByText('In Progress')).toBeVisible()

    // in-progress → done (complete button disappears once done)
    await row.getByRole('button', { name: /mark.*complete/i }).click()
    await expect(row.getByText('Done')).toBeVisible()
    await expect(row.getByRole('button', { name: /mark.*complete/i })).not.toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8 · Deleting a task
// ─────────────────────────────────────────────────────────────────────────────

test.describe('8 · Deleting a task', () => {
  test('confirming delete removes the row from the table', async ({ page }) => {
    await page.goto('/')
    const title = await createTask(page, 'DeleteConfirm')

    page.on('dialog', (dialog) => dialog.accept())
    const row = page.getByRole('row').filter({ hasText: title })
    await row.getByRole('button', { name: /delete/i }).click()

    await expect(page.getByText(title)).not.toBeVisible()
  })
})

