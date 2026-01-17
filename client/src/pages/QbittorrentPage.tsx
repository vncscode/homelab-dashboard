import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Plus,
  AlertCircle,
  Settings,
} from "lucide-react";

/**
 * qBittorrent Page - Gerenciamento de torrents
 * Sem dados fake - você adicionará seus próprios dados para teste
 */
export default function QbittorrentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-accent flex items-center gap-2">
          <Download className="w-8 h-8" />
          qBittorrent
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerenciamento de torrents
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="torrents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="torrents">Torrents</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Torrents Tab */}
        <TabsContent value="torrents" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Torrents</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Torrent
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum torrent configurado
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure suas credenciais do qBittorrent em Configurações para
                  começar
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma categoria disponível
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Conecte o qBittorrent para acessar configurações
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
