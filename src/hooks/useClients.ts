import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { company } = useCompany();
  const { toast } = useToast();

  const fetchClients = async () => {
    if (!company) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("company_id", company.id)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadClients = async () => {
      if (!company) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("company_id", company.id)
          .eq("is_active", true)
          .order("name", { ascending: true });

        if (error) throw error;
        
        if (!isMounted) return;
        setClients(data || []);
      } catch (error: any) {
        if (!isMounted) return;
        toast({
          title: "Erro ao carregar clientes",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadClients();

    return () => {
      isMounted = false;
    };
  }, [company]);

  const createClient = async (client: Omit<ClientInsert, "company_id">) => {
    if (!company) return;

    try {
      const { data, error } = await supabase
        .from("clients")
        .insert({ ...client, company_id: company.id })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Cliente criado",
        description: "Cliente adicionado com sucesso!",
      });

      await fetchClients();
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateClient = async (id: string, updates: Partial<ClientInsert>) => {
    try {
      const { error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Cliente atualizado",
        description: "Cliente atualizado com sucesso!",
      });

      await fetchClients();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from("clients")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Cliente removido",
        description: "Cliente removido com sucesso!",
      });

      await fetchClients();
    } catch (error: any) {
      toast({
        title: "Erro ao remover cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    refreshClients: fetchClients,
  };
}
