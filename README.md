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

`npm run prisma:seed` es destructivo: elimina y vuelve a crear registros. Solo se ejecuta si
`DATABASE_URL` apunta a `localhost`, `127.0.0.1` o `::1`; úsalo en una base local aislada,
nunca en Railway ni en otra base compartida.

Para cumplir el requisito de volumen en una base de demo remota aislada, existe
`npm run prisma:seed:demo`. Este comando es aditivo e idempotente: inserta 10,000 productos,
4,000 ventas relacionadas, 250 clientes y 7 tareas, usando IDs deterministas y omitiendo filas
ya insertadas. No borra ni reemplaza datos existentes. Requiere que primero se aplique la
migración y que se configuren explícitamente una URL de base de demo remota y una frase de
confirmación en la terminal:

```bash
export PULSEMARKET_DEMO_DATABASE_URL='URL_DE_LA_BASE_DEMO_AISLADA'
export PULSEMARKET_DEMO_SEED_CONFIRM='INSERT_DEMO_DATA_NON_DESTRUCTIVELY'
npm run prisma:seed:demo
unset PULSEMARKET_DEMO_DATABASE_URL PULSEMARKET_DEMO_SEED_CONFIRM
```

En PowerShell:

```powershell
$env:PULSEMARKET_DEMO_DATABASE_URL = 'URL_DE_LA_BASE_DEMO_AISLADA'
$env:PULSEMARKET_DEMO_SEED_CONFIRM = 'INSERT_DEMO_DATA_NON_DESTRUCTIVELY'
npm.cmd run prisma:seed:demo
Remove-Item Env:PULSEMARKET_DEMO_DATABASE_URL, Env:PULSEMARKET_DEMO_SEED_CONFIRM
```

No guardes las credenciales de base de datos en el repositorio ni las pegues en chats o logs.
No ejecutes el seed de demo contra la base compartida del equipo; usa un servicio/base Railway
aislado para la demostración.

## Despliegue en Vercel con PostgreSQL

Configura `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GITHUB_ID`,
`GITHUB_SECRET`, `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en las variables de entorno
del proyecto de Vercel para cada entorno que corresponda. Usa la URL de la base PostgreSQL
del entorno y no la publiques en el repositorio ni en los logs.

Los builds de Preview pueden completarse sin estas variables para no bloquear la revisión
del pull request. Sin embargo, iniciar sesión y usar el dashboard requiere `DATABASE_URL`,
`NEXTAUTH_SECRET`, `NEXTAUTH_URL` y las credenciales completas de al menos un proveedor OAuth.
Sin esa configuración, el login avisa que el acceso no está listo y no ofrece botones que
fallarían. Antes de probar el sistema desplegado, configura todos los valores en Vercel y
apunta `DATABASE_URL` a una base de pruebas aislada, no a la base compartida.

La instalación y el build generan el cliente Prisma, pero no ejecutan migraciones ni seed.
Aplica `npm run prisma:migrate` de forma controlada contra la base de destino antes de
desplegar el código que requiera esas migraciones. Nunca ejecutes el seed local destructivo
contra producción o contra una base compartida. El seed remoto de demo tampoco debe ejecutarse
contra producción.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
