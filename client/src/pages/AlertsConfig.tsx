import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AlertIndicator } from "@/components/AlertIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Alerts configuration page
 */
export default function AlertsConfig() {
  const [instanceId, setInstanceId] = useState<number>(1);
  const [cpuThreshold, setCpuThreshold] = useState<number>(80);
  const [memoryThreshold, setMemoryThreshold] = useState<number>(85);
  const [diskThreshold, setDiskThreshold] = useState<number>(90);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  // Fetch current thresholds
  const thresholdsQuery = trpc.alerts.getThresholds.useQuery(
    { instanceId }
  );

  // Update thresholds when query succeeds
  if (thresholdsQuery.data) {
    setCpuThreshold(thresholdsQuery.data.cpuThreshold);
    setMemoryThreshold(thresholdsQuery.data.memoryThreshold);
    setDiskThreshold(thresholdsQuery.data.diskThreshold);
    setIsEnabled(thresholdsQuery.data.isEnabled === 1);
  }

  // Fetch active alerts
  const activeAlertsQuery = trpc.alerts.getActiveAlerts.useQuery(
    { instanceId, limit: 50 },
    { refetchInterval: 5000 } // Refetch every 5 seconds
  );

  // Update thresholds mutation
  const updateThresholdsMutation = trpc.alerts.updateThresholds.useMutation({
    onSuccess: () => {
      toast.success("Limites de alerta atualizados com sucesso");
      thresholdsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar limites");
    },
  });

  // Resolve alert mutation
  const resolveAlertMutation = trpc.alerts.resolveAlert.useMutation({
    onSuccess: () => {
      toast.success("Alerta resolvido");
      activeAlertsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao resolver alerta");
    },
  });

  const handleUpdateThresholds = () => {
    updateThresholdsMutation.mutate({
      instanceId,
      cpuThreshold,
      memoryThreshold,
      diskThreshold,
      isEnabled: isEnabled ? 1 : 0,
    });
  };

  const handleResolveAlert = (alertId: number) => {
    resolveAlertMutation.mutate({ alertId });
  };

  const isLoading =
    thresholdsQuery.isLoading ||
    updateThresholdsMutation.isPending ||
    resolveAlertMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-accent flex items-center gap-2">
          <Bell className="w-8 h-8" />
          Configuração de Alertas
        </h1>
        <p className="text-muted-foreground">
          Configure limites de CPU, memória e disco para receber notificações
        </p>
      </div>

      <Tabs defaultValue="thresholds" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="thresholds">Limites</TabsTrigger>
          <TabsTrigger value="active">
            Alertas Ativos
            {activeAlertsQuery.data && activeAlertsQuery.data.length > 0 && (
              <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-1">
                {activeAlertsQuery.data.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Thresholds Tab */}
        <TabsContent value="thresholds" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Configurar Limites de Alerta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* CPU Threshold */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Limite de CPU: {cpuThreshold}%
                </Label>
                <Slider
                  value={[cpuThreshold]}
                  onValueChange={(value) => setCpuThreshold(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Alerta será disparado quando CPU ultrapassar {cpuThreshold}%
                </p>
              </div>

              {/* Memory Threshold */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Limite de Memória: {memoryThreshold}%
                </Label>
                <Slider
                  value={[memoryThreshold]}
                  onValueChange={(value) => setMemoryThreshold(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Alerta será disparado quando memória ultrapassar {memoryThreshold}%
                </p>
              </div>

              {/* Disk Threshold */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Limite de Disco: {diskThreshold}%
                </Label>
                <Slider
                  value={[diskThreshold]}
                  onValueChange={(value) => setDiskThreshold(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Alerta será disparado quando disco ultrapassar {diskThreshold}%
                </p>
              </div>

              {/* Enable/Disable */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable-alerts"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="enable-alerts" className="text-sm font-medium cursor-pointer">
                  Ativar alertas para esta instância
                </Label>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleUpdateThresholds}
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configurações"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Alerts Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeAlertsQuery.isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : activeAlertsQuery.data && activeAlertsQuery.data.length > 0 ? (
            <div className="space-y-3">
              {activeAlertsQuery.data.map((alert) => (
                <AlertIndicator
                  key={alert.id}
                  alert={alert}
                  onResolve={handleResolveAlert}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum alerta ativo</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tudo está funcionando normalmente
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
