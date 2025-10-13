import { useState } from "react";
import { GradientText } from "@/components/GradientText";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    transaction_date: new Date(),
    category_id: "",
  });

  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction } =
    useTransactions({
      search: searchTerm,
      categoryId: filterCategory && filterCategory !== "all" ? filterCategory : undefined,
    });

  const { categories } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const transactionData = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      transaction_date: format(formData.transaction_date, "yyyy-MM-dd"),
      category_id: formData.category_id || null,
    };

    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transactionData);
    } else {
      await createTransaction(transactionData);
    }

    setIsDialogOpen(false);
    setEditingTransaction(null);
    setFormData({
      description: "",
      amount: "",
      transaction_date: new Date(),
      category_id: "",
    });
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      transaction_date: new Date(transaction.transaction_date),
      category_id: transaction.category_id || "",
    });
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
              onClick={() => {
                setEditingTransaction(null);
                setFormData({
                  description: "",
                  amount: "",
                  transaction_date: new Date(),
                  category_id: "",
                });
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? "Editar" : "Novo"} Lançamento
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
        ) : transactions.length === 0 ? (
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
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const category = getCategoryById(transaction.category_id);
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.transaction_date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>{category?.name || "-"}</TableCell>
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
    </div>
  );
}
