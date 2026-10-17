import { expect, test } from '@playwright/test'
import { signInTestUser } from './helpers/auth'

test('flujo interactivo: drag and drop persiste el estado del kanban', async ({ page }) => {
  await signInTestUser(page)
  await page.goto('/dashboard/kanban')

  const dashboard = page.getByRole('main')
  const card = dashboard.locator('[data-testid^="kanban-card-"]').first()
  await expect(card).toBeVisible()
  const cardId = await card.getAttribute('data-testid')
  expect(cardId).toBeTruthy()

  const doneColumn = dashboard.getByTestId('kanban-column-DONE')
  const moveResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/kanban') && response.request().method() === 'PATCH',
  )
  const cardBox = await card.boundingBox()
  const columnBox = await doneColumn.boundingBox()
  if (!cardBox || !columnBox) {
    throw new Error('No se pudo calcular la posición de la tarjeta o columna Kanban')
  }

  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    columnBox.x + columnBox.width / 2,
    columnBox.y + columnBox.height - 20,
    { steps: 10 },
  )
  await page.mouse.up()

  expect((await moveResponse).status()).toBe(200)
  await expect(doneColumn.locator(`[data-testid="${cardId}"]`)).toBeVisible()

  await page.reload()
  await expect(doneColumn.locator(`[data-testid="${cardId}"]`)).toBeVisible()
})
