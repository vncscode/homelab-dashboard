import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface JexactylFormProps {
  onSuccess?: () => void;
}

export function JexactylForm({ onSuccess }: JexactylFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    apiUrl: "",
    apiKey: "",
    serverId: "",
    description: "",
  });

  const { toast } = useToast();
  const createMutation = trpc.settings.jexactyl.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.apiUrl.trim() || !formData.apiKey.trim() || !formData.serverId.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast({
        title: "Sucesso",
        description: "Servidor Jexactyl adicionado com sucesso",
      });
      setFormData({
        name: "",
        apiUrl: "",
        apiKey: "",
        serverId: "",
        description: "",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao adicionar servidor",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Adicionar Servidor Jexactyl</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Nome do Servidor</label>
            <Input
              placeholder="Ex: Servidor Principal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">URL da API</label>
            <Input
              placeholder="Ex: https://jexactyl.example.com/api"
              type="url"
              value={formData.apiUrl}
              onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
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
            <label className="text-sm font-medium text-foreground">ID do Servidor</label>
            <Input
              placeholder="Ex: 1"
              value={formData.serverId}
              onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
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
              "Adicionar Servidor"
            )}
          </Button>

          {createMutation.isError && (
            <div className="flex gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Erro ao adicionar servidor"}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
