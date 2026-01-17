import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Server,
  Download,
  Activity,
  Globe,
  Clock,
  Trash2,
  Edit2,
} from "lucide-react";
import { JexactylForm } from "@/components/forms/JexactylForm";
import { QbittorrentForm } from "@/components/forms/QbittorrentForm";
import { GlancesForm } from "@/components/forms/GlancesForm";
import { CloudflareForm } from "@/components/forms/CloudflareForm";
import { UptimeKumaForm } from "@/components/forms/UptimeKumaForm";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

/**
 * Settings Page - Configurações de integrações
 */
export default function Settings() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Queries para listar instâncias
  const jexactylQuery = trpc.settings.jexactyl.list.useQuery();
  const qbittorrentQuery = trpc.settings.qbittorrent.list.useQuery();
  const glancesQuery = trpc.settings.glances.list.useQuery();
  const cloudflareQuery = trpc.settings.cloudflare.list.useQuery();
  const uptimeKumaQuery = trpc.settings.uptimeKuma.list.useQuery();

  // Mutations para deletar instâncias
  const deleteJexactylMutation = trpc.settings.jexactyl.delete.useMutation();
  const deleteQbittorrentMutation = trpc.settings.qbittorrent.delete.useMutation();
  const deleteGlancesMutation = trpc.settings.glances.delete.useMutation();
  const deleteCloudFlareMutation = trpc.settings.cloudflare.delete.useMutation();
  const deleteUptimeKumaMutation = trpc.settings.uptimeKuma.delete.useMutation();

  const handleDelete = async (id: number, type: "jexactyl" | "qbittorrent" | "glances" | "cloudflare" | "uptimeKuma") => {
    if (!confirm("Tem certeza que deseja deletar esta configuração?")) return;

    try {
      switch (type) {
        case "jexactyl":
          await deleteJexactylMutation.mutateAsync({ id });
          break;
        case "qbittorrent":
          await deleteQbittorrentMutation.mutateAsync({ id });
          break;
        case "glances":
          await deleteGlancesMutation.mutateAsync({ id });
          break;
        case "cloudflare":
          await deleteCloudFlareMutation.mutateAsync({ id });
          break;
        case "uptimeKuma":
          await deleteUptimeKumaMutation.mutateAsync({ id });
          break;
      }
      setRefreshKey((k) => k + 1);
      jexactylQuery.refetch();
      qbittorrentQuery.refetch();
      glancesQuery.refetch();
      cloudflareQuery.refetch();
      uptimeKumaQuery.refetch();
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-accent">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas integrações com serviços externos
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="jexactyl" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="jexactyl" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            <span className="hidden sm:inline">Jexactyl</span>
          </TabsTrigger>
          <TabsTrigger value="qbittorrent" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">qBittorrent</span>
          </TabsTrigger>
          <TabsTrigger value="glances" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Glances</span>
          </TabsTrigger>
          <TabsTrigger value="cloudflare" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Cloudflare</span>
          </TabsTrigger>
          <TabsTrigger value="uptimeKuma" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Uptime Kuma</span>
          </TabsTrigger>
        </TabsList>

        {/* Jexactyl Tab */}
        <TabsContent value="jexactyl" className="space-y-6">
          <JexactylForm onSuccess={() => jexactylQuery.refetch()} />

          {jexactylQuery.data && jexactylQuery.data.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Servidores Configurados</h3>
              {jexactylQuery.data.map((server) => (
                <Card key={server.id} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{server.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{server.domainUrl}</p>
                        {server.description && (
                          <p className="text-sm text-muted-foreground mt-2">{server.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(server.id, "jexactyl")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* qBittorrent Tab */}
        <TabsContent value="qbittorrent" className="space-y-6">
          <QbittorrentForm onSuccess={() => qbittorrentQuery.refetch()} />

          {qbittorrentQuery.data && qbittorrentQuery.data.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Instâncias Configuradas</h3>
              {qbittorrentQuery.data.map((instance) => (
                <Card key={instance.id} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{instance.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{instance.apiUrl}</p>
                        {instance.description && (
                          <p className="text-sm text-muted-foreground mt-2">{instance.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(instance.id, "qbittorrent")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Glances Tab */}
        <TabsContent value="glances" className="space-y-6">
          <GlancesForm onSuccess={() => glancesQuery.refetch()} />

          {glancesQuery.data && glancesQuery.data.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Instâncias Configuradas</h3>
              {glancesQuery.data.map((instance) => (
                <Card key={instance.id} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{instance.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{instance.apiUrl}</p>
                        {instance.description && (
                          <p className="text-sm text-muted-foreground mt-2">{instance.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(instance.id, "glances")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Cloudflare Tab */}
        <TabsContent value="cloudflare" className="space-y-6">
          <CloudflareForm onSuccess={() => cloudflareQuery.refetch()} />

          {cloudflareQuery.data && cloudflareQuery.data.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contas Configuradas</h3>
              {cloudflareQuery.data.map((account) => (
                <Card key={account.id} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{account.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{account.accountEmail}</p>
                        {account.description && (
                          <p className="text-sm text-muted-foreground mt-2">{account.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(account.id, "cloudflare")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Uptime Kuma Tab */}
        <TabsContent value="uptimeKuma" className="space-y-6">
          <UptimeKumaForm onSuccess={() => uptimeKumaQuery.refetch()} />

          {uptimeKumaQuery.data && uptimeKumaQuery.data.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Instâncias Configuradas</h3>
              {uptimeKumaQuery.data.map((instance) => (
                <Card key={instance.id} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{instance.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{instance.apiUrl}</p>
                        {instance.description && (
                          <p className="text-sm text-muted-foreground mt-2">{instance.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(instance.id, "uptimeKuma")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
