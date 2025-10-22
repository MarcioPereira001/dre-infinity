import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";

interface TaxConfiguration {
  id: string;
  company_id: string;
  icms_rate: number;
  ipi_rate: number;
  pis_rate: number;
  cofins_rate: number;
  iss_rate: number;
  das_rate: number;
  use_das: boolean;
  irpj_rate: number;
  irpj_additional_rate: number;
  irpj_additional_threshold: number;
  csll_rate: number;
  regime_type: string;
  last_updated: string;
  created_at: string;
}

export function useTaxConfigurations() {
  const [taxConfig, setTaxConfig] = useState<TaxConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const { company } = useCompany();
  const { toast } = useToast();

  const fetchTaxConfiguration = async () => {
    if (!company) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tax_configurations")
        .select("*")
        .eq("company_id", company.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create default if not exists
        await createDefaultTaxConfiguration();
        return;
      }

      setTaxConfig(data as TaxConfiguration);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar configurações de impostos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTaxConfiguration = async () => {
    if (!company) return;

    const defaultConfig = {
      company_id: company.id,
      regime_type: company.tax_regime,
      use_das: company.tax_regime === "simples_nacional",
    };

    try {
      const { data, error } = await supabase
        .from("tax_configurations")
        .insert(defaultConfig)
        .select()
        .single();

      if (error) throw error;
      setTaxConfig(data as TaxConfiguration);
    } catch (error: any) {
      toast({
        title: "Erro ao criar configurações padrão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateTaxConfiguration = async (updates: Partial<TaxConfiguration>) => {
    if (!company || !taxConfig) return;

    try {
      const { data, error } = await supabase
        .from("tax_configurations")
        .update(updates)
        .eq("company_id", company.id)
        .select()
        .single();

      if (error) throw error;

      setTaxConfig(data as TaxConfiguration);
      toast({
        title: "Configurações atualizadas",
        description: "As alíquotas de impostos foram atualizadas com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar configurações",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadTaxConfiguration = async () => {
      if (!company) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("tax_configurations")
          .select("*")
          .eq("company_id", company.id)
          .maybeSingle();

        if (error) throw error;

        if (!isMounted) return;

        if (!data) {
          // Create default if not exists
          await createDefaultTaxConfiguration();
          return;
        }

        setTaxConfig(data as TaxConfiguration);
      } catch (error: any) {
        if (!isMounted) return;
        toast({
          title: "Erro ao carregar configurações de impostos",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTaxConfiguration();

    return () => {
      isMounted = false;
    };
  }, [company]);

  return {
    taxConfig,
    loading,
    updateTaxConfiguration,
    refreshTaxConfig: fetchTaxConfiguration,
  };
}
