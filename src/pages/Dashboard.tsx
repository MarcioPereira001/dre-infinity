import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { useCompany } from "@/contexts/CompanyContext";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { company } = useCompany();
  const navigate = useNavigate();

  useEffect(() => {
    if (!company) {
      navigate("/company-setup");
    }
  }, [company, navigate]);

  if (!company) {
    return null;
  }
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
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <GradientText>{company.name}</GradientText>
            </h1>
            <p className="text-sm text-muted-foreground">
              Regime: {company.tax_regime.replace("_", " ")} • Período: {company.fiscal_period}
            </p>
          </div>
        </div>
        <p className="text-lg text-muted-foreground">
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
  );
}
