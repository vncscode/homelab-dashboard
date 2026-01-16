import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function JexactylSettings() {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    apiUrl: "",
    apiKey: "",
    serverId: "",
    description: "",
  });

  const { data: servers, refetch } = trpc.settings.jexactyl.list.useQuery();
  const createMutation = trpc.settings.jexactyl.create.useMutation();
  const deleteMutation = trpc.settings.jexactyl.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setFormData({ name: "", apiUrl: "", apiKey: "", serverId: "", description: "" });
      setIsAdding(false);
      await refetch();
      toast.success("Servidor Jexactyl adicionado com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar servidor Jexactyl");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      await refetch();
      toast.success("Servidor removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover servidor");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-accent">Configuração Jexactyl</h2>
          <p className="text-muted-foreground">Gerencie suas instâncias de servidores Jexactyl</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Servidor
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Novo Servidor Jexactyl</CardTitle>
            <CardDescription>Configure uma nova instância de servidor Jexactyl</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Servidor</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Servidor Principal"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apiUrl">URL da API</Label>
                  <Input
                    id="apiUrl"
                    type="url"
                    value={formData.apiUrl}
                    onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                    placeholder="https://jexactyl.example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apiKey">Chave da API</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="Sua chave de API"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="serverId">ID do Servidor</Label>
                  <Input
                    id="serverId"
                    value={formData.serverId}
                    onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
                    placeholder="ID único do servidor"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional do servidor"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-accent hover:bg-accent/90">
                  Salvar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {servers?.map((server) => (
          <Card key={server.id} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{server.name}</CardTitle>
                  <CardDescription>{server.apiUrl}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(server.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">ID do Servidor:</span> {server.serverId}</p>
                {server.description && (
                  <p><span className="text-muted-foreground">Descrição:</span> {server.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Adicionado em {new Date(server.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {servers?.length === 0 && !isAdding && (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nenhum servidor configurado ainda.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
