import { useNavigate } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";
import { GradientText } from "@/components/GradientText";
import { GlassCard } from "@/components/GlassCard";
import { useEffect, useState } from "react";
import { useDRE } from "@/hooks/useDRE";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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

export default function Dashboard() {
  const { company, companies, loading: companyLoading } = useCompany();
  const navigate = useNavigate();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { dreData, loading: dreLoading } = useDRE(selectedMonth, selectedYear);

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
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
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

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))"];

  // Mock data for charts - In production, this would come from the database
  const monthlyData = [
    { month: "Jan", lucroLiquido: 12000, margemLiquida: 15 },
    { month: "Fev", lucroLiquido: 15000, margemLiquida: 18 },
    { month: "Mar", lucroLiquido: 18000, margemLiquida: 20 },
    { month: "Abr", lucroLiquido: dreData?.lucroLiquido || 0, margemLiquida: dreData?.margemLiquida || 0 },
  ];

  const compositionData = dreData
    ? [
        { name: "Lucro Líquido", value: dreData.lucroLiquido },
        { name: "Custos", value: dreData.cmv },
        { name: "Despesas", value: dreData.despesasOperacionais },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <GradientText>Dashboard</GradientText>
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo(a) ao DRE INFINITY, {company?.name}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="w-40">
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

          <div className="w-32">
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

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Lucro Líquido
          </h3>
          <p className="text-3xl font-bold">
            <GradientText>
              {dreLoading ? "..." : formatCurrency(dreData?.lucroLiquido || 0)}
            </GradientText>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Margem: {dreLoading ? "..." : formatPercent(dreData?.margemLiquida || 0)}
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Lucro Bruto
          </h3>
          <p className="text-3xl font-bold">
            <GradientText>
              {dreLoading ? "..." : formatCurrency(dreData?.lucroBruto || 0)}
            </GradientText>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Margem: {dreLoading ? "..." : formatPercent(dreData?.margemBruta || 0)}
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Receita Líquida
          </h3>
          <p className="text-3xl font-bold">
            <GradientText>
              {dreLoading ? "..." : formatCurrency(dreData?.receitaLiquida || 0)}
            </GradientText>
          </p>
          <p className="text-xs text-muted-foreground mt-2">Mês selecionado</p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Lucro Operacional
          </h3>
          <p className="text-3xl font-bold">
            <GradientText>
              {dreLoading ? "..." : formatCurrency(dreData?.lucroOperacional || 0)}
            </GradientText>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Margem: {dreLoading ? "..." : formatPercent(dreData?.margemOperacional || 0)}
          </p>
        </GlassCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            {compositionData.length > 0 && dreData && dreData.receitaLiquida > 0 ? (
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
