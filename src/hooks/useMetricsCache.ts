import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";

export interface MetricsCache {
  id: string;
  company_id: string;
  period_month: number;
  period_year: number;
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
  safetyMarginPercent: number;
  contributionMargin: number;
  last_calculated_at: string;
}

export const useMetricsCache = (month?: number, year?: number) => {
  const { company } = useCompany();
  const { toast } = useToast();
  const [metricsCache, setMetricsCache] = useState<MetricsCache | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetricsCache = async () => {
    if (!company) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from("metrics_cache")
        .select("*")
        .eq("company_id", company.id);

      if (month !== undefined) {
        query = query.eq("period_month", month);
      }
      if (year !== undefined) {
        query = query.eq("period_year", year);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      
      // Convert snake_case to camelCase
      if (data) {
        const convertedData: MetricsCache = {
          id: data.id,
          company_id: data.company_id,
          period_month: data.period_month,
          period_year: data.period_year,
          totalRevenue: Number(data.total_revenue) || 0,
          netRevenue: Number(data.net_revenue) || 0,
          totalSalesCount: Number(data.total_sales_count) || 0,
          newClientsCount: Number(data.new_clients_count) || 0,
          totalActiveClients: Number(data.total_active_clients) || 0,
          repeatCustomersCount: Number(data.repeat_customers_count) || 0,
          marketingCosts: Number(data.marketing_costs) || 0,
          salesCosts: Number(data.sales_costs) || 0,
          operationalCosts: Number(data.operational_costs) || 0,
          fixedCosts: Number(data.fixed_costs) || 0,
          variableCosts: Number(data.variable_costs) || 0,
          cac: Number(data.cac) || 0,
          ltv: Number(data.ltv) || 0,
          ltvCacRatio: Number(data.ltv_cac_ratio) || 0,
          roi: Number(data.roi) || 0,
          averageTicket: Number(data.average_ticket) || 0,
          breakEvenPoint: Number(data.break_even_point) || 0,
          safetyMargin: Number(data.safety_margin) || 0,
          safetyMarginPercent: Number(data.safety_margin) || 0,
          contributionMargin: Number(data.contribution_margin) || 0,
          last_calculated_at: data.last_calculated_at || "",
        };
        setMetricsCache(convertedData);
      } else {
        setMetricsCache(null);
      }
    } catch (error: any) {
      console.error("Error fetching metrics cache:", error);
      toast({
        title: "Erro ao carregar métricas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsCache();
  }, [company, month, year]);

  return {
    metricsCache,
    loading,
    refreshMetricsCache: fetchMetricsCache,
  };
};
