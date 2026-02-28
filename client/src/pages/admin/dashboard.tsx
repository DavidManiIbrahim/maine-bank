import { useAdminStats } from "@/hooks/use-admin";
import { AppLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
  };

  // Mock data for chart visualization
  const chartData = [
    { name: 'Deposits', value: Number(stats?.totalDeposits || 0), color: '#22c55e' },
    { name: 'Withdrawals', value: Number(stats?.totalWithdrawals || 0), color: '#ef4444' },
    { name: 'System Balance', value: Number(stats?.systemBalance || 0), color: '#6366f1' },
  ];

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "System Balance", value: formatCurrency(stats?.systemBalance || "0"), icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { title: "Total Deposits", value: formatCurrency(stats?.totalDeposits || "0"), icon: ArrowDownLeft, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Total Withdrawals", value: formatCurrency(stats?.totalWithdrawals || "0"), icon: ArrowUpRight, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
          <p className="text-muted-foreground mt-1">System-wide statistics and metrics</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <Card key={i} className="p-6 rounded-3xl border-border/50 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                  )}
                </div>
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Financial Volume Overview</h3>
          <div className="h-[400px] w-full">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))'}} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: 'hsl(var(--muted-foreground))'}}
                    tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                  />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--secondary))'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
