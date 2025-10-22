import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";

export interface Goal {
  id: string;
  company_id: string;
  period_month: number;
  period_year: number;
  metric_name: string;
  target_value: number;
  created_at: string;
  updated_at: string;
}

export const useGoals = (month: number, year: number) => {
  const { company } = useCompany();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!company) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("company_id", company.id)
        .eq("period_month", month)
        .eq("period_year", year);

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar metas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const upsertGoal = async (metricName: string, targetValue: number) => {
    if (!company) return;

    try {
      const { error } = await supabase.from("goals").upsert({
        company_id: company.id,
        period_month: month,
        period_year: year,
        metric_name: metricName,
        target_value: targetValue,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Meta salva",
        description: "Meta atualizada com sucesso",
      });

      fetchGoals();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar meta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getGoalByMetric = (metricName: string): number | null => {
    const goal = goals.find((g) => g.metric_name === metricName);
    return goal ? Number(goal.target_value) : null;
  };

  useEffect(() => {
    let isMounted = true;

    const loadGoals = async () => {
      if (!company) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("goals")
          .select("*")
          .eq("company_id", company.id)
          .eq("period_month", month)
          .eq("period_year", year);

        if (error) throw error;
        
        if (!isMounted) return;
        setGoals(data || []);
      } catch (error: any) {
        if (!isMounted) return;
        toast({
          title: "Erro ao carregar metas",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadGoals();

    return () => {
      isMounted = false;
    };
  }, [company, month, year]);

  return {
    goals,
    loading,
    upsertGoal,
    getGoalByMetric,
    refreshGoals: fetchGoals,
  };
};
