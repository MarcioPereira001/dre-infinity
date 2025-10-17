import { useState } from "react";
import { GradientText } from "@/components/GradientText";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Edit, Trash2, Users, Percent } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useClients } from "@/hooks/useClients";
import { useTaxConfigurations } from "@/hooks/useTaxConfigurations";
import { useCompany } from "@/contexts/CompanyContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccountTab } from "@/components/settings/AccountTab";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  // Client dialog state
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    category_type: "revenue" as "revenue" | "cost" | "expense",
    cost_classification: null as "fixed" | "variable" | null,
    parent_id: null as string | null,
  });

  const [clientFormData, setClientFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tax_id: "",
  });

  // Only fetch categories when not on clients or tax_av tabs
  const shouldFetchCategories = !["clients", "tax_av"].includes(activeTab);
  
  const { categories, loading, createCategory, updateCategory, deleteCategory } =
    useCategories(shouldFetchCategories ? (activeTab as "revenue" | "cost" | "expense") : undefined);

  const { clients, loading: clientsLoading, createClient, updateClient, deleteClient } = useClients();
  
  const { taxConfig, loading: taxLoading, updateTaxConfiguration } = useTaxConfigurations();
  const { company } = useCompany();

  const [taxFormData, setTaxFormData] = useState({
    icms_rate: 0,
    ipi_rate: 0,
    pis_rate: 0,
    cofins_rate: 0,
    iss_rate: 0,
    das_rate: 0,
    use_das: false,
    irpj_rate: 0,
    irpj_additional_rate: 0,
    irpj_additional_threshold: 0,
    csll_rate: 0,
  });

  // Update tax form when taxConfig loads
  useState(() => {
    if (taxConfig) {
      setTaxFormData({
        icms_rate: taxConfig.icms_rate,
        ipi_rate: taxConfig.ipi_rate,
        pis_rate: taxConfig.pis_rate,
        cofins_rate: taxConfig.cofins_rate,
        iss_rate: taxConfig.iss_rate,
        das_rate: taxConfig.das_rate,
        use_das: taxConfig.use_das,
        irpj_rate: taxConfig.irpj_rate,
        irpj_additional_rate: taxConfig.irpj_additional_rate,
        irpj_additional_threshold: taxConfig.irpj_additional_threshold,
        csll_rate: taxConfig.csll_rate,
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      await updateCategory(editingCategory.id, formData);
    } else {
      await createCategory(formData);
    }

    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      category_type: activeTab as "revenue" | "cost" | "expense",
      cost_classification: null,
      parent_id: null,
    });
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingClient) {
      await updateClient(editingClient.id, clientFormData);
    } else {
      await createClient(clientFormData);
    }

    setIsClientDialogOpen(false);
    setEditingClient(null);
    setClientFormData({
      name: "",
      email: "",
      phone: "",
      tax_id: "",
    });
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      category_type: category.category_type,
      cost_classification: category.cost_classification,
      parent_id: category.parent_id,
    });
    setIsDialogOpen(true);
  };

  const handleClientEdit = (client: any) => {
    setEditingClient(client);
    setClientFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      tax_id: client.tax_id || "",
    });
    setIsClientDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover esta categoria?")) {
      await deleteCategory(id);
    }
  };

  const handleClientDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este cliente?")) {
      await deleteClient(id);
    }
  };

  const handleTaxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTaxConfiguration(taxFormData);
  };

  const getCategoryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      revenue: "Receitas",
      cost: "Custos",
      expense: "Despesas",
    };
    return labels[type] || type;
  };

  const mainCategories = categories.filter((c) => !c.parent_id);
  const subcategories = categories.filter((c) => c.parent_id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          <GradientText>Configurações</GradientText>
        </h1>
        <p className="text-muted-foreground">
          Configure as categorias e clientes da sua empresa
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass">
          <TabsTrigger value="revenue">Receitas</TabsTrigger>
          <TabsTrigger value="cost">Custos</TabsTrigger>
          <TabsTrigger value="expense">Despesas</TabsTrigger>
          <TabsTrigger value="clients">
            <Users className="w-4 h-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="tax_av">
            <Percent className="w-4 h-4 mr-2" />
            % AV
          </TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>

        {/* Categories Tabs */}
        {["revenue", "cost", "expense"].map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                <GradientText>{getCategoryTypeLabel(type)}</GradientText>
              </h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="glow"
                    onClick={() => {
                      setEditingCategory(null);
                      setFormData({
                        name: "",
                        category_type: type as "revenue" | "cost" | "expense",
                        cost_classification: null,
                        parent_id: null,
                      });
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? "Editar" : "Nova"} Categoria
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados da categoria de {getCategoryTypeLabel(type).toLowerCase()}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome da Categoria</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Ex: Venda de Produtos"
                          required
                        />
                      </div>

                      {(type === "cost" || type === "expense") && (
                        <div>
                          <Label htmlFor="classification">Classificação</Label>
                          <Select
                            value={formData.cost_classification || ""}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                cost_classification: value as "fixed" | "variable",
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixo</SelectItem>
                              <SelectItem value="variable">Variável</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="parent">Categoria Pai (Opcional)</Label>
                        <Select
                          value={formData.parent_id || "none"}
                          onValueChange={(value) =>
                            setFormData({ ...formData, parent_id: value === "none" ? null : value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Nenhuma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {mainCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" variant="glow">
                        {editingCategory ? "Atualizar" : "Criar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <GlassCard>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : mainCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma categoria cadastrada. Clique em "Nova Categoria" para começar.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      {(type === "cost" || type === "expense") && (
                        <TableHead>Classificação</TableHead>
                      )}
                      <TableHead>Subcategorias</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mainCategories.map((category) => {
                      const subs = subcategories.filter(
                        (s) => s.parent_id === category.id
                      );
                      return (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          {(type === "cost" || type === "expense") && (
                            <TableCell>
                              {category.cost_classification === "fixed"
                                ? "Fixo"
                                : category.cost_classification === "variable"
                                ? "Variável"
                                : "-"}
                            </TableCell>
                          )}
                          <TableCell>{subs.length}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </GlassCard>
          </TabsContent>
        ))}

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">
              <GradientText>Clientes</GradientText>
            </h2>
            <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="glow"
                  onClick={() => {
                    setEditingClient(null);
                    setClientFormData({
                      name: "",
                      email: "",
                      phone: "",
                      tax_id: "",
                    });
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="glass">
                <DialogHeader>
                  <DialogTitle>
                    {editingClient ? "Editar" : "Novo"} Cliente
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do cliente
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleClientSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="client-name">Nome *</Label>
                      <Input
                        id="client-name"
                        value={clientFormData.name}
                        onChange={(e) =>
                          setClientFormData({ ...clientFormData, name: e.target.value })
                        }
                        placeholder="Nome do cliente"
                        required
                        minLength={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="client-email">Email</Label>
                      <Input
                        id="client-email"
                        type="email"
                        value={clientFormData.email}
                        onChange={(e) =>
                          setClientFormData({ ...clientFormData, email: e.target.value })
                        }
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="client-phone">Telefone</Label>
                      <Input
                        id="client-phone"
                        value={clientFormData.phone}
                        onChange={(e) =>
                          setClientFormData({ ...clientFormData, phone: e.target.value })
                        }
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="client-tax-id">CPF/CNPJ</Label>
                      <Input
                        id="client-tax-id"
                        value={clientFormData.tax_id}
                        onChange={(e) =>
                          setClientFormData({ ...clientFormData, tax_id: e.target.value })
                        }
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsClientDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" variant="glow">
                      {editingClient ? "Atualizar" : "Criar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <GlassCard>
            {clientsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum cliente cadastrado. Clique em "Novo Cliente" para começar.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email || "-"}</TableCell>
                      <TableCell>{client.phone || "-"}</TableCell>
                      <TableCell>{client.tax_id || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleClientEdit(client)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleClientDelete(client.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </GlassCard>
        </TabsContent>

        {/* Tax Configurations Tab */}
        <TabsContent value="tax_av" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">
              <GradientText>Configuração de Alíquotas e Impostos</GradientText>
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure as alíquotas de impostos de acordo com o regime tributário da sua empresa.
              Estes valores serão usados para calcular o DRE e a Análise Vertical.
            </p>
          </div>

          {taxLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <GlassCard className="p-6">
              <form onSubmit={handleTaxSubmit} className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Regime Tributário Atual</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    {company?.tax_regime === 'simples_nacional' && 'Simples Nacional'}
                    {company?.tax_regime === 'lucro_presumido' && 'Lucro Presumido'}
                    {company?.tax_regime === 'lucro_real' && 'Lucro Real'}
                  </p>
                </div>

                <Separator />

                {company?.tax_regime === 'simples_nacional' && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Usar DAS (Simples Nacional)?</Label>
                        <p className="text-sm text-muted-foreground">
                          Se ativado, usará apenas a alíquota do DAS. Caso contrário, usará impostos individuais.
                        </p>
                      </div>
                      <Switch
                        checked={taxFormData.use_das}
                        onCheckedChange={(checked) =>
                          setTaxFormData({ ...taxFormData, use_das: checked })
                        }
                      />
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Impostos sobre Vendas (Deduções da Receita Bruta)
                  </h3>
                  
                  {taxFormData.use_das ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="das_rate">DAS - Simples Nacional (%)</Label>
                        <Input
                          id="das_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={(taxFormData.das_rate * 100).toFixed(2)}
                          onChange={(e) =>
                            setTaxFormData({
                              ...taxFormData,
                              das_rate: Number(e.target.value) / 100,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Alíquota total do DAS conforme faixa de faturamento
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="icms_rate">ICMS (%)</Label>
                        <Input
                          id="icms_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={(taxFormData.icms_rate * 100).toFixed(2)}
                          onChange={(e) =>
                            setTaxFormData({
                              ...taxFormData,
                              icms_rate: Number(e.target.value) / 100,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Imposto estadual sobre circulação de mercadorias
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="ipi_rate">IPI (%)</Label>
                        <Input
                          id="ipi_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={(taxFormData.ipi_rate * 100).toFixed(2)}
                          onChange={(e) =>
                            setTaxFormData({
                              ...taxFormData,
                              ipi_rate: Number(e.target.value) / 100,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Imposto sobre produtos industrializados
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="pis_rate">PIS (%)</Label>
                        <Input
                          id="pis_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={(taxFormData.pis_rate * 100).toFixed(2)}
                          onChange={(e) =>
                            setTaxFormData({
                              ...taxFormData,
                              pis_rate: Number(e.target.value) / 100,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Programa de Integração Social
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="cofins_rate">COFINS (%)</Label>
                        <Input
                          id="cofins_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={(taxFormData.cofins_rate * 100).toFixed(2)}
                          onChange={(e) =>
                            setTaxFormData({
                              ...taxFormData,
                              cofins_rate: Number(e.target.value) / 100,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Contribuição para Financiamento da Seguridade Social
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="iss_rate">ISS (%)</Label>
                        <Input
                          id="iss_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={(taxFormData.iss_rate * 100).toFixed(2)}
                          onChange={(e) =>
                            setTaxFormData({
                              ...taxFormData,
                              iss_rate: Number(e.target.value) / 100,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Imposto municipal sobre serviços
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Impostos sobre o Lucro (após LAIR)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="irpj_rate">IRPJ (%)</Label>
                      <Input
                        id="irpj_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={(taxFormData.irpj_rate * 100).toFixed(2)}
                        onChange={(e) =>
                          setTaxFormData({
                            ...taxFormData,
                            irpj_rate: Number(e.target.value) / 100,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Imposto de Renda Pessoa Jurídica (base)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="irpj_additional_rate">IRPJ Adicional (%)</Label>
                      <Input
                        id="irpj_additional_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={(taxFormData.irpj_additional_rate * 100).toFixed(2)}
                        onChange={(e) =>
                          setTaxFormData({
                            ...taxFormData,
                            irpj_additional_rate: Number(e.target.value) / 100,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Alíquota adicional sobre lucro acima do limite
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="irpj_additional_threshold">Limite para IRPJ Adicional (R$)</Label>
                      <Input
                        id="irpj_additional_threshold"
                        type="number"
                        step="0.01"
                        min="0"
                        value={taxFormData.irpj_additional_threshold.toFixed(2)}
                        onChange={(e) =>
                          setTaxFormData({
                            ...taxFormData,
                            irpj_additional_threshold: Number(e.target.value),
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Lucro mensal acima deste valor paga adicional (padrão: R$ 20.000)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="csll_rate">CSLL (%)</Label>
                      <Input
                        id="csll_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={(taxFormData.csll_rate * 100).toFixed(2)}
                        onChange={(e) =>
                          setTaxFormData({
                            ...taxFormData,
                            csll_rate: Number(e.target.value) / 100,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Contribuição Social sobre Lucro Líquido
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="submit" variant="glow">
                    Salvar Configurações
                  </Button>
                </div>
              </form>
            </GlassCard>
          )}
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
