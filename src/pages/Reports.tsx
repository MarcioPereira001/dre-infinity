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
import { useCategories } from "@/hooks/useCategories";
import { useClients } from "@/hooks/useClients";
import { useExportDRE } from "@/hooks/useExportDRE";
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
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined);

  const { categories } = useCategories();
  const { clients } = useClients();
  const { dreData, loading } = useDRE(selectedMonth, selectedYear, selectedCategory, selectedClient);
  const { exportToXLSX } = useExportDRE();

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

  const handleExport = () => {
    if (!dreData) return;
    
    const categoryName = categories.find(c => c.id === selectedCategory)?.name;
    const clientName = clients.find(c => c.id === selectedClient)?.name;
    
    exportToXLSX(dreData, selectedMonth, selectedYear, { categoryName, clientName });
  };

  const dreRows = dreData
    ? [
        {
          label: "RECEITA BRUTA",
          value: dreData.receitaBruta,
          level: 0,
          isHeader: true,
          bold: true,
          ah: dreData.horizontalAnalysis?.receitaBruta,
        },
        {
          label: "",
          value: 0,
          level: 0,
          isHeader: false,
        },
        {
          label: "(-) DEDUÇÕES DA RECEITA BRUTA",
          value: 0,
          level: 0,
          isHeader: true,
          isSubheader: true,
        },
        ...(dreData.use_das ? [
          {
            label: "DAS - Simples Nacional",
            value: -dreData.das,
            level: 1,
            negative: true,
            av: (dreData.das / dreData.receitaLiquida) * 100,
          },
        ] : [
          {
            label: "ICMS",
            value: -dreData.icms,
            level: 1,
            negative: true,
            av: (dreData.icms / dreData.receitaLiquida) * 100,
          },
          {
            label: "IPI",
            value: -dreData.ipi,
            level: 1,
            negative: true,
            av: (dreData.ipi / dreData.receitaLiquida) * 100,
          },
          {
            label: "PIS",
            value: -dreData.pis,
            level: 1,
            negative: true,
            av: (dreData.pis / dreData.receitaLiquida) * 100,
          },
          {
            label: "COFINS",
            value: -dreData.cofins,
            level: 1,
            negative: true,
            av: (dreData.cofins / dreData.receitaLiquida) * 100,
          },
          {
            label: "ISS",
            value: -dreData.iss,
            level: 1,
            negative: true,
            av: (dreData.iss / dreData.receitaLiquida) * 100,
          },
        ]),
        {
          label: "Total de Deduções",
          value: -dreData.deducoesTotal,
          level: 1,
          negative: true,
          bold: true,
          av: dreData.avDeducoes,
        },
        {
          label: "",
          value: 0,
          level: 0,
          isHeader: false,
        },
        {
          label: "= RECEITA OPERACIONAL LÍQUIDA",
          value: dreData.receitaLiquida,
          level: 0,
          isHeader: true,
          highlight: true,
          av: 100,
        },
        {
          label: "",
          value: 0,
          level: 0,
          isHeader: false,
        },
        {
          label: "(-) CMV/CSV",
          value: -dreData.cmv,
          level: 1,
          negative: true,
          av: dreData.avCmv,
        },
        {
          label: "",
          value: 0,
          level: 0,
          isHeader: false,
        },
        {
          label: "= LUCRO BRUTO",
          value: dreData.lucroBruto,
          level: 0,
          isHeader: true,
          highlight: true,
          margin: dreData.margemBruta,
        },
        {
          label: "",
          value: 0,
          level: 0,
          isHeader: false,
        },
        {
          label: "(-) Despesas Operacionais",
          value: -dreData.despesasOperacionais,
          level: 1,
          negative: true,
          av: dreData.avDespesasOperacionais,
        },
        {
          label: "",
          value: 0,
          level: 0,
          isHeader: false,
        },
        {
          label: "= LUCRO OPERACIONAL (EBIT)",
          value: dreData.lucroOperacional,
          level: 0,
          isHeader: true,
          highlight: true,
          margin: dreData.margemOperacional,
        },
        {
          label: "",
          value: 0,
          level: 0,
          isHeader: false,
        },
        {
          label: "(-) Despesas Financeiras",
          value: -dreData.despesasFinanceiras,
          level: 1,
          negative: true,
          av: dreData.avDespesasFinanceiras,
        },
        {
          label: "(+) Receitas Financeiras",
          value: dreData.receitasFinanceiras,
          level: 1,
          av: dreData.avReceitasFinanceiras,
        },
        {
          label: "",
          value: 0,
          level: 0,
          isHeader: false,
        },
        {
          label: "= LAIR (Lucro Antes de Impostos sobre Lucro)",
          value: dreData.lair,
          level: 0,
          isHeader: true,
          highlight: true,
          av: (dreData.lair / dreData.receitaLiquida) * 100,
        },
        {
          label: "",
          value: 0,
          level: 0,
          isHeader: false,
        },
        {
          label: "(-) IMPOSTOS SOBRE O LUCRO",
          value: 0,
          level: 0,
          isHeader: true,
          isSubheader: true,
        },
        {
          label: "IRPJ",
          value: -dreData.irpj,
          level: 1,
          negative: true,
          av: (dreData.irpj / dreData.receitaLiquida) * 100,
        },
        {
          label: "IRPJ Adicional",
          value: -dreData.irpjAdicional,
          level: 1,
          negative: true,
          av: (dreData.irpjAdicional / dreData.receitaLiquida) * 100,
        },
        {
          label: "CSLL",
          value: -dreData.csll,
          level: 1,
          negative: true,
          av: (dreData.csll / dreData.receitaLiquida) * 100,
        },
        {
          label: "Total de Impostos sobre Lucro",
          value: -dreData.impostosTotal,
          level: 1,
          negative: true,
          bold: true,
          av: dreData.avImpostos,
        },
        {
          label: "",
          value: 0,
          level: 0,
          isHeader: false,
        },
        {
          label: "= LUCRO LÍQUIDO DO EXERCÍCIO",
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

        <div className="w-full md:w-56">
          <Label>Categoria</Label>
          <Select 
            value={selectedCategory || "all"} 
            onValueChange={(value) => setSelectedCategory(value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-56">
          <Label>Cliente</Label>
          <Select 
            value={selectedClient || "all"} 
            onValueChange={(value) => setSelectedClient(value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="glow" 
          className="ml-auto"
          onClick={handleExport}
          disabled={!dreData}
        >
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
                <TableHead className="w-[50%]">Conta</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">% AV</TableHead>
                <TableHead className="text-right">% AH</TableHead>
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
                      row.isHeader && "font-semibold",
                      row.bold && "font-bold"
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
                    {row.label ? formatCurrency(Math.abs(row.value)) : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.av !== undefined
                      ? formatPercent(row.av)
                      : row.margin !== undefined
                      ? formatPercent(row.margin)
                      : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.ah !== undefined ? (
                      <span
                        className={cn(
                          "font-medium",
                          row.ah > 0 ? "text-green-500" : row.ah < 0 ? "text-red-500" : ""
                        )}
                      >
                        {row.ah > 0 ? "+" : ""}
                        {formatPercent(row.ah)}
                      </span>
                    ) : (
                      ""
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
