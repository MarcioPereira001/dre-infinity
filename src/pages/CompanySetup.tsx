import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/GlassCard";
import { GradientText } from "@/components/GradientText";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CompanySetup() {
  const { user } = useAuth();
  const { companies, refreshCompanies } = useCompany();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasExistingCompany, setHasExistingCompany] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tax_id: "",
    tax_regime: "simples_nacional" as const,
    fiscal_period: "monthly",
  });

  useEffect(() => {
    setHasExistingCompany(companies.length > 0);
  }, [companies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("companies").insert({
        name: formData.name,
        tax_id: formData.tax_id || null,
        tax_regime: formData.tax_regime,
        fiscal_period: formData.fiscal_period,
        owner_id: user.id,
      });

      if (error) throw error;

      await refreshCompanies();

      toast({
        title: "Empresa cadastrada!",
        description: "Sua empresa foi criada com sucesso.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar empresa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        {hasExistingCompany && (
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        )}
        
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-4xl font-bold mb-2">
            <GradientText sparkle>Configure sua Empresa</GradientText>
          </h1>
          <p className="text-muted-foreground">
            {hasExistingCompany 
              ? "Adicione uma nova empresa" 
              : "Adicione as informações da sua empresa para começar"
            }
          </p>
        </div>

        <GlassCard className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                placeholder="Digite o nome da empresa"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id">CNPJ (opcional)</Label>
              <Input
                id="tax_id"
                placeholder="00.000.000/0000-00"
                value={formData.tax_id}
                onChange={(e) =>
                  setFormData({ ...formData, tax_id: e.target.value })
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_regime">Regime Tributário *</Label>
              <Select
                value={formData.tax_regime}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, tax_regime: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples_nacional">
                    Simples Nacional
                  </SelectItem>
                  <SelectItem value="lucro_presumido">
                    Lucro Presumido
                  </SelectItem>
                  <SelectItem value="lucro_real">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscal_period">Período Fiscal *</Label>
              <Select
                value={formData.fiscal_period}
                onValueChange={(value) =>
                  setFormData({ ...formData, fiscal_period: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="annual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              variant="glow"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando empresa...
                </>
              ) : (
                "Criar Empresa"
              )}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
