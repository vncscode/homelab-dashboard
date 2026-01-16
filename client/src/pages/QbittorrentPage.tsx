import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Upload,
  Pause,
  Play,
  Trash2,
  Plus,
  TrendingUp,
} from "lucide-react";
import { MetricsChart } from "@/components/MetricsChart";

/**
 * qBittorrent detailed page with torrent management
 */
export default function QbittorrentPage() {
  // Mock torrent data
  const torrents = [
    {
      id: 1,
      name: "Ubuntu 22.04 LTS",
      status: "downloading",
      progress: 75,
      downloadSpeed: 2.5,
      uploadSpeed: 0.8,
      eta: "2h 30m",
      size: "3.2 GB",
    },
    {
      id: 2,
      name: "Debian 12",
      status: "downloading",
      progress: 45,
      downloadSpeed: 1.8,
      uploadSpeed: 0.5,
      eta: "4h 15m",
      size: "2.8 GB",
    },
    {
      id: 3,
      name: "CentOS 9",
      status: "seeding",
      progress: 100,
      downloadSpeed: 0,
      uploadSpeed: 2.1,
      eta: "∞",
      size: "2.5 GB",
    },
    {
      id: 4,
      name: "Fedora 38",
      status: "seeding",
      progress: 100,
      downloadSpeed: 0,
      uploadSpeed: 1.5,
      eta: "∞",
      size: "2.1 GB",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "downloading":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "seeding":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "paused":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "downloading":
        return "Baixando";
      case "seeding":
        return "Seedando";
      case "paused":
        return "Pausado";
      default:
        return status;
    }
  };

  const totalDownloadSpeed = torrents
    .filter((t) => t.status === "downloading")
    .reduce((acc, t) => acc + t.downloadSpeed, 0);

  const totalUploadSpeed = torrents.reduce((acc, t) => acc + t.uploadSpeed, 0);

  const totalSize = torrents.length;
  const downloading = torrents.filter((t) => t.status === "downloading").length;
  const seeding = torrents.filter((t) => t.status === "seeding").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-accent flex items-center gap-2">
            <Download className="w-8 h-8" />
            qBittorrent
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerenciamento de torrents e downloads
          </p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Torrent
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Torrents Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{totalSize}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Download className="w-4 h-4 text-blue-500" />
              Baixando
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">{downloading}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Upload className="w-4 h-4 text-green-500" />
              Seedando
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{seeding}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Velocidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-500">
              ↓{totalDownloadSpeed.toFixed(1)} MB/s
            </p>
            <p className="text-sm text-muted-foreground">
              ↑{totalUploadSpeed.toFixed(1)} MB/s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Torrents List */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lista de Torrents</TabsTrigger>
          <TabsTrigger value="speed">Velocidade</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {torrents.map((torrent) => (
            <Card
              key={torrent.id}
              className={`bg-card border ${getStatusColor(torrent.status)}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{torrent.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {torrent.size}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      torrent.status
                    )}`}
                  >
                    {getStatusLabel(torrent.status)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-muted-foreground">Progresso</p>
                    <p className="text-sm font-semibold">{torrent.progress}%</p>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-purple-500"
                      style={{ width: `${torrent.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Download
                    </p>
                    <p className="text-lg font-semibold">
                      {torrent.downloadSpeed} MB/s
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      Upload
                    </p>
                    <p className="text-lg font-semibold">
                      {torrent.uploadSpeed} MB/s
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ETA</p>
                    <p className="text-lg font-semibold">{torrent.eta}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-lg font-semibold">
                      {torrent.status === "downloading"
                        ? "Ativo"
                        : "Completo"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90">
                    {torrent.status === "downloading" ? (
                      <>
                        <Pause className="w-3 h-3 mr-1" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Retomar
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="speed" className="space-y-6">
          <MetricsChart
            title="Velocidade de Download"
            data={[
              {
                timestamp: Date.now() - 300000,
                cpuPercent: 0,
                memoryPercent: 0,
                diskPercent: 2.1,
              },
              {
                timestamp: Date.now() - 240000,
                cpuPercent: 0,
                memoryPercent: 0,
                diskPercent: 2.3,
              },
              {
                timestamp: Date.now() - 180000,
                cpuPercent: 0,
                memoryPercent: 0,
                diskPercent: 2.5,
              },
              {
                timestamp: Date.now() - 120000,
                cpuPercent: 0,
                memoryPercent: 0,
                diskPercent: 2.4,
              },
              {
                timestamp: Date.now() - 60000,
                cpuPercent: 0,
                memoryPercent: 0,
                diskPercent: 2.5,
              },
              {
                timestamp: Date.now(),
                cpuPercent: 0,
                memoryPercent: 0,
                diskPercent: 2.3,
              },
            ]}
            lines={[
              {
                key: "diskPercent",
                name: "Download (MB/s)",
                color: "#3b82f6",
              },
            ]}
            height={300}
          />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="space-y-4">
            {torrents.map((torrent) => (
              <Card key={torrent.id} className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">{torrent.name}</p>
                    <p className="text-sm font-semibold">{torrent.progress}%</p>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-purple-500"
                      style={{ width: `${torrent.progress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
