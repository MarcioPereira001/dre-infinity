-- MIGRATION 1: Adicionar Policy de DELETE para Companies
-- Permite que usuários excluam suas próprias empresas

CREATE POLICY "Users can delete their own companies"
ON public.companies
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- MIGRATION 2: Recriar Trigger SQL para Atualização Automática de Métricas
-- Garante que metrics_cache é atualizado automaticamente após mudanças em transactions

DROP TRIGGER IF EXISTS transactions_metrics_trigger ON public.transactions;

CREATE TRIGGER transactions_metrics_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalculate_metrics();

-- MIGRATION 3: Adicionar Constraint UNIQUE em Goals e Corrigir Transações Órfãs
-- Previne metas duplicadas e garante que todas transações têm categoria

-- Adicionar constraint UNIQUE para prevenir metas duplicadas
ALTER TABLE public.goals 
ADD CONSTRAINT goals_unique_metric_period 
UNIQUE (company_id, period_month, period_year, metric_name);

-- Criar categoria padrão "Outros (Sem Categoria)" para cada empresa que tem transações órfãs
INSERT INTO public.dre_categories (company_id, name, category_type, cost_classification, is_active)
SELECT DISTINCT 
  t.company_id, 
  'Outros (Sem Categoria)', 
  'expense'::category_type, 
  'fixed'::cost_classification, 
  true
FROM public.transactions t
WHERE t.category_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM public.dre_categories c 
  WHERE c.company_id = t.company_id 
  AND c.name = 'Outros (Sem Categoria)'
);

-- Associar transações órfãs à categoria "Outros"
UPDATE public.transactions t
SET category_id = (
  SELECT c.id FROM public.dre_categories c 
  WHERE c.company_id = t.company_id 
  AND c.name = 'Outros (Sem Categoria)'
  LIMIT 1
)
WHERE t.category_id IS NULL;