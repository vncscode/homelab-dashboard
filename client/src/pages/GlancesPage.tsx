import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Thermometer,
} from "lucide-react";
import { MetricsChart } from "@/components/MetricsChart";

/**
 * Glances detailed page with system resources monitoring
 */
export default function GlancesPage() {
  // Mock system data
  const systemMetrics = {
    cpu: {
      percent: 38.5,
      cores: 8,
      frequency: "2.4 GHz",
      temperature: 62,
    },
    memory: {
      percent: 55.2,
      used: "8.8 GB",
      total: "16 GB",
      available: "7.2 GB",
    },
    disk: {
      percent: 72.1,
      used: "360 GB",
      total: "500 GB",
      free: "140 GB",
    },
    network: {
      bytesIn: 1.2,
      bytesOut: 0.89,
      packetsIn: 1250000,
      packetsOut: 980000,
    },
    processes: {
      total: 127,
      running: 2,
      sleeping: 125,
    },
  };

  const topProcesses = [
    {
      pid: 1234,
      name: "docker",
      cpu: 12.5,
      memory: 18.3,
      user: "root",
    },
    {
      pid: 5678,
      name: "node",
      cpu: 8.2,
      memory: 12.1,
      user: "ubuntu",
    },
    {
      pid: 9012,
      name: "python",
      cpu: 5.3,
      memory: 8.7,
      user: "ubuntu",
    },
    {
      pid: 3456,
      name: "nginx",
      cpu: 2.1,
      memory: 5.2,
      user: "www-data",
    },
  ];

  const getResourceColor = (percent: number) => {
    if (percent >= 80) return "text-red-500";
    if (percent >= 60) return "text-yellow-500";
    return "text-green-500";
  };

  const getResourceBgColor = (percent: number) => {
    if (percent >= 80) return "bg-red-500/20";
    if (percent >= 60) return "bg-yellow-500/20";
    return "bg-green-500/20";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-accent flex items-center gap-2">
          <Activity className="w-8 h-8" />
          Glances
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitoramento em tempo real dos recursos do sistema
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <Card className={`bg-card border-border ${getResourceBgColor(systemMetrics.cpu.percent)}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className={`text-3xl font-bold ${getResourceColor(systemMetrics.cpu.percent)}`}>
                {systemMetrics.cpu.percent}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {systemMetrics.cpu.cores} cores @ {systemMetrics.cpu.frequency}
              </p>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${getResourceBgColor(systemMetrics.cpu.percent)}`}
                style={{ width: `${systemMetrics.cpu.percent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Memory */}
        <Card className={`bg-card border-border ${getResourceBgColor(systemMetrics.memory.percent)}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              Memória
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className={`text-3xl font-bold ${getResourceColor(systemMetrics.memory.percent)}`}>
                {systemMetrics.memory.percent}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {systemMetrics.memory.used} / {systemMetrics.memory.total}
              </p>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${getResourceBgColor(systemMetrics.memory.percent)}`}
                style={{ width: `${systemMetrics.memory.percent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Disk */}
        <Card className={`bg-card border-border ${getResourceBgColor(systemMetrics.disk.percent)}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-orange-500" />
              Disco
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className={`text-3xl font-bold ${getResourceColor(systemMetrics.disk.percent)}`}>
                {systemMetrics.disk.percent}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {systemMetrics.disk.used} / {systemMetrics.disk.total}
              </p>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${getResourceBgColor(systemMetrics.disk.percent)}`}
                style={{ width: `${systemMetrics.disk.percent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Network */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="w-4 h-4 text-green-500" />
              Rede
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Download</p>
              <p className="text-lg font-bold text-green-500">
                {systemMetrics.network.bytesIn} GB/s
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Upload</p>
              <p className="text-lg font-bold text-blue-500">
                {systemMetrics.network.bytesOut} GB/s
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="processes">Processos</TabsTrigger>
          <TabsTrigger value="network">Rede</TabsTrigger>
          <TabsTrigger value="temperature">Temperatura</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU Details */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-500" />
                  Detalhes da CPU
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Uso Atual</p>
                  <p className="text-3xl font-bold text-accent">
                    {systemMetrics.cpu.percent}%
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Cores</p>
                    <p className="text-lg font-semibold">
                      {systemMetrics.cpu.cores}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Frequência</p>
                    <p className="text-lg font-semibold">
                      {systemMetrics.cpu.frequency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory Details */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  Detalhes da Memória
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Uso Atual</p>
                  <p className="text-3xl font-bold text-accent">
                    {systemMetrics.memory.percent}%
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Usado</p>
                    <p className="text-lg font-semibold">
                      {systemMetrics.memory.used}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Disponível</p>
                    <p className="text-lg font-semibold">
                      {systemMetrics.memory.available}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <MetricsChart
            title="Histórico de Recursos (Últimas 6 horas)"
            data={[
              {
                timestamp: Date.now() - 360000,
                cpuPercent: 35.2,
                memoryPercent: 52.1,
                diskPercent: 71.8,
              },
              {
                timestamp: Date.now() - 300000,
                cpuPercent: 38.5,
                memoryPercent: 54.3,
                diskPercent: 71.9,
              },
              {
                timestamp: Date.now() - 240000,
                cpuPercent: 36.2,
                memoryPercent: 55.2,
                diskPercent: 72.0,
              },
              {
                timestamp: Date.now() - 180000,
                cpuPercent: 40.1,
                memoryPercent: 56.8,
                diskPercent: 72.1,
              },
              {
                timestamp: Date.now() - 120000,
                cpuPercent: 37.8,
                memoryPercent: 55.5,
                diskPercent: 72.1,
              },
              {
                timestamp: Date.now() - 60000,
                cpuPercent: 38.5,
                memoryPercent: 55.2,
                diskPercent: 72.1,
              },
            ]}
            lines={[
              { key: "cpuPercent", name: "CPU (%)", color: "#3b82f6" },
              { key: "memoryPercent", name: "Memória (%)", color: "#a855f7" },
              { key: "diskPercent", name: "Disco (%)", color: "#f97316" },
            ]}
            height={300}
          />
        </TabsContent>

        {/* Processes Tab */}
        <TabsContent value="processes" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">
                Processos em Execução: {systemMetrics.processes.total}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProcesses.map((proc) => (
                  <div
                    key={proc.pid}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{proc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        PID: {proc.pid} | Usuário: {proc.user}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        CPU: {proc.cpu}% | RAM: {proc.memory}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm">Download</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">
                  {systemMetrics.network.bytesIn} GB/s
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Pacotes: {(systemMetrics.network.packetsIn / 1000000).toFixed(1)}M
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm">Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-500">
                  {systemMetrics.network.bytesOut} GB/s
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Pacotes: {(systemMetrics.network.packetsOut / 1000000).toFixed(1)}M
                </p>
              </CardContent>
            </Card>
          </div>

          <MetricsChart
            title="Tráfego de Rede"
            data={[
              {
                timestamp: Date.now() - 300000,
                cpuPercent: 1.1,
                memoryPercent: 0.85,
                diskPercent: 0,
              },
              {
                timestamp: Date.now() - 240000,
                cpuPercent: 1.2,
                memoryPercent: 0.88,
                diskPercent: 0,
              },
              {
                timestamp: Date.now() - 180000,
                cpuPercent: 1.15,
                memoryPercent: 0.89,
                diskPercent: 0,
              },
              {
                timestamp: Date.now() - 120000,
                cpuPercent: 1.3,
                memoryPercent: 0.91,
                diskPercent: 0,
              },
              {
                timestamp: Date.now() - 60000,
                cpuPercent: 1.2,
                memoryPercent: 0.89,
                diskPercent: 0,
              },
              {
                timestamp: Date.now(),
                cpuPercent: 1.2,
                memoryPercent: 0.89,
                diskPercent: 0,
              },
            ]}
            lines={[
              { key: "cpuPercent", name: "Download (GB/s)", color: "#22c55e" },
              { key: "memoryPercent", name: "Upload (GB/s)", color: "#3b82f6" },
            ]}
            height={300}
          />
        </TabsContent>

        {/* Temperature Tab */}
        <TabsContent value="temperature" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-red-500" />
                Temperatura do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">CPU</p>
                <p className="text-3xl font-bold text-orange-500">
                  {systemMetrics.cpu.temperature}°C
                </p>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-orange-500"
                    style={{ width: `${(systemMetrics.cpu.temperature / 100) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Normal (0°C - 100°C)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
