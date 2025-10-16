-- Criar tabela de metas e orçamento
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  metric_name TEXT NOT NULL,
  target_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, period_month, period_year, metric_name)
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage goals of their companies"
ON public.goals
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = goals.company_id
    AND companies.owner_id = auth.uid()
  )
);

-- Criar função para calcular métricas automaticamente
CREATE OR REPLACE FUNCTION public.calculate_and_cache_metrics(
  p_company_id UUID,
  p_month INTEGER,
  p_year INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_revenue NUMERIC := 0;
  v_net_revenue NUMERIC := 0;
  v_total_sales_count INTEGER := 0;
  v_new_clients_count INTEGER := 0;
  v_total_active_clients INTEGER := 0;
  v_repeat_customers_count INTEGER := 0;
  v_marketing_costs NUMERIC := 0;
  v_sales_costs NUMERIC := 0;
  v_operational_costs NUMERIC := 0;
  v_fixed_costs NUMERIC := 0;
  v_variable_costs NUMERIC := 0;
  v_cac NUMERIC := 0;
  v_ltv NUMERIC := 0;
  v_ltv_cac_ratio NUMERIC := 0;
  v_roi NUMERIC := 0;
  v_average_ticket NUMERIC := 0;
  v_break_even_point NUMERIC := 0;
  v_safety_margin NUMERIC := 0;
  v_contribution_margin NUMERIC := 0;
BEGIN
  -- Calcular receita total (Receita Bruta)
  SELECT COALESCE(SUM(t.amount), 0)
  INTO v_total_revenue
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id
    AND t.month = p_month
    AND t.year = p_year
    AND c.category_type = 'revenue';

  -- Calcular número de vendas
  SELECT COUNT(*)
  INTO v_total_sales_count
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id
    AND t.month = p_month
    AND t.year = p_year
    AND c.category_type = 'revenue';

  -- Calcular número de novos clientes
  SELECT COUNT(DISTINCT t.client_id)
  INTO v_new_clients_count
  FROM transactions t
  WHERE t.company_id = p_company_id
    AND t.month = p_month
    AND t.year = p_year
    AND t.is_new_client = true;

  -- Calcular total de clientes ativos (com transações no período)
  SELECT COUNT(DISTINCT t.client_id)
  INTO v_total_active_clients
  FROM transactions t
  WHERE t.company_id = p_company_id
    AND t.month = p_month
    AND t.year = p_year
    AND t.client_id IS NOT NULL;

  -- Calcular clientes recorrentes
  v_repeat_customers_count := v_total_active_clients - v_new_clients_count;

  -- Calcular custos de marketing
  SELECT COALESCE(SUM(t.amount), 0)
  INTO v_marketing_costs
  FROM transactions t
  WHERE t.company_id = p_company_id
    AND t.month = p_month
    AND t.year = p_year
    AND t.is_marketing_cost = true;

  -- Calcular custos de vendas
  SELECT COALESCE(SUM(t.amount), 0)
  INTO v_sales_costs
  FROM transactions t
  WHERE t.company_id = p_company_id
    AND t.month = p_month
    AND t.year = p_year
    AND t.is_sales_cost = true;

  -- Calcular custos operacionais (despesas operacionais)
  SELECT COALESCE(SUM(t.amount), 0)
  INTO v_operational_costs
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id
    AND t.month = p_month
    AND t.year = p_year
    AND c.category_type = 'expense';

  -- Calcular custos fixos
  SELECT COALESCE(SUM(t.amount), 0)
  INTO v_fixed_costs
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id
    AND t.month = p_month
    AND t.year = p_year
    AND (c.category_type = 'expense' OR c.category_type = 'cost')
    AND c.cost_classification = 'fixed';

  -- Calcular custos variáveis
  SELECT COALESCE(SUM(t.amount), 0)
  INTO v_variable_costs
  FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id
    AND t.month = p_month
    AND t.year = p_year
    AND (c.category_type = 'expense' OR c.category_type = 'cost')
    AND c.cost_classification = 'variable';

  -- Obter receita líquida da DRE (simplificado aqui)
  v_net_revenue := v_total_revenue * 0.94; -- Assumindo 6% de impostos (ajustar conforme tax_configurations)

  -- Calcular CAC (Custo de Aquisição de Cliente)
  IF v_new_clients_count > 0 THEN
    v_cac := (v_marketing_costs + v_sales_costs) / v_new_clients_count;
  END IF;

  -- Calcular LTV (Lifetime Value) - simplificado
  IF v_total_active_clients > 0 THEN
    v_average_ticket := v_total_revenue / v_total_sales_count;
    v_ltv := v_average_ticket * 12; -- Assumindo 12 meses de retenção (ajustar conforme histórico)
  END IF;

  -- Calcular LTV/CAC Ratio
  IF v_cac > 0 THEN
    v_ltv_cac_ratio := v_ltv / v_cac;
  END IF;

  -- Calcular ROI
  IF (v_marketing_costs + v_sales_costs) > 0 THEN
    v_roi := ((v_net_revenue - (v_marketing_costs + v_sales_costs)) / (v_marketing_costs + v_sales_costs)) * 100;
  END IF;

  -- Calcular Average Ticket
  IF v_total_sales_count > 0 THEN
    v_average_ticket := v_total_revenue / v_total_sales_count;
  END IF;

  -- Calcular Margem de Contribuição
  v_contribution_margin := v_net_revenue - v_variable_costs;

  -- Calcular Ponto de Equilíbrio
  IF v_contribution_margin > 0 AND v_net_revenue > 0 THEN
    v_break_even_point := v_fixed_costs / (v_contribution_margin / v_net_revenue);
  END IF;

  -- Calcular Margem de Segurança
  IF v_net_revenue > 0 THEN
    v_safety_margin := ((v_net_revenue - v_break_even_point) / v_net_revenue) * 100;
  END IF;

  -- Inserir ou atualizar metrics_cache
  INSERT INTO public.metrics_cache (
    company_id,
    period_month,
    period_year,
    total_revenue,
    net_revenue,
    total_sales_count,
    new_clients_count,
    total_active_clients,
    repeat_customers_count,
    marketing_costs,
    sales_costs,
    operational_costs,
    fixed_costs,
    variable_costs,
    cac,
    ltv,
    ltv_cac_ratio,
    roi,
    average_ticket,
    break_even_point,
    safety_margin,
    contribution_margin,
    last_calculated_at
  ) VALUES (
    p_company_id,
    p_month,
    p_year,
    v_total_revenue,
    v_net_revenue,
    v_total_sales_count,
    v_new_clients_count,
    v_total_active_clients,
    v_repeat_customers_count,
    v_marketing_costs,
    v_sales_costs,
    v_operational_costs,
    v_fixed_costs,
    v_variable_costs,
    v_cac,
    v_ltv,
    v_ltv_cac_ratio,
    v_roi,
    v_average_ticket,
    v_break_even_point,
    v_safety_margin,
    v_contribution_margin,
    now()
  )
  ON CONFLICT (company_id, period_month, period_year)
  DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    net_revenue = EXCLUDED.net_revenue,
    total_sales_count = EXCLUDED.total_sales_count,
    new_clients_count = EXCLUDED.new_clients_count,
    total_active_clients = EXCLUDED.total_active_clients,
    repeat_customers_count = EXCLUDED.repeat_customers_count,
    marketing_costs = EXCLUDED.marketing_costs,
    sales_costs = EXCLUDED.sales_costs,
    operational_costs = EXCLUDED.operational_costs,
    fixed_costs = EXCLUDED.fixed_costs,
    variable_costs = EXCLUDED.variable_costs,
    cac = EXCLUDED.cac,
    ltv = EXCLUDED.ltv,
    ltv_cac_ratio = EXCLUDED.ltv_cac_ratio,
    roi = EXCLUDED.roi,
    average_ticket = EXCLUDED.average_ticket,
    break_even_point = EXCLUDED.break_even_point,
    safety_margin = EXCLUDED.safety_margin,
    contribution_margin = EXCLUDED.contribution_margin,
    last_calculated_at = now();
END;
$$;

-- Criar trigger para recalcular métricas quando transações mudam
CREATE OR REPLACE FUNCTION public.trigger_recalculate_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Recalcular para o período da transação inserida/atualizada
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_and_cache_metrics(OLD.company_id, OLD.month, OLD.year);
    RETURN OLD;
  ELSE
    PERFORM calculate_and_cache_metrics(NEW.company_id, NEW.month, NEW.year);
    RETURN NEW;
  END IF;
END;
$$;

-- Criar trigger na tabela transactions
DROP TRIGGER IF EXISTS transactions_metrics_trigger ON public.transactions;
CREATE TRIGGER transactions_metrics_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalculate_metrics();