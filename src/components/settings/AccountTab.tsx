import { useState } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Building2, Trash2, Save } from "lucide-react";

export const AccountTab = () => {
  const { company, refreshCompanies } = useCompany();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  
  const [formData, setFormData] = useState({
    name: company?.name || "",
    tax_id: company?.tax_id || "",
    tax_regime: (company?.tax_regime as "simples_nacional" | "lucro_presumido" | "lucro_real") || "simples_nacional",
    fiscal_period: company?.fiscal_period || "monthly",
  });

  const handleUpdateCompany = async () => {
    if (!company) return;

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from("companies")
        .update({
          name: formData.name,
          tax_id: formData.tax_id,
          tax_regime: formData.tax_regime,
          fiscal_period: formData.fiscal_period,
        })
        .eq("id", company.id);

      if (error) throw error;

      toast({
        title: "Empresa atualizada",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });

      refreshCompanies();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar empresa",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!company || deleteConfirmation !== company.name) {
      toast({
        title: "Confirmação incorreta",
        description: "O nome da empresa não corresponde.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", company.id);

      if (error) throw error;

      toast({
        title: "Empresa excluída",
        description: "A empresa foi removida com sucesso.",
      });

      // Refresh companies and redirect
      await refreshCompanies();
      navigate("/company-setup");
    } catch (error: any) {
      toast({
        title: "Erro ao excluir empresa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!company) {
    return (
      <GlassCard className="p-6">
        <p className="text-center text-muted-foreground">
          Nenhuma empresa selecionada
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-semibold">
            <GradientText>Dados da Empresa</GradientText>
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="company-name">Nome da Empresa *</Label>
            <Input
              id="company-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nome da empresa"
              required
            />
          </div>

          <div>
            <Label htmlFor="company-tax-id">CNPJ</Label>
            <Input
              id="company-tax-id"
              value={formData.tax_id}
              onChange={(e) =>
                setFormData({ ...formData, tax_id: e.target.value })
              }
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div>
            <Label htmlFor="tax-regime">Regime Tributário</Label>
            <Select
              value={formData.tax_regime}
              onValueChange={(value: "simples_nacional" | "lucro_presumido" | "lucro_real") =>
                setFormData({ ...formData, tax_regime: value })
              }
            >
              <SelectTrigger id="tax-regime">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                <SelectItem value="lucro_real">Lucro Real</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fiscal-period">Período Fiscal</Label>
            <Select
              value={formData.fiscal_period}
              onValueChange={(value) =>
                setFormData({ ...formData, fiscal_period: value })
              }
            >
              <SelectTrigger id="fiscal-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleUpdateCompany}
              disabled={isUpdating || !formData.name}
              variant="glow"
            >
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 border-destructive/50">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-6 h-6 text-destructive" />
          <h3 className="text-2xl font-semibold text-destructive">
            Zona de Perigo
          </h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          A exclusão da empresa é permanente e não pode ser desfeita. Todos os
          dados, incluindo transações, categorias e configurações serão removidos.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Empresa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Para confirmar, digite o nome da
                empresa <strong>"{company.name}"</strong> abaixo:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder={`Digite: ${company.name}`}
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCompany}
                disabled={deleteConfirmation !== company.name}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirmar Exclusão
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </GlassCard>
    </div>
  );
};
