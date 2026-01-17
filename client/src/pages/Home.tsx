import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Server,
  Download,
  Activity,
  AlertCircle,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { MetricsChart } from "@/components/MetricsChart";

/**
 * Home page with overview of all services and metrics
 */
export default function Home() {
  // Mock data for demonstration
  const jexactylStats = {
    totalServers: 5,
    activeServers: 3,
    inactiveServers: 2,
    avgCpuUsage: 45.2,
    avgMemoryUsage: 62.8,
    avgUptime: "23d 14h",
  };

  const qbittorrentStats = {
    totalTorrents: 12,
    downloading: 3,
    seeding: 8,
    paused: 1,
    totalDownloaded: "450 GB",
    avgDownloadSpeed: "2.5 MB/s",
  };

  const glancesStats = {
    cpuPercent: 38.5,
    memoryPercent: 55.2,
    diskPercent: 72.1,
    networkBytesIn: "1.2 GB",
    networkBytesOut: "890 MB",
    processes: 127,
  };

  const recentAlerts = [
    {
      id: 1,
      type: "memory",
      severity: "warning",
      message: "Memory usage is 85% on Server 1",
      time: "5 minutes ago",
    },
    {
      id: 2,
      type: "disk",
      severity: "critical",
      message: "Disk usage is 92% on Server 2",
      time: "12 minutes ago",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-accent">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo ao seu painel de controle do home lab
        </p>
      </div>

      {/* Quick Stats Cards */}
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
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-accent">
                  {jexactylStats.activeServers}/{jexactylStats.totalServers}
                </p>
                <p className="text-xs text-muted-foreground">Servidores ativos</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">CPU</p>
                  <p className="font-semibold">{jexactylStats.avgCpuUsage}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">RAM</p>
                  <p className="font-semibold">{jexactylStats.avgMemoryUsage}%</p>
                </div>
              </div>
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
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-accent">
                  {qbittorrentStats.downloading}
                </p>
                <p className="text-xs text-muted-foreground">Baixando agora</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Seedando</p>
                  <p className="font-semibold">{qbittorrentStats.seeding}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Velocidade</p>
                  <p className="font-semibold">{qbittorrentStats.avgDownloadSpeed}</p>
                </div>
              </div>
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
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-accent">
                  {glancesStats.cpuPercent}%
                </p>
                <p className="text-xs text-muted-foreground">CPU em uso</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">RAM</p>
                  <p className="font-semibold">{glancesStats.memoryPercent}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Disco</p>
                  <p className="font-semibold">{glancesStats.diskPercent}%</p>
                </div>
              </div>
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
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-accent">{recentAlerts.length}</p>
                <p className="text-xs text-muted-foreground">Alertas recentes</p>
              </div>
              <Button size="sm" className="w-full bg-accent hover:bg-accent/90">
                Ver Alertas
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Detailed Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jexactyl Detailed Stats */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-500" />
              Jexactyl - Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Servidores Ativos</p>
                <p className="text-2xl font-bold text-accent">
                  {jexactylStats.activeServers}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold text-red-500">
                  {jexactylStats.inactiveServers}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3" /> CPU Médio
                </p>
                <p className="text-2xl font-bold text-green-500">
                  {jexactylStats.avgCpuUsage}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Tempo de Atividade</p>
                <p className="text-lg font-bold text-accent flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {jexactylStats.avgUptime}
                </p>
              </div>
            </div>
            <Link href="/jexactyl">
              <Button className="w-full bg-accent hover:bg-accent/90">
                Acessar Jexactyl
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* qBittorrent Detailed Stats */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-green-500" />
              qBittorrent - Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Torrents Totais</p>
                <p className="text-2xl font-bold text-accent">
                  {qbittorrentStats.totalTorrents}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Baixando</p>
                <p className="text-2xl font-bold text-blue-500">
                  {qbittorrentStats.downloading}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Seedando</p>
                <p className="text-2xl font-bold text-green-500">
                  {qbittorrentStats.seeding}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Velocidade</p>
                <p className="text-lg font-bold text-accent flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {qbittorrentStats.avgDownloadSpeed}
                </p>
              </div>
            </div>
            <Link href="/qbittorrent">
              <Button className="w-full bg-accent hover:bg-accent/90">
                Acessar qBittorrent
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* System Resources Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Recursos do Sistema (Glances)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">CPU</p>
              <div className="relative h-32 flex items-end justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">
                    {glancesStats.cpuPercent}%
                  </p>
                  <div className="w-24 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                      style={{ width: `${glancesStats.cpuPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Memory */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Memória</p>
              <div className="relative h-32 flex items-end justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">
                    {glancesStats.memoryPercent}%
                  </p>
                  <div className="w-24 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${glancesStats.memoryPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Disk */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Disco</p>
              <div className="relative h-32 flex items-end justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">
                    {glancesStats.diskPercent}%
                  </p>
                  <div className="w-24 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                      style={{ width: `${glancesStats.diskPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      {recentAlerts.length > 0 && (
        <Card className="bg-card border-border border-yellow-700/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="w-5 h-5" />
              Alertas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start justify-between p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-yellow-600">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Ver
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
