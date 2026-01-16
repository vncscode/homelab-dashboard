import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Edit2, Plus } from "lucide-react";

export default function QbittorrentSettings() {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    apiUrl: "",
    username: "",
    password: "",
    description: "",
  });

  const { data: instances, refetch } = trpc.settings.qbittorrent.list.useQuery();
  const createMutation = trpc.settings.qbittorrent.create.useMutation();
  const deleteMutation = trpc.settings.qbittorrent.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setFormData({ name: "", apiUrl: "", username: "", password: "", description: "" });
      setIsAdding(false);
      await refetch();
      toast.success("Instância qBittorrent adicionada com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar instância qBittorrent");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      await refetch();
      toast.success("Instância removida com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover instância");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-accent">Configuração qBittorrent</h2>
          <p className="text-muted-foreground">Gerencie suas instâncias de qBittorrent</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Instância
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Nova Instância qBittorrent</CardTitle>
            <CardDescription>Configure uma nova instância de qBittorrent</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Instância</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: qBittorrent Principal"
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
                    placeholder="http://localhost:6800"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Usuário de acesso"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Senha de acesso"
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
                  placeholder="Descrição opcional da instância"
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
        {instances?.map((instance) => (
          <Card key={instance.id} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{instance.name}</CardTitle>
                  <CardDescription>{instance.apiUrl}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(instance.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Usuário:</span> {instance.username}</p>
                {instance.description && (
                  <p><span className="text-muted-foreground">Descrição:</span> {instance.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Adicionado em {new Date(instance.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {instances?.length === 0 && !isAdding && (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nenhuma instância configurada ainda.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
