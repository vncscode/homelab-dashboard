import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Settings, Plus } from "lucide-react";
import { Link } from "wouter";

export default function QbittorrentControl() {
  const { data: instances } = trpc.settings.qbittorrent.list.useQuery();

  const totalInstances = instances?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-accent flex items-center gap-2">
            <Download className="w-8 h-8" />
            qBittorrent - Gerenciamento de Torrents
          </h2>
          <p className="text-muted-foreground mt-1">Controle seus torrents com facilidade</p>
        </div>
        <Link href="/settings">
          <Button className="bg-accent hover:bg-accent/90">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Instâncias Configuradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{totalInstances}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Torrents Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-pink-500">0</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Velocidade de Download</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">0 MB/s</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="torrents">Torrents</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Informações do qBittorrent</CardTitle>
              <CardDescription>Resumo das configurações e status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Instâncias Ativas</p>
                  <p className="text-2xl font-bold text-accent">{totalInstances}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Geral</p>
                  <p className="text-2xl font-bold text-green-500">Operacional</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Torrents Tab */}
        <TabsContent value="torrents" className="mt-6 space-y-4">
          {instances && instances.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {instances.map((instance) => (
                <Card key={instance.id} className="bg-card border-border hover:border-accent transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{instance.name}</CardTitle>
                        <CardDescription>{instance.apiUrl}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Conectar
                        </Button>
                        <Button size="sm" variant="outline">
                          Adicionar Torrent
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Usuário:</span> {instance.username}</p>
                      {instance.description && (
                        <p><span className="text-muted-foreground">Descrição:</span> {instance.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Adicionado em {new Date(instance.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">Nenhuma instância configurada.</p>
                <Link href="/settings">
                  <Button className="bg-accent hover:bg-accent/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Instância
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Estatísticas de Download</CardTitle>
              <CardDescription>Histórico de atividades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Downloaded</p>
                    <p className="text-xl font-bold text-accent">0 GB</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Uploaded</p>
                    <p className="text-xl font-bold text-accent">0 GB</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
