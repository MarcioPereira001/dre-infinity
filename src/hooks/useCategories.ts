import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["dre_categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["dre_categories"]["Insert"];

export function useCategories(categoryType?: "revenue" | "cost" | "expense") {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { company } = useCompany();
  const { toast } = useToast();

  const fetchCategories = async () => {
    if (!company) return;

    try {
      setLoading(true);
      let query = supabase
        .from("dre_categories")
        .select("*")
        .eq("company_id", company.id)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (categoryType) {
        query = query.eq("category_type", categoryType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      if (!company) return;

      try {
        setLoading(true);
        let query = supabase
          .from("dre_categories")
          .select("*")
          .eq("company_id", company.id)
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (categoryType) {
          query = query.eq("category_type", categoryType);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        if (!isMounted) return;
        setCategories(data || []);
      } catch (error: any) {
        if (!isMounted) return;
        toast({
          title: "Erro ao carregar categorias",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [company, categoryType]);

  const createCategory = async (category: Omit<CategoryInsert, "company_id">) => {
    if (!company) return;

    try {
      const { data, error } = await supabase
        .from("dre_categories")
        .insert({ ...category, company_id: company.id })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Categoria criada",
        description: "Categoria adicionada com sucesso!",
      });

      await fetchCategories();
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateCategory = async (id: string, updates: Partial<CategoryInsert>) => {
    try {
      const { error } = await supabase
        .from("dre_categories")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Categoria atualizada",
        description: "Categoria atualizada com sucesso!",
      });

      await fetchCategories();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("dre_categories")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Categoria removida",
        description: "Categoria removida com sucesso!",
      });

      await fetchCategories();
    } catch (error: any) {
      toast({
        title: "Erro ao remover categoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories,
  };
}
