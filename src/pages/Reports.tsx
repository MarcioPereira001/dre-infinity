import { useState } from "react";
import { GradientText } from "@/components/GradientText";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { useDRE } from "@/hooks/useDRE";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function Reports() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { dreData, loading } = useDRE(selectedMonth, selectedYear);

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

  const dreRows = dreData
    ? [
        {
          label: "Receita Bruta",
          value: dreData.receitaBruta,
          level: 0,
          isHeader: true,
        },
        {
          label: "(-) Deduções e Impostos sobre Vendas",
          value: -dreData.deducoes,
          level: 1,
          negative: true,
        },
        {
          label: "= Receita Operacional Líquida",
          value: dreData.receitaLiquida,
          level: 0,
          isHeader: true,
          highlight: true,
        },
        {
          label: "(-) CMV/CSV",
          value: -dreData.cmv,
          level: 1,
          negative: true,
        },
        {
          label: "= Lucro Bruto",
          value: dreData.lucroBruto,
          level: 0,
          isHeader: true,
          highlight: true,
          margin: dreData.margemBruta,
        },
        {
          label: "(-) Despesas Operacionais",
          value: -dreData.despesasOperacionais,
          level: 1,
          negative: true,
        },
        {
          label: "= Lucro Operacional (EBIT)",
          value: dreData.lucroOperacional,
          level: 0,
          isHeader: true,
          highlight: true,
          margin: dreData.margemOperacional,
        },
        {
          label: "(-) Despesas Financeiras",
          value: -dreData.despesasFinanceiras,
          level: 1,
          negative: true,
        },
        {
          label: "(+) Receitas Financeiras",
          value: dreData.receitasFinanceiras,
          level: 1,
        },
        {
          label: "= LAIR",
          value: dreData.lair,
          level: 0,
          isHeader: true,
          highlight: true,
        },
        {
          label: "(-) Impostos sobre o Lucro",
          value: -dreData.impostos,
          level: 1,
          negative: true,
        },
        {
          label: "= Lucro Líquido do Exercício",
          value: dreData.lucroLiquido,
          level: 0,
          isHeader: true,
          highlight: true,
          primary: true,
          margin: dreData.margemLiquida,
        },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          <GradientText>DRE Automatizada</GradientText>
        </h1>
        <p className="text-muted-foreground">
          Demonstração do Resultado do Exercício com análise vertical
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-64">
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

        <div className="w-full md:w-40">
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

        <Button variant="glow" className="ml-auto">
          <Download className="mr-2 h-4 w-4" />
          Exportar XLSX
        </Button>
      </div>

      <GlassCard>
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
                <TableHead className="w-[60%]">Conta</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">% AV</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dreRows.map((row, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    row.isHeader && "font-semibold",
                    row.highlight && "bg-primary/5",
                    row.primary && "bg-primary/10"
                  )}
                >
                  <TableCell
                    className={cn(
                      row.level === 1 && "pl-8",
                      row.isHeader && "font-semibold"
                    )}
                  >
                    {row.label}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      row.negative
                        ? "text-red-500"
                        : row.value > 0
                        ? "text-green-500"
                        : ""
                    )}
                  >
                    {formatCurrency(Math.abs(row.value))}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.margin !== undefined
                      ? formatPercent(row.margin)
                      : dreData.receitaLiquida > 0
                      ? formatPercent((row.value / dreData.receitaLiquida) * 100)
                      : "-"}
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
