
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  useEffect(() => {
    console.error(
      "404 Error: Page non trouvée"
    );
  }, []);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <AlertCircle className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-3">404</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Oups! Cette page n'existe pas ou a été déplacée.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/explore">
            <Search className="mr-2 h-4 w-4" />
            Explorer les decks
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
