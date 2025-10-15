import { useState } from "react";
import { GradientText } from "@/components/GradientText";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDRE } from "@/hooks/useDRE";
import { Target, TrendingUp, TrendingDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function Goals() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Metas (em um sistema real, isso viria de um banco de dados)
  const [goals, setGoals] = useState({
    receitaBruta: 100000,
    receitaLiquida: 80000,
    lucroBruto: 50000,
    lucroOperacional: 30000,
    lucroLiquido: 20000,
  });

  const { dreData, loading } = useDRE(selectedMonth, selectedYear);

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

  const calculateDeviation = (actual: number, goal: number) => {
    if (goal === 0) return 0;
    return ((actual - goal) / goal) * 100;
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

  const metricsComparison = [
    {
      label: "Receita Bruta",
      actual: dreData?.receitaBruta || 0,
      goal: goals.receitaBruta,
      deviation: calculateDeviation(dreData?.receitaBruta || 0, goals.receitaBruta),
    },
    {
      label: "Receita Líquida",
      actual: dreData?.receitaLiquida || 0,
      goal: goals.receitaLiquida,
      deviation: calculateDeviation(dreData?.receitaLiquida || 0, goals.receitaLiquida),
    },
    {
      label: "Lucro Bruto",
      actual: dreData?.lucroBruto || 0,
      goal: goals.lucroBruto,
      deviation: calculateDeviation(dreData?.lucroBruto || 0, goals.lucroBruto),
    },
    {
      label: "Lucro Operacional",
      actual: dreData?.lucroOperacional || 0,
      goal: goals.lucroOperacional,
      deviation: calculateDeviation(dreData?.lucroOperacional || 0, goals.lucroOperacional),
    },
    {
      label: "Lucro Líquido",
      actual: dreData?.lucroLiquido || 0,
      goal: goals.lucroLiquido,
      deviation: calculateDeviation(dreData?.lucroLiquido || 0, goals.lucroLiquido),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          <GradientText>Metas e Orçamento</GradientText>
        </h1>
        <p className="text-muted-foreground">
          Defina e acompanhe suas metas financeiras
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

      {/* Definir Metas */}
      <GlassCard className="p-6">
        <h2 className="text-2xl font-semibold mb-4">
          <GradientText>Definir Metas Mensais</GradientText>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="goal-receita-bruta">Receita Bruta (R$)</Label>
            <Input
              id="goal-receita-bruta"
              type="number"
              step="0.01"
              value={goals.receitaBruta}
              onChange={(e) => setGoals({ ...goals, receitaBruta: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="goal-receita-liquida">Receita Líquida (R$)</Label>
            <Input
              id="goal-receita-liquida"
              type="number"
              step="0.01"
              value={goals.receitaLiquida}
              onChange={(e) => setGoals({ ...goals, receitaLiquida: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="goal-lucro-bruto">Lucro Bruto (R$)</Label>
            <Input
              id="goal-lucro-bruto"
              type="number"
              step="0.01"
              value={goals.lucroBruto}
              onChange={(e) => setGoals({ ...goals, lucroBruto: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="goal-lucro-operacional">Lucro Operacional (R$)</Label>
            <Input
              id="goal-lucro-operacional"
              type="number"
              step="0.01"
              value={goals.lucroOperacional}
              onChange={(e) => setGoals({ ...goals, lucroOperacional: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="goal-lucro-liquido">Lucro Líquido (R$)</Label>
            <Input
              id="goal-lucro-liquido"
              type="number"
              step="0.01"
              value={goals.lucroLiquido}
              onChange={(e) => setGoals({ ...goals, lucroLiquido: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-end">
            <Button variant="glow" className="w-full">
              <Target className="mr-2 h-4 w-4" />
              Salvar Metas
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Comparativo Realizado vs Meta */}
      <GlassCard>
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">
            <GradientText>Realizado vs. Meta</GradientText>
          </h2>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Métrica</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead className="text-right">Realizado</TableHead>
                <TableHead className="text-right">Desvio</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metricsComparison.map((metric, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{metric.label}</TableCell>
                  <TableCell className="text-right">{formatCurrency(metric.goal)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(metric.actual)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold",
                      metric.deviation >= 0 ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {metric.deviation >= 0 ? "+" : ""}
                    {formatPercent(metric.deviation)}
                  </TableCell>
                  <TableCell className="text-right">
                    {metric.deviation >= 0 ? (
                      <div className="flex items-center justify-end gap-2 text-green-500">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">Meta Atingida</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 text-red-500">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm font-semibold">Abaixo da Meta</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </GlassCard>
    </div>
  );
}
