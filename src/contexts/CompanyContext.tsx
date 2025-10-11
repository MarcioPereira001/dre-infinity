import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { Database } from "@/integrations/supabase/types";

type Company = Database["public"]["Tables"]["companies"]["Row"];

interface CompanyContextType {
  company: Company | null;
  companies: Company[];
  loading: boolean;
  setCurrentCompany: (company: Company) => void;
  refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType>({
  company: null,
  companies: [],
  loading: true,
  setCurrentCompany: () => {},
  refreshCompanies: async () => {},
});

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    if (!user) {
      setCompanies([]);
      setCompany(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCompanies(data || []);
      
      if (data && data.length > 0) {
        const savedCompanyId = localStorage.getItem("currentCompanyId");
        const currentCompany = savedCompanyId
          ? data.find((c) => c.id === savedCompanyId) || data[0]
          : data[0];
        setCompany(currentCompany);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [user]);

  const setCurrentCompany = (newCompany: Company) => {
    setCompany(newCompany);
    localStorage.setItem("currentCompanyId", newCompany.id);
  };

  const refreshCompanies = async () => {
    await fetchCompanies();
  };

  return (
    <CompanyContext.Provider
      value={{
        company,
        companies,
        loading,
        setCurrentCompany,
        refreshCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}
