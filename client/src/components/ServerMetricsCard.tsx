import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, HardDrive, Wifi } from "lucide-react";
import type { ServerMetricsEvent } from "@shared/websocket";

interface ServerMetricsCardProps {
  metrics: ServerMetricsEvent;
  title?: string;
}

/**
 * Server metrics card with real-time updates
 */
export function ServerMetricsCard({ metrics, title = "Métricas do Servidor" }: ServerMetricsCardProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getProgressColor = (percent: number): string => {
    if (percent < 50) return "bg-green-600";
    if (percent < 75) return "bg-yellow-600";
    if (percent < 90) return "bg-orange-600";
    return "bg-red-600";
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* CPU Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">CPU</span>
              <span className="text-xs text-muted-foreground">({metrics.cpu.cores} cores)</span>
            </div>
            <span className="text-sm font-bold">{metrics.cpu.percent.toFixed(1)}%</span>
          </div>
          <Progress
            value={metrics.cpu.percent}
            className="h-2"
            style={{
              background: "hsl(var(--background))",
            }}
          />
        </div>

        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Memória</span>
            <span className="text-sm font-bold">{metrics.memory.percent.toFixed(1)}%</span>
          </div>
          <Progress
            value={metrics.memory.percent}
            className="h-2"
            style={{
              background: "hsl(var(--background))",
            }}
          />
          <p className="text-xs text-muted-foreground">
            {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
          </p>
        </div>

        {/* Disk Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Disco</span>
            </div>
            <span className="text-sm font-bold">{metrics.disk.percent.toFixed(1)}%</span>
          </div>
          <Progress
            value={metrics.disk.percent}
            className="h-2"
            style={{
              background: "hsl(var(--background))",
            }}
          />
          <p className="text-xs text-muted-foreground">
            {formatBytes(metrics.disk.used)} / {formatBytes(metrics.disk.total)}
          </p>
        </div>

        {/* Network Stats */}
        <div className="space-y-2 border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Rede</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-background/50 rounded p-2">
              <p className="text-muted-foreground">Entrada</p>
              <p className="font-medium">{formatBytes(metrics.network.bytesIn)}</p>
              <p className="text-muted-foreground text-xs mt-1">
                {metrics.network.packetsIn} pacotes
              </p>
            </div>
            <div className="bg-background/50 rounded p-2">
              <p className="text-muted-foreground">Saída</p>
              <p className="font-medium">{formatBytes(metrics.network.bytesOut)}</p>
              <p className="text-muted-foreground text-xs mt-1">
                {metrics.network.packetsOut} pacotes
              </p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-right pt-2 border-t border-border">
          Atualizado: {new Date(metrics.timestamp).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
