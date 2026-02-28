import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin, useRegister, useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Wallet } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2),
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { data: user, isLoading } = useAuth();
  
  const login = useLogin();
  const register = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: { email: "", password: "", fullName: "" },
  });

  if (isLoading) return null;
  if (user) return <Redirect to={user.role === 'admin' ? '/admin' : '/dashboard'} />;

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    if (isLogin) {
      login.mutate({ email: values.email, password: values.password });
    } else {
      register.mutate(values);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply opacity-70 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full mix-blend-multiply opacity-70" />

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-card rounded-[2rem] shadow-2xl overflow-hidden border border-border/50 relative z-10 m-4 min-h-[600px]">
        
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Wallet className="w-8 h-8 text-indigo-300" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Nexus Bank</h1>
            </div>
            <h2 className="mt-16 text-4xl font-bold leading-tight font-display">
              The future of <br/> borderless banking.
            </h2>
            <p className="mt-6 text-indigo-200 text-lg max-w-md">
              Experience seamless global transfers, beautiful insights, and unparalleled security.
            </p>
          </div>
          
          <div className="relative z-10 text-sm text-indigo-300">
            © 2024 Nexus Financial Technologies
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-card">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold text-foreground">
                {isLogin ? "Welcome back" : "Create an account"}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {isLogin ? "Enter your credentials to access your account." : "Join Nexus Bank in just a few clicks."}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {!isLogin && (
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="fade-in-up">
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-background transition-colors" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="fade-in-up delay-100">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="hello@example.com" className="h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-background transition-colors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="fade-in-up delay-200">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className="h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-background transition-colors" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 fade-in-up delay-300"
                  disabled={login.isPending || register.isPending}
                >
                  {login.isPending || register.isPending ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center fade-in-up delay-300">
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    form.reset();
                  }}
                  className="ml-2 font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
