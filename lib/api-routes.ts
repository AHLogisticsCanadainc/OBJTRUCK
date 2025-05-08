// API routes for the application

export const apiRoutes = {
  // Authentication endpoints
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    register: "/api/auth/register",
    resetPassword: "/api/auth/reset-password",
  },

  // Dashboard data
  dashboard: {
    summary: "/api/dashboard/summary",
  },

  // Carrier lookup
  carrier: {
    lookup: "/api/carrier-lookup",
  },

  // Email testing
  email: {
    test: "/api/check-resend-config",
  },

  // Quote management
  quotes: {
    create: "/api/quotes/create",
    update: "/api/quotes/update",
    delete: "/api/quotes/delete",
    list: "/api/quotes/list",
  },

  // Client management
  clients: {
    create: "/api/clients/create",
    update: "/api/clients/update",
    delete: "/api/clients/delete",
    list: "/api/clients/list",
  },
}
