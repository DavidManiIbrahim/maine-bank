import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Globe, Lock, CreditCard } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">MAINE BANK</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
              The future of <span className="text-primary">digital banking</span> is here.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Experience seamless, secure, and lightning-fast financial services designed for the modern world. Manage your wealth with MAINE BANK.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-lg gap-2">
                  Open Account <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                View Personal Rates
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for security and scale</h2>
            <p className="text-muted-foreground text-lg">MAINE BANK provides institutional-grade security with the simplicity of a consumer app.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Lock className="w-6 h-6 text-primary" />}
              title="Secure Storage"
              description="Your funds are protected by multi-layer encryption and real-time fraud monitoring."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="Instant Transfers"
              description="Send money to any MAINE BANK user instantly, 24/7, with zero fees."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-primary" />}
              title="Global Access"
              description="Manage your accounts from anywhere in the world with our mobile-first platform."
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-12 text-primary-foreground overflow-hidden relative">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl font-bold mb-6">Join the banking revolution today.</h2>
              <p className="text-primary-foreground/80 text-xl mb-8">
                Over 2 million users trust MAINE BANK for their daily financial needs. 
                Start your journey towards financial freedom.
              </p>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg">
                  Create Free Account
                </Button>
              </Link>
            </div>
            <CreditCard className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 text-primary-foreground/10 rotate-12 -z-0" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Shield className="text-primary w-6 h-6" />
              <span className="text-xl font-bold tracking-tight">MAINE BANK</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 MAINE BANK Corporation. Member FDIC.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-background border hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
