import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface MetricInfoPopoverProps {
  title: string;
  description: string;
  formula?: string;
  example?: string;
}

export function MetricInfoPopover({
  title,
  description,
  formula,
  example,
}: MetricInfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full hover:bg-primary/10 transition-colors absolute bottom-2 left-2"
        >
          <Info className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 glass pointer-events-auto" align="start">
        <div className="space-y-3">
          <h4 className="font-semibold text-base text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          {formula && (
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Fórmula:
              </p>
              <code className="text-sm text-foreground font-mono">{formula}</code>
            </div>
          )}
          {example && (
            <div className="bg-primary/5 p-3 rounded-md border border-primary/20">
              <p className="text-xs font-medium text-primary mb-1">Exemplo:</p>
              <p className="text-sm text-foreground">{example}</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
