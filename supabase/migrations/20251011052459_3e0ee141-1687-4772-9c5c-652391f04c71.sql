-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');

-- Create enum for category types
CREATE TYPE public.category_type AS ENUM ('revenue', 'cost', 'expense');

-- Create enum for cost classification
CREATE TYPE public.cost_classification AS ENUM ('fixed', 'variable');

-- Create enum for tax regime
CREATE TYPE public.tax_regime AS ENUM ('simples_nacional', 'lucro_presumido', 'lucro_real');

-- =============================================
-- USER ROLES TABLE
-- =============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- COMPANIES TABLE
-- =============================================
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    tax_id TEXT,
    tax_regime tax_regime NOT NULL DEFAULT 'simples_nacional',
    fiscal_period TEXT NOT NULL DEFAULT 'monthly',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own companies"
ON public.companies FOR SELECT
USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own companies"
ON public.companies FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own companies"
ON public.companies FOR UPDATE
USING (auth.uid() = owner_id);

-- =============================================
-- DRE CATEGORIES TABLE
-- =============================================
CREATE TABLE public.dre_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category_type category_type NOT NULL,
    parent_id UUID REFERENCES public.dre_categories(id) ON DELETE CASCADE,
    cost_classification cost_classification,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_category_per_company UNIQUE (company_id, name, category_type)
);

ALTER TABLE public.dre_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories of their companies"
ON public.dre_categories FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.companies
        WHERE companies.id = dre_categories.company_id
        AND companies.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can manage categories of their companies"
ON public.dre_categories FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.companies
        WHERE companies.id = dre_categories.company_id
        AND companies.owner_id = auth.uid()
    )
);

-- =============================================
-- TRANSACTIONS TABLE
-- =============================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.dre_categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions of their companies"
ON public.transactions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.companies
        WHERE companies.id = transactions.company_id
        AND companies.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can create transactions for their companies"
ON public.transactions FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.companies
        WHERE companies.id = transactions.company_id
        AND companies.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can update transactions of their companies"
ON public.transactions FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.companies
        WHERE companies.id = transactions.company_id
        AND companies.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can delete transactions of their companies"
ON public.transactions FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.companies
        WHERE companies.id = transactions.company_id
        AND companies.owner_id = auth.uid()
    )
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_companies_owner_id ON public.companies(owner_id);
CREATE INDEX idx_dre_categories_company_id ON public.dre_categories(company_id);
CREATE INDEX idx_dre_categories_parent_id ON public.dre_categories(parent_id);
CREATE INDEX idx_transactions_company_id ON public.transactions(company_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_month_year ON public.transactions(month, year);

-- =============================================
-- TRIGGER FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply update triggers
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dre_categories_updated_at
    BEFORE UPDATE ON public.dre_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-populate month and year from transaction_date
CREATE OR REPLACE FUNCTION public.auto_populate_transaction_period()
RETURNS TRIGGER AS $$
BEGIN
    NEW.month = EXTRACT(MONTH FROM NEW.transaction_date);
    NEW.year = EXTRACT(YEAR FROM NEW.transaction_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_transaction_period
    BEFORE INSERT OR UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_populate_transaction_period();