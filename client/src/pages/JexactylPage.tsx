import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server,
  Power,
  RotateCw,
  Trash2,
  Plus,
  File,
  AlertCircle,
} from "lucide-react";


/**
 * Jexactyl Page - Gerenciamento de servidores
 * Sem dados fake - você adicionará seus próprios dados para teste
 */
export default function JexactylPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-accent flex items-center gap-2">
          <Server className="w-8 h-8" />
          Jexactyl
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerenciamento de servidores
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="servers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="servers">Servidores</TabsTrigger>
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
        </TabsList>

        {/* Servers Tab */}
        <TabsContent value="servers" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Servidores</CardTitle>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Servidor
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum servidor configurado
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Configure suas credenciais do Jexactyl em Configurações para
                  começar
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="w-5 h-5" />
                Gerenciamento de Arquivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione um servidor para gerenciar arquivos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Console Tab */}
        <TabsContent value="console" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Console do Servidor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-background rounded-lg p-4 font-mono text-sm text-muted-foreground min-h-96 border border-border">
                <p>Console disponível após conectar um servidor</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
