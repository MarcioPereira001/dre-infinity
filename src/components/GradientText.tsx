import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  sparkle?: boolean;
}

export const GradientText = ({ children, className, sparkle = false }: GradientTextProps) => {
  return (
    <span className={cn("gradient-text font-bold relative", className)}>
      {children}
      {sparkle && (
        <>
          <span className="absolute -top-2 -right-2 w-2 h-2 bg-primary rounded-full animate-sparkle" />
          <span className="absolute top-1/2 -left-3 w-1.5 h-1.5 bg-secondary rounded-full animate-sparkle animation-delay-200" />
          <span className="absolute -bottom-1 right-1/4 w-1 h-1 bg-accent rounded-full animate-sparkle animation-delay-400" />
        </>
      )}
    </span>
  );
};
