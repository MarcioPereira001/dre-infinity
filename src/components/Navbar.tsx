import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/GradientText";
import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">
              <GradientText>DRE INFINITY</GradientText>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/auth">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
