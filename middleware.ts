import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login", // Redirige aquí si no hay sesión
  },
})

// Protege toda la carpeta /dashboard y sus subrutas
export const config = { matcher: ["/dashboard/:path*"] }