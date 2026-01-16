import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Download, HardDrive } from "lucide-react";
import JexactylSettings from "./Settings/JexactylSettings";
import QbittorrentSettings from "./Settings/QbittorrentSettings";
import GlancesSettings from "./Settings/GlancesSettings";

export default function Settings() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-accent">Configurações</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas integrações e instâncias de serviços</p>
        </div>
      </div>

      <div className="container py-8">
        <Tabs defaultValue="jexactyl" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger value="jexactyl" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Jexactyl
            </TabsTrigger>
            <TabsTrigger value="qbittorrent" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              qBittorrent
            </TabsTrigger>
            <TabsTrigger value="glances" className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Glances
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jexactyl" className="mt-6">
            <JexactylSettings />
          </TabsContent>

          <TabsContent value="qbittorrent" className="mt-6">
            <QbittorrentSettings />
          </TabsContent>

          <TabsContent value="glances" className="mt-6">
            <GlancesSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
