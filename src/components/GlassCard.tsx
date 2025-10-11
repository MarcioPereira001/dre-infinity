import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export const GlassCard = ({ children, className, hover = true, style }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "glass rounded-xl p-6 transition-all duration-300",
        hover && "hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30",
        className
      )}
      style={{
        boxShadow: "var(--shadow-glass)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
