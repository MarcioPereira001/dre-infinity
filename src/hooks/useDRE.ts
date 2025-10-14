import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import { useTaxConfigurations } from "./useTaxConfigurations";

interface DREData {
  receitaBruta: number;
  
  // Deduções detalhadas (impostos sobre vendas)
  icms: number;
  ipi: number;
  pis: number;
  cofins: number;
  iss: number;
  das: number;
  use_das: boolean;
  deducoesTotal: number;
  
  receitaLiquida: number;
  cmv: number;
  lucroBruto: number;
  despesasOperacionais: number;
  lucroOperacional: number;
  despesasFinanceiras: number;
  receitasFinanceiras: number;
  lair: number;
  
  // Impostos sobre lucro detalhados
  irpj: number;
  irpjAdicional: number;
  csll: number;
  impostosTotal: number;
  
  lucroLiquido: number;
  
  // Margens
  margemBruta: number;
  margemOperacional: number;
  margemLiquida: number;
  
  // Análise Vertical (% da Receita Líquida)
  avDeducoes: number;
  avCmv: number;
  avDespesasOperacionais: number;
  avDespesasFinanceiras: number;
  avReceitasFinanceiras: number;
  avImpostos: number;
}

export function useDRE(
  month?: number, 
  year?: number,
  categoryId?: string,
  clientId?: string
) {
  const [dreData, setDreData] = useState<DREData | null>(null);
  const [loading, setLoading] = useState(true);
  const { company } = useCompany();
  const { toast } = useToast();
  const { taxConfig } = useTaxConfigurations();

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
      if (categoryId) query = query.eq("category_id", categoryId);
      if (clientId) query = query.eq("client_id", clientId);

      const { data: transactions, error } = await query;

      if (error) throw error;

      // Calcular DRE
      let receitaBruta = 0;
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

      // Calcular deduções baseadas nas configurações de impostos
      let icms = 0;
      let ipi = 0;
      let pis = 0;
      let cofins = 0;
      let iss = 0;
      let das = 0;
      let deducoesTotal = 0;
      const use_das = taxConfig?.use_das || false;

      if (use_das) {
        das = receitaBruta * (taxConfig?.das_rate || 0.06);
        deducoesTotal = das;
      } else {
        icms = receitaBruta * (taxConfig?.icms_rate || 0.18);
        ipi = receitaBruta * (taxConfig?.ipi_rate || 0.10);
        pis = receitaBruta * (taxConfig?.pis_rate || 0.0165);
        cofins = receitaBruta * (taxConfig?.cofins_rate || 0.076);
        iss = receitaBruta * (taxConfig?.iss_rate || 0.05);
        deducoesTotal = icms + ipi + pis + cofins + iss;
      }

      const receitaLiquida = receitaBruta - deducoesTotal;
      const lucroBruto = receitaLiquida - cmv;
      const lucroOperacional = lucroBruto - despesasOperacionais;
      const lair = lucroOperacional + receitasFinanceiras - despesasFinanceiras;

      // Calcular impostos sobre lucro
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

      // Calcular margens
      const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;
      const margemOperacional = receitaLiquida > 0 ? (lucroOperacional / receitaLiquida) * 100 : 0;
      const margemLiquida = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

      // Calcular Análise Vertical (% AV)
      const avDeducoes = receitaLiquida > 0 ? (deducoesTotal / receitaLiquida) * 100 : 0;
      const avCmv = receitaLiquida > 0 ? (cmv / receitaLiquida) * 100 : 0;
      const avDespesasOperacionais = receitaLiquida > 0 ? (despesasOperacionais / receitaLiquida) * 100 : 0;
      const avDespesasFinanceiras = receitaLiquida > 0 ? (despesasFinanceiras / receitaLiquida) * 100 : 0;
      const avReceitasFinanceiras = receitaLiquida > 0 ? (receitasFinanceiras / receitaLiquida) * 100 : 0;
      const avImpostos = receitaLiquida > 0 ? (impostosTotal / receitaLiquida) * 100 : 0;

      setDreData({
        receitaBruta,
        icms,
        ipi,
        pis,
        cofins,
        iss,
        das,
        use_das,
        deducoesTotal,
        receitaLiquida,
        cmv,
        lucroBruto,
        despesasOperacionais,
        lucroOperacional,
        despesasFinanceiras,
        receitasFinanceiras,
        lair,
        irpj,
        irpjAdicional,
        csll,
        impostosTotal,
        lucroLiquido,
        margemBruta,
        margemOperacional,
        margemLiquida,
        avDeducoes,
        avCmv,
        avDespesasOperacionais,
        avDespesasFinanceiras,
        avReceitasFinanceiras,
        avImpostos,
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
  }, [company, month, year, categoryId, clientId, taxConfig]);

  return {
    dreData,
    loading,
    recalculate: calculateDRE,
  };
}
