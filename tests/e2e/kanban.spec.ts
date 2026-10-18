import { expect, test } from '@playwright/test'
import { signInTestUser } from './helpers/auth'

test('flujo interactivo: drag and drop persiste el estado del kanban', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
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
  const dragHandle = card.getByTestId(
    `kanban-card-handle-${cardId.replace('kanban-card-', '')}`,
  )
  await dragHandle.scrollIntoViewIfNeeded()
  await destination.scrollIntoViewIfNeeded()
  const moveResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/kanban') && response.request().method() === 'PATCH',
  )
  const cardBox = await dragHandle.boundingBox()
  const destinationBox = await destination.boundingBox()
  if (!cardBox || !destinationBox) {
    throw new Error('No se pudo calcular la posición de la tarjeta o columna Kanban')
  }

  await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    destinationBox.x + destinationBox.width / 2,
    destinationBox.y + 80,
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

test('crea, edita y elimina una tarjeta Kanban de forma persistente', async ({ page }) => {
  await signInTestUser(page)
  await page.goto('/dashboard/kanban')

  const originalTitle = `Tarea E2E ${Date.now()}`
  const editedTitle = `${originalTitle} editada`
  const titleInput = page.getByTestId('kanban-new-title')
  await titleInput.fill(originalTitle)

  const createResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/kanban') && response.request().method() === 'POST',
  )
  await page.getByTestId('kanban-create').click()
  expect((await createResponse).status()).toBe(201)

  const createdCard = page.locator('article[data-testid^="kanban-card-"]').filter({
    hasText: originalTitle,
  })
  await expect(createdCard).toBeVisible()
  const cardTestId = await createdCard.getAttribute('data-testid')
  if (!cardTestId) {
    throw new Error('La tarjeta creada no expone data-testid')
  }
  const card = page.getByTestId(cardTestId)
  await card.getByTestId('kanban-edit').click()
  await card.getByTestId('kanban-edit-title').fill(editedTitle)

  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/kanban') && response.request().method() === 'PATCH',
  )
  await card.getByTestId('kanban-save-edit').click()
  expect((await updateResponse).status()).toBe(200)
  await expect(card).toContainText(editedTitle)

  page.once('dialog', (dialog) => dialog.accept())
  const deleteResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/kanban') && response.request().method() === 'DELETE',
  )
  await card.getByTestId('kanban-delete').click()
  expect((await deleteResponse).status()).toBe(200)
  await expect(card).toHaveCount(0)

  await page.reload()
  await expect(page.getByText(editedTitle)).toHaveCount(0)
})
