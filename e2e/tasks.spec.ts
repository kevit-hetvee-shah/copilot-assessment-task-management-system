/**
 * E2E tests for the Task Management System.
 * Generated via Playwright MCP browser observation.
 *
 * Covers: page load, add task, complete task workflow,
 *         edit task, delete task, filter by status/priority, live search.
 *
 * Run: npx playwright test
 * Requires: frontend on http://localhost:5173 + backend on http://localhost:8000
 */
import { test, expect, Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function openAddModal(page: Page) {
  await page.getByRole('button', { name: /add task/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
}

async function fillAndSubmitTask(page: Page, title: string, priority: 'Low' | 'Medium' | 'High' = 'Medium') {
  await page.getByLabel(/title/i).fill(title)
  await page.getByRole('radio', { name: priority }).click()
  await page.getByRole('button', { name: /save task/i }).click()
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe('Task Management System', () => {

  test('page load — table and Add Task button are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('table', { name: /tasks/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /add task/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search tasks/i)).toBeVisible()
  })

  test('add task — new task appears in the table', async ({ page }) => {
    await page.goto('/')
    const title = `E2E Task ${Date.now()}`
    await openAddModal(page)
    await fillAndSubmitTask(page, title, 'High')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText(title)).toBeVisible()
  })

  test('add task — empty title shows validation error', async ({ page }) => {
    await page.goto('/')
    await openAddModal(page)
    await page.getByRole('button', { name: /save task/i }).click()
    await expect(page.getByText(/title is required/i)).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible() // modal stays open
  })

  test('complete task — advances status from todo to in-progress', async ({ page }) => {
    await page.goto('/')
    const title = `Complete E2E ${Date.now()}`
    await openAddModal(page)
    await fillAndSubmitTask(page, title)

    // Find the row and click Complete
    const row = page.getByRole('row').filter({ hasText: title })
    await row.getByRole('button', { name: /mark.*complete/i }).click()

    // Status badge should now read "In Progress"
    await expect(row.getByText('In Progress')).toBeVisible()
  })

  test('complete task again — advances from in-progress to done', async ({ page }) => {
    await page.goto('/')
    const title = `Done E2E ${Date.now()}`
    await openAddModal(page)
    await fillAndSubmitTask(page, title)

    const row = page.getByRole('row').filter({ hasText: title })

    // todo → in-progress
    await row.getByRole('button', { name: /mark.*complete/i }).click()
    await expect(row.getByText('In Progress')).toBeVisible()

    // in-progress → done (complete button disappears once done)
    await row.getByRole('button', { name: /mark.*complete/i }).click()
    await expect(row.getByText('Done')).toBeVisible()
    await expect(row.getByRole('button', { name: /mark.*complete/i })).not.toBeVisible()
  })

  test('edit task — updated title is reflected in the table', async ({ page }) => {
    await page.goto('/')
    const title = `Edit Me ${Date.now()}`
    const updatedTitle = `Edited ${Date.now()}`
    await openAddModal(page)
    await fillAndSubmitTask(page, title)

    const row = page.getByRole('row').filter({ hasText: title })
    await row.getByRole('button', { name: /edit/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByLabel(/title/i).fill(updatedTitle)
    await page.getByRole('button', { name: /update task/i }).click()

    await expect(page.getByText(updatedTitle)).toBeVisible()
    await expect(page.getByText(title)).not.toBeVisible()
  })

  test('delete task — row is removed from the table', async ({ page }) => {
    await page.goto('/')
    const title = `Delete Me ${Date.now()}`
    await openAddModal(page)
    await fillAndSubmitTask(page, title)

    const row = page.getByRole('row').filter({ hasText: title })
    page.on('dialog', (dialog) => dialog.accept()) // confirm delete
    await row.getByRole('button', { name: /delete/i }).click()

    await expect(page.getByText(title)).not.toBeVisible()
  })

  test('filter by status — only matching tasks are visible', async ({ page }) => {
    await page.goto('/')

    // Add one todo task
    const todoTitle = `Status-Todo ${Date.now()}`
    await openAddModal(page)
    await fillAndSubmitTask(page, todoTitle)

    // Select "In Progress" filter — the todo task should disappear
    await page.getByLabel(/filter by status/i).selectOption('in-progress')
    await expect(page.getByText(todoTitle)).not.toBeVisible()

    // Reset filter
    await page.getByLabel(/filter by status/i).selectOption('')
    await expect(page.getByText(todoTitle)).toBeVisible()
  })

  test('filter by priority — only high-priority tasks visible', async ({ page }) => {
    await page.goto('/')
    const highTitle = `High Prio ${Date.now()}`
    await openAddModal(page)
    await fillAndSubmitTask(page, highTitle, 'High')

    await page.getByLabel(/filter by priority/i).selectOption('high')
    await expect(page.getByText(highTitle)).toBeVisible()

    // Tasks without high priority should not appear
    const rows = page.getByRole('row')
    const count = await rows.count()
    for (let i = 1; i < count; i++) {
      await expect(rows.nth(i).getByText('High')).toBeVisible()
    }
  })

  test('live search — table updates as user types, no page reload', async ({ page }) => {
    await page.goto('/')
    const uniqueTitle = `UniqueSearch${Date.now()}`
    await openAddModal(page)
    await fillAndSubmitTask(page, uniqueTitle)

    const searchInput = page.getByPlaceholder(/search tasks/i)
    await searchInput.fill(uniqueTitle.slice(0, 6))
    await expect(page.getByText(uniqueTitle)).toBeVisible()

    // Typing something that matches nothing should show no rows
    await searchInput.fill('zzz_no_match_zzz')
    await expect(page.getByText(uniqueTitle)).not.toBeVisible()
  })

  test('clear filters button resets all filters', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder(/search tasks/i).fill('some text')
    await expect(page.getByRole('button', { name: /clear/i })).toBeVisible()
    await page.getByRole('button', { name: /clear/i }).click()
    await expect(page.getByPlaceholder(/search tasks/i)).toHaveValue('')
  })
})

