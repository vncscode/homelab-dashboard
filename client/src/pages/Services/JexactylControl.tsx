import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Settings, Plus } from "lucide-react";
import { Link } from "wouter";

export default function JexactylControl() {
  const { data: servers } = trpc.settings.jexactyl.list.useQuery();

  const onlineServers = servers?.filter(s => true).length || 0;
  const totalServers = servers?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-accent flex items-center gap-2">
            <Server className="w-8 h-8" />
            Jexactyl - Gerenciamento de Servidores
          </h2>
          <p className="text-muted-foreground mt-1">Controle total dos seus servidores</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Servidores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{totalServers}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Servidores Online</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{onlineServers}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Disponibilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">
              {totalServers > 0 ? Math.round((onlineServers / totalServers) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="servers">Servidores</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Informações do Jexactyl</CardTitle>
              <CardDescription>Resumo das configurações e status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Servidores Configurados</p>
                  <p className="text-2xl font-bold text-accent">{totalServers}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Geral</p>
                  <p className="text-2xl font-bold text-green-500">Operacional</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Servers Tab */}
        <TabsContent value="servers" className="mt-6 space-y-4">
          {servers && servers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {servers.map((server) => (
                <Card key={server.id} className="bg-card border-border hover:border-accent transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{server.name}</CardTitle>
                        <CardDescription>{server.domainUrl}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Conectar
                        </Button>
                        <Button size="sm" variant="outline">
                          Console
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-muted-foreground">Domínio:</span> {server.domainUrl}</p>
                      {server.description && (
                        <p><span className="text-muted-foreground">Descrição:</span> {server.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Adicionado em {new Date(server.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">Nenhum servidor configurado.</p>
                <Link href="/settings">
                  <Button className="bg-accent hover:bg-accent/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Servidor
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Console Tab */}
        <TabsContent value="console" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Console em Tempo Real</CardTitle>
              <CardDescription>Selecione um servidor para visualizar o console</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 h-64 overflow-y-auto border border-border">
                <p>[INFO] Sistema aguardando conexão...</p>
                <p>[INFO] Selecione um servidor para começar</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
