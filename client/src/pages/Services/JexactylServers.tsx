import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Server, Loader2, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface JexactylServersProps {
  credentialId?: number;
}

export function JexactylServers({ credentialId }: JexactylServersProps) {
  const { toast } = useToast();
  const [selectedCredential, setSelectedCredential] = useState<number | null>(credentialId || null);

  // Query para listar credenciais
  const credentialsQuery = trpc.settings.jexactyl.list.useQuery();

  // Query para listar servidores de uma credencial
  const serversQuery = trpc.settings.jexactyl.getServers.useQuery(
    { credentialId: selectedCredential! },
    { enabled: !!selectedCredential }
  );

  // Mutation para sincronizar
  const syncMutation = trpc.settings.jexactyl.sync.useMutation();

  const handleSync = async () => {
    if (!selectedCredential) {
      toast({
        title: "Erro",
        description: "Selecione uma credencial primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await syncMutation.mutateAsync({ credentialId: selectedCredential });
      toast({
        title: "Sucesso",
        description: `${result.count} servidores sincronizados`,
      });
      serversQuery.refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao sincronizar",
        variant: "destructive",
      });
    }
  };

  if (credentialsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  const credentials = credentialsQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Seletor de Credencial */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Selecionar Credencial</CardTitle>
        </CardHeader>
        <CardContent>
          {credentials.length === 0 ? (
            <div className="flex gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-600">
                Nenhuma credencial configurada. Adicione uma na aba de Configurações.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {credentials.map((cred) => (
                <button
                  key={cred.id}
                  onClick={() => setSelectedCredential(cred.id)}
                  className={`p-4 rounded-lg border-2 transition-colors text-left ${
                    selectedCredential === cred.id
                      ? "bg-accent/20 border-accent"
                      : "bg-background border-border hover:border-accent/50"
                  }`}
                >
                  <div className="font-medium text-foreground">{cred.name}</div>
                  <div className="text-sm text-foreground/60">{cred.domainUrl}</div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de Sincronização */}
      {selectedCredential && (
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sincronizar Servidores</CardTitle>
            <Button
              onClick={handleSync}
              disabled={syncMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {syncMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar
                </>
              )}
            </Button>
          </CardHeader>
          {syncMutation.isError && (
            <CardContent>
              <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">
                  {syncMutation.error instanceof Error
                    ? syncMutation.error.message
                    : "Erro ao sincronizar"}
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Lista de Servidores */}
      {selectedCredential && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Servidores Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            {serversQuery.isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : serversQuery.isError ? (
              <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">Erro ao carregar servidores</p>
              </div>
            ) : (
              <>
                {(serversQuery.data || []).length === 0 ? (
                  <div className="text-center p-8">
                    <Server className="w-12 h-12 text-foreground/40 mx-auto mb-2" />
                    <p className="text-foreground/60">
                      Nenhum servidor sincronizado. Clique em "Sincronizar" para buscar servidores.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(serversQuery.data || []).map((server) => (
                      <div
                        key={server.id}
                        className="p-4 rounded-lg bg-background border border-border hover:border-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium text-foreground">{server.name}</div>
                            <div className="text-xs text-foreground/60">{server.identifier}</div>
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              server.isSuspended
                                ? "bg-red-500/20 text-red-600"
                                : server.status === "running"
                                ? "bg-green-500/20 text-green-600"
                                : "bg-yellow-500/20 text-yellow-600"
                            }`}
                          >
                            {server.isSuspended ? "Suspenso" : server.status || "Desconhecido"}
                          </div>
                        </div>

                        <div className="space-y-1 text-sm text-foreground/70">
                          <div>
                            <span className="font-medium">Node:</span> {server.node}
                          </div>
                          {server.description && (
                            <div>
                              <span className="font-medium">Descrição:</span> {server.description}
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            {server.isInstalling && (
                              <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-1 rounded">
                                Instalando
                              </span>
                            )}
                            {server.isTransferring && (
                              <span className="text-xs bg-purple-500/20 text-purple-600 px-2 py-1 rounded">
                                Transferindo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
