import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Página não encontrada
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <Button asChild className="w-full">
            <a href="/">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Início
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
