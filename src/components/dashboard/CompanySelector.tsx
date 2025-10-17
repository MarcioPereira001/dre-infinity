import { Check, ChevronsUpDown, Building2, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CompanySelectorProps {
  companies: Array<{
    id: string;
    name: string;
  }>;
  currentCompanyId: string | null;
  onCompanyChange: (companyId: string) => void;
}

export const CompanySelector = ({
  companies,
  currentCompanyId,
  onCompanyChange,
}: CompanySelectorProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const currentCompany = companies.find((c) => c.id === currentCompanyId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between glass"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="truncate">
              {currentCompany ? currentCompany.name : "Selecione empresa..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0 glass" style={{ zIndex: 9999 }}>
        <Command>
          <CommandInput placeholder="Buscar empresa..." />
          <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
          <CommandGroup>
            {companies.map((company) => (
              <CommandItem
                key={company.id}
                value={company.name}
                onSelect={() => {
                  onCompanyChange(company.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentCompanyId === company.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {company.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup>
            <CommandItem
              onSelect={() => {
                navigate("/company-setup");
                setOpen(false);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4 text-primary" />
              <span className="text-primary">Nova Empresa</span>
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
