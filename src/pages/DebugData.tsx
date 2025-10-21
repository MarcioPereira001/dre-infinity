import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function DebugData() {
  const { company } = useCompany();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!company) return;

    try {
      setLoading(true);

      // Fetch transactions
      const { data: transData, error: transError } = await supabase
        .from("transactions")
        .select(`
          *,
          category:dre_categories(*)
        `)
        .eq("company_id", company.id)
        .order("transaction_date", { ascending: false });

      if (transError) throw transError;
      setTransactions(transData || []);

      // Fetch metrics cache
      const { data: metricsData, error: metricsError } = await supabase
        .from("metrics_cache")
        .select("*")
        .eq("company_id", company.id)
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false });

      if (metricsError) throw metricsError;
      setMetrics(metricsData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao buscar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const recalculateMetrics = async () => {
    if (!company) return;

    try {
      setLoading(true);

      // Get unique month/year combinations from transactions
      const { data: transactions } = await supabase
        .from("transactions")
        .select("month, year")
        .eq("company_id", company.id);

      const periods = new Set<string>();
      transactions?.forEach((t: any) => {
        periods.add(`${t.year}-${t.month}`);
      });

      // Call function for each period
      for (const period of periods) {
        const [year, month] = period.split("-").map(Number);
        const { error } = await supabase.rpc("calculate_and_cache_metrics", {
          p_company_id: company.id,
          p_month: month,
          p_year: year,
        });

        if (error) {
          console.error(`Error recalculating for ${period}:`, error);
        }
      }

      toast({
        title: "Métricas recalculadas",
        description: `Recalculado para ${periods.size} períodos`,
      });

      await fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao recalcular",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [company]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          <GradientText>Debug de Dados</GradientText>
        </h1>
        <p className="text-muted-foreground">
          Visualize e recalcule os dados do sistema
        </p>
      </div>

      <div className="flex gap-4">
        <Button onClick={fetchData} disabled={loading}>
          Atualizar Dados
        </Button>
        <Button onClick={recalculateMetrics} disabled={loading} variant="glow">
          Recalcular Métricas
        </Button>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-2xl font-semibold mb-4">
          <GradientText>Transações ({transactions.length})</GradientText>
        </h2>
        <div className="space-y-2 max-h-96 overflow-auto">
          {transactions.map((t) => (
            <div key={t.id} className="p-3 bg-background/50 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">{t.description}</span>
                <span className="text-primary font-bold">
                  R$ {Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t.category?.name || "Sem categoria"} ({t.category?.category_type || "N/A"}) |{" "}
                {t.month}/{t.year} | {t.transaction_date}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-2xl font-semibold mb-4">
          <GradientText>Métricas Cacheadas ({metrics.length})</GradientText>
        </h2>
        <div className="space-y-2 max-h-96 overflow-auto">
          {metrics.map((m) => (
            <div key={m.id} className="p-3 bg-background/50 rounded-lg">
              <div className="font-medium mb-2">
                {m.period_month}/{m.period_year}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Receita Total:</span>{" "}
                  <span className="font-medium">
                    R$ {Number(m.total_revenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Receita Líquida:</span>{" "}
                  <span className="font-medium">
                    R$ {Number(m.net_revenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">CAC:</span>{" "}
                  <span className="font-medium">
                    R$ {Number(m.cac || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">LTV:</span>{" "}
                  <span className="font-medium">
                    R$ {Number(m.ltv || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
