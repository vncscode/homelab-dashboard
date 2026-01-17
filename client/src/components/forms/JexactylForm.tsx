import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
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

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [isTesting, setIsTesting] = useState(false);

  const { toast } = useToast();
  const createMutation = trpc.settings.jexactyl.create.useMutation();
  const syncMutation = trpc.settings.jexactyl.sync.useMutation();
  const testConnectionMutation = trpc.settings.jexactyl.testConnection.useMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestConnection = async () => {
    if (!formData.domainUrl.trim() || !formData.apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Preencha a URL do domínio e a chave de API",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testConnectionMutation.mutateAsync({
        domainUrl: formData.domainUrl,
        apiKey: formData.apiKey,
      });
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erro ao testar conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

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
      setTestResult(null);
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
              <label className="text-sm font-medium text-foreground">Nome da Credencial *</label>
              <Input
                name="name"
                placeholder="Ex: Servidor Principal"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1"
                disabled={createMutation.isPending}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">URL do Domínio *</label>
              <Input
                name="domainUrl"
                placeholder="Ex: https://jexactyl.example.com"
                value={formData.domainUrl}
                onChange={handleInputChange}
                className="mt-1"
                type="url"
                disabled={createMutation.isPending}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">API Key *</label>
              <Input
                name="apiKey"
                placeholder="Cole sua API key aqui"
                type="password"
                value={formData.apiKey}
                onChange={handleInputChange}
                className="mt-1"
                disabled={createMutation.isPending}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Descrição (Opcional)</label>
              <Textarea
                name="description"
                placeholder="Ex: Servidor de produção"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1"
                rows={3}
                disabled={createMutation.isPending}
              />
            </div>

            {testResult && (
              <div
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  testResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {testResult.success ? 'Conexão bem-sucedida' : 'Erro na conexão'}
                  </p>
                  <p
                    className={`text-sm ${
                      testResult.success ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {testResult.message}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || createMutation.isPending || !formData.domainUrl.trim() || !formData.apiKey.trim()}
              >
                {isTesting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Testar Conexão
              </Button>

              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90"
                disabled={createMutation.isPending || !testResult?.success}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  "Salvar Credenciais"
                )}
              </Button>
            </div>

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
