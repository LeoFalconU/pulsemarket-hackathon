import { expect, test } from '@playwright/test'
import { signInTestUser } from './helpers/auth'

test('flujo interactivo: drag and drop persiste el estado del kanban', async ({ page }) => {
  await signInTestUser(page)
  await page.goto('/dashboard')

  const card = page.locator('[data-testid^="kanban-card-"]').first()
  await expect(card).toBeVisible()
  const cardId = await card.getAttribute('data-testid')
  expect(cardId).toBeTruthy()

  const doneColumn = page.getByTestId('kanban-column-DONE')
  await card.dragTo(doneColumn)
  await expect(doneColumn.locator(`[data-testid="${cardId}"]`)).toBeVisible()

  await page.reload()
  await expect(doneColumn.locator(`[data-testid="${cardId}"]`)).toBeVisible()
})
