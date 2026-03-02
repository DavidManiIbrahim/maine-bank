import { z } from 'zod';
import { insertUserSchema, users, accounts, transactions } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  unauthorized: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
  badRequest: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: z.object({ fullName: z.string(), email: z.string(), password: z.string() }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ email: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: {
        200: z.object({ message: z.string() })
      }
    }
  },
  accounts: {
    myAccount: {
      method: 'GET' as const,
      path: '/api/accounts/me' as const,
      responses: {
        200: z.custom<typeof accounts.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    lookup: {
      method: 'GET' as const,
      path: '/api/accounts/lookup' as const,
      responses: {
        200: z.object({ fullName: z.string(), accountNumber: z.string() }),
        404: errorSchemas.notFound,
      }
    }
  },
  transactions: {
    listMy: {
      method: 'GET' as const,
      path: '/api/transactions/me' as const,
      responses: {
        200: z.array(z.custom<any>()), // Can be TransactionWithType
      }
    },
    transfer: {
      method: 'POST' as const,
      path: '/api/transactions/transfer' as const,
      input: z.object({ receiverAccountNumber: z.string(), amount: z.string() }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.badRequest,
      }
    },
    deposit: {
      method: 'POST' as const,
      path: '/api/transactions/deposit' as const,
      input: z.object({ amount: z.string() }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.badRequest,
      }
    },
    withdraw: {
      method: 'POST' as const,
      path: '/api/transactions/withdraw' as const,
      input: z.object({ amount: z.string() }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.badRequest,
      }
    }
  },
  admin: {
    users: {
      method: 'GET' as const,
      path: '/api/admin/users' as const,
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>())
      }
    },
    toggleFreeze: {
      method: 'PATCH' as const,
      path: '/api/admin/users/:id/freeze' as const,
      input: z.object({ isFrozen: z.boolean() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>()
      }
    },
    transactions: {
      method: 'GET' as const,
      path: '/api/admin/transactions' as const,
      responses: {
        200: z.array(z.custom<any>())
      }
    },
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats' as const,
      responses: {
        200: z.object({
          totalUsers: z.number(),
          totalDeposits: z.string(),
          totalWithdrawals: z.string(),
          systemBalance: z.string()
        })
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
