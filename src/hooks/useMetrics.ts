import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";

export interface MetricsData {
  // Métricas de Receita
  totalRevenue: number;
  netRevenue: number;
  totalSalesCount: number;
  
  // Métricas de Clientes
  newClientsCount: number;
  totalActiveClients: number;
  repeatCustomersCount: number;
  
  // Métricas de Custos
  marketingCosts: number;
  salesCosts: number;
  operationalCosts: number;
  fixedCosts: number;
  variableCosts: number;
  
  // Métricas Calculadas
  cac: number; // Custo de Aquisição de Cliente
  ltv: number; // Lifetime Value
  ltvCacRatio: number; // Relação LTV/CAC
  roi: number; // ROI
  averageTicket: number; // Ticket Médio
  breakEvenPoint: number; // Ponto de Equilíbrio
  safetyMargin: number; // Margem de Segurança
  safetyMarginPercent: number; // Margem de Segurança %
  contributionMargin: number; // Margem de Contribuição
  contributionMarginPercent: number; // Margem de Contribuição %
}

export function useMetrics(month?: number, year?: number) {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { company } = useCompany();
  const { toast } = useToast();

  const calculateMetrics = async () => {
    if (!company) return;

    try {
      setLoading(true);

      // Buscar transações do período
      let query = supabase
        .from("transactions")
        .select(`
          *,
          category:dre_categories(*)
        `)
        .eq("company_id", company.id);

      if (month) query = query.eq("month", month);
      if (year) query = query.eq("year", year);

      const { data: transactions, error } = await query;
      if (error) throw error;

      // Inicializar variáveis
      let totalRevenue = 0;
      let netRevenue = 0;
      let totalSalesCount = 0;
      let newClientsCount = 0;
      let marketingCosts = 0;
      let salesCosts = 0;
      let operationalCosts = 0;
      let fixedCosts = 0;
      let variableCosts = 0;

      const clientPurchases = new Map<string, number>();

      // Processar transações
      transactions?.forEach((t: any) => {
        const amount = Number(t.amount);
        const categoryType = t.category?.category_type;
        const classification = t.category?.cost_classification;

        // Receitas
        if (categoryType === "revenue") {
          totalRevenue += amount;
          totalSalesCount++;

          // Rastrear compras por cliente
          if (t.client_id) {
            const purchases = clientPurchases.get(t.client_id) || 0;
            clientPurchases.set(t.client_id, purchases + 1);
          }

          // Clientes novos
          if (t.is_new_client) {
            newClientsCount++;
          }
        }

        // Custos e Despesas
        if (categoryType === "cost" || categoryType === "expense") {
          // Marketing e Vendas
          if (t.is_marketing_cost) {
            marketingCosts += amount;
          }
          if (t.is_sales_cost) {
            salesCosts += amount;
          }

          // Classificação Fixo/Variável
          if (classification === "fixed") {
            fixedCosts += amount;
          } else if (classification === "variable") {
            variableCosts += amount;
          }

          // Custos operacionais
          if (categoryType === "expense") {
            operationalCosts += amount;
          }
        }
      });

      // Calcular deduções (impostos)
      const taxRegime = company.tax_regime;
      let taxRate = 0;
      switch (taxRegime) {
        case "simples_nacional":
          taxRate = 0.06;
          break;
        case "lucro_presumido":
          taxRate = 0.138;
          break;
        case "lucro_real":
          taxRate = 0.34;
          break;
      }

      const deductions = totalRevenue * taxRate;
      netRevenue = totalRevenue - deductions;

      // CALCULAR MÉTRICAS

      // 1. CAC (Custo de Aquisição de Cliente)
      const cac = newClientsCount > 0 
        ? (marketingCosts + salesCosts) / newClientsCount 
        : 0;

      // 2. Ticket Médio
      const averageTicket = totalSalesCount > 0 
        ? totalRevenue / totalSalesCount 
        : 0;

      // 3. Clientes Recorrentes
      const repeatCustomersCount = Array.from(clientPurchases.values())
        .filter(count => count > 1).length;

      // 4. Taxa de Retenção (simplificada)
      const totalActiveClients = clientPurchases.size;
      const retentionRate = totalActiveClients > 0 
        ? repeatCustomersCount / totalActiveClients 
        : 0;

      // 5. Frequência Média de Compra
      const avgPurchaseFrequency = totalActiveClients > 0
        ? totalSalesCount / totalActiveClients
        : 1;

      // 6. LTV (Lifetime Value)
      // LTV = Ticket Médio * Frequência de Compra * Tempo de Retenção (em meses, assumindo 12 meses)
      const avgLifetimeMonths = 12 * (retentionRate > 0 ? retentionRate : 0.5); // Tempo médio de vida do cliente
      const ltv = averageTicket * avgPurchaseFrequency * avgLifetimeMonths;

      // 7. Relação LTV/CAC
      const ltvCacRatio = cac > 0 ? ltv / cac : 0;

      // 8. Margem de Contribuição
      const contributionMargin = netRevenue - variableCosts;
      const contributionMarginRate = netRevenue > 0 
        ? (contributionMargin / netRevenue) 
        : 0;

      // 9. Ponto de Equilíbrio
      const breakEvenPoint = contributionMarginRate > 0 
        ? fixedCosts / contributionMarginRate 
        : 0;

      // 10. Margem de Segurança
      const safetyMargin = netRevenue - breakEvenPoint;
      const safetyMarginPercent = netRevenue > 0 ? (safetyMargin / netRevenue) * 100 : 0;

      // 11. ROI
      const totalCosts = fixedCosts + variableCosts + marketingCosts + salesCosts;
      const roi = totalCosts > 0 
        ? ((netRevenue - totalCosts) / totalCosts) * 100 
        : 0;

      setMetricsData({
        totalRevenue,
        netRevenue,
        totalSalesCount,
        newClientsCount,
        totalActiveClients,
        repeatCustomersCount,
        marketingCosts,
        salesCosts,
        operationalCosts,
        fixedCosts,
        variableCosts,
        cac,
        ltv,
        ltvCacRatio,
        roi,
        averageTicket,
        breakEvenPoint,
        safetyMargin,
        safetyMarginPercent,
        contributionMargin,
        contributionMarginPercent: contributionMarginRate * 100,
      });

    } catch (error: any) {
      toast({
        title: "Erro ao calcular métricas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateMetrics();
  }, [company, month, year]);

  return {
    metricsData,
    loading,
    recalculate: calculateMetrics,
  };
}
