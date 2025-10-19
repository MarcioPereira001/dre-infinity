-- FASE 1: CRIAR CATEGORIAS PADRÃO PARA TODAS AS EMPRESAS
-- Receita de Vendas (NULL para cost_classification)
INSERT INTO dre_categories (company_id, name, category_type, display_order, is_active)
SELECT DISTINCT 
  c.id,
  'Receita de Vendas',
  'revenue'::category_type,
  1,
  true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM dre_categories dc
  WHERE dc.company_id = c.id AND dc.name = 'Receita de Vendas'
);

-- Custos de Produção (CMV)
INSERT INTO dre_categories (company_id, name, category_type, cost_classification, display_order, is_active)
SELECT DISTINCT 
  c.id,
  'Custos de Produção',
  'cost'::category_type,
  'variable'::cost_classification,
  2,
  true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM dre_categories dc
  WHERE dc.company_id = c.id AND dc.name = 'Custos de Produção'
);

-- Despesas Administrativas
INSERT INTO dre_categories (company_id, name, category_type, cost_classification, display_order, is_active)
SELECT DISTINCT 
  c.id,
  'Despesas Administrativas',
  'expense'::category_type,
  'fixed'::cost_classification,
  3,
  true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM dre_categories dc
  WHERE dc.company_id = c.id AND dc.name = 'Despesas Administrativas'
);

-- Despesas Comerciais
INSERT INTO dre_categories (company_id, name, category_type, cost_classification, display_order, is_active)
SELECT DISTINCT 
  c.id,
  'Despesas Comerciais',
  'expense'::category_type,
  'variable'::cost_classification,
  4,
  true
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM dre_categories dc
  WHERE dc.company_id = c.id AND dc.name = 'Despesas Comerciais'
);

-- FASE 1: ATUALIZAR TRANSAÇÕES SEM CATEGORIA
UPDATE transactions t
SET category_id = (
  SELECT dc.id FROM dre_categories dc
  WHERE dc.company_id = t.company_id 
  AND dc.category_type = 'revenue'::category_type
  AND dc.is_active = true
  ORDER BY dc.display_order LIMIT 1
)
WHERE t.category_id IS NULL 
AND (t.amount > 500 OR lower(t.description) LIKE '%venda%' OR lower(t.description) LIKE '%receita%');

UPDATE transactions t
SET category_id = (
  SELECT dc.id FROM dre_categories dc
  WHERE dc.company_id = t.company_id 
  AND dc.category_type = 'cost'::category_type
  AND dc.is_active = true
  ORDER BY dc.display_order LIMIT 1
)
WHERE t.category_id IS NULL 
AND (lower(t.description) LIKE '%compra%' OR lower(t.description) LIKE '%materia%' OR lower(t.description) LIKE '%produto%');

UPDATE transactions t
SET category_id = (
  SELECT dc.id FROM dre_categories dc
  WHERE dc.company_id = t.company_id 
  AND dc.category_type = 'expense'::category_type
  AND dc.is_active = true
  ORDER BY dc.display_order LIMIT 1
)
WHERE t.category_id IS NULL;

-- FASE 2: RECRIAR TRIGGER
DROP TRIGGER IF EXISTS transactions_metrics_trigger ON public.transactions;
CREATE TRIGGER transactions_metrics_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalculate_metrics();

-- FASE 3: ADICIONAR COLUNA tax_deductions
ALTER TABLE metrics_cache ADD COLUMN IF NOT EXISTS tax_deductions NUMERIC DEFAULT 0;

-- FASE 3: ATUALIZAR FUNÇÃO calculate_and_cache_metrics
CREATE OR REPLACE FUNCTION public.calculate_and_cache_metrics(p_company_id UUID, p_month INTEGER, p_year INTEGER)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  v_tax_deductions NUMERIC := 0;
  v_use_das BOOLEAN := false;
  v_das_rate NUMERIC := 0.06;
  v_icms_rate NUMERIC := 0.18;
  v_ipi_rate NUMERIC := 0.10;
  v_pis_rate NUMERIC := 0.0165;
  v_cofins_rate NUMERIC := 0.076;
  v_iss_rate NUMERIC := 0.05;
