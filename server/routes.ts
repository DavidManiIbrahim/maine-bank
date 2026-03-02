import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import pgSession from "connect-pg-simple";
import { db, pool } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Helper to check authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && (req.user as any).role === 'admin') return next();
  res.status(401).json({ message: "Unauthorized - Admin only" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgSessionStore = pgSession(session);

  app.use(session({
    store: new PgSessionStore({
      pool,
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) return done(null, false, { message: 'Incorrect credentials' });
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return done(null, false, { message: 'Incorrect credentials' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await storage.createUser({ ...input, password: hashedPassword });

      // Generate account number
      const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      await storage.createAccount({ userId: user.id, accountNumber });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Internal error" });
        return res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.post(api.auth.login.path, passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) return res.json(req.user);
    res.status(401).json({ message: "Unauthorized" });
  });

  // Account Routes
  app.get(api.accounts.myAccount.path, requireAuth, async (req, res) => {
    const account = await storage.getAccountByUserId((req.user as any).id);
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json(account);
  });

  app.get(api.accounts.lookup.path, requireAuth, async (req, res) => {
    const accountNumber = req.query.accountNumber as string;
    if (!accountNumber) return res.status(400).json({ message: "Account number is required" });

    const account = await storage.getAccountByNumber(accountNumber);
    if (!account) return res.status(404).json({ message: "Account not found" });

    // Only return safe public info (Full name & Account number)
    // Needs user relation, fetching it
    const user = await storage.getUser(account.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      fullName: user.fullName,
      accountNumber: account.accountNumber,
    });
  });

  // Transaction Routes
  app.get(api.transactions.listMy.path, requireAuth, async (req, res) => {
    const account = await storage.getAccountByUserId((req.user as any).id);
    if (!account) return res.json([]);
    const txs = await storage.getTransactionsForAccount(account.id);
    res.json(txs);
  });

  app.post(api.transactions.transfer.path, requireAuth, async (req, res) => {
    try {
      const input = api.transactions.transfer.input.parse(req.body);
      const amount = parseFloat(input.amount);
      if (isNaN(amount) || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

      const senderAccount = await storage.getAccountByUserId((req.user as any).id);
      if (!senderAccount) return res.status(400).json({ message: "Sender account not found" });
      if ((req.user as any).isFrozen) return res.status(400).json({ message: "Account is frozen" });

      const receiverAccount = await storage.getAccountByNumber(input.receiverAccountNumber);
      if (!receiverAccount) return res.status(400).json({ message: "Receiver account not found" });

      if (senderAccount.id === receiverAccount.id) return res.status(400).json({ message: "Cannot transfer to same account" });

      const tx = await storage.executeTransfer(senderAccount.id, receiverAccount.id, amount.toString());
      res.status(201).json(tx);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Transfer failed" });
    }
  });

  app.post(api.transactions.deposit.path, requireAuth, async (req, res) => {
    try {
      const input = api.transactions.deposit.input.parse(req.body);
      const amount = parseFloat(input.amount);
      if (isNaN(amount) || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

      const account = await storage.getAccountByUserId((req.user as any).id);
      if (!account) return res.status(400).json({ message: "Account not found" });
      if ((req.user as any).isFrozen) return res.status(400).json({ message: "Account is frozen" });

      const tx = await storage.executeDeposit(account.id, amount.toString());
      res.status(201).json(tx);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Deposit failed" });
    }
  });

  app.post(api.transactions.withdraw.path, requireAuth, async (req, res) => {
    try {
      const input = api.transactions.withdraw.input.parse(req.body);
      const amount = parseFloat(input.amount);
      if (isNaN(amount) || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

      const account = await storage.getAccountByUserId((req.user as any).id);
      if (!account) return res.status(400).json({ message: "Account not found" });
      if ((req.user as any).isFrozen) return res.status(400).json({ message: "Account is frozen" });

      const tx = await storage.executeWithdraw(account.id, amount.toString());
      res.status(201).json(tx);
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Withdrawal failed" });
    }
  });

  // Admin Routes
  app.get(api.admin.users.path, requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.patch(api.admin.toggleFreeze.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.toggleFreeze.input.parse(req.body);
      const user = await storage.updateUserFreeze(parseInt(req.params.id as string), input.isFrozen);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get(api.admin.transactions.path, requireAdmin, async (req, res) => {
    const txs = await storage.getAllTransactions();
    res.json(txs);
  });

  app.get(api.admin.stats.path, requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    const txs = await storage.getAllTransactions();

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let systemBalance = 0;

    for (const tx of txs) {
      if (tx.type === 'deposit') totalDeposits += parseFloat(tx.amount);
      if (tx.type === 'withdrawal') totalWithdrawals += parseFloat(tx.amount);
    }

    const accountsData = await db.query.accounts.findMany();
    for (const acc of accountsData) {
      systemBalance += parseFloat(acc.balance);
    }

    res.json({
      totalUsers: users.length,
      totalDeposits: totalDeposits.toFixed(2),
      totalWithdrawals: totalWithdrawals.toFixed(2),
      systemBalance: systemBalance.toFixed(2)
    });
  });

  // Seed DB with admin if not exists
  async function seed() {
    const existingAdmin = await storage.getUserByEmail('admin@bank.com');
    if (!existingAdmin) {
      const hash = await bcrypt.hash('admin123', 10);
      const admin = await storage.createUser({
        fullName: 'Admin User',
        email: 'admin@bank.com',
        password: hash,
      });
      await db.update(users).set({ role: 'admin' }).where(eq(users.id, admin.id));
      await storage.createAccount({ userId: admin.id, accountNumber: '0000000000' });
    }
  }

  seed().catch(console.error);

  return httpServer;
}
