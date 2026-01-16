import { AlertCircle, AlertTriangle, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Alert {
  id: number;
  alertType: "cpu" | "memory" | "disk";
  severity: "warning" | "critical";
  currentValue: number;
  threshold: number;
  message: string;
  createdAt: Date;
  isResolved: number;
}

interface AlertIndicatorProps {
  alert: Alert;
  onResolve?: (alertId: number) => void;
  onDismiss?: (alertId: number) => void;
}

/**
 * Alert indicator component
 */
export function AlertIndicator({ alert, onResolve, onDismiss }: AlertIndicatorProps) {
  const isCritical = alert.severity === "critical";
  const bgColor = isCritical ? "bg-red-900/20 border-red-700" : "bg-yellow-900/20 border-yellow-700";
  const textColor = isCritical ? "text-red-400" : "text-yellow-400";
  const icon = isCritical ? (
    <AlertCircle className="w-5 h-5 text-red-500" />
  ) : (
    <AlertTriangle className="w-5 h-5 text-yellow-500" />
  );

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case "cpu":
        return "CPU";
      case "memory":
        return "Memória";
      case "disk":
        return "Disco";
      default:
        return type;
    }
  };

  return (
    <Card className={`${bgColor} border p-4`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {icon}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className={`font-semibold ${textColor}`}>
                {getAlertTypeLabel(alert.alertType)}
              </h4>
              <Badge
                variant={isCritical ? "destructive" : "secondary"}
                className={isCritical ? "bg-red-700" : "bg-yellow-700"}
              >
                {isCritical ? "Crítico" : "Aviso"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Valor atual: {alert.currentValue.toFixed(1)}% | Limite: {alert.threshold.toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {onResolve && !alert.isResolved && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve(alert.id)}
              className="text-xs"
            >
              Resolver
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDismiss(alert.id)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
