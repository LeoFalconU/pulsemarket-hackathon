import { expect, test } from '@playwright/test'
import { signInTestUser } from './helpers/auth'

test('flujo interactivo: drag and drop persiste el estado del kanban', async ({ page }) => {
  await signInTestUser(page)
  await page.goto('/dashboard/kanban')

  const card = page.locator('[data-testid^="kanban-card-"]').first()
  await expect(card).toBeVisible()
  const cardId = await card.getAttribute('data-testid')
  if (!cardId) {
    throw new Error('La tarjeta de Kanban no expone data-testid')
  }
  const initialColumn = card.locator('xpath=ancestor::*[@data-testid and starts-with(@data-testid,"kanban-column-")]')
  const initialStatus = await initialColumn.getAttribute('data-testid')
  const destinationStatus = initialStatus === 'kanban-column-DONE' ? 'TODO' : 'DONE'
  const destination = page.getByTestId(`kanban-column-${destinationStatus}`)
  await card.dragTo(destination)
  await expect(destination.locator(`[data-testid="${cardId}"]`)).toBeVisible()

  await page.reload()
  await expect(page.getByTestId(`kanban-column-${destinationStatus}`).locator(`[data-testid="${cardId}"]`)).toBeVisible()

  const taskId = cardId.replace('kanban-card-', '')
  const persisted = await page.request.get('/api/kanban')
  expect(persisted.ok()).toBeTruthy()
  const payload = (await persisted.json()) as { tasks: Array<{ id: string; status: string }> }
  expect(payload.tasks.find((task) => task.id === taskId)?.status).toBe(destinationStatus)
})
