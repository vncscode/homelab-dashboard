import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Server, Download, HardDrive, Settings, Zap, AlertCircle, Loader2 } from "lucide-react";

/**
 * Dashboard page showing overview of all plugins and services
 */
export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: plugins, isLoading: pluginsLoading } = trpc.plugins.list.useQuery();
  const { data: jexactylServers, isLoading: jexactylLoading } = trpc.settings.jexactyl.list.useQuery();
  const { data: qbittorrentInstances, isLoading: qbittorrentLoading } = trpc.settings.qbittorrent.list.useQuery();
  const { data: glancesInstances, isLoading: glancesLoading } = trpc.settings.glances.list.useQuery();

  // Find installed plugins
  const jexactylPlugin = plugins?.find(p => p.type === "jexactyl");
  const qbittorrentPlugin = plugins?.find(p => p.type === "qbittorrent");
  const glancesPlugin = plugins?.find(p => p.type === "glances");

  // Check if plugins are enabled
  const isJexactylEnabled = jexactylPlugin?.isEnabled;
  const isQbittorrentEnabled = qbittorrentPlugin?.isEnabled;
  const isGlancesEnabled = glancesPlugin?.isEnabled;

  const isLoading = authLoading || pluginsLoading || jexactylLoading || qbittorrentLoading || glancesLoading;

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="bg-card border-border max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-accent">Autenticação Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Você precisa estar autenticado para acessar o painel de controle.
            </p>
            <Button className="w-full bg-accent hover:bg-accent/90">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-accent">HomeLab Control Center</h1>
          <p className="text-muted-foreground mt-1">
            Painel centralizado para gerenciar seu home lab
          </p>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-accent/30">
          <CardHeader>
            <CardTitle>Bem-vindo, {user?.name || "Usuário"}!</CardTitle>
            <CardDescription>Seu painel de controle do home lab está pronto</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-4">
              Gerencie todos os seus serviços em um único lugar. Instale plugins para expandir as funcionalidades.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/plugins">
                <Button className="bg-accent hover:bg-accent/90">
                  <Zap className="w-4 h-4 mr-2" />
                  Gerenciar Plugins
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
              <p className="text-muted-foreground">Carregando dados...</p>
            </CardContent>
          </Card>
        )}

        {/* Plugins Overview */}
        {!isLoading && (
          <div>
            <h2 className="text-2xl font-bold text-accent mb-4">Plugins Instalados</h2>
            {plugins && plugins.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Jexactyl Card */}
                {jexactylPlugin && (
                  <Card className="bg-card border-border hover:border-accent transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Server className="w-5 h-5 text-accent" />
                          <CardTitle>Jexactyl</CardTitle>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${isJexactylEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <CardDescription>Gerenciamento de Servidores</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">
                          <strong>Servidores:</strong> {jexactylServers?.length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Status:</strong> {isJexactylEnabled ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                      <Link href="/services/jexactyl">
                        <Button variant="outline" className="w-full">
                          Acessar
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {/* qBittorrent Card */}
                {qbittorrentPlugin && (
                  <Card className="bg-card border-border hover:border-accent transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Download className="w-5 h-5 text-pink-500" />
                          <CardTitle>qBittorrent</CardTitle>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${isQbittorrentEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <CardDescription>Gerenciamento de Torrents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">
                          <strong>Instâncias:</strong> {qbittorrentInstances?.length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Status:</strong> {isQbittorrentEnabled ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                      <Link href="/services/qbittorrent">
                        <Button variant="outline" className="w-full">
                          Acessar
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {/* Glances Card */}
                {glancesPlugin && (
                  <Card className="bg-card border-border hover:border-accent transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-cyan-500" />
                          <CardTitle>Glances</CardTitle>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${isGlancesEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <CardDescription>Monitoramento de Recursos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-muted-foreground">
                          <strong>Instâncias:</strong> {glancesInstances?.length || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Status:</strong> {isGlancesEnabled ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                      <Link href="/services/glances">
                        <Button variant="outline" className="w-full">
                          Acessar
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Nenhum plugin instalado.</p>
                  <Link href="/plugins">
                    <Button className="bg-accent hover:bg-accent/90">
                      Instalar Plugins
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {!isLoading && plugins && plugins.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-accent mb-4">Resumo Geral</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Plugins Instalados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{plugins.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plugins.filter(p => p.isEnabled).length} ativos
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Servidores Jexactyl
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{jexactylServers?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isJexactylEnabled ? "Plugin ativo" : "Plugin inativo"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Instâncias qBittorrent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{qbittorrentInstances?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isQbittorrentEnabled ? "Plugin ativo" : "Plugin inativo"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Instâncias Glances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{glancesInstances?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isGlancesEnabled ? "Plugin ativo" : "Plugin inativo"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
