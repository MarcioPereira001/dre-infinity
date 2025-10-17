import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface KPIEvolutionChartsProps {
  historicalMetrics: Array<{
    month: string;
    cac: number;
    ltv: number;
    ltvCacRatio: number;
  }>;
  type: "cac-ltv" | "ltv-cac-ratio";
}

export const KPIEvolutionCharts = ({ historicalMetrics, type }: KPIEvolutionChartsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatRatio = (value: number) => {
    return `${value.toFixed(2)}:1`;
  };

  if (type === "cac-ltv") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={historicalMetrics}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: any) => formatCurrency(value)}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="cac"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            name="CAC"
            dot={{ fill: "hsl(var(--destructive))", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="ltv"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            name="LTV"
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={historicalMetrics}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: any) => formatRatio(value)}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="ltvCacRatio"
          stroke="hsl(var(--secondary))"
          strokeWidth={2}
          name="LTV/CAC"
          dot={{ fill: "hsl(var(--secondary))", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
