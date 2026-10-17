import { expect, test } from '@playwright/test'
import { signInTestUser } from './helpers/auth'

test('flujo interactivo: drag and drop persiste el estado del kanban', async ({ page }) => {
  await signInTestUser(page)
  await page.goto('/dashboard/kanban')

  const dashboard = page.getByRole('main')
  const card = dashboard.locator('[data-testid^="kanban-card-"]').first()
  await expect(card).toBeVisible()
  const cardId = await card.getAttribute('data-testid')
  if (!cardId) {
    throw new Error('La tarjeta de Kanban no expone data-testid')
  }
  const initialColumn = card.locator(
    'xpath=ancestor::*[@data-testid and starts-with(@data-testid,"kanban-column-")]',
  )
  const initialColumnId = await initialColumn.getAttribute('data-testid')
  if (!initialColumnId) {
    throw new Error('No se pudo identificar la columna inicial de Kanban')
  }
  const destinationStatus = initialColumnId === 'kanban-column-DONE' ? 'TODO' : 'DONE'
  const destination = dashboard.getByTestId(`kanban-column-${destinationStatus}`)
  const moveResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/kanban') && response.request().method() === 'PATCH',
  )
  const cardBox = await card.boundingBox()
  const destinationBox = await destination.boundingBox()
  if (!cardBox || !destinationBox) {
    throw new Error('No se pudo calcular la posición de la tarjeta o columna Kanban')
  }

  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    destinationBox.x + destinationBox.width / 2,
    destinationBox.y + destinationBox.height - 20,
    { steps: 10 },
  )
  await page.mouse.up()

  expect((await moveResponse).status()).toBe(200)
  await expect(destination.locator(`[data-testid="${cardId}"]`)).toBeVisible()

  await page.reload()
  await expect(
    dashboard
      .getByTestId(`kanban-column-${destinationStatus}`)
      .locator(`[data-testid="${cardId}"]`),
  ).toBeVisible()

  const taskId = cardId.replace('kanban-card-', '')
  const persisted = await page.request.get('/api/kanban')
  expect(persisted.ok()).toBeTruthy()
  const payload = (await persisted.json()) as { tasks: Array<{ id: string; status: string }> }
  expect(payload.tasks.find((task) => task.id === taskId)?.status).toBe(destinationStatus)
})
