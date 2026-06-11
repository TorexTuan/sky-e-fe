/**
 * Global Auth Middleware
 *
 * Runs on every route navigation (global = filename suffix `.global.ts`).
 *
 * Rules:
 * - Unauthenticated user → protected route: redirect to /auth/login
 * - Authenticated user   → guest-only route (/auth/*): redirect to /
 */

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  const isAuthenticated = authStore.isAuthenticated
  const isAuthRoute = to.path.startsWith('/auth')

  // Authenticated user trying to access login/register → redirect home
  if (isAuthenticated && isAuthRoute) {
    return navigateTo('/', { replace: true })
  }

  // Unauthenticated user trying to access protected route → redirect to login
  if (!isAuthenticated && !isAuthRoute) {
    return navigateTo('/auth/login', { replace: true })
  }
})
