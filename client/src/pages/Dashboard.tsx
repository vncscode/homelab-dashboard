import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Server, Download, HardDrive, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: plugins } = trpc.plugins.list.useQuery();
  const { data: jexactylServers } = trpc.settings.jexactyl.list.useQuery();
  const { data: qbittorrentInstances } = trpc.settings.qbittorrent.list.useQuery();
  const { data: glancesInstances } = trpc.settings.glances.list.useQuery();

  const jexactylPlugin = plugins?.find(p => p.type === "jexactyl");
  const qbittorrentPlugin = plugins?.find(p => p.type === "qbittorrent");
  const glancesPlugin = plugins?.find(p => p.type === "glances");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-accent">HomeLab Control Center</h1>
          <p className="text-muted-foreground mt-1">Painel centralizado para gerenciar seu home lab</p>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-accent/30">
          <CardHeader>
            <CardTitle>Bem-vindo, {user?.name || "Usuário"}!</CardTitle>
            <CardDescription>Seu painel de controle do home lab está pronto</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">Gerencie todos os seus serviços em um único lugar. Instale plugins para expandir as funcionalidades.</p>
            <div className="mt-4 flex gap-2">
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

        <div>
          <h2 className="text-2xl font-bold text-accent mb-4">Resumo de Plugins</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={`bg-card border-border hover:border-accent transition-colors ${jexactylPlugin?.isEnabled ? "opacity-100" : "opacity-50"}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-purple-500" />
                    <CardTitle>Jexactyl</CardTitle>
                  </div>
                  {jexactylPlugin && (
                    <span className={`text-xs px-2 py-1 rounded ${jexactylPlugin.isEnabled ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                      {jexactylPlugin.isEnabled ? "Ativo" : "Inativo"}
                    </span>
                  )}
                </div>
                <CardDescription>Gerenciamento de Servidores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Servidores: <span className="font-bold text-accent">{jexactylServers?.length || 0}</span></p>
                  {jexactylPlugin ? (
                    <Link href="/services/jexactyl">
                      <Button size="sm" className="w-full bg-accent hover:bg-accent/90">Acessar</Button>
                    </Link>
                  ) : (
                    <Link href="/plugins">
                      <Button size="sm" variant="outline" className="w-full">Instalar</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-card border-border hover:border-accent transition-colors ${qbittorrentPlugin?.isEnabled ? "opacity-100" : "opacity-50"}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-pink-500" />
                    <CardTitle>qBittorrent</CardTitle>
                  </div>
                  {qbittorrentPlugin && (
                    <span className={`text-xs px-2 py-1 rounded ${qbittorrentPlugin.isEnabled ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                      {qbittorrentPlugin.isEnabled ? "Ativo" : "Inativo"}
                    </span>
                  )}
                </div>
                <CardDescription>Gerenciamento de Torrents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Instâncias: <span className="font-bold text-accent">{qbittorrentInstances?.length || 0}</span></p>
                  {qbittorrentPlugin ? (
                    <Link href="/services/qbittorrent">
                      <Button size="sm" className="w-full bg-accent hover:bg-accent/90">Acessar</Button>
                    </Link>
                  ) : (
                    <Link href="/plugins">
                      <Button size="sm" variant="outline" className="w-full">Instalar</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-card border-border hover:border-accent transition-colors ${glancesPlugin?.isEnabled ? "opacity-100" : "opacity-50"}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-cyan-500" />
                    <CardTitle>Glances</CardTitle>
                  </div>
                  {glancesPlugin && (
                    <span className={`text-xs px-2 py-1 rounded ${glancesPlugin.isEnabled ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                      {glancesPlugin.isEnabled ? "Ativo" : "Inativo"}
                    </span>
                  )}
                </div>
                <CardDescription>Monitoramento de Recursos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Instâncias: <span className="font-bold text-accent">{glancesInstances?.length || 0}</span></p>
                  {glancesPlugin ? (
                    <Link href="/services/glances">
                      <Button size="sm" className="w-full bg-accent hover:bg-accent/90">Acessar</Button>
                    </Link>
                  ) : (
                    <Link href="/plugins">
                      <Button size="sm" variant="outline" className="w-full">Instalar</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-accent mb-4">Estatísticas Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Plugins Instalados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">{plugins?.filter(p => p.isInstalled).length || 0}/3</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Plugins Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">{plugins?.filter(p => p.isEnabled).length || 0}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Servidores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">{(jexactylServers?.length || 0) + (qbittorrentInstances?.length || 0) + (glancesInstances?.length || 0)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">Online</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
