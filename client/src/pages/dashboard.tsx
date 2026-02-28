import { useState } from "react";
import { format } from "date-fns";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send,
  CreditCard,
  History,
  TrendingUp
} from "lucide-react";
import { useMyAccount } from "@/hooks/use-accounts";
import { useMyTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TransactionDialog } from "@/components/transaction-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout";

export default function DashboardPage() {
  const { data: user } = useAuth();
  const { data: account, isLoading: loadingAccount } = useMyAccount();
  const { data: transactions, isLoading: loadingTx } = useMyTransactions();
  const [action, setAction] = useState<"deposit" | "withdraw" | "transfer" | null>(null);

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
  };

  const recentTx = transactions?.slice(0, 5) || [];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.fullName}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Balance Card */}
          <div className="lg:col-span-2">
            {loadingAccount ? (
              <Skeleton className="w-full h-56 rounded-3xl" />
            ) : (
              <div className="credit-card-gradient text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden h-56 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-indigo-100 font-medium tracking-wide">Available Balance</p>
                    <h2 className="text-5xl font-bold mt-2 tracking-tight">
                      {formatCurrency(account?.balance || "0")}
                    </h2>
                  </div>
                  <CreditCard className="w-10 h-10 text-white/50" />
                </div>
                
                <div className="relative z-10 flex justify-between items-end mt-8">
                  <div>
                    <p className="text-indigo-200 text-sm font-medium">Account Number</p>
                    <p className="font-mono text-lg tracking-wider mt-1">{account?.accountNumber}</p>
                  </div>
                  {user?.isFrozen && (
                    <div className="bg-red-500/80 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                      ACCOUNT FROZEN
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-rows-3 gap-3">
            <Button 
              variant="outline" 
              className="h-full rounded-2xl flex justify-start items-center px-6 hover:border-primary/50 hover:bg-primary/5 group transition-all"
              onClick={() => setAction("transfer")}
              disabled={user?.isFrozen}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Send Money</p>
                <p className="text-xs text-muted-foreground">Transfer to anyone</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-full rounded-2xl flex justify-start items-center px-6 hover:border-green-500/50 hover:bg-green-500/5 group transition-all"
              onClick={() => setAction("deposit")}
              disabled={user?.isFrozen}
            >
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <ArrowDownLeft className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Deposit Funds</p>
                <p className="text-xs text-muted-foreground">Add money to balance</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-full rounded-2xl flex justify-start items-center px-6 hover:border-red-500/50 hover:bg-red-500/5 group transition-all"
              onClick={() => setAction("withdraw")}
              disabled={user?.isFrozen || Number(account?.balance) <= 0}
            >
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground">Withdraw Funds</p>
                <p className="text-xs text-muted-foreground">Move to external bank</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Recent Transactions */}
        <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50 flex justify-between items-center bg-card">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Recent Transactions</h3>
            </div>
            <Button variant="ghost" size="sm" asChild className="rounded-xl text-primary font-medium hover:bg-primary/10 hover:text-primary">
              <a href="/transactions">View All</a>
            </Button>
          </div>
          
          <div className="divide-y divide-border/50">
            {loadingTx ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="w-32 h-4" />
                      <Skeleton className="w-24 h-3" />
                    </div>
                  </div>
                  <Skeleton className="w-20 h-5" />
                </div>
              ))
            ) : recentTx.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 opacity-50" />
                </div>
                <p>No transactions yet</p>
                <p className="text-sm">Deposit funds to get started</p>
              </div>
            ) : (
              recentTx.map((tx: any) => {
                const isDeposit = tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiverId === account?.id);
                
                return (
                  <div key={tx.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center
                        ${isDeposit ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isDeposit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground capitalize">
                          {tx.type === 'transfer' 
                            ? (isDeposit ? `Transfer from ${tx.senderAccount?.accountNumber}` : `Transfer to ${tx.receiverAccount?.accountNumber}`)
                            : tx.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(tx.createdAt), 'MMM dd, yyyy • hh:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${isDeposit ? 'text-green-500' : 'text-foreground'}`}>
                        {isDeposit ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize
                        ${tx.status === 'completed' ? 'bg-green-500/10 text-green-600' : 
                          tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : 
                          'bg-red-500/10 text-red-600'}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <TransactionDialog 
        action={action} 
        onClose={() => setAction(null)} 
      />
    </AppLayout>
  );
}
