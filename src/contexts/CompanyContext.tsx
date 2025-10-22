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

  const fetchCompanies = async (signal?: { aborted: boolean }) => {
    if (!user) {
      if (!signal?.aborted) {
        setCompanies([]);
        setCompany(null);
        setLoading(false);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (signal?.aborted) return;

      setCompanies(data || []);
      
      if (data && data.length > 0) {
        const savedCompanyId = localStorage.getItem("currentCompanyId");
        const currentCompany = savedCompanyId
          ? data.find((c) => c.id === savedCompanyId) || data[0]
          : data[0];
        setCompany(currentCompany);
      }
    } catch (error) {
      if (signal?.aborted) return;
      console.error("Error fetching companies:", error);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadCompanies = async () => {
      if (!user) {
        if (isMounted) {
          setCompanies([]);
          setCompany(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (!isMounted) return;

        setCompanies(data || []);
        
        if (data && data.length > 0) {
          const savedCompanyId = localStorage.getItem("currentCompanyId");
          const currentCompany = savedCompanyId
            ? data.find((c) => c.id === savedCompanyId) || data[0]
            : data[0];
          setCompany(currentCompany);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching companies:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCompanies();

    return () => {
      isMounted = false;
    };
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
