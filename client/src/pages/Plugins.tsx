import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Trash2, Power, PowerOff, AlertCircle, Loader2 } from "lucide-react";

/**
 * Plugins management page with install/uninstall/enable/disable functionality
 */
export default function Plugins() {
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);

  // Queries
  const { data: installedPlugins, isLoading: isLoadingInstalled, refetch: refetchInstalled } = trpc.plugins.list.useQuery();
  const { data: availablePlugins, isLoading: isLoadingAvailable } = trpc.plugins.available.useQuery();

  // Mutations
  const installMutation = trpc.plugins.install.useMutation();
  const uninstallMutation = trpc.plugins.uninstall.useMutation();
  const enableMutation = trpc.plugins.enable.useMutation();
  const disableMutation = trpc.plugins.disable.useMutation();

  /**
   * Handle plugin installation with error handling
   */
  const handleInstall = async (type: "jexactyl" | "qbittorrent" | "glances") => {
    try {
      setSelectedPlugin(type);
      const result = await installMutation.mutateAsync({ type });
      await refetchInstalled();
      toast.success(result.message || `Plugin ${type} instalado com sucesso!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Erro ao instalar plugin ${type}`;
      console.error("[Plugins] Install error:", error);
      toast.error(errorMessage);
    } finally {
      setSelectedPlugin(null);
    }
  };

  /**
   * Handle plugin uninstallation with confirmation
   */
  const handleUninstall = async (id: number, name: string) => {
    if (!window.confirm(`Tem certeza que deseja desinstalar ${name}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setSelectedPlugin(name);
      const result = await uninstallMutation.mutateAsync({ id });
      await refetchInstalled();
      toast.success(result.message || `Plugin ${name} desinstalado com sucesso!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Erro ao desinstalar plugin ${name}`;
      console.error("[Plugins] Uninstall error:", error);
      toast.error(errorMessage);
    } finally {
      setSelectedPlugin(null);
    }
  };

  /**
   * Handle plugin enable/disable toggle
   */
  const handleToggle = async (id: number, isEnabled: boolean, name: string) => {
    try {
      setSelectedPlugin(name);
      const result = isEnabled
        ? await disableMutation.mutateAsync({ id })
        : await enableMutation.mutateAsync({ id });

      await refetchInstalled();
      toast.success(result.message || `Plugin ${name} ${isEnabled ? "desativado" : "ativado"} com sucesso!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Erro ao alterar status do plugin ${name}`;
      console.error("[Plugins] Toggle error:", error);
      toast.error(errorMessage);
    } finally {
      setSelectedPlugin(null);
    }
  };

  const isLoading = isLoadingInstalled || isLoadingAvailable;
  const isProcessing = installMutation.isPending || uninstallMutation.isPending || enableMutation.isPending || disableMutation.isPending;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-accent">Gerenciamento de Plugins</h1>
          <p className="text-muted-foreground mt-1">
            Instale e gerencie plugins para expandir as funcionalidades do seu home lab
          </p>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Loading State */}
        {isLoading && (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
              <p className="text-muted-foreground">Carregando plugins...</p>
            </CardContent>
          </Card>
        )}

        {/* Installed Plugins Section */}
        {!isLoading && (
          <div>
            <h2 className="text-2xl font-bold text-accent mb-4">Plugins Instalados</h2>
            {installedPlugins && installedPlugins.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {installedPlugins.map((plugin) => (
                  <Card key={plugin.id} className="bg-card border-border hover:border-accent transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: plugin.color || "#8B5CF6" }}
                              aria-label={`${plugin.name} color indicator`}
                            />
                            {plugin.name}
                          </CardTitle>
                          <CardDescription className="mt-1">{plugin.description}</CardDescription>
                        </div>
                        <Badge variant={plugin.isEnabled ? "default" : "secondary"}>
                          {plugin.isEnabled ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggle(plugin.id, Boolean(plugin.isEnabled), plugin.name)}
                          disabled={isProcessing && selectedPlugin === plugin.name}
                          className="flex-1"
                        >
                          {isProcessing && selectedPlugin === plugin.name ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Processando...
                            </>
                          ) : plugin.isEnabled ? (
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
                          disabled={isProcessing && selectedPlugin === plugin.name}
                        >
                          {isProcessing && selectedPlugin === plugin.name ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum plugin instalado ainda.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Available Plugins Section */}
        {!isLoading && (
          <div>
            <h2 className="text-2xl font-bold text-accent mb-4">Plugins Disponíveis</h2>
            {availablePlugins ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availablePlugins
                  .filter((p) => !p.isInstalled)
                  .map((plugin) => (
                    <Card key={plugin.id} className="bg-card border-border hover:border-accent transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: plugin.color }}
                                aria-label={`${plugin.name} color indicator`}
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
                          disabled={isProcessing && selectedPlugin === plugin.type}
                        >
                          {isProcessing && selectedPlugin === plugin.type ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Instalando...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Instalar
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
                  <p className="text-muted-foreground">Carregando plugins disponíveis...</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
