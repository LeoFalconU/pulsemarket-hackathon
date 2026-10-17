This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Base de datos y seed

El seed elimina y vuelve a crear registros. Solo se ejecuta si `DATABASE_URL` apunta a
`localhost`, `127.0.0.1` o `::1`; usa una base local aislada y nunca la conexión compartida
de Railway. No guardes credenciales de base de datos en el repositorio.

## Despliegue en Vercel con PostgreSQL

Configura `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GITHUB_ID`,
`GITHUB_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `AUTHORIZED_EMAIL_DOMAIN`
en las variables de entorno del proyecto de Vercel para cada entorno que corresponda. El
dominio permitido por defecto es `@utez.edu.mx`; se valida tanto durante OAuth como en el
Middleware, APIs y Server Actions. Usa la URL de la base PostgreSQL del entorno y no la
publiques en el repositorio ni en los logs.

Los builds de Preview pueden completarse sin estas variables para no bloquear la revisión
del pull request. Sin embargo, iniciar sesión y usar el dashboard requiere `DATABASE_URL`,
`NEXTAUTH_SECRET`, `NEXTAUTH_URL` y las credenciales completas de al menos un proveedor OAuth.
Sin esa configuración, el login avisa que el acceso no está listo y no ofrece botones que
fallarían. Antes de probar el sistema desplegado, configura todos los valores en Vercel y
apunta `DATABASE_URL` a una base de pruebas aislada, no a la base compartida.

La instalación y el build generan el cliente Prisma, pero no ejecutan migraciones ni seed.
Aplica `npx prisma migrate deploy` de forma controlada contra la base de destino antes de
desplegar el código que requiera esas migraciones. Nunca ejecutes `prisma:seed` contra
producción o contra una base compartida.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
