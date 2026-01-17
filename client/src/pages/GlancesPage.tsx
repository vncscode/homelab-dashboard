import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertCircle,
  Cpu,
  HardDrive,
  Network,
} from "lucide-react";

/**
 * Glances Page - Monitoramento de recursos
 * Sem dados fake - você adicionará seus próprios dados para teste
 */
export default function GlancesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-accent flex items-center gap-2">
          <Activity className="w-8 h-8" />
          Glances
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitoramento de recursos do sistema
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cpu">CPU</TabsTrigger>
          <TabsTrigger value="memory">Memória</TabsTrigger>
          <TabsTrigger value="disk">Disco</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  CPU
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aguardando dados
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Memória
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aguardando dados
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Disco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aguardando dados
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Rede
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aguardando dados
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CPU Tab */}
        <TabsContent value="cpu" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Uso de CPU</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Conecte o Glances para visualizar dados de CPU
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Memory Tab */}
        <TabsContent value="memory" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Uso de Memória</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Conecte o Glances para visualizar dados de memória
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Disk Tab */}
        <TabsContent value="disk" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Uso de Disco</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Conecte o Glances para visualizar dados de disco
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
