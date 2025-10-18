import React, { Component, ErrorInfo, ReactNode } from "react";
import { GlassCard } from "./GlassCard";
import { GradientText } from "./GradientText";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="max-w-md p-8 text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">
              <GradientText>Algo deu errado</GradientText>
            </h1>
            <p className="text-muted-foreground">
              Desculpe, encontramos um erro inesperado. Por favor, recarregue a
              página ou entre em contato com o suporte se o problema persistir.
            </p>
            {this.state.error && (
              <details className="text-xs text-left bg-background/50 p-3 rounded">
                <summary className="cursor-pointer font-semibold mb-2">
                  Detalhes do erro
                </summary>
                <code className="text-destructive">
                  {this.state.error.message}
                </code>
              </details>
            )}
            <Button onClick={this.handleReload} variant="glow" className="w-full">
              Recarregar Página
            </Button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
