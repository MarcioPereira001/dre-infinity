import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface RevenueCompositionFunnelProps {
  dreData: {
    receitaBruta: number;
    receitaLiquida: number;
    lucroBruto: number;
    lucroOperacional: number;
    lucroLiquido: number;
  } | null;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(var(--primary-glow))",
  "hsl(var(--secondary-glow))",
];

export const RevenueCompositionFunnel = ({ dreData }: RevenueCompositionFunnelProps) => {
  const funnelData = useMemo(() => {
    if (!dreData) return [];

    return [
      { name: "Receita Bruta", value: dreData.receitaBruta, percentage: 100 },
      {
        name: "Receita Líquida",
        value: dreData.receitaLiquida,
        percentage: dreData.receitaBruta > 0 ? (dreData.receitaLiquida / dreData.receitaBruta) * 100 : 0,
      },
      {
        name: "Lucro Bruto",
        value: dreData.lucroBruto,
        percentage: dreData.receitaBruta > 0 ? (dreData.lucroBruto / dreData.receitaBruta) * 100 : 0,
      },
      {
        name: "Lucro Operacional",
        value: dreData.lucroOperacional,
        percentage: dreData.receitaBruta > 0 ? (dreData.lucroOperacional / dreData.receitaBruta) * 100 : 0,
      },
      {
        name: "Lucro Líquido",
        value: dreData.lucroLiquido,
        percentage: dreData.receitaBruta > 0 ? (dreData.lucroLiquido / dreData.receitaBruta) * 100 : 0,
      },
    ];
  }, [dreData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={funnelData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
        <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={90} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
          formatter={(value: any, name: string, props: any) => [
            `${formatCurrency(value)} (${props.payload.percentage.toFixed(1)}% da Receita Bruta)`,
            name,
          ]}
        />
        <Legend />
        <Bar dataKey="value" name="Valor" radius={[0, 8, 8, 0]}>
          {funnelData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
