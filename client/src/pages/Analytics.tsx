import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { MetricsChart } from "@/components/MetricsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp } from "lucide-react";
import { Loader2 } from "lucide-react";

/**
 * Analytics page for viewing historical metrics and torrent progress
 */
export default function Analytics() {
  const [instanceId, setInstanceId] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "7d" | "30d">("24h");
  const [metricsData, setMetricsData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  // Calculate date range based on selected time range
  const getDateRange = () => {
    const now = new Date();
    const startTime = new Date(now);

    switch (timeRange) {
      case "1h":
        startTime.setHours(startTime.getHours() - 1);
        break;
      case "6h":
        startTime.setHours(startTime.getHours() - 6);
        break;
      case "24h":
        startTime.setDate(startTime.getDate() - 1);
        break;
      case "7d":
        startTime.setDate(startTime.getDate() - 7);
        break;
      case "30d":
        startTime.setDate(startTime.getDate() - 30);
        break;
    }

    return { startTime, endTime: now };
  };

  const { startTime, endTime } = getDateRange();

  // Fetch server metrics history
  const metricsQuery = trpc.analytics.getServerMetricsHistory.useQuery(
    {
      instanceId,
      startTime,
      endTime,
      limit: 1000,
    },
    {
      enabled: instanceId > 0,
    }
  );

  // Update metrics data when query succeeds
  if (metricsQuery.data) {
    setMetricsData(metricsQuery.data);
  }

  // Fetch statistics
  const statsQuery = trpc.analytics.getMetricsStatistics.useQuery(
    {
      instanceId,
      startTime,
      endTime,
    },
    {
      enabled: instanceId > 0,
    }
  );

  const isLoading = metricsQuery.isLoading || statsQuery.isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-accent">Análise de Métricas</h1>
        <p className="text-muted-foreground">Visualize histórico de CPU, memória e disco</p>
      </div>

      {/* Controls */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground">Instância</label>
            <Select value={instanceId.toString()} onValueChange={(v) => setInstanceId(parseInt(v))}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione uma instância" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Instância 1</SelectItem>
                <SelectItem value="2">Instância 2</SelectItem>
                <SelectItem value="3">Instância 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground">Período</label>
            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Última hora</SelectItem>
                <SelectItem value="6h">Últimas 6 horas</SelectItem>
                <SelectItem value="24h">Últimas 24 horas</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => {
                metricsQuery.refetch();
                statsQuery.refetch();
              }}
              disabled={isLoading}
              className="bg-accent hover:bg-accent/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                "Atualizar"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      {statsQuery.data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pontos de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">{statsQuery.data.dataPoints}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">CPU Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">
                {statsQuery.data.cpu.avg.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Min: {statsQuery.data.cpu.min.toFixed(1)}% | Max: {statsQuery.data.cpu.max.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Memória Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">
                {statsQuery.data.memory.avg.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Min: {statsQuery.data.memory.min.toFixed(1)}% | Max:{" "}
                {statsQuery.data.memory.max.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Disco Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-accent">
                {statsQuery.data.disk.avg.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Min: {statsQuery.data.disk.min.toFixed(1)}% | Max: {statsQuery.data.disk.max.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : metricsData.length > 0 ? (
          <>
            <MetricsChart
              title="Uso de CPU, Memória e Disco"
              data={metricsData}
              height={400}
            />

            <MetricsChart
              title="Tendência de CPU"
              data={metricsData}
              lines={[{ key: "cpuPercent", name: "CPU (%)", color: "#8b5cf6" }]}
              height={300}
            />

            <MetricsChart
              title="Tendência de Memória"
              data={metricsData}
              lines={[{ key: "memoryPercent", name: "Memória (%)", color: "#ec4899" }]}
              height={300}
            />

            <MetricsChart
              title="Tendência de Disco"
              data={metricsData}
              lines={[{ key: "diskPercent", name: "Disco (%)", color: "#06b6d4" }]}
              height={300}
            />
          </>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
