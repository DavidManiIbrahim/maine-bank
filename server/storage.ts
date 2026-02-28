import { db } from "./db";
import { users, accounts, transactions, type InsertUser, type InsertAccount, type InsertTransaction, type User, type Account, type Transaction } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserFreeze(id: number, isFrozen: boolean): Promise<User>;
  
  createAccount(account: InsertAccount): Promise<Account>;
  getAccountByUserId(userId: number): Promise<Account | undefined>;
  getAccountByNumber(accountNumber: string): Promise<Account | undefined>;
  
  createTransaction(tx: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction>;
  
  getTransactionsForAccount(accountId: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  
  // Atomic transfer
  executeTransfer(senderAccountId: number, receiverAccountId: number, amount: string): Promise<Transaction>;
  executeDeposit(accountId: number, amount: string): Promise<Transaction>;
  executeWithdraw(accountId: number, amount: string): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserFreeze(id: number, isFrozen: boolean): Promise<User> {
    const [user] = await db.update(users).set({ isFrozen }).where(eq(users.id, id)).returning();
    return user;
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db.insert(accounts).values(insertAccount).returning();
    return account;
  }

  async getAccountByUserId(userId: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.userId, userId));
    return account;
  }

  async getAccountByNumber(accountNumber: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.accountNumber, accountNumber));
    return account;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [tx] = await db.insert(transactions).values(insertTransaction).returning();
    return tx;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    const [tx] = await db.update(transactions).set({ status }).where(eq(transactions.id, id)).returning();
    return tx;
  }

  async getTransactionsForAccount(accountId: number): Promise<Transaction[]> {
    return db.query.transactions.findMany({
      where: (tx, { eq, or }) => or(eq(tx.senderId, accountId), eq(tx.receiverId, accountId)),
      with: {
        sender: true,
        receiver: true
      },
      orderBy: (tx, { desc }) => [desc(tx.createdAt)]
    });
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return db.query.transactions.findMany({
      with: {
        sender: true,
        receiver: true
      },
      orderBy: (tx, { desc }) => [desc(tx.createdAt)]
    });
  }

  async executeTransfer(senderAccountId: number, receiverAccountId: number, amount: string): Promise<Transaction> {
    return await db.transaction(async (tx) => {
      const [sender] = await tx.select().from(accounts).where(eq(accounts.id, senderAccountId));
      const [receiver] = await tx.select().from(accounts).where(eq(accounts.id, receiverAccountId));
      
      if (!sender || !receiver) throw new Error("Account not found");
      if (parseFloat(sender.balance) < parseFloat(amount)) throw new Error("Insufficient funds");

      const [transaction] = await tx.insert(transactions).values({
        senderId: senderAccountId,
        receiverId: receiverAccountId,
        amount,
        type: 'transfer',
        status: 'completed'
      }).returning();

      await tx.update(accounts).set({ balance: sql`${accounts.balance} - ${amount}::numeric` }).where(eq(accounts.id, senderAccountId));
      await tx.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}::numeric` }).where(eq(accounts.id, receiverAccountId));

      return transaction;
    });
  }

  async executeDeposit(accountId: number, amount: string): Promise<Transaction> {
    return await db.transaction(async (tx) => {
      const [transaction] = await tx.insert(transactions).values({
        receiverId: accountId,
        amount,
        type: 'deposit',
        status: 'completed'
      }).returning();

      await tx.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}::numeric` }).where(eq(accounts.id, accountId));

      return transaction;
    });
  }

  async executeWithdraw(accountId: number, amount: string): Promise<Transaction> {
    return await db.transaction(async (tx) => {
      const [account] = await tx.select().from(accounts).where(eq(accounts.id, accountId));
      if (!account) throw new Error("Account not found");
      if (parseFloat(account.balance) < parseFloat(amount)) throw new Error("Insufficient funds");

      const [transaction] = await tx.insert(transactions).values({
        senderId: accountId,
        amount,
        type: 'withdrawal',
        status: 'completed'
      }).returning();

      await tx.update(accounts).set({ balance: sql`${accounts.balance} - ${amount}::numeric` }).where(eq(accounts.id, accountId));

      return transaction;
    });
  }
}

export const storage = new DatabaseStorage();