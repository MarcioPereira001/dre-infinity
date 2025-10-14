import { useNavigate } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";
import { GradientText } from "@/components/GradientText";
import { GlassCard } from "@/components/GlassCard";
import { useEffect, useState } from "react";
import { useDRE } from "@/hooks/useDRE";
import { useMetrics } from "@/hooks/useMetrics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Activity } from "lucide-react";

export default function Dashboard() {
  const { company, companies, loading: companyLoading } = useCompany();
  const navigate = useNavigate();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { dreData, loading: dreLoading } = useDRE(selectedMonth, selectedYear);
  const { metricsData, loading: metricsLoading } = useMetrics(selectedMonth, selectedYear);

  useEffect(() => {
    if (!companyLoading && companies.length === 0) {
      navigate("/company-setup");
    }
  }, [companyLoading, companies, navigate]);

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (!isFinite(value) || isNaN(value)) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    if (!isFinite(value) || isNaN(value)) return "0.00%";
    return `${value.toFixed(2)}%`;
  };

  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - i);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--destructive))"];

  // Mock data for charts - In production, this would come from the database
  const monthlyData = [
    { month: "Jan", lucroLiquido: 12000, margemLiquida: 15 },
    { month: "Fev", lucroLiquido: 15000, margemLiquida: 18 },
    { month: "Mar", lucroLiquido: 18000, margemLiquida: 20 },
    { month: "Abr", lucroLiquido: dreData?.lucroLiquido || 0, margemLiquida: dreData?.margemLiquida || 0 },
  ];

  const compositionData = metricsData
    ? [
        { name: "Receita Líquida", value: metricsData.netRevenue },
        { name: "Custos Fixos", value: metricsData.fixedCosts },
        { name: "Custos Variáveis", value: metricsData.variableCosts },
        { name: "Marketing", value: metricsData.marketingCosts },
      ]
    : [];

  const ltvCacRatioColor = metricsData && metricsData.ltvCacRatio >= 3 
    ? "text-green-500" 
    : "text-red-500";

  const ltvCacProgress = metricsData && metricsData.cac > 0 && isFinite(metricsData.ltvCacRatio)
    ? Math.min((metricsData.ltvCacRatio / 3) * 100, 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <GradientText>Dashboard</GradientText>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Bem-vindo(a) ao DRE INFINITY, {company?.name}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-40">
            <Label>Mês</Label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-32">
            <Label>Ano</Label>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* DRE KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Lucro Líquido</h3>
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold break-words">
            <GradientText>
              {dreLoading ? "..." : formatCurrency(dreData?.lucroLiquido || 0)}
            </GradientText>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Margem: {dreLoading ? "..." : formatPercent(dreData?.margemLiquida || 0)}
          </p>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Lucro Bruto</h3>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold break-words">
            <GradientText>
              {dreLoading ? "..." : formatCurrency(dreData?.lucroBruto || 0)}
            </GradientText>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Margem: {dreLoading ? "..." : formatPercent(dreData?.margemBruta || 0)}
          </p>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Receita Líquida</h3>
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold break-words">
            <GradientText>
              {dreLoading ? "..." : formatCurrency(dreData?.receitaLiquida || 0)}
            </GradientText>
          </p>
          <p className="text-xs text-muted-foreground mt-2">Mês selecionado</p>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Lucro Operacional</h3>
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold break-words">
            <GradientText>
              {dreLoading ? "..." : formatCurrency(dreData?.lucroOperacional || 0)}
            </GradientText>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Margem: {dreLoading ? "..." : formatPercent(dreData?.margemOperacional || 0)}
          </p>
        </GlassCard>
      </div>

      {/* Advanced Metrics KPIs */}
      {metricsData && metricsData.totalSalesCount > 0 && (
        <>
          <div className="mt-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              <GradientText>Métricas Avançadas</GradientText>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">CAC</h3>
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold break-words">
                <GradientText>{formatCurrency(metricsData.cac)}</GradientText>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {metricsData.newClientsCount} novos clientes
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">LTV</h3>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold break-words">
                <GradientText>{formatCurrency(metricsData.ltv)}</GradientText>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Lifetime Value
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">LTV/CAC</h3>
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${ltvCacRatioColor}`}>
                {isFinite(metricsData.ltvCacRatio) ? metricsData.ltvCacRatio.toFixed(2) : "0.00"}:1
              </p>
              <div className="mt-2">
                <Progress value={ltvCacProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Meta: 3:1 {metricsData.ltvCacRatio >= 3 ? "✓" : ""}
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">ROI</h3>
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${metricsData.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(metricsData.roi)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Retorno sobre Investimento
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Ticket Médio</h3>
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold break-words">
                <GradientText>{formatCurrency(metricsData.averageTicket)}</GradientText>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {metricsData.totalSalesCount} vendas
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Ponto de Equilíbrio</h3>
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className="text-xl sm:text-2xl font-bold break-words">
                <GradientText>{formatCurrency(metricsData.breakEvenPoint)}</GradientText>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {metricsData.netRevenue > 0 
                  ? `${((metricsData.breakEvenPoint / metricsData.netRevenue) * 100).toFixed(1)}% da receita`
                  : "0% da receita"
                }
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Margem de Segurança</h3>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className={`text-xl sm:text-2xl font-bold break-words ${metricsData.safetyMargin >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(metricsData.safetyMargin)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatPercent(metricsData.safetyMarginPercent)} da receita
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Clientes Ativos</h3>
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                <GradientText>{metricsData.totalActiveClients}</GradientText>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {metricsData.repeatCustomersCount} recorrentes
              </p>
            </GlassCard>
          </div>
        </>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            <GradientText>Evolução do Lucro Líquido</GradientText>
          </h3>
          <div className="h-64">
            {dreData && dreData.lucroLiquido > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="lucroLiquido"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Lucro Líquido"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Adicione lançamentos para visualizar gráficos
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            <GradientText>Composição Financeira</GradientText>
          </h3>
          <div className="h-64">
            {compositionData.length > 0 && metricsData && metricsData.netRevenue > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Adicione lançamentos para visualizar gráficos
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
