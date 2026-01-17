import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Server,
  Download,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";

/**
 * Home page - Dashboard principal
 * Sem dados fake - você adicionará seus próprios dados para teste
 */
export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-accent">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo ao seu painel de controle do home lab
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jexactyl Card */}
        <Link href="/jexactyl">
          <Card className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-500" />
                Jexactyl
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Gerenciamento de servidores
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* qBittorrent Card */}
        <Link href="/qbittorrent">
          <Card className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4 text-green-500" />
                qBittorrent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Gerenciamento de torrents
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Glances Card */}
        <Link href="/glances">
          <Card className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" />
                Glances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Monitoramento de recursos
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Alerts Card */}
        <Link href="/alerts">
          <Card className="bg-card border-border hover:border-accent/50 transition-colors cursor-pointer h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Configuração de alertas
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Info Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Bem-vindo ao HomeLab Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Este painel de controle permite gerenciar seus servidores Jexactyl,
            torrents qBittorrent e monitorar recursos do sistema via Glances.
          </p>
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Como começar:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Configure suas credenciais em Configurações</li>
              <li>Acesse Jexactyl para gerenciar servidores</li>
              <li>Use qBittorrent para gerenciar downloads</li>
              <li>Monitore recursos em Glances</li>
              <li>Configure alertas para métricas críticas</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
