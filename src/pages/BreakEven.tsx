import { useState } from "react";
import { GradientText } from "@/components/GradientText";
import { GlassCard } from "@/components/GlassCard";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDRE } from "@/hooks/useDRE";
import { useCategories } from "@/hooks/useCategories";
import { TrendingUp, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function BreakEven() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { dreData, loading } = useDRE(selectedMonth, selectedYear);
  const { categories } = useCategories();

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

  // Calcular custos fixos e variáveis
  const fixedCosts = categories
    .filter(c => c.cost_classification === "fixed")
    .reduce((sum, cat) => sum + (dreData?.despesasOperacionais || 0) / categories.filter(c => c.category_type === "expense").length, 0);

  const variableCosts = dreData?.cmv || 0;

  // Calcular Ponto de Equilíbrio
  const contributionMargin = (dreData?.receitaLiquida || 0) - variableCosts;
  const contributionMarginRate = (dreData?.receitaLiquida || 0) > 0 
    ? contributionMargin / (dreData?.receitaLiquida || 0) 
    : 0;

  const breakEvenPoint = contributionMarginRate > 0 
    ? (fixedCosts + (dreData?.despesasOperacionais || 0)) / contributionMarginRate 
    : 0;

  const safetyMargin = (dreData?.receitaLiquida || 0) - breakEvenPoint;
  const safetyMarginPercent = (dreData?.receitaLiquida || 0) > 0 
    ? (safetyMargin / (dreData?.receitaLiquida || 0)) * 100 
    : 0;

  // Dados para o gráfico
  const chartData = [];
  const maxRevenue = Math.max((dreData?.receitaLiquida || 0) * 1.5, breakEvenPoint * 1.5);
  const steps = 20;
  
  for (let i = 0; i <= steps; i++) {
    const revenue = (maxRevenue / steps) * i;
    const totalCosts = fixedCosts + (dreData?.despesasOperacionais || 0) + (revenue * (variableCosts / (dreData?.receitaLiquida || 1)));
    
    chartData.push({
      receita: revenue,
      custoTotal: totalCosts,
      receitaFormatted: formatCurrency(revenue),
      custoFormatted: formatCurrency(totalCosts),
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          <GradientText>Ponto de Equilíbrio</GradientText>
        </h1>
        <p className="text-muted-foreground">
          Análise do ponto de equilíbrio e margem de segurança
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
        <div className="w-full md:w-48">
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

        <div className="w-full md:w-32">
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

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando...
        </div>
      ) : !dreData ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum dado encontrado para o período selecionado.
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Ponto de Equilíbrio
                </h3>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">
                <GradientText>{formatCurrency(breakEvenPoint)}</GradientText>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Receita necessária para cobrir custos
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Margem de Segurança
                </h3>
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">
                <GradientText>{formatCurrency(safetyMargin)}</GradientText>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatPercent(safetyMarginPercent)} da receita
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Margem de Contribuição
                </h3>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">
                <GradientText>{formatCurrency(contributionMargin)}</GradientText>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatPercent(contributionMarginRate * 100)} da receita
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Custos Fixos
                </h3>
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">
                <GradientText>{formatCurrency(fixedCosts + (dreData?.despesasOperacionais || 0))}</GradientText>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Custos e despesas fixas
              </p>
            </GlassCard>
          </div>

          {/* Gráfico de Ponto de Equilíbrio */}
          <GlassCard className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              <GradientText>Gráfico de Ponto de Equilíbrio</GradientText>
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="receita" 
                  tickFormatter={(value) => formatCurrency(value)}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <ReferenceLine 
                  x={breakEvenPoint} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="5 5"
                  label={{ value: "Ponto de Equilíbrio", fill: "hsl(var(--primary))" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="receita" 
                  name="Receita" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="custoTotal" 
                  name="Custo Total" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Análise Detalhada */}
          <GlassCard className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              <GradientText>Análise Detalhada</GradientText>
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-accent/10 rounded-lg">
                <h3 className="font-semibold mb-2">O que é o Ponto de Equilíbrio?</h3>
                <p className="text-sm text-muted-foreground">
                  O Ponto de Equilíbrio (Break-Even Point) é o nível de receita em que a empresa 
                  não tem lucro nem prejuízo. Neste ponto, todas as receitas são suficientes apenas 
                  para cobrir todos os custos e despesas.
                </p>
              </div>

              <div className="p-4 bg-accent/10 rounded-lg">
                <h3 className="font-semibold mb-2">Margem de Segurança</h3>
                <p className="text-sm text-muted-foreground">
                  A Margem de Segurança indica quanto a receita atual está acima do ponto de equilíbrio. 
                  Uma margem maior significa que a empresa tem mais "folga" antes de começar a ter prejuízo.
                  {safetyMarginPercent < 0 && (
                    <span className="text-destructive font-semibold block mt-2">
                      ⚠️ ATENÇÃO: Sua receita está ABAIXO do ponto de equilíbrio. A empresa está operando com prejuízo!
                    </span>
                  )}
                  {safetyMarginPercent > 0 && safetyMarginPercent < 20 && (
                    <span className="text-yellow-500 font-semibold block mt-2">
                      ⚠️ Margem de segurança baixa. Considere reduzir custos ou aumentar receitas.
                    </span>
                  )}
                  {safetyMarginPercent >= 20 && (
                    <span className="text-green-500 font-semibold block mt-2">
                      ✓ Margem de segurança saudável!
                    </span>
                  )}
                </p>
              </div>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
