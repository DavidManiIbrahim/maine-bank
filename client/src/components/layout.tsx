import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  LogOut, 
  Users, 
  Activity, 
  Wallet,
  ShieldAlert
} from "lucide-react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useAuth();
  const [location] = useLocation();
  const logout = useLogout();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const isAdmin = user.role === "admin";

  const customerLinks = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  ];

  const adminLinks = [
    { title: "Overview", url: "/admin", icon: Activity },
    { title: "Manage Users", url: "/admin/users", icon: Users },
    { title: "All Transactions", url: "/admin/transactions", icon: ArrowLeftRight },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex min-h-screen w-full bg-secondary/30">
        <Sidebar className="border-r border-border/50">
          <div className="flex h-16 items-center px-6 border-b border-border/50">
            <Wallet className="w-6 h-6 text-primary mr-2" />
            <span className="font-bold text-lg tracking-tight text-foreground"> MAINE BANK</span>
          </div>
          
          <SidebarContent className="py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {isAdmin ? "Admin Controls" : "My Account"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {links.map((link) => {
                    const isActive = location === link.url;
                    return (
                      <SidebarMenuItem key={link.url}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          className={`
                            ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary'} 
                            transition-colors duration-200 rounded-xl mb-1
                          `}
                        >
                          <Link href={link.url}>
                            <link.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                            <span>{link.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <div className="mt-auto p-4 border-t border-border/50">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user.fullName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold truncate max-w-[140px]">{user.fullName}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all rounded-xl"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              {isAdmin && (
                <div className="hidden sm:flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-full text-xs font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin Mode
                </div>
              )}
            </div>
          </header>
          
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto opacity-0 fade-in-up">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
