import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  search?: string;
}

export function useTransactions(filters?: TransactionFilters) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { company } = useCompany();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    if (!company) return;

    try {
      setLoading(true);
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("company_id", company.id)
        .order("transaction_date", { ascending: false });

      if (filters?.startDate) {
        query = query.gte("transaction_date", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("transaction_date", filters.endDate);
      }
      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }
      if (filters?.search) {
        query = query.ilike("description", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar lançamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      if (!company) return;

      try {
        setLoading(true);
        let query = supabase
          .from("transactions")
          .select("*")
          .eq("company_id", company.id)
          .order("transaction_date", { ascending: false });

        if (filters?.startDate) {
          query = query.gte("transaction_date", filters.startDate);
        }
        if (filters?.endDate) {
          query = query.lte("transaction_date", filters.endDate);
        }
        if (filters?.categoryId) {
          query = query.eq("category_id", filters.categoryId);
        }
        if (filters?.search) {
          query = query.ilike("description", `%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        if (!isMounted) return;
        setTransactions(data || []);
      } catch (error: any) {
        if (!isMounted) return;
        toast({
          title: "Erro ao carregar lançamentos",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [company, filters?.startDate, filters?.endDate, filters?.categoryId, filters?.search]);

  const createTransaction = async (transaction: {
    description: string;
    amount: number;
    transaction_date: string;
    category_id: string | null;
    created_by?: string;
    client_id?: string | null;
    is_new_client?: boolean;
    is_marketing_cost?: boolean;
    is_sales_cost?: boolean;
    transaction_type?: "administrative" | "operational";
  }) => {
    if (!company) return;

    try {
      // month and year will be auto-populated by the database trigger
      const transactionData: any = {
        ...transaction,
        company_id: company.id,
      };

      const { data, error } = await supabase
        .from("transactions")
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Lançamento criado",
        description: "Lançamento adicionado com sucesso!",
      });

      await fetchTransactions();
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar lançamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateTransaction = async (id: string, updates: Partial<TransactionInsert> & {
    client_id?: string | null;
    is_new_client?: boolean;
    is_marketing_cost?: boolean;
    is_sales_cost?: boolean;
    transaction_type?: "administrative" | "operational";
  }) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Lançamento atualizado",
        description: "Lançamento atualizado com sucesso!",
      });

      await fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar lançamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Lançamento removido",
        description: "Lançamento removido com sucesso!",
      });

      await fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Erro ao remover lançamento",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    transactions,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions,
  };
}
