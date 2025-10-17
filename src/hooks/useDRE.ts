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
  
  // Análise Horizontal (% variação em relação ao período anterior)
  horizontalAnalysis?: {
    receitaBruta: number;
    receitaLiquida: number;
    cmv: number;
    lucroBruto: number;
    despesasOperacionais: number;
    lucroOperacional: number;
    lair: number;
    lucroLiquido: number;
  };
}

export function useDRE(
  month?: number, 
  year?: number,
  categoryId?: string,
  clientId?: string
) {
  const [dreData, setDreData] = useState<DREData | null>(null);
  const [previousDreData, setPreviousDreData] = useState<DREData | null>(null);
  const [loading, setLoading] = useState(true);
  const { company } = useCompany();
  const { toast } = useToast();
  const { taxConfig } = useTaxConfigurations();

  const calculateDRE = async () => {
    if (!company) return;

    try {
      setLoading(true);

      // Buscar transações do período atual
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

      // Buscar transações do período anterior para Análise Horizontal
      let previousMonth = month ? month - 1 : undefined;
      let previousYear = year;
      if (previousMonth === 0) {
        previousMonth = 12;
        previousYear = year ? year - 1 : undefined;
      }

      let previousQuery = supabase
        .from("transactions")
        .select(`
          *,
          category:dre_categories(*)
        `)
        .eq("company_id", company.id);

      if (previousMonth) previousQuery = previousQuery.eq("month", previousMonth);
      if (previousYear) previousQuery = previousQuery.eq("year", previousYear);
      if (categoryId) previousQuery = previousQuery.eq("category_id", categoryId);
      if (clientId) previousQuery = previousQuery.eq("client_id", clientId);

      const { data: previousTransactions } = await previousQuery;

      // Calcular DRE
      let receitaBruta = 0;
      let cmv = 0;
      let despesasOperacionais = 0;
      let despesasFinanceiras = 0;
      let receitasFinanceiras = 0;

      console.log("Processando transações:", transactions?.length);
      console.log("Filtros aplicados - Month:", month, "Year:", year, "CategoryId:", categoryId, "ClientId:", clientId);
      
      transactions?.forEach((t: any) => {
        const amount = Number(t.amount);
        const categoryType = t.category?.category_type;
        
        console.log("Transaction:", {
          description: t.description,
          amount,
          categoryType,
          categoryName: t.category?.name,
          hasCategory: !!t.category_id
        });
        
        // Log para debug
        if (!t.category_id) {
          console.warn("Transação sem categoria:", t.description, amount);
        }

        // Processar baseado no tipo de categoria
        if (categoryType === "revenue") {
          receitaBruta += amount;
          console.log("Adicionado à receita bruta:", amount, "Total:", receitaBruta);
        } else if (categoryType === "cost") {
          cmv += amount;
          console.log("Adicionado ao CMV:", amount, "Total:", cmv);
        } else if (categoryType === "expense") {
          // Classificar despesas
          const categoryName = t.category?.name?.toLowerCase() || "";
          if (categoryName.includes("financeira")) {
            despesasFinanceiras += amount;
            console.log("Adicionado a despesas financeiras:", amount);
          } else {
            despesasOperacionais += amount;
            console.log("Adicionado a despesas operacionais:", amount);
          }
        } else if (!categoryType && t.transaction_type === "operational") {
          // Fallback: transações operacionais sem categoria são consideradas receita
          console.log("Transação operacional sem categoria, contando como receita:", t.description, amount);
          receitaBruta += amount;
        }
      });
      console.log("DRE Calculada:", {
        receitaBruta,
        cmv,
        despesasOperacionais,
        despesasFinanceiras,
        receitasFinanceiras,
        transactionsCount: transactions?.length,
        company_id: company.id,
        filters: { month, year, categoryId, clientId }
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

      // Calcular DRE do período anterior (simplificado)
      let prevReceitaBruta = 0;
      let prevCmv = 0;
      let prevDespesasOperacionais = 0;
      let prevDespesasFinanceiras = 0;
      let prevReceitasFinanceiras = 0;

      previousTransactions?.forEach((t: any) => {
        const amount = Number(t.amount);
        const categoryType = t.category?.category_type;
        if (categoryType === "revenue") prevReceitaBruta += amount;
        else if (categoryType === "cost") prevCmv += amount;
        else if (categoryType === "expense") {
          const categoryName = t.category?.name?.toLowerCase() || "";
          if (categoryName.includes("financeira")) {
            prevDespesasFinanceiras += amount;
          } else {
            prevDespesasOperacionais += amount;
          }
        }
      });

      let prevDeducoesTotal = 0;
      if (use_das) {
        prevDeducoesTotal = prevReceitaBruta * (taxConfig?.das_rate || 0.06);
      } else {
        const prevIcms = prevReceitaBruta * (taxConfig?.icms_rate || 0.18);
        const prevIpi = prevReceitaBruta * (taxConfig?.ipi_rate || 0.10);
        const prevPis = prevReceitaBruta * (taxConfig?.pis_rate || 0.0165);
        const prevCofins = prevReceitaBruta * (taxConfig?.cofins_rate || 0.076);
        const prevIss = prevReceitaBruta * (taxConfig?.iss_rate || 0.05);
        prevDeducoesTotal = prevIcms + prevIpi + prevPis + prevCofins + prevIss;
      }

      const prevReceitaLiquida = prevReceitaBruta - prevDeducoesTotal;
      const prevLucroBruto = prevReceitaLiquida - prevCmv;
      const prevLucroOperacional = prevLucroBruto - prevDespesasOperacionais;
      const prevLAIR = prevLucroOperacional + prevReceitasFinanceiras - prevDespesasFinanceiras;
      
      let prevIRPJ = 0;
      let prevIRPJAdicional = 0;
      let prevCSLL = 0;
      
      if (prevLAIR > 0) {
        prevIRPJ = prevLAIR * (taxConfig?.irpj_rate || 0.15);
        const threshold = taxConfig?.irpj_additional_threshold || 20000;
        if (prevLAIR > threshold) {
          prevIRPJAdicional = (prevLAIR - threshold) * (taxConfig?.irpj_additional_rate || 0.10);
        }
        prevCSLL = prevLAIR * (taxConfig?.csll_rate || 0.09);
      }

      const prevImpostosTotal = prevIRPJ + prevIRPJAdicional + prevCSLL;
      const prevLucroLiquido = prevLAIR - prevImpostosTotal;

      setPreviousDreData({
        receitaBruta: prevReceitaBruta,
        icms: 0,
        ipi: 0,
        pis: 0,
        cofins: 0,
        iss: 0,
        das: 0,
        use_das,
        deducoesTotal: prevDeducoesTotal,
        receitaLiquida: prevReceitaLiquida,
        cmv: prevCmv,
        lucroBruto: prevLucroBruto,
        despesasOperacionais: prevDespesasOperacionais,
        lucroOperacional: prevLucroOperacional,
        despesasFinanceiras: prevDespesasFinanceiras,
        receitasFinanceiras: prevReceitasFinanceiras,
        lair: prevLAIR,
        irpj: prevIRPJ,
        irpjAdicional: prevIRPJAdicional,
        csll: prevCSLL,
        impostosTotal: prevImpostosTotal,
        lucroLiquido: prevLucroLiquido,
        margemBruta: 0,
        margemOperacional: 0,
        margemLiquida: 0,
        avDeducoes: 0,
        avCmv: 0,
        avDespesasOperacionais: 0,
        avDespesasFinanceiras: 0,
        avReceitasFinanceiras: 0,
        avImpostos: 0,
      });

      // Calcular Análise Horizontal
      const horizontalAnalysis = previousDreData ? {
        receitaBruta: prevReceitaBruta > 0 ? ((receitaBruta - prevReceitaBruta) / prevReceitaBruta) * 100 : 0,
        receitaLiquida: prevReceitaLiquida > 0 ? ((receitaLiquida - prevReceitaLiquida) / prevReceitaLiquida) * 100 : 0,
        cmv: prevCmv > 0 ? ((cmv - prevCmv) / prevCmv) * 100 : 0,
        lucroBruto: prevLucroBruto > 0 ? ((lucroBruto - prevLucroBruto) / prevLucroBruto) * 100 : 0,
        despesasOperacionais: prevDespesasOperacionais > 0 ? ((despesasOperacionais - prevDespesasOperacionais) / prevDespesasOperacionais) * 100 : 0,
        lucroOperacional: prevLucroOperacional > 0 ? ((lucroOperacional - prevLucroOperacional) / prevLucroOperacional) * 100 : 0,
        lair: prevLAIR > 0 ? ((lair - prevLAIR) / prevLAIR) * 100 : 0,
        lucroLiquido: prevLucroLiquido > 0 ? ((lucroLiquido - prevLucroLiquido) / prevLucroLiquido) * 100 : 0,
      } : undefined;

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
        horizontalAnalysis,
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
    previousDreData,
    loading,
    recalculate: calculateDRE,
  };
}
