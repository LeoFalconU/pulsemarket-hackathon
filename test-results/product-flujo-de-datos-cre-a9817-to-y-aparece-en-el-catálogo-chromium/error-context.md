# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: product.spec.ts >> flujo de datos: crea un producto y aparece en el catálogo
- Location: tests/e2e/product.spec.ts:4:5

# Error details

```
Error: NEXTAUTH_SECRET es requerido para E2E autenticado
```

# Test source

```ts
  1  | import { encode } from 'next-auth/jwt'
  2  | import type { Page } from '@playwright/test'
  3  | 
  4  | export async function signInTestUser(page: Page) {
  5  |   const secret = process.env.NEXTAUTH_SECRET
  6  |   if (!secret) {
> 7  |     throw new Error('NEXTAUTH_SECRET es requerido para E2E autenticado')
     |           ^ Error: NEXTAUTH_SECRET es requerido para E2E autenticado
  8  |   }
  9  | 
  10 |   const token = await encode({
  11 |     token: {
  12 |       sub: 'e2e-user',
  13 |       name: 'Juez E2E',
  14 |       email: 'e2e@pulsemarket.test',
  15 |     },
  16 |     secret,
  17 |   })
  18 | 
  19 |   await page.context().addCookies([
  20 |     {
  21 |       name: 'next-auth.session-token',
  22 |       value: token,
  23 |       url: 'http://localhost:3000',
  24 |       httpOnly: true,
  25 |       sameSite: 'Lax',
  26 |     },
  27 |   ])
  28 | }
  29 | 
```