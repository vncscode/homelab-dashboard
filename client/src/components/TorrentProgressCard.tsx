import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Clock } from "lucide-react";
import type { TorrentProgressEvent } from "@shared/websocket";

interface TorrentProgressCardProps {
  torrent: TorrentProgressEvent;
}

/**
 * Torrent progress card with real-time updates
 */
export function TorrentProgressCard({ torrent }: TorrentProgressCardProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatBytes(bytesPerSecond) + "/s";
  };

  const formatETA = (seconds: number): string => {
    if (seconds === 0) return "Concluído";
    if (seconds < 0) return "Calculando...";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "downloading":
        return "bg-blue-600";
      case "seeding":
        return "bg-green-600";
      case "paused":
        return "bg-yellow-600";
      case "stopped":
        return "bg-gray-600";
      case "error":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      downloading: "Baixando",
      seeding: "Compartilhando",
      paused: "Pausado",
      stopped: "Parado",
      error: "Erro",
    };
    return labels[status] || status;
  };

  return (
    <Card className="bg-card border-border hover:border-accent transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate">
              {torrent.torrentName}
            </CardTitle>
          </div>
          <Badge className={`${getStatusColor(torrent.status)} text-white`}>
            {getStatusLabel(torrent.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{torrent.progress.toFixed(1)}%</span>
          </div>
          <Progress value={torrent.progress} className="h-2" />
        </div>

        {/* Speed Info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Download</p>
              <p className="font-medium">{formatSpeed(torrent.downloadSpeed)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Upload</p>
              <p className="font-medium">{formatSpeed(torrent.uploadSpeed)}</p>
            </div>
          </div>
        </div>

        {/* ETA */}
        {torrent.status === "downloading" && (
          <div className="flex items-center gap-2 text-sm bg-background/50 rounded p-2">
            <Clock className="w-4 h-4 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Tempo restante</p>
              <p className="font-medium">{formatETA(torrent.eta)}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {torrent.error && (
          <div className="text-xs text-red-500 bg-red-500/10 rounded p-2">
            {torrent.error}
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-right">
          Atualizado: {new Date(torrent.timestamp).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
