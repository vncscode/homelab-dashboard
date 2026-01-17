import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditor } from "@/components/CodeEditor";
import { ArrowLeft, History, FileText, Clock, User } from "lucide-react";
import { toast } from "sonner";

interface FileVersion {
  id: number;
  content: string;
  editMessage?: string;
  createdAt: Date;
  changeSize: number;
}

/**
 * File editor page with version history
 */
export default function FileEditor({
  fileName = "server.properties",
  filePath = "/server.properties",
  initialContent = `# Server Configuration\nserver-port=25565\nmax-players=20\ndifficulty=2\npvp=true`,
  onBack,
}: {
  fileName?: string;
  filePath?: string;
  initialContent?: string;
  onBack?: () => void;
}) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [versions, setVersions] = useState<FileVersion[]>([
    {
      id: 1,
      content: initialContent,
      editMessage: "Initial version",
      createdAt: new Date(Date.now() - 86400000),
      changeSize: initialContent.length,
    },
    {
      id: 2,
      content: initialContent + "\n# Updated config",
      editMessage: "Updated server settings",
      createdAt: new Date(Date.now() - 3600000),
      changeSize: 20,
    },
  ]);

  const getLanguageFromFileName = (): "javascript" | "json" | "xml" | "html" | "css" | "text" => {
    if (fileName.endsWith(".json")) return "json";
    if (fileName.endsWith(".js") || fileName.endsWith(".mjs")) return "javascript";
    if (fileName.endsWith(".xml")) return "xml";
    if (fileName.endsWith(".html")) return "html";
    if (fileName.endsWith(".css")) return "css";
    return "text";
  };

  const handleSave = async (newContent: string) => {
    try {
      setIsSaving(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add to version history
      const newVersion: FileVersion = {
        id: versions.length + 1,
        content: newContent,
        editMessage: `Updated ${fileName}`,
        createdAt: new Date(),
        changeSize: newContent.length - content.length,
      };

      setVersions([newVersion, ...versions]);
      setContent(newContent);
      toast.success("Arquivo salvo com sucesso");
    } catch (error) {
      toast.error("Erro ao salvar arquivo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreVersion = (version: FileVersion) => {
    setContent(version.content);
    toast.success(`Restaurado para versão de ${version.createdAt.toLocaleString("pt-BR")}`);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="h-auto p-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" />
            <h1 className="text-3xl font-bold text-accent">{fileName}</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 font-mono">{filePath}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico ({versions.length})
          </TabsTrigger>
        </TabsList>

        {/* Editor Tab */}
        <TabsContent value="editor" className="space-y-4">
          <CodeEditor
            value={content}
            onChange={setContent}
            onSave={handleSave}
            language={getLanguageFromFileName()}
            fileName={fileName}
            height="600px"
          />

          {/* File Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Informações do Arquivo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Tamanho</p>
                <p className="text-sm font-medium">{formatSize(content.length)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Linhas</p>
                <p className="text-sm font-medium">{content.split("\n").length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Caracteres</p>
                <p className="text-sm font-medium">{content.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-medium">{getLanguageFromFileName()}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="space-y-3">
            {versions.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Nenhuma versão anterior
                </CardContent>
              </Card>
            ) : (
              versions.map((version) => (
                <Card
                  key={version.id}
                  className="bg-card border-border hover:border-accent/50 transition-colors"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm font-medium">
                            {formatDate(version.createdAt)}
                          </p>
                        </div>

                        {version.editMessage && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {version.editMessage}
                          </p>
                        )}

                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>
                            {version.changeSize > 0 ? "+" : ""}
                            {formatSize(version.changeSize)}
                          </span>
                          <span>{version.content.split("\n").length} linhas</span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleRestoreVersion(version)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Restaurar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Cleanup Info */}
          <Card className="bg-muted/50 border-border">
            <CardContent className="pt-6 text-xs text-muted-foreground">
              <p>
                Histórico é mantido automaticamente. As últimas 50 versões são
                preservadas. Versões antigas são removidas periodicamente.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
