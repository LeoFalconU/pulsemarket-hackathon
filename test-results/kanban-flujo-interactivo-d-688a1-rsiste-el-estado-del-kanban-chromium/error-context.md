# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kanban.spec.ts >> flujo interactivo: drag and drop persiste el estado del kanban
- Location: tests\e2e\kanban.spec.ts:4:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid^="kanban-card-"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('[data-testid^="kanban-card-"]').first() with timeout 5000ms
  - waiting for locator('[data-testid^="kanban-card-"]').first()

```

```yaml
- main:
  - heading "PulseMarket" [level=1]
  - paragraph: Acceso exclusivo con Google o GitHub.
  - button "Continuar con Google"
  - button "Continuar con GitHub"
- alert
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | import { signInTestUser } from './helpers/auth'
  3  | 
  4  | test('flujo interactivo: drag and drop persiste el estado del kanban', async ({ page }) => {
  5  |   await signInTestUser(page)
  6  |   await page.goto('/dashboard')
  7  | 
  8  |   const card = page.locator('[data-testid^="kanban-card-"]').first()
> 9  |   await expect(card).toBeVisible()
     |                      ^ Error: expect(locator).toBeVisible() failed
  10 |   const cardId = await card.getAttribute('data-testid')
  11 |   expect(cardId).toBeTruthy()
  12 | 
  13 |   const doneColumn = page.getByTestId('kanban-column-DONE')
  14 |   await card.dragTo(doneColumn)
  15 |   await expect(doneColumn.locator(`[data-testid="${cardId}"]`)).toBeVisible()
  16 | 
  17 |   await page.reload()
  18 |   await expect(doneColumn.locator(`[data-testid="${cardId}"]`)).toBeVisible()
  19 | })
  20 | 
```