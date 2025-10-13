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
import { PlusCircle, Edit, Trash2, Users } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useClients } from "@/hooks/useClients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const { categories, loading, createCategory, updateCategory, deleteCategory } =
    useCategories(activeTab as "revenue" | "cost" | "expense");

  const { clients, loading: clientsLoading, createClient, updateClient, deleteClient } = useClients();

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
      </Tabs>
    </div>
  );
}
