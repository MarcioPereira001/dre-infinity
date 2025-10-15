import { useState } from "react";
import { GradientText } from "@/components/GradientText";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useDRE } from "@/hooks/useDRE";
import { RefreshCw, Calculator } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function Scenarios() {
  const currentDate = new Date();
  const { dreData } = useDRE(currentDate.getMonth() + 1, currentDate.getFullYear());

  // Variáveis de simulação (percentuais de ajuste)
  const [adjustments, setAdjustments] = useState({
    receita: 0, // -50% a +200%
    cmv: 0, // -50% a +100%
    despesasOperacionais: 0, // -50% a +100%
    despesasFinanceiras: 0, // -50% a +100%
  });

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

  const resetAdjustments = () => {
    setAdjustments({
      receita: 0,
      cmv: 0,
      despesasOperacionais: 0,
      despesasFinanceiras: 0,
    });
  };

  // Calcular valores simulados
  const simulatedReceitaBruta = (dreData?.receitaBruta || 0) * (1 + adjustments.receita / 100);
  const simulatedDeducoes = (dreData?.deducoesTotal || 0) * (1 + adjustments.receita / 100);
  const simulatedReceitaLiquida = simulatedReceitaBruta - simulatedDeducoes;
  const simulatedCMV = (dreData?.cmv || 0) * (1 + adjustments.cmv / 100);
  const simulatedLucroBruto = simulatedReceitaLiquida - simulatedCMV;
  const simulatedDespesasOp = (dreData?.despesasOperacionais || 0) * (1 + adjustments.despesasOperacionais / 100);
  const simulatedLucroOp = simulatedLucroBruto - simulatedDespesasOp;
  const simulatedDespesasFin = (dreData?.despesasFinanceiras || 0) * (1 + adjustments.despesasFinanceiras / 100);
  const simulatedLAIR = simulatedLucroOp - simulatedDespesasFin;
  
  // Impostos sobre lucro (simplificado)
  const simulatedIRPJ = simulatedLAIR > 0 ? simulatedLAIR * 0.15 : 0;
  const simulatedIRPJAdicional = simulatedLAIR > 20000 ? (simulatedLAIR - 20000) * 0.10 : 0;
  const simulatedCSLL = simulatedLAIR > 0 ? simulatedLAIR * 0.09 : 0;
  const simulatedImpostos = simulatedIRPJ + simulatedIRPJAdicional + simulatedCSLL;
  const simulatedLucroLiquido = simulatedLAIR - simulatedImpostos;

  // Calcular diferenças
  const difReceitaLiquida = simulatedReceitaLiquida - (dreData?.receitaLiquida || 0);
  const difLucroBruto = simulatedLucroBruto - (dreData?.lucroBruto || 0);
  const difLucroOp = simulatedLucroOp - (dreData?.lucroOperacional || 0);
  const difLucroLiquido = simulatedLucroLiquido - (dreData?.lucroLiquido || 0);

  const comparisons = [
    {
      label: "Receita Bruta",
      current: dreData?.receitaBruta || 0,
      simulated: simulatedReceitaBruta,
      difference: simulatedReceitaBruta - (dreData?.receitaBruta || 0),
    },
    {
      label: "(-) Deduções",
      current: -(dreData?.deducoesTotal || 0),
      simulated: -simulatedDeducoes,
      difference: -(simulatedDeducoes - (dreData?.deducoesTotal || 0)),
    },
    {
      label: "= Receita Líquida",
      current: dreData?.receitaLiquida || 0,
      simulated: simulatedReceitaLiquida,
      difference: difReceitaLiquida,
      highlight: true,
    },
    {
      label: "(-) CMV",
      current: -(dreData?.cmv || 0),
      simulated: -simulatedCMV,
      difference: -(simulatedCMV - (dreData?.cmv || 0)),
    },
    {
      label: "= Lucro Bruto",
      current: dreData?.lucroBruto || 0,
      simulated: simulatedLucroBruto,
      difference: difLucroBruto,
      highlight: true,
    },
    {
      label: "(-) Despesas Operacionais",
      current: -(dreData?.despesasOperacionais || 0),
      simulated: -simulatedDespesasOp,
      difference: -(simulatedDespesasOp - (dreData?.despesasOperacionais || 0)),
    },
    {
      label: "= Lucro Operacional",
      current: dreData?.lucroOperacional || 0,
      simulated: simulatedLucroOp,
      difference: difLucroOp,
      highlight: true,
    },
    {
      label: "(-) Despesas Financeiras",
      current: -(dreData?.despesasFinanceiras || 0),
      simulated: -simulatedDespesasFin,
      difference: -(simulatedDespesasFin - (dreData?.despesasFinanceiras || 0)),
    },
    {
      label: "= LAIR",
      current: dreData?.lair || 0,
      simulated: simulatedLAIR,
      difference: simulatedLAIR - (dreData?.lair || 0),
      highlight: true,
    },
    {
      label: "(-) Impostos sobre Lucro",
      current: -(dreData?.impostosTotal || 0),
      simulated: -simulatedImpostos,
      difference: -(simulatedImpostos - (dreData?.impostosTotal || 0)),
    },
    {
      label: "= Lucro Líquido",
      current: dreData?.lucroLiquido || 0,
      simulated: simulatedLucroLiquido,
      difference: difLucroLiquido,
      highlight: true,
      primary: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          <GradientText>Cenários e Simulações</GradientText>
        </h1>
        <p className="text-muted-foreground">
          Simule diferentes cenários e veja o impacto nas suas finanças
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Ajustes */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              <GradientText>Ajustar Variáveis</GradientText>
            </h2>
            <Button variant="outline" size="sm" onClick={resetAdjustments}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Resetar
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Receita Bruta</Label>
                <span className="text-sm font-semibold">
                  {adjustments.receita > 0 ? "+" : ""}
                  {adjustments.receita}%
                </span>
              </div>
              <Slider
                value={[adjustments.receita]}
                onValueChange={([value]) =>
                  setAdjustments({ ...adjustments, receita: value })
                }
                min={-50}
                max={200}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>-50%</span>
                <span>+200%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>CMV (Custo das Mercadorias Vendidas)</Label>
                <span className="text-sm font-semibold">
                  {adjustments.cmv > 0 ? "+" : ""}
                  {adjustments.cmv}%
                </span>
              </div>
              <Slider
                value={[adjustments.cmv]}
                onValueChange={([value]) =>
                  setAdjustments({ ...adjustments, cmv: value })
                }
                min={-50}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>-50%</span>
                <span>+100%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Despesas Operacionais</Label>
                <span className="text-sm font-semibold">
                  {adjustments.despesasOperacionais > 0 ? "+" : ""}
                  {adjustments.despesasOperacionais}%
                </span>
              </div>
              <Slider
                value={[adjustments.despesasOperacionais]}
                onValueChange={([value]) =>
                  setAdjustments({ ...adjustments, despesasOperacionais: value })
                }
                min={-50}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>-50%</span>
                <span>+100%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Despesas Financeiras</Label>
                <span className="text-sm font-semibold">
                  {adjustments.despesasFinanceiras > 0 ? "+" : ""}
                  {adjustments.despesasFinanceiras}%
                </span>
              </div>
              <Slider
                value={[adjustments.despesasFinanceiras]}
                onValueChange={([value]) =>
                  setAdjustments({ ...adjustments, despesasFinanceiras: value })
                }
                min={-50}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>-50%</span>
                <span>+100%</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Resumo do Impacto */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold mb-6">
            <GradientText>Impacto no Resultado</GradientText>
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Receita Líquida
                </span>
                <Calculator className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">
                <GradientText>{formatCurrency(simulatedReceitaLiquida)}</GradientText>
              </p>
              <p className={cn(
                "text-sm font-semibold mt-1",
                difReceitaLiquida >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {difReceitaLiquida >= 0 ? "+" : ""}
                {formatCurrency(difReceitaLiquida)}
              </p>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Lucro Bruto
                </span>
                <Calculator className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">
                <GradientText>{formatCurrency(simulatedLucroBruto)}</GradientText>
              </p>
              <p className={cn(
                "text-sm font-semibold mt-1",
                difLucroBruto >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {difLucroBruto >= 0 ? "+" : ""}
                {formatCurrency(difLucroBruto)}
              </p>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Lucro Operacional
                </span>
                <Calculator className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">
                <GradientText>{formatCurrency(simulatedLucroOp)}</GradientText>
              </p>
              <p className={cn(
                "text-sm font-semibold mt-1",
                difLucroOp >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {difLucroOp >= 0 ? "+" : ""}
                {formatCurrency(difLucroOp)}
              </p>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Lucro Líquido
                </span>
                <Calculator className="w-4 h-4 text-primary" />
              </div>
              <p className="text-3xl font-bold">
                <GradientText>{formatCurrency(simulatedLucroLiquido)}</GradientText>
              </p>
              <p className={cn(
                "text-base font-bold mt-1",
                difLucroLiquido >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {difLucroLiquido >= 0 ? "+" : ""}
                {formatCurrency(difLucroLiquido)}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Comparação Detalhada */}
      <GlassCard>
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">
            <GradientText>Comparação Detalhada</GradientText>
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Linha DRE</TableHead>
              <TableHead className="text-right">Atual</TableHead>
              <TableHead className="text-right">Simulado</TableHead>
              <TableHead className="text-right">Diferença</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisons.map((row, index) => (
              <TableRow
                key={index}
                className={cn(
                  row.highlight && "bg-primary/5",
                  row.primary && "bg-primary/10 font-bold"
                )}
              >
                <TableCell className={cn(row.highlight && "font-semibold")}>
                  {row.label}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Math.abs(row.current))}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(Math.abs(row.simulated))}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold",
                    row.difference > 0 ? "text-green-500" : row.difference < 0 ? "text-red-500" : ""
                  )}
                >
                  {row.difference >= 0 ? "+" : ""}
                  {formatCurrency(row.difference)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GlassCard>
    </div>
  );
}
