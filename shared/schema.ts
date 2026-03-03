import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('customer'), // 'customer' | 'admin'
  isFrozen: integer("is_frozen", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id),
  accountNumber: text("account_number").notNull().unique(),
  balance: text("balance").notNull().default('0'),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  senderId: integer("sender_id").references(() => accounts.id), // null for deposits
  receiverId: integer("receiver_id").references(() => accounts.id), // null for withdrawals
  amount: text("amount").notNull(),
  type: text("type").notNull(), // 'deposit' | 'withdrawal' | 'transfer'
  status: text("status").notNull().default('pending'), // 'pending' | 'completed' | 'failed'
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

export const usersRelations = relations(users, ({ one }) => ({
  account: one(accounts, {
    fields: [users.id],
    references: [accounts.userId],
  }),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  sentTransactions: many(transactions, { relationName: "sender" }),
  receivedTransactions: many(transactions, { relationName: "receiver" }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  sender: one(accounts, {
    fields: [transactions.senderId],
    references: [accounts.id],
    relationName: "sender"
  }),
  receiver: one(accounts, {
    fields: [transactions.receiverId],
    references: [accounts.id],
    relationName: "receiver"
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, role: true, isFrozen: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, status: true });

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type TransactionWithType = Transaction & {
  senderAccount?: Account | null,
  receiverAccount?: Account | null
};