BEGIN
  SELECT COALESCE(use_das, false), COALESCE(das_rate, 0.06), COALESCE(icms_rate, 0.18), 
         COALESCE(ipi_rate, 0.10), COALESCE(pis_rate, 0.0165), COALESCE(cofins_rate, 0.076), COALESCE(iss_rate, 0.05)
  INTO v_use_das, v_das_rate, v_icms_rate, v_ipi_rate, v_pis_rate, v_cofins_rate, v_iss_rate
  FROM tax_configurations WHERE company_id = p_company_id LIMIT 1;

  SELECT COALESCE(SUM(t.amount), 0) INTO v_total_revenue FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id AND t.month = p_month AND t.year = p_year 
  AND c.category_type = 'revenue'::category_type AND c.is_active = true;

  IF v_use_das THEN
    v_tax_deductions := v_total_revenue * v_das_rate;
  ELSE
    v_tax_deductions := v_total_revenue * (v_icms_rate + v_ipi_rate + v_pis_rate + v_cofins_rate + v_iss_rate);
  END IF;

  v_net_revenue := v_total_revenue - v_tax_deductions;

  SELECT COUNT(*) INTO v_total_sales_count FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id AND t.month = p_month AND t.year = p_year 
  AND c.category_type = 'revenue'::category_type AND c.is_active = true;

  SELECT COUNT(DISTINCT t.client_id) INTO v_new_clients_count FROM transactions t
  WHERE t.company_id = p_company_id AND t.month = p_month AND t.year = p_year 
  AND t.is_new_client = true AND t.client_id IS NOT NULL;

  SELECT COUNT(DISTINCT t.client_id) INTO v_total_active_clients FROM transactions t
  WHERE t.company_id = p_company_id AND t.month = p_month AND t.year = p_year AND t.client_id IS NOT NULL;

  v_repeat_customers_count := GREATEST(v_total_active_clients - v_new_clients_count, 0);

  SELECT COALESCE(SUM(t.amount), 0) INTO v_marketing_costs FROM transactions t
  WHERE t.company_id = p_company_id AND t.month = p_month AND t.year = p_year AND t.is_marketing_cost = true;

  SELECT COALESCE(SUM(t.amount), 0) INTO v_sales_costs FROM transactions t
  WHERE t.company_id = p_company_id AND t.month = p_month AND t.year = p_year AND t.is_sales_cost = true;

  SELECT COALESCE(SUM(t.amount), 0) INTO v_operational_costs FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id AND t.month = p_month AND t.year = p_year 
  AND c.category_type = 'expense'::category_type AND c.is_active = true;

  SELECT COALESCE(SUM(t.amount), 0) INTO v_fixed_costs FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id AND t.month = p_month AND t.year = p_year 
  AND (c.category_type = 'expense'::category_type OR c.category_type = 'cost'::category_type)
  AND c.cost_classification = 'fixed'::cost_classification AND c.is_active = true;

  SELECT COALESCE(SUM(t.amount), 0) INTO v_variable_costs FROM transactions t
  LEFT JOIN dre_categories c ON t.category_id = c.id
  WHERE t.company_id = p_company_id AND t.month = p_month AND t.year = p_year 
  AND (c.category_type = 'expense'::category_type OR c.category_type = 'cost'::category_type)
  AND c.cost_classification = 'variable'::cost_classification AND c.is_active = true;

  IF v_new_clients_count > 0 THEN v_cac := (v_marketing_costs + v_sales_costs) / v_new_clients_count; END IF;
  IF v_total_sales_count > 0 THEN v_average_ticket := v_total_revenue / v_total_sales_count; END IF;
  v_ltv := v_average_ticket * 12;
  IF v_cac > 0 THEN v_ltv_cac_ratio := v_ltv / v_cac; END IF;
  IF (v_marketing_costs + v_sales_costs) > 0 THEN 
    v_roi := ((v_net_revenue - (v_marketing_costs + v_sales_costs)) / (v_marketing_costs + v_sales_costs)) * 100;
  END IF;
  v_contribution_margin := v_net_revenue - v_variable_costs;
  IF v_contribution_margin > 0 AND v_net_revenue > 0 THEN 
    v_break_even_point := v_fixed_costs / (v_contribution_margin / v_net_revenue);
  END IF;
  IF v_net_revenue > 0 THEN v_safety_margin := ((v_net_revenue - v_break_even_point) / v_net_revenue) * 100; END IF;

  INSERT INTO public.metrics_cache (company_id, period_month, period_year, total_revenue, net_revenue, 
    total_sales_count, new_clients_count, total_active_clients, repeat_customers_count, marketing_costs, 
    sales_costs, operational_costs, fixed_costs, variable_costs, cac, ltv, ltv_cac_ratio, roi, average_ticket, 
    break_even_point, safety_margin, contribution_margin, tax_deductions, last_calculated_at)
  VALUES (p_company_id, p_month, p_year, v_total_revenue, v_net_revenue, v_total_sales_count, v_new_clients_count, 
    v_total_active_clients, v_repeat_customers_count, v_marketing_costs, v_sales_costs, v_operational_costs, 
    v_fixed_costs, v_variable_costs, v_cac, v_ltv, v_ltv_cac_ratio, v_roi, v_average_ticket, v_break_even_point, 
    v_safety_margin, v_contribution_margin, v_tax_deductions, now())
  ON CONFLICT (company_id, period_month, period_year) DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue, net_revenue = EXCLUDED.net_revenue, total_sales_count = EXCLUDED.total_sales_count,
    new_clients_count = EXCLUDED.new_clients_count, total_active_clients = EXCLUDED.total_active_clients,
    repeat_customers_count = EXCLUDED.repeat_customers_count, marketing_costs = EXCLUDED.marketing_costs,
    sales_costs = EXCLUDED.sales_costs, operational_costs = EXCLUDED.operational_costs, fixed_costs = EXCLUDED.fixed_costs,
    variable_costs = EXCLUDED.variable_costs, cac = EXCLUDED.cac, ltv = EXCLUDED.ltv, ltv_cac_ratio = EXCLUDED.ltv_cac_ratio,
    roi = EXCLUDED.roi, average_ticket = EXCLUDED.average_ticket, break_even_point = EXCLUDED.break_even_point,
    safety_margin = EXCLUDED.safety_margin, contribution_margin = EXCLUDED.contribution_margin,
    tax_deductions = EXCLUDED.tax_deductions, last_calculated_at = now();
END;
$$;