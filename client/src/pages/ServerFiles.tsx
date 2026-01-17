import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/FileUpload";
import { CodeEditor } from "@/components/CodeEditor";
import {
  File,
  Folder,
  Download,
  Trash2,
  ChevronRight,
  Home,
  Lock,
  Edit,
} from "lucide-react";

interface ServerFile {
  id: number;
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  lastModified: Date;
}

/**
 * Server files management page
 */
export default function ServerFiles({ serverId }: { serverId: number }) {
  const [currentPath, setCurrentPath] = useState("/");
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [editingFile, setEditingFile] = useState<ServerFile | null>(null);

  // Mock server files
  const files: ServerFile[] = [
    {
      id: 1,
      name: "server.properties",
      path: "/server.properties",
      size: 2048,
      isDirectory: false,
      lastModified: new Date(Date.now() - 86400000),
    },
    {
      id: 2,
      name: "world",
      path: "/world",
      size: 0,
      isDirectory: true,
      lastModified: new Date(Date.now() - 3600000),
    },
    {
      id: 3,
      name: "plugins",
      path: "/plugins",
      size: 0,
      isDirectory: true,
      lastModified: new Date(Date.now() - 7200000),
    },
    {
      id: 4,
      name: "logs",
      path: "/logs",
      size: 0,
      isDirectory: true,
      lastModified: new Date(Date.now() - 1800000),
    },
    {
      id: 5,
      name: "latest.log",
      path: "/logs/latest.log",
      size: 512000,
      isDirectory: false,
      lastModified: new Date(),
    },
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "-";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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

  const toggleFileSelection = (fileId: number) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const getBreadcrumbs = () => {
    const parts = currentPath.split("/").filter(Boolean);
    return [
      { label: "Home", path: "/" },
      ...parts.map((part, index) => ({
        label: part,
        path: "/" + parts.slice(0, index + 1).join("/"),
      })),
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-accent flex items-center gap-2">
          <File className="w-8 h-8" />
          Gerenciador de Arquivos
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie arquivos do seu servidor
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload de Arquivos</TabsTrigger>
          <TabsTrigger value="files">Arquivos do Servidor</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Enviar Arquivos</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                serverId={serverId}
                maxFileSize={100 * 1024 * 1024}
                onUploadStart={(fileName) => {
                  console.log(`Iniciando upload: ${fileName}`);
                }}
                onUploadProgress={(fileName, progress) => {
                  console.log(`${fileName}: ${progress}%`);
                }}
                onUploadComplete={(fileName, success) => {
                  console.log(`${fileName}: ${success ? "Sucesso" : "Falha"}`);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm p-3 bg-muted/50 rounded-lg">
            {getBreadcrumbs().map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPath(crumb.path)}
                  className="h-auto p-0 text-accent hover:text-accent/80"
                >
                  {index === 0 ? <Home className="w-4 h-4" /> : crumb.label}
                </Button>
              </div>
            ))}
          </div>

          {/* Files List */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">
                Arquivos ({files.length})
                {selectedFiles.length > 0 && (
                  <span className="ml-2 text-muted-foreground">
                    - {selectedFiles.length} selecionado(s)
                  </span>
                )}
              </CardTitle>
              {selectedFiles.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Baixar
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Deletar
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum arquivo encontrado
                  </p>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => toggleFileSelection(file.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedFiles.includes(file.id)
                          ? "bg-accent/20 border border-accent/50"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="w-4 h-4 cursor-pointer"
                      />

                      {/* Icon */}
                      {file.isDirectory ? (
                        <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      ) : (
                        <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {!file.isDirectory && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-auto p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto p-1 text-red-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Storage Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Informações de Armazenamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Espaço Usado</p>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent to-purple-500 w-3/4" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  750 GB de 1 TB (75%)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
