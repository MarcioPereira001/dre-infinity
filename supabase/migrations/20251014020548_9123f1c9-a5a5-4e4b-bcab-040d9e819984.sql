-- Create tax_configurations table for configurable tax rates
CREATE TABLE IF NOT EXISTS public.tax_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Sales Taxes (Revenue Deductions)
  icms_rate DECIMAL(5,4) DEFAULT 0.1800, -- 18%
  ipi_rate DECIMAL(5,4) DEFAULT 0.1000, -- 10%
  pis_rate DECIMAL(5,4) DEFAULT 0.0165, -- 1.65%
  cofins_rate DECIMAL(5,4) DEFAULT 0.0760, -- 7.6%
  iss_rate DECIMAL(5,4) DEFAULT 0.0500, -- 5%
  
  -- DAS (Simples Nacional) - replaces individual taxes when used
  das_rate DECIMAL(5,4) DEFAULT 0.0600, -- 6%
  use_das BOOLEAN DEFAULT false,
  
  -- Profit Taxes
  irpj_rate DECIMAL(5,4) DEFAULT 0.1500, -- 15%
  irpj_additional_rate DECIMAL(5,4) DEFAULT 0.1000, -- 10% additional
  irpj_additional_threshold DECIMAL(15,2) DEFAULT 20000.00, -- R$ 20,000/month threshold
  csll_rate DECIMAL(5,4) DEFAULT 0.0900, -- 9%
  
  -- Metadata
  regime_type TEXT CHECK (regime_type IN ('simples_nacional', 'lucro_presumido', 'lucro_real')),
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(company_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_tax_configurations_company_id ON public.tax_configurations(company_id);

-- Enable RLS
ALTER TABLE public.tax_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view tax configurations of their companies" 
ON public.tax_configurations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = tax_configurations.company_id 
    AND companies.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage tax configurations of their companies" 
ON public.tax_configurations FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.id = tax_configurations.company_id 
    AND companies.owner_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_tax_configurations_updated_at
  BEFORE UPDATE ON public.tax_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Populate with default data for existing companies
INSERT INTO public.tax_configurations (company_id, regime_type, use_das)
SELECT id, tax_regime, 
  CASE WHEN tax_regime = 'simples_nacional' THEN true ELSE false END
FROM public.companies
ON CONFLICT (company_id) DO NOTHING;

-- Add tax_breakdown column to transactions for detailed tax information
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS tax_breakdown JSONB;

COMMENT ON COLUMN public.transactions.tax_breakdown IS 'JSON structure storing detailed tax breakdown: {"icms": 180.00, "pis": 16.50, "cofins": 76.00, "iss": 50.00, "total": 322.50}';