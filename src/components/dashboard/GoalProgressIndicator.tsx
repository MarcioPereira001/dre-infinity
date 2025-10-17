import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface GoalProgressIndicatorProps {
  currentValue: number;
  targetValue: number | null;
  label: string;
  formatValue?: (value: number) => string;
}

export const GoalProgressIndicator = ({
  currentValue,
  targetValue,
  label,
  formatValue = (v) => v.toFixed(2),
}: GoalProgressIndicatorProps) => {
  if (!targetValue || targetValue === 0) return null;

  const progress = Math.min((currentValue / targetValue) * 100, 100);
  const isAchieved = currentValue >= targetValue;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Meta {label}:</span>
        </div>
        <span className="font-medium">
          {formatValue(currentValue)} / {formatValue(targetValue)}
        </span>
      </div>
      <Progress value={progress} className={`h-2 ${isAchieved ? "bg-primary/20" : ""}`} />
      <div className="flex justify-between text-xs">
        <span className={isAchieved ? "text-primary font-medium" : "text-muted-foreground"}>
          {progress.toFixed(1)}% alcançado
        </span>
        {isAchieved && <span className="text-primary font-medium">✓ Meta atingida!</span>}
      </div>
    </div>
  );
};
