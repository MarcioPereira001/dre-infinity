import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

interface DREData {
  totalRevenue: number;
  netRevenue: number;
  totalCosts: number;
  grossProfit: number;
  operatingExpenses: number;
  ebitda: number;
  taxesDeductions: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  ebitdaMargin: number;
}

interface MetricsData {
  totalRevenue: number;
  netRevenue: number;
  totalSalesCount: number;
  newClientsCount: number;
  totalActiveClients: number;
  repeatCustomersCount: number;
  marketingCosts: number;
  salesCosts: number;
  operationalCosts: number;
  fixedCosts: number;
  variableCosts: number;
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  roi: number;
  averageTicket: number;
  breakEvenPoint: number;
  safetyMargin: number;
  contributionMargin: number;
}

export const useExportDashboard = () => {
  const { toast } = useToast();

  const exportToXLSX = (
    dreData: DREData,
    metricsData: MetricsData,
    month: number,
    year: number,
    companyName: string
  ) => {
    try {
      // Criar workbook
      const wb = XLSX.utils.book_new();

      // Criar planilha DRE
      const dreSheet = [
        ["DRE - Demonstração do Resultado do Exercício"],
        [`Empresa: ${companyName}`, `Período: ${month}/${year}`],
        [],
        ["Item", "Valor (R$)", "% Receita"],
        ["Receita Bruta", dreData.totalRevenue, "100.00%"],
        ["(-) Deduções/Impostos", dreData.taxesDeductions, `${((dreData.taxesDeductions / dreData.totalRevenue) * 100).toFixed(2)}%`],
        ["Receita Líquida", dreData.netRevenue, `${((dreData.netRevenue / dreData.totalRevenue) * 100).toFixed(2)}%`],
        ["(-) Custos Totais", dreData.totalCosts, `${((dreData.totalCosts / dreData.totalRevenue) * 100).toFixed(2)}%`],
        ["Lucro Bruto", dreData.grossProfit, `${dreData.grossMargin.toFixed(2)}%`],
        ["(-) Despesas Operacionais", dreData.operatingExpenses, `${((dreData.operatingExpenses / dreData.totalRevenue) * 100).toFixed(2)}%`],
        ["EBITDA", dreData.ebitda, `${dreData.ebitdaMargin.toFixed(2)}%`],
        ["Lucro Líquido", dreData.netProfit, `${dreData.netMargin.toFixed(2)}%`],
      ];

      const dreWs = XLSX.utils.aoa_to_sheet(dreSheet);
      
      // Formatação de largura das colunas
      dreWs["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];

      XLSX.utils.book_append_sheet(wb, dreWs, "DRE");

      // Criar planilha de Métricas Avançadas
      const metricsSheet = [
        ["Métricas Avançadas"],
        [`Empresa: ${companyName}`, `Período: ${month}/${year}`],
        [],
        ["Métrica", "Valor"],
        ["Receita Total", `R$ ${metricsData.totalRevenue.toFixed(2)}`],
        ["Receita Líquida", `R$ ${metricsData.netRevenue.toFixed(2)}`],
        ["Total de Vendas", metricsData.totalSalesCount],
        ["Novos Clientes", metricsData.newClientsCount],
        ["Clientes Ativos", metricsData.totalActiveClients],
        ["Clientes Recorrentes", metricsData.repeatCustomersCount],
        [],
        ["Custos e Despesas"],
        ["Custos de Marketing", `R$ ${metricsData.marketingCosts.toFixed(2)}`],
        ["Custos de Vendas", `R$ ${metricsData.salesCosts.toFixed(2)}`],
        ["Custos Operacionais", `R$ ${metricsData.operationalCosts.toFixed(2)}`],
        ["Custos Fixos", `R$ ${metricsData.fixedCosts.toFixed(2)}`],
        ["Custos Variáveis", `R$ ${metricsData.variableCosts.toFixed(2)}`],
        [],
        ["Métricas de Performance"],
        ["CAC (Custo de Aquisição)", `R$ ${metricsData.cac.toFixed(2)}`],
        ["LTV (Valor do Tempo de Vida)", `R$ ${metricsData.ltv.toFixed(2)}`],
        ["Relação LTV/CAC", metricsData.ltvCacRatio.toFixed(2)],
        ["ROI", `${metricsData.roi.toFixed(2)}%`],
        ["Ticket Médio", `R$ ${metricsData.averageTicket.toFixed(2)}`],
        ["Ponto de Equilíbrio", `R$ ${metricsData.breakEvenPoint.toFixed(2)}`],
        ["Margem de Segurança", `${metricsData.safetyMargin.toFixed(2)}%`],
        ["Margem de Contribuição", `R$ ${metricsData.contributionMargin.toFixed(2)}`],
      ];

      const metricsWs = XLSX.utils.aoa_to_sheet(metricsSheet);
      metricsWs["!cols"] = [{ wch: 30 }, { wch: 20 }];

      XLSX.utils.book_append_sheet(wb, metricsWs, "Métricas");

      // Salvar arquivo
      const fileName = `Dashboard_${companyName.replace(/\s+/g, "_")}_${month}_${year}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "✅ Exportação Concluída",
        description: "Dashboard exportado com sucesso para XLSX.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "❌ Erro na Exportação",
        description: error.message || "Erro ao exportar dashboard",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    // Para PDF, vamos usar window.print() que permite ao usuário salvar como PDF
    // Esta é uma solução nativa do navegador
    toast({
      title: "📄 Exportar para PDF",
      description: "Use a opção de impressão do navegador para salvar como PDF.",
      variant: "default",
    });
    window.print();
  };

  return {
    exportToXLSX,
    exportToPDF,
  };
};
