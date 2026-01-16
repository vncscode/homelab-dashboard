import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Trash2, Power, PowerOff } from "lucide-react";

export default function Plugins() {
  const { data: installedPlugins, refetch: refetchInstalled } = trpc.plugins.list.useQuery();
  const { data: availablePlugins } = trpc.plugins.available.useQuery();
  
  const installMutation = trpc.plugins.install.useMutation();
  const uninstallMutation = trpc.plugins.uninstall.useMutation();
  const enableMutation = trpc.plugins.enable.useMutation();
  const disableMutation = trpc.plugins.disable.useMutation();

  const handleInstall = async (type: 'jexactyl' | 'qbittorrent' | 'glances') => {
    try {
      await installMutation.mutateAsync({ type });
      await refetchInstalled();
      toast.success(`Plugin ${type} instalado com sucesso!`);
    } catch (error) {
      toast.error(`Erro ao instalar plugin ${type}`);
    }
  };

  const handleUninstall = async (id: number, name: string) => {
    if (!window.confirm(`Tem certeza que deseja desinstalar ${name}?`)) return;
    try {
      await uninstallMutation.mutateAsync({ id });
      await refetchInstalled();
      toast.success(`Plugin ${name} desinstalado com sucesso!`);
    } catch (error) {
      toast.error(`Erro ao desinstalar plugin ${name}`);
    }
  };

  const handleToggle = async (id: number, isEnabled: boolean, name: string) => {
    try {
      if (isEnabled) {
        await disableMutation.mutateAsync({ id });
      } else {
        await enableMutation.mutateAsync({ id });
      }
      await refetchInstalled();
      toast.success(`Plugin ${name} ${isEnabled ? 'desativado' : 'ativado'}!`);
    } catch (error) {
      toast.error(`Erro ao alterar status do plugin ${name}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-accent">Gerenciamento de Plugins</h1>
          <p className="text-muted-foreground mt-1">Instale e gerencie plugins para expandir as funcionalidades do seu home lab</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="space-y-8">
          {/* Plugins Instalados */}
          <div>
            <h2 className="text-2xl font-bold text-accent mb-4">Plugins Instalados</h2>
            {installedPlugins && installedPlugins.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {installedPlugins.map((plugin) => (
                  <Card key={plugin.id} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: plugin.color || '#8B5CF6' }}
                            />
                            {plugin.name}
                          </CardTitle>
                          <CardDescription className="mt-1">{plugin.description}</CardDescription>
                        </div>
                        <Badge variant={plugin.isEnabled ? "default" : "secondary"}>
                          v{plugin.version}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggle(plugin.id, Boolean(plugin.isEnabled), plugin.name)}
                          className="flex-1"
                        >
                          {plugin.isEnabled ? (
                            <>
                              <PowerOff className="w-4 h-4 mr-1" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Power className="w-4 h-4 mr-1" />
                              Ativar
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUninstall(plugin.id, plugin.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Nenhum plugin instalado ainda.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Plugins Disponíveis */}
          <div>
            <h2 className="text-2xl font-bold text-accent mb-4">Plugins Disponíveis</h2>
            {availablePlugins ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availablePlugins
                  .filter(p => !p.isInstalled)
                  .map((plugin) => (
                    <Card key={plugin.id} className="bg-card border-border">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: plugin.color }}
                              />
                              {plugin.name}
                            </CardTitle>
                            <CardDescription className="mt-1">{plugin.description}</CardDescription>
                          </div>
                          <Badge variant="outline">v{plugin.version}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          className="w-full bg-accent hover:bg-accent/90"
                          onClick={() => handleInstall(plugin.type)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Instalar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Carregando plugins disponíveis...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
