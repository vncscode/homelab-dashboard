import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface JexactylFormProps {
  credentialId?: number;
  onSuccess?: () => void;
}

export function JexactylForm({ credentialId, onSuccess }: JexactylFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    domainUrl: "",
    apiKey: "",
    description: "",
  });

  const { toast } = useToast();
  const createMutation = trpc.settings.jexactyl.create.useMutation();
  const syncMutation = trpc.settings.jexactyl.sync.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.domainUrl.trim() || !formData.apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createMutation.mutateAsync(formData);
      toast({
        title: "Sucesso",
        description: "Credencial Jexactyl adicionada com sucesso",
      });
      setFormData({
        name: "",
        domainUrl: "",
        apiKey: "",
        description: "",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao adicionar credencial",
        variant: "destructive",
      });
    }
  };

  const handleSync = async () => {
    if (!credentialId) {
      toast({
        title: "Erro",
        description: "Nenhuma credencial selecionada",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await syncMutation.mutateAsync({ credentialId });
      toast({
        title: "Sucesso",
        description: `${result.count} servidores sincronizados com sucesso`,
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao sincronizar servidores",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Adicionar Credencial Jexactyl</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nome da Credencial</label>
              <Input
                placeholder="Ex: Servidor Principal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">URL do Domínio</label>
              <Input
                placeholder="Ex: jexactyl.example.com"
                value={formData.domainUrl}
                onChange={(e) => setFormData({ ...formData, domainUrl: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">API Key</label>
              <Input
                placeholder="Cole sua API key aqui"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Descrição (Opcional)</label>
              <Input
                placeholder="Ex: Servidor de produção"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Adicionar Credencial"
              )}
            </Button>

            {createMutation.isError && (
              <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : "Erro ao adicionar credencial"}
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {credentialId && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Sincronizar Servidores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/70 mb-4">
              Clique no botão abaixo para sincronizar todos os servidores disponíveis do Jexactyl.
            </p>
            <Button
              onClick={handleSync}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar Servidores
                </>
              )}
            </Button>

            {syncMutation.isError && (
              <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mt-4">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">
                  {syncMutation.error instanceof Error
                    ? syncMutation.error.message
                    : "Erro ao sincronizar servidores"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
