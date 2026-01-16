import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-accent">HomeLab Control Center</h1>
          <p className="text-muted-foreground mt-1">Painel centralizado para gerenciar seu home lab</p>
        </div>
      </div>

      <div className="container py-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Bem-vindo ao HomeLab Control Center</CardTitle>
            <CardDescription>Painel de controle para Jexactyl, qBittorrent e Glances</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">Olá, {user?.name || "Usuário"}!</p>
            <p className="text-muted-foreground mt-2">Configure suas integrações para começar a gerenciar seu home lab.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
