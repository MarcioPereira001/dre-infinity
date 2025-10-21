import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

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
    <div className="h-full animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Composição da Receita (Funil)</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-primary transition-colors" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Este funil mostra como a receita é transformada em lucro, 
                identificando onde as margens estão sendo perdidas em cada etapa 
                (deduções, custos e despesas).
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={funnelData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          className="animate-fade-in"
        >
          <defs>
            <linearGradient id="revenueFunnelGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="100%" stopColor="hsl(var(--primary-glow))" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
          <XAxis 
            type="number" 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="rgba(255,255,255,0.5)" 
            width={90}
            style={{ fontSize: '12px' }}
          />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.9)",
              border: "1px solid hsl(var(--primary) / 0.3)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
            formatter={(value: any, name: string, props: any) => [
              `${formatCurrency(value)} (${props.payload.percentage.toFixed(1)}% da Receita Bruta)`,
              name,
            ]}
          />
          <Legend />
          <Bar 
            dataKey="value" 
            name="Valor" 
            radius={[0, 8, 8, 0]}
            animationDuration={800}
          >
            {funnelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
