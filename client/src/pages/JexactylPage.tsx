import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server,
  Power,
  RotateCw,
  Trash2,
  Plus,
  TrendingUp,
  File,
  AlertCircle,
  Zap,
  Clock,
  RefreshCw,
} from "lucide-react";
import { MetricsChart } from "@/components/MetricsChart";
import { FileUpload } from "@/components/FileUpload";

/**
 * Jexactyl detailed page with server management
 */
export default function JexactylPage() {
  // Mock server data
  const servers = [
    {
      id: 1,
      name: "Server 1",
      status: "online",
      cpuUsage: 45.2,
      memoryUsage: 62.8,
      uptime: "23d 14h",
      players: "12/20",
    },
    {
      id: 2,
      name: "Server 2",
      status: "online",
      cpuUsage: 38.5,
      memoryUsage: 55.2,
      uptime: "45d 2h",
      players: "18/32",
    },
    {
      id: 3,
      name: "Server 3",
      status: "offline",
      cpuUsage: 0,
      memoryUsage: 0,
      uptime: "0d 0h",
      players: "0/20",
    },
  ];

  const getStatusColor = (status: string) => {
    return status === "online"
      ? "bg-green-500/20 text-green-600 border-green-500/30"
      : "bg-red-500/20 text-red-600 border-red-500/30";
  };

  const getStatusBadge = (status: string) => {
    return status === "online" ? "Online" : "Offline";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-accent flex items-center gap-2">
            <Server className="w-8 h-8" />
            Jexactyl
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerenciamento centralizado de servidores
          </p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Servidor
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Servidores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">
              {servers.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Power className="w-4 h-4 text-green-500" />
              Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">
              {servers.filter((s) => s.status === "online").length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Offline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">
              {servers.filter((s) => s.status === "offline").length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              CPU Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">
              {(
                servers
                  .filter((s) => s.status === "online")
                  .reduce((acc, s) => acc + s.cpuUsage, 0) /
                servers.filter((s) => s.status === "online").length
              ).toFixed(1)}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Servers List */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lista de Servidores</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {servers.map((server) => (
            <Card
              key={server.id}
              className={`bg-card border ${getStatusColor(server.status)}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{server.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {server.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        server.status
                      )}`}
                    >
                      {getStatusBadge(server.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">CPU</p>
                    <p className="text-lg font-semibold">{server.cpuUsage}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Memória</p>
                    <p className="text-lg font-semibold">{server.memoryUsage}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Atividade
                    </p>
                    <p className="text-lg font-semibold">{server.uptime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Jogadores</p>
                    <p className="text-lg font-semibold">{server.players}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90">
                    <Power className="w-3 h-3 mr-1" />
                    {server.status === "online" ? "Parar" : "Iniciar"}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reiniciar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <MetricsChart
            title="Uso de CPU por Servidor"
            data={servers
              .filter((s) => s.status === "online")
              .map((s, i) => ({
                timestamp: Date.now() - i * 60000,
                cpuPercent: s.cpuUsage,
                memoryPercent: 0,
                diskPercent: 0,
              }))}
            lines={[
              { key: "cpuPercent", name: "CPU (%)", color: "#8b5cf6" },
            ]}
            height={300}
          />

          <MetricsChart
            title="Uso de Memória por Servidor"
            data={servers
              .filter((s) => s.status === "online")
              .map((s, i) => ({
                timestamp: Date.now() - i * 60000,
                cpuPercent: 0,
                memoryPercent: s.memoryUsage,
                diskPercent: 0,
              }))}
            lines={[
              { key: "memoryPercent", name: "Memória (%)", color: "#ec4899" },
            ]}
            height={300}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
