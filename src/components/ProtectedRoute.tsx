import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { companies, loading: companyLoading } = useCompany();
  const location = useLocation();

  if (authLoading || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to company setup if no company exists and not already on setup page
  if (companies.length === 0 && location.pathname !== "/company-setup") {
    return <Navigate to="/company-setup" replace />;
  }

  // Redirect to dashboard if company exists and on setup page
  if (companies.length > 0 && location.pathname === "/company-setup") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
