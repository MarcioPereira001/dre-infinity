-- Adicionar coluna de categoria de negócio/segmento à tabela companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS business_category TEXT;

COMMENT ON COLUMN public.companies.business_category IS 'Categoria/nicho/segmento de negócio da empresa (ex: Tecnologia, Varejo, Serviços, etc.)';