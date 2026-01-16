import { useWebSocket } from "@/hooks/useWebSocket";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * WebSocket connection status indicator
 */
export function WebSocketStatus() {
  const { isConnected, error } = useWebSocket();

  if (error) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Erro
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{error}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isConnected) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="default" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
            <Wifi className="w-3 h-3 animate-pulse" />
            Conectado
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Conectado ao servidor WebSocket</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="secondary" className="flex items-center gap-1">
          <WifiOff className="w-3 h-3" />
          Desconectado
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tentando reconectar ao servidor WebSocket...</p>
      </TooltipContent>
    </Tooltip>
  );
}
