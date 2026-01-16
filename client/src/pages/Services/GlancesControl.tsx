import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HardDrive, Settings, Plus } from "lucide-react";
import { Link } from "wouter";

export default function GlancesControl() {
  const { data: instances } = trpc.settings.glances.list.useQuery();

  const totalInstances = instances?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-accent flex items-center gap-2">
            <HardDrive className="w-8 h-8" />
            Glances - Monitoramento de Recursos
          </h2>
          <p className="text-muted-foreground mt-1">Monitore o desempenho do seu sistema em tempo real</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Instâncias Monitoradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{totalInstances}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">CPU Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-cyan-500">0%</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Memória Média</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">0%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="instances">Instâncias</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="processes">Processos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Informações do Glances</CardTitle>
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

        {/* Instances Tab */}
        <TabsContent value="instances" className="mt-6 space-y-4">
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
                      <Button size="sm" variant="outline">
                        Monitorar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {instance.apiKey && (
                        <p><span className="text-muted-foreground">Autenticação:</span> Configurada</p>
                      )}
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

        {/* Resources Tab */}
        <TabsContent value="resources" className="mt-6 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Uso de Recursos</CardTitle>
              <CardDescription>Monitoramento em tempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">CPU</span>
                    <span className="text-sm font-semibold">0%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: "0%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Memória</span>
                    <span className="text-sm font-semibold">0%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: "0%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Disco</span>
                    <span className="text-sm font-semibold">0%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: "0%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processes Tab */}
        <TabsContent value="processes" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Processos em Execução</CardTitle>
              <CardDescription>Top 10 processos por uso de CPU</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Selecione uma instância para visualizar os processos</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
