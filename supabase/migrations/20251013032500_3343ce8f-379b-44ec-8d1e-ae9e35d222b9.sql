-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  tax_id TEXT,
  first_purchase_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, tax_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON public.clients(is_active);

-- RLS Policies para clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view clients of their companies" ON public.clients;
CREATE POLICY "Users can view clients of their companies" 
ON public.clients FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = clients.company_id 
    AND companies.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage clients of their companies" ON public.clients;
CREATE POLICY "Users can manage clients of their companies" 
ON public.clients FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = clients.company_id 
    AND companies.owner_id = auth.uid()
  )
);

-- Atualizar tabela transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_new_client BOOLEAN DEFAULT false;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_marketing_cost BOOLEAN DEFAULT false;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_sales_cost BOOLEAN DEFAULT false;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'administrative' CHECK (transaction_type IN ('administrative', 'operational'));

-- Índices adicionais para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON public.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_is_new_client ON public.transactions(is_new_client);
CREATE INDEX IF NOT EXISTS idx_transactions_is_marketing_cost ON public.transactions(is_marketing_cost);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_type ON public.transactions(transaction_type);

-- Atualizar transações existentes como administrativas
UPDATE public.transactions SET transaction_type = 'administrative' WHERE transaction_type IS NULL;

-- Criar tabela de cache de métricas
CREATE TABLE IF NOT EXISTS public.metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  
  total_revenue DECIMAL(15,2) DEFAULT 0,
  net_revenue DECIMAL(15,2) DEFAULT 0,
  total_sales_count INTEGER DEFAULT 0,
  
  new_clients_count INTEGER DEFAULT 0,
  total_active_clients INTEGER DEFAULT 0,
  repeat_customers_count INTEGER DEFAULT 0,
  
  marketing_costs DECIMAL(15,2) DEFAULT 0,
  sales_costs DECIMAL(15,2) DEFAULT 0,
  operational_costs DECIMAL(15,2) DEFAULT 0,
  fixed_costs DECIMAL(15,2) DEFAULT 0,
  variable_costs DECIMAL(15,2) DEFAULT 0,
  
  cac DECIMAL(15,2),
  ltv DECIMAL(15,2),
  ltv_cac_ratio DECIMAL(10,2),
  roi DECIMAL(10,2),
  average_ticket DECIMAL(15,2),
  break_even_point DECIMAL(15,2),
  safety_margin DECIMAL(15,2),
  contribution_margin DECIMAL(15,2),
  
  last_calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(company_id, period_month, period_year)
);

-- Índices para metrics_cache
CREATE INDEX IF NOT EXISTS idx_metrics_cache_company_period ON public.metrics_cache(company_id, period_year, period_month);

-- RLS Policies para metrics_cache
ALTER TABLE public.metrics_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view metrics of their companies" ON public.metrics_cache;
CREATE POLICY "Users can view metrics of their companies" 
ON public.metrics_cache FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = metrics_cache.company_id 
    AND companies.owner_id = auth.uid()
  )
);