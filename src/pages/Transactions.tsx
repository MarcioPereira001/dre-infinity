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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
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
import { cn } from "@/lib/utils";

export default function Transactions() {
  const [activeTab, setActiveTab] = useState<"administrative" | "operational">("administrative");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Operational fields
  const [hasClient, setHasClient] = useState(false);
  const [isMarketingOrSales, setIsMarketingOrSales] = useState(false);
  const [costType, setCostType] = useState<"marketing" | "sales">("marketing");

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    transaction_date: new Date(),
    category_id: "",
    client_id: "",
    is_new_client: false,
  });

  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction } =
    useTransactions({
      search: searchTerm,
      categoryId: filterCategory && filterCategory !== "all" ? filterCategory : undefined,
    });

  const { categories } = useCategories();
  const { clients } = useClients();

  // Filter transactions by type
  const filteredTransactions = transactions.filter(
    (t) => t.transaction_type === activeTab || (!t.transaction_type && activeTab === "administrative")
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const transactionData: any = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      transaction_date: format(formData.transaction_date, "yyyy-MM-dd"),
      category_id: formData.category_id || null,
      transaction_type: activeTab,
    };

    // Add operational fields
    if (activeTab === "operational") {
      if (hasClient) {
        transactionData.client_id = formData.client_id || null;
        transactionData.is_new_client = formData.is_new_client;
      }
      if (isMarketingOrSales) {
        transactionData.is_marketing_cost = costType === "marketing";
        transactionData.is_sales_cost = costType === "sales";
      }
    }

    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transactionData);
    } else {
      await createTransaction(transactionData);
    }

    resetForm();
  };

  const resetForm = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
    setHasClient(false);
    setIsMarketingOrSales(false);
    setCostType("marketing");
    setFormData({
      description: "",
      amount: "",
      transaction_date: new Date(),
      category_id: "",
      client_id: "",
      is_new_client: false,
    });
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      transaction_date: new Date(transaction.transaction_date),
      category_id: transaction.category_id || "",
      client_id: transaction.client_id || "",
      is_new_client: transaction.is_new_client || false,
    });
    setHasClient(!!transaction.client_id);
    setIsMarketingOrSales(transaction.is_marketing_cost || transaction.is_sales_cost);
    if (transaction.is_marketing_cost) setCostType("marketing");
    if (transaction.is_sales_cost) setCostType("sales");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este lançamento?")) {
      await deleteTransaction(id);
    }
  };

  const getCategoryById = (id: string | null) => {
    if (!id) return null;
    return categories.find((c) => c.id === id);
  };

  const getClientById = (id: string | null) => {
    if (!id) return null;
    return clients.find((c) => c.id === id);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          <GradientText>Lançamentos</GradientText>
        </h1>
        <p className="text-muted-foreground">
          Registre todas as transações financeiras da sua empresa
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="glass">
          <TabsTrigger value="administrative">Administrativos</TabsTrigger>
          <TabsTrigger value="operational">Operacionais</TabsTrigger>
        </TabsList>

        {["administrative", "operational"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="w-full md:w-64">
                <Label>Categoria</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="glow"
                    onClick={resetForm}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Lançamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTransaction ? "Editar" : "Novo"} Lançamento {tabValue === "operational" && "Operacional"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados da transação financeira
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="date">Data</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.transaction_date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.transaction_date ? (
                                format(formData.transaction_date, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 pointer-events-auto">
                            <Calendar
                              mode="single"
                              selected={formData.transaction_date}
                              onSelect={(date) =>
                                date && setFormData({ ...formData, transaction_date: date })
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="Ex: Venda de produtos"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Select
                          value={formData.category_id}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category_id: value })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="amount">Valor (R$)</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) =>
                            setFormData({ ...formData, amount: e.target.value })
                          }
                          placeholder="0,00"
                          required
                        />
                      </div>

                      {/* Operational Fields */}
                      {tabValue === "operational" && (
                        <>
                          <div className="flex items-center space-x-2 p-4 bg-accent/10 rounded-lg">
                            <Switch
                              id="has-client"
                              checked={hasClient}
                              onCheckedChange={setHasClient}
                            />
                            <Label htmlFor="has-client" className="cursor-pointer">
                              Cliente Envolvido
                            </Label>
                          </div>

                          {hasClient && (
                            <>
                              <div>
                                <Label htmlFor="client">Cliente</Label>
                                <Select
                                  value={formData.client_id}
                                  onValueChange={(value) =>
                                    setFormData({ ...formData, client_id: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {clients.map((client) => (
                                      <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center space-x-2 p-4 bg-accent/10 rounded-lg">
                                <Switch
                                  id="is-new-client"
                                  checked={formData.is_new_client}
                                  onCheckedChange={(checked) =>
                                    setFormData({ ...formData, is_new_client: checked })
                                  }
                                />
                                <Label htmlFor="is-new-client" className="cursor-pointer">
                                  Cliente Novo? (para cálculo de CAC)
                                </Label>
                              </div>
                            </>
                          )}

                          <div className="flex items-center space-x-2 p-4 bg-accent/10 rounded-lg">
                            <Switch
                              id="is-marketing-sales"
                              checked={isMarketingOrSales}
                              onCheckedChange={setIsMarketingOrSales}
                            />
                            <Label htmlFor="is-marketing-sales" className="cursor-pointer">
                              Custo de Marketing/Vendas
                            </Label>
                          </div>

                          {isMarketingOrSales && (
                            <div>
                              <Label>Tipo de Custo</Label>
                              <RadioGroup
                                value={costType}
                                onValueChange={(value: "marketing" | "sales") =>
                                  setCostType(value)
                                }
                                className="flex space-x-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="marketing" id="marketing" />
                                  <Label htmlFor="marketing" className="cursor-pointer">
                                    Marketing
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="sales" id="sales" />
                                  <Label htmlFor="sales" className="cursor-pointer">
                                    Vendas
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          )}
                        </>
                      )}
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
                        {editingTransaction ? "Atualizar" : "Criar"}
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
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum lançamento encontrado. Clique em "Novo Lançamento" para começar.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      {tabValue === "operational" && <TableHead>Cliente</TableHead>}
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => {
                      const category = getCategoryById(transaction.category_id);
                      const client = getClientById(transaction.client_id);
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.transaction_date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.description}
                            {transaction.is_new_client && (
                              <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                Novo
                              </span>
                            )}
                            {transaction.is_marketing_cost && (
                              <span className="ml-2 text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded">
                                Marketing
                              </span>
                            )}
                            {transaction.is_sales_cost && (
                              <span className="ml-2 text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded">
                                Vendas
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{category?.name || "-"}</TableCell>
                          {tabValue === "operational" && (
                            <TableCell>{client?.name || "-"}</TableCell>
                          )}
                          <TableCell
                            className={cn(
                              "text-right font-semibold",
                              category?.category_type === "revenue"
                                ? "text-green-500"
                                : "text-red-500"
                            )}
                          >
                            {formatCurrency(Number(transaction.amount))}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(transaction.id)}
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
      </Tabs>
    </div>
  );
}
