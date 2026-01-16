import { Server, Download, HardDrive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JexactylSettings from "./Settings/JexactylSettings";
import QbittorrentSettings from "./Settings/QbittorrentSettings";
import GlancesSettings from "./Settings/GlancesSettings";

/**
 * Settings page with tabs for managing service integrations
 */
export default function Settings() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-accent">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas integrações e instâncias de serviços
          </p>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="container py-8">
        <Tabs defaultValue="jexactyl" className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border mb-6">
            <TabsTrigger 
              value="jexactyl" 
              className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-background"
            >
              <Server className="w-4 h-4" />
              <span className="hidden sm:inline">Jexactyl</span>
            </TabsTrigger>
            <TabsTrigger 
              value="qbittorrent" 
              className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-background"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">qBittorrent</span>
            </TabsTrigger>
            <TabsTrigger 
              value="glances" 
              className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-background"
            >
              <HardDrive className="w-4 h-4" />
              <span className="hidden sm:inline">Glances</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content - Jexactyl */}
          <TabsContent value="jexactyl" className="mt-6">
            <JexactylSettings />
          </TabsContent>

          {/* Tab Content - qBittorrent */}
          <TabsContent value="qbittorrent" className="mt-6">
            <QbittorrentSettings />
          </TabsContent>

          {/* Tab Content - Glances */}
          <TabsContent value="glances" className="mt-6">
            <GlancesSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
