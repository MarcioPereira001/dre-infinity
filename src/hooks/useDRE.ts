import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";

interface DREData {
  receitaBruta: number;
  deducoes: number;
  receitaLiquida: number;
  cmv: number;
  lucroBruto: number;
  despesasOperacionais: number;
  lucroOperacional: number;
  despesasFinanceiras: number;
  receitasFinanceiras: number;
  lair: number;
  impostos: number;
  lucroLiquido: number;
  margemBruta: number;
  margemOperacional: number;
  margemLiquida: number;
}

export function useDRE(month?: number, year?: number) {
  const [dreData, setDreData] = useState<DREData | null>(null);
  const [loading, setLoading] = useState(true);
  const { company } = useCompany();
  const { toast } = useToast();

  const calculateDRE = async () => {
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

      // Calcular DRE
      let receitaBruta = 0;
      let deducoes = 0;
      let cmv = 0;
      let despesasOperacionais = 0;
      let despesasFinanceiras = 0;
      let receitasFinanceiras = 0;

      transactions?.forEach((t: any) => {
        const amount = Number(t.amount);
        const categoryType = t.category?.category_type;

        if (categoryType === "revenue") {
          receitaBruta += amount;
        } else if (categoryType === "cost") {
          cmv += amount;
        } else if (categoryType === "expense") {
          // Classificar despesas
          const categoryName = t.category?.name?.toLowerCase() || "";
          if (categoryName.includes("financeira")) {
            despesasFinanceiras += amount;
          } else {
            despesasOperacionais += amount;
          }
        }
      });

      // Cálculo de impostos baseado no regime tributário
      const taxRegime = company.tax_regime;
      let aliquotaImpostos = 0;

      switch (taxRegime) {
        case "simples_nacional":
          aliquotaImpostos = 0.06; // 6% simplificado
          break;
        case "lucro_presumido":
          aliquotaImpostos = 0.138; // 13.8% (IRPJ + CSLL)
          break;
        case "lucro_real":
          aliquotaImpostos = 0.34; // 34% (IRPJ + CSLL + adicional)
          break;
      }

      deducoes = receitaBruta * aliquotaImpostos;
      const receitaLiquida = receitaBruta - deducoes;
      const lucroBruto = receitaLiquida - cmv;
      const lucroOperacional = lucroBruto - despesasOperacionais;
      const lair = lucroOperacional + receitasFinanceiras - despesasFinanceiras;
      const impostos = lair > 0 ? lair * 0.34 : 0;
      const lucroLiquido = lair - impostos;

      const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;
      const margemOperacional = receitaLiquida > 0 ? (lucroOperacional / receitaLiquida) * 100 : 0;
      const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

      setDreData({
        receitaBruta,
        deducoes,
        receitaLiquida,
        cmv,
        lucroBruto,
        despesasOperacionais,
        lucroOperacional,
        despesasFinanceiras,
        receitasFinanceiras,
        lair,
        impostos,
        lucroLiquido,
        margemBruta,
        margemOperacional,
        margemLiquida,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao calcular DRE",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateDRE();
  }, [company, month, year]);

  return {
    dreData,
    loading,
    recalculate: calculateDRE,
  };
}
