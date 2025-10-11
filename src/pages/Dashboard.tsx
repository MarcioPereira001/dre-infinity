import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { Navbar } from "@/components/Navbar";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function Dashboard() {
  const kpis = [
    {
      title: "Lucro Líquido",
      value: "R$ 245.800",
      change: "+18.5%",
      trend: "up" as const,
      icon: DollarSign,
      margin: "Margem: 24.5%"
    },
    {
      title: "Lucro Bruto",
      value: "R$ 456.200",
      change: "+12.3%",
      trend: "up" as const,
      icon: TrendingUp,
      margin: "Margem: 45.6%"
    },
    {
      title: "LTV/CAC",
      value: "4.2",
      change: "+0.8",
      trend: "up" as const,
      icon: Target,
      margin: "Acima da meta"
    },
    {
      title: "Ticket Médio",
      value: "R$ 1.850",
      change: "+5.2%",
      trend: "up" as const,
      icon: Users,
      margin: "Por cliente"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <GradientText>Dashboard Financeiro</GradientText>
            </h1>
            <p className="text-xl text-muted-foreground">
              Visão geral das suas métricas e indicadores em tempo real
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi, index) => (
              <GlassCard 
                key={index}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
              >
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <kpi.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      kpi.trend === 'up' ? 'text-primary' : 'text-destructive'
                    }`}>
                      {kpi.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {kpi.change}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                    <p className="text-2xl font-bold gradient-text">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.margin}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Large Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <GlassCard className="animate-fade-up md:col-span-2" style={{ animationDelay: '400ms' } as React.CSSProperties}>
              <div className="h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <TrendingUp className="w-16 h-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-bold gradient-text">Gráfico de Evolução</h3>
                  <p className="text-muted-foreground">
                    Visualização de lucro líquido e margens ao longo do tempo
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    Em desenvolvimento - Gráficos interativos em breve
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <GlassCard className="animate-fade-up" style={{ animationDelay: '500ms' } as React.CSSProperties}>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <DollarSign className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="text-lg font-bold gradient-text">Receitas</h3>
                  <p className="text-sm text-muted-foreground">Por categoria</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="animate-fade-up" style={{ animationDelay: '600ms' } as React.CSSProperties}>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Target className="w-12 h-12 text-secondary mx-auto" />
                  <h3 className="text-lg font-bold gradient-text">Despesas</h3>
                  <p className="text-sm text-muted-foreground">Distribuição</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="animate-fade-up" style={{ animationDelay: '700ms' } as React.CSSProperties}>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Users className="w-12 h-12 text-accent mx-auto" />
                  <h3 className="text-lg font-bold gradient-text">Clientes</h3>
                  <p className="text-sm text-muted-foreground">Por canal</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
