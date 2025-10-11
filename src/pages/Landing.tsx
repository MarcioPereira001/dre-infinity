import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/GradientText";
import { GlassCard } from "@/components/GlassCard";
import { Navbar } from "@/components/Navbar";
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Zap, 
  Shield, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

export default function Landing() {
  const features = [
    {
      icon: BarChart3,
      title: "DRE Automatizada",
      description: "Cálculos automáticos de DRE completa com análises vertical e horizontal em tempo real."
    },
    {
      icon: TrendingUp,
      title: "Dashboard Interativo",
      description: "Visualize KPIs, margens, CAC, LTV e métricas essenciais em gráficos modernos."
    },
    {
      icon: Target,
      title: "Ponto de Equilíbrio",
      description: "Calcule automaticamente seu ponto de equilíbrio e margem de segurança."
    },
    {
      icon: Zap,
      title: "Simulações",
      description: "Teste cenários e preveja impactos antes de tomar decisões importantes."
    },
    {
      icon: Shield,
      title: "Seguro e Confiável",
      description: "Seus dados financeiros protegidos com a mais alta tecnologia de segurança."
    },
    {
      icon: Sparkles,
      title: "Interface Moderna",
      description: "Design intuitivo e elegante para uma experiência única de gestão financeira."
    }
  ];

  const benefits = [
    "Visão completa da saúde financeira",
    "Decisões baseadas em dados reais",
    "Economia de tempo na análise",
    "Projeções e simulações precisas",
    "Relatórios profissionais em XLSX"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 grid-background opacity-30" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
            <div className="inline-block">
              <div className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm mb-6 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-primary font-medium">Gestão Financeira Inteligente</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <GradientText sparkle>
                DRE Automatizada
              </GradientText>
              <br />
              <span className="text-foreground">para Seu Negócio</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plataforma completa de Demonstração de Resultado do Exercício com 
              dashboard interativo, análises avançadas e simulações em tempo real.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="hero" size="lg" className="text-lg px-8" asChild>
                <Link to="/signup">
                  Experimentar Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="glass" size="lg" className="text-lg px-8" asChild>
                <Link to="/dashboard">
                  Ver Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <GradientText>Recursos Poderosos</GradientText>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para uma gestão financeira profissional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <GlassCard 
                key={index}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
              >
                <div className="flex flex-col items-start space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold gradient-text">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    <GradientText>Por que escolher a DRE INFINITY?</GradientText>
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Transforme dados financeiros em insights estratégicos com a plataforma 
                    mais moderna e intuitiva do mercado.
                  </p>
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/signup">
                      Começar Agora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              <GradientText>Pronto para Transformar</GradientText>
              <br />
              <span className="text-foreground">Sua Gestão Financeira?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Junte-se a empresas que já otimizaram sua gestão financeira com a DRE INFINITY
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="hero" size="lg" className="text-lg px-8" asChild>
                <Link to="/signup">
                  Criar Conta Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">
                <GradientText>DRE INFINITY</GradientText>
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 DRE INFINITY. Gestão financeira profissional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
