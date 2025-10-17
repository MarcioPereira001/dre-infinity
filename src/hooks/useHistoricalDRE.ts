import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";

interface MonthlyData {
  month: string;
  lucroLiquido: number;
  margemLiquida: number;
  receitaLiquida: number;
  year: number;
  monthNum: number;
}

export function useHistoricalDRE(months: number = 12) {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { company } = useCompany();

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!company) return;

      try {
        setLoading(true);
        
        // Get tax configuration
        const { data: taxConfig } = await supabase
          .from("tax_configurations")
          .select("*")
          .eq("company_id", company.id)
          .maybeSingle();

        // Calculate date range
        const currentDate = new Date();
        const startDate = new Date(currentDate);
        startDate.setMonth(currentDate.getMonth() - months);

        // Fetch transactions for the period
        const { data: transactions, error } = await supabase
          .from("transactions")
          .select(`
            *,
            category:dre_categories(*)
          `)
          .eq("company_id", company.id)
          .gte("transaction_date", startDate.toISOString().split('T')[0])
          .order("transaction_date", { ascending: true });

        if (error) throw error;

        // Group by month and calculate DRE
        const monthlyMap = new Map<string, {
          receitaBruta: number;
          cmv: number;
          despesasOperacionais: number;
          despesasFinanceiras: number;
          receitasFinanceiras: number;
          year: number;
          month: number;
        }>();

        transactions?.forEach((t: any) => {
          const key = `${t.year}-${t.month}`;
          if (!monthlyMap.has(key)) {
            monthlyMap.set(key, {
              receitaBruta: 0,
              cmv: 0,
              despesasOperacionais: 0,
              despesasFinanceiras: 0,
              receitasFinanceiras: 0,
              year: t.year,
              month: t.month,
            });
          }

          const monthData = monthlyMap.get(key)!;
          const amount = Number(t.amount);
          const categoryType = t.category?.category_type;
          
          if (categoryType === "revenue") {
            monthData.receitaBruta += amount;
          } else if (categoryType === "cost") {
            monthData.cmv += amount;
          } else if (categoryType === "expense") {
            const categoryName = t.category?.name?.toLowerCase() || "";
            if (categoryName.includes("financeira")) {
              monthData.despesasFinanceiras += amount;
            } else {
              monthData.despesasOperacionais += amount;
            }
          }
        });

        // Calculate DRE for each month
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const historicalData: MonthlyData[] = [];

        monthlyMap.forEach((monthData, key) => {
          const { receitaBruta, cmv, despesasOperacionais, despesasFinanceiras, receitasFinanceiras, year, month } = monthData;

          // Calculate deductions based on tax configuration
          let deducoesTotal = 0;
          const use_das = taxConfig?.use_das || false;

          if (use_das) {
            deducoesTotal = receitaBruta * (taxConfig?.das_rate || 0.06);
          } else {
            const icms = receitaBruta * (taxConfig?.icms_rate || 0.18);
            const ipi = receitaBruta * (taxConfig?.ipi_rate || 0.10);
            const pis = receitaBruta * (taxConfig?.pis_rate || 0.0165);
            const cofins = receitaBruta * (taxConfig?.cofins_rate || 0.076);
            const iss = receitaBruta * (taxConfig?.iss_rate || 0.05);
            deducoesTotal = icms + ipi + pis + cofins + iss;
          }

          const receitaLiquida = receitaBruta - deducoesTotal;
          const lucroBruto = receitaLiquida - cmv;
          const lucroOperacional = lucroBruto - despesasOperacionais;
          const lair = lucroOperacional + receitasFinanceiras - despesasFinanceiras;

          // Calculate income taxes
          let irpj = 0;
          let irpjAdicional = 0;
          let csll = 0;

          if (lair > 0) {
            irpj = lair * (taxConfig?.irpj_rate || 0.15);
            const threshold = taxConfig?.irpj_additional_threshold || 20000;
            if (lair > threshold) {
              irpjAdicional = (lair - threshold) * (taxConfig?.irpj_additional_rate || 0.10);
            }
            csll = lair * (taxConfig?.csll_rate || 0.09);
          }

          const impostosTotal = irpj + irpjAdicional + csll;
          const lucroLiquido = lair - impostosTotal;
          const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

          historicalData.push({
            month: monthNames[month - 1],
            lucroLiquido,
            margemLiquida,
            receitaLiquida,
            year,
            monthNum: month,
          });
        });

        // Sort by year and month
        historicalData.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.monthNum - b.monthNum;
        });

        setData(historicalData);
      } catch (error) {
        console.error("Error fetching historical DRE:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [company, months]);

  return { data, loading };
}
