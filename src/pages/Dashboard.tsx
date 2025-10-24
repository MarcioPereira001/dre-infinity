import { useNavigate } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";
import { GradientText } from "@/components/GradientText";
import { GlassCard } from "@/components/GlassCard";
import { useEffect, useState, useMemo } from "react";
import { useDRE } from "@/hooks/useDRE";
import { useMetrics } from "@/hooks/useMetrics";
import { useMetricsCache } from "@/hooks/useMetricsCache";
import { useHistoricalDRE } from "@/hooks/useHistoricalDRE";
import { useGoals } from "@/hooks/useGoals";
import { useExportDashboard } from "@/hooks/useExportDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MetricInfoPopover } from "@/components/dashboard/MetricInfoPopover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Activity, ArrowUpRight, ArrowDownRight, Download, FileSpreadsheet, FileText } from "lucide-react";
import { RevenueCompositionFunnel } from "@/components/dashboard/RevenueCompositionFunnel";
import { KPIEvolutionCharts } from "@/components/dashboard/KPIEvolutionCharts";
import { GoalProgressIndicator } from "@/components/dashboard/GoalProgressIndicator";

export default function Dashboard() {
  const { company, companies, loading: companyLoading } = useCompany();
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [comparisonType, setComparisonType] = useState<"none" | "previous-month" | "same-period-last-year">("none");

  const { dreData, loading: dreLoading } = useDRE(selectedMonth, selectedYear);
  const { metricsCache, loading: metricsLoading, refreshMetricsCache } = useMetricsCache(selectedMonth, selectedYear);
  const { data: historicalData, loading: historicalLoading } = useHistoricalDRE(12);
  const { goals, loading: goalsLoading } = useGoals(selectedMonth, selectedYear);
  const { metricsData: fallbackMetricsData } = useMetrics(selectedMonth, selectedYear);
  const { exportToXLSX, exportToPDF } = useExportDashboard();
  
  // Use metrics_cache if available, fallback to calculated metrics
  const metricsData = metricsCache || fallbackMetricsData;

  const handleExport = (format: "xlsx" | "pdf") => {
    if (!company || !dreData || !metricsData) {
      toast({
        title: "❌ Erro",
        description: "Não há dados disponíveis para exportar.",
        variant: "destructive",
      });
      return;
    }

    if (format === "xlsx") {
      exportToXLSX(
        {
          totalRevenue: dreData.receitaBruta,
          netRevenue: dreData.receitaLiquida,
          totalCosts: (dreData.receitaBruta - dreData.lucroBruto),
          grossProfit: dreData.lucroBruto,
          operatingExpenses: dreData.despesasOperacionais,
          ebitda: dreData.lucroOperacional,
          taxesDeductions: (dreData.receitaBruta - dreData.receitaLiquida),
          netProfit: dreData.lucroLiquido,
          grossMargin: dreData.margemBruta,
          netMargin: dreData.margemLiquida,
          ebitdaMargin: dreData.margemOperacional,
        },
        metricsData,
        selectedMonth,
        selectedYear,
        company.name
      );
    } else {
      exportToPDF();
    }
  };

  const handleForceRecalculate = async () => {
    if (!company) return;
    
    try {
      const { error } = await supabase.rpc('calculate_and_cache_metrics', {
        p_company_id: company.id,
        p_month: selectedMonth,
        p_year: selectedYear
      });
      
      if (error) throw error;
      
      toast({
        title: "✅ Métricas Recalculadas",
        description: "Os dados do Dashboard foram atualizados com sucesso.",
        variant: "default",
      });
      
      // Refresh do cache
      await refreshMetricsCache();
    } catch (error: any) {
      toast({
        title: "Erro ao recalcular",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Comparison data
  const comparisonMonth = comparisonType === "previous-month" 
    ? selectedMonth === 1 ? 12 : selectedMonth - 1
    : selectedMonth;
  const comparisonYear = comparisonType === "previous-month" && selectedMonth === 1
    ? selectedYear - 1
    : comparisonType === "same-period-last-year"
    ? selectedYear - 1
    : selectedYear;

  const { dreData: comparisonDreData } = useDRE(
    comparisonType !== "none" ? comparisonMonth : selectedMonth,
    comparisonType !== "none" ? comparisonYear : selectedYear
  );

  const { metricsCache: comparisonMetrics } = useMetricsCache(
    comparisonType !== "none" ? comparisonMonth : selectedMonth,
    comparisonType !== "none" ? comparisonYear : selectedYear
  );

  // Historical metrics for evolution charts
  const historicalMetrics = useMemo(() => {
    return historicalData.map((item) => ({
      month: item.month,
      cac: item.cac || 0,
      ltv: item.ltv || 0,
      ltvCacRatio: item.ltvCacRatio || 0,
    }));
  }, [historicalData]);

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

  const calculateVariation = (current: number, comparison: number) => {
    if (!comparison || comparison === 0) return 0;
    return ((current - comparison) / comparison) * 100;
  };

  const getGoalValue = (metricName: string): number | null => {
    const goal = goals.find((g) => g.metric_name === metricName);
    return goal ? Number(goal.target_value) : null;
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

  // Use real historical data from database
  const monthlyData = historicalData.length > 0 ? historicalData : [];

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

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar XLSX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF (Imprimir)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handleForceRecalculate}
            disabled={!company || metricsLoading}
            className="flex items-center gap-2"
          >
            🔄 Atualizar
          </Button>
        </div>
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

          <div className="w-full sm:w-56">
            <Label>Comparar com</Label>
            <Select
              value={comparisonType}
              onValueChange={(value: any) => setComparisonType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem comparação</SelectItem>
                <SelectItem value="previous-month">Mês Anterior</SelectItem>
                <SelectItem value="same-period-last-year">Mesmo Período Ano Anterior</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      {/* DRE KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 sm:p-6 relative overflow-hidden hover:shadow-glow-primary transition-all duration-300">
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
          {comparisonType !== "none" && comparisonDreData && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {calculateVariation(dreData?.lucroLiquido || 0, comparisonDreData.lucroLiquido) >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-primary" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-destructive" />
              )}
              <span className={calculateVariation(dreData?.lucroLiquido || 0, comparisonDreData.lucroLiquido) >= 0 ? "text-primary" : "text-destructive"}>
                {formatPercent(Math.abs(calculateVariation(dreData?.lucroLiquido || 0, comparisonDreData.lucroLiquido)))}
              </span>
            </div>
          )}
          <GoalProgressIndicator
            currentValue={dreData?.lucroLiquido || 0}
            targetValue={getGoalValue("lucro_liquido")}
            label="Lucro Líquido"
            formatValue={formatCurrency}
          />
          <MetricInfoPopover
            title="Lucro Líquido"
            description="O lucro líquido é o resultado final após deduzir todas as despesas, custos e impostos da receita total."
            formula="Lucro Líquido = Receita Total - Custos - Despesas - Impostos"
            example="Se sua receita foi R$ 100.000 e os custos + despesas + impostos totalizaram R$ 70.000, seu lucro líquido é R$ 30.000."
          />
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 relative overflow-hidden hover:shadow-glow-primary transition-all duration-300">
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
          {comparisonType !== "none" && comparisonDreData && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {calculateVariation(dreData?.lucroBruto || 0, comparisonDreData.lucroBruto) >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-primary" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-destructive" />
              )}
              <span className={calculateVariation(dreData?.lucroBruto || 0, comparisonDreData.lucroBruto) >= 0 ? "text-primary" : "text-destructive"}>
                {formatPercent(Math.abs(calculateVariation(dreData?.lucroBruto || 0, comparisonDreData.lucroBruto)))}
              </span>
            </div>
          )}
          <MetricInfoPopover
            title="Lucro Bruto"
            description="Lucro obtido após deduzir os custos diretos de produção ou aquisição de produtos/serviços da receita."
            formula="Lucro Bruto = Receita Líquida - Custos Diretos"
            example="Com receita de R$ 100.000 e custos diretos de R$ 40.000, o lucro bruto é R$ 60.000 (60% de margem)."
          />
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 relative overflow-hidden hover:shadow-glow-secondary transition-all duration-300">
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
          {comparisonType !== "none" && comparisonDreData && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {calculateVariation(dreData?.receitaLiquida || 0, comparisonDreData.receitaLiquida) >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-primary" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-destructive" />
              )}
              <span className={calculateVariation(dreData?.receitaLiquida || 0, comparisonDreData.receitaLiquida) >= 0 ? "text-primary" : "text-destructive"}>
                {formatPercent(Math.abs(calculateVariation(dreData?.receitaLiquida || 0, comparisonDreData.receitaLiquida)))}
              </span>
            </div>
          )}
          <GoalProgressIndicator
            currentValue={dreData?.receitaLiquida || 0}
            targetValue={getGoalValue("receita_liquida")}
            label="Receita Líquida"
            formatValue={formatCurrency}
          />
          <MetricInfoPopover
            title="Receita Líquida"
            description="Receita total após dedução de impostos sobre vendas, devoluções e descontos. É a base para o cálculo da lucratividade."
            formula="Receita Líquida = Receita Bruta - Impostos sobre Vendas"
            example="Com receita bruta de R$ 100.000 e impostos de R$ 18.000, sua receita líquida é R$ 82.000."
          />
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 relative overflow-hidden hover:shadow-glow-secondary transition-all duration-300">
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
          {comparisonType !== "none" && comparisonDreData && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {calculateVariation(dreData?.lucroOperacional || 0, comparisonDreData.lucroOperacional) >= 0 ? (
                <ArrowUpRight className="w-3 h-3 text-primary" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-destructive" />
              )}
              <span className={calculateVariation(dreData?.lucroOperacional || 0, comparisonDreData.lucroOperacional) >= 0 ? "text-primary" : "text-destructive"}>
                {formatPercent(Math.abs(calculateVariation(dreData?.lucroOperacional || 0, comparisonDreData.lucroOperacional)))}
              </span>
            </div>
          )}
          <MetricInfoPopover
            title="Lucro Operacional (EBITDA)"
            description="Lucro antes de juros, impostos sobre lucro, depreciação e amortização. Mostra a eficiência operacional do negócio."
            formula="EBITDA = Lucro Bruto - Despesas Operacionais"
            example="Com lucro bruto de R$ 60.000 e despesas operacionais de R$ 20.000, o EBITDA é R$ 40.000."
          />
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
            <GlassCard className="p-4 sm:p-6 relative">
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
              <p className="text-xs text-muted-foreground">
                Custos: {formatCurrency(metricsData.marketingCosts + metricsData.salesCosts)}
              </p>
              <MetricInfoPopover
                title="CAC - Custo de Aquisição de Cliente"
                description="Custo médio investido para adquirir um novo cliente, calculado dividindo os custos de marketing e vendas pelo número de novos clientes."
                formula="CAC = (Custos de Marketing + Custos de Vendas) / Novos Clientes"
                example="Com R$ 10.000 em custos e 50 novos clientes, o CAC é R$ 200 por cliente."
              />
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
              <MetricInfoPopover
                title="LTV - Lifetime Value"
                description="Valor total que um cliente gera durante todo o relacionamento com sua empresa. Estimado multiplicando o ticket médio por 12 meses."
                formula="LTV = Ticket Médio × 12 meses"
                example="Com ticket médio de R$ 500, o LTV estimado é R$ 6.000 ao longo de 12 meses."
              />
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
              <MetricInfoPopover
                title="Relação LTV/CAC"
                description="Indica quantas vezes o valor do cliente supera o custo de aquisição. Uma relação saudável é acima de 3:1."
                formula="LTV/CAC = Lifetime Value ÷ Custo de Aquisição"
                example="Com LTV de R$ 6.000 e CAC de R$ 200, a relação é 30:1 (excelente)."
              />
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
              <MetricInfoPopover
                title="ROI - Retorno sobre Investimento"
                description="Percentual de retorno obtido sobre os investimentos em marketing e vendas. Valores positivos indicam lucro."
                formula="ROI = ((Receita Líquida - Custos) / Custos) × 100"
                example="Com receita líquida de R$ 50.000 e custos de R$ 10.000, o ROI é 400%."
              />
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
              <MetricInfoPopover
                title="Ticket Médio"
                description="Valor médio de cada venda realizada no período. Fundamental para calcular o LTV e estratégias de precificação."
                formula="Ticket Médio = Receita Total ÷ Número de Vendas"
                example="Com R$ 100.000 em 200 vendas, o ticket médio é R$ 500 por venda."
              />
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
              <MetricInfoPopover
                title="Ponto de Equilíbrio"
                description="Receita mínima necessária para cobrir todos os custos fixos. Acima deste valor, a empresa começa a ter lucro."
                formula="Ponto de Equilíbrio = Custos Fixos ÷ (Margem de Contribuição / Receita Líquida)"
                example="Com custos fixos de R$ 30.000 e margem de contribuição de 60%, o ponto de equilíbrio é R$ 50.000."
              />
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
              <MetricInfoPopover
                title="Margem de Segurança"
                description="Quanto a receita pode cair percentualmente antes de atingir o ponto de equilíbrio. Maior margem = maior segurança financeira."
                formula="Margem de Segurança = ((Receita Atual - Ponto de Equilíbrio) / Receita Atual) × 100"
                example="Com receita de R$ 100.000 e ponto de equilíbrio de R$ 70.000, a margem é 30%."
              />
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
              <MetricInfoPopover
                title="Clientes Ativos"
                description="Total de clientes únicos que realizaram compras no período. Inclui novos clientes e clientes recorrentes."
                formula="Clientes Ativos = Novos Clientes + Clientes Recorrentes"
                example="Com 50 novos clientes e 30 recorrentes, você tem 80 clientes ativos no período."
              />
            </GlassCard>
          </div>
        </>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <GlassCard className="p-6 hover:shadow-glow-primary transition-all duration-300">
          <h3 className="text-xl font-semibold mb-4">
            <GradientText>Funil de Composição da Receita</GradientText>
          </h3>
          <div className="h-80">
            {dreData && dreData.receitaBruta > 0 ? (
              <RevenueCompositionFunnel dreData={dreData} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Adicione lançamentos para visualizar o funil
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-glow-primary transition-all duration-300">
          <h3 className="text-xl font-semibold mb-4">
            <GradientText>Evolução do Lucro Líquido</GradientText>
          </h3>
          <div className="h-64">
            {!historicalLoading && monthlyData.length > 0 ? (
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
            ) : historicalLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-primary/20 rounded w-32 mx-auto"></div>
                  <div className="h-24 bg-primary/10 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-fade-in">
                <div className="p-6 glass rounded-lg border border-primary/20">
                  <p className="text-lg font-semibold mb-2">📊 Nenhum dado disponível</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cadastre transações em <strong>Lançamentos</strong> para visualizar seus gráficos.
                  </p>
                  <Button onClick={() => navigate("/transactions")} variant="glow" size="sm">
                    Ir para Lançamentos
                  </Button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6 hover:shadow-glow-secondary transition-all duration-300">
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

        {/* Evolução CAC e LTV */}
        {historicalMetrics.length > 0 && metricsData && metricsData.totalSalesCount > 0 && (
          <>
            <GlassCard className="p-6 hover:shadow-glow-secondary transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4">
                <GradientText>Evolução CAC e LTV</GradientText>
              </h3>
              <div className="h-64">
                <KPIEvolutionCharts historicalMetrics={historicalMetrics} type="cac-ltv" />
              </div>
            </GlassCard>

            <GlassCard className="p-6 hover:shadow-glow-primary transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4">
                <GradientText>Relação LTV/CAC</GradientText>
              </h3>
              <div className="h-64">
                <KPIEvolutionCharts historicalMetrics={historicalMetrics} type="ltv-cac-ratio" />
              </div>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  );
}
