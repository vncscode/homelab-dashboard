import React, { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface FileUploadProps {
  serverId: number;
  onUploadStart?: (fileName: string) => void;
  onUploadProgress?: (fileName: string, progress: number) => void;
  onUploadComplete?: (fileName: string, success: boolean) => void;
  maxFileSize?: number; // in bytes, default 100MB
  acceptedTypes?: string[];
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
}

/**
 * File upload component with drag-and-drop support
 */
export function FileUpload({
  serverId,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  acceptedTypes = ["*/*"],
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `Arquivo muito grande. Máximo: ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`;
    }

    if (acceptedTypes.length > 0 && !acceptedTypes.includes("*/*")) {
      const fileType = file.type;
      const isAccepted = acceptedTypes.some(
        (type) =>
          type === fileType ||
          (type.endsWith("/*") && fileType.startsWith(type.slice(0, -2)))
      );

      if (!isAccepted) {
        return `Tipo de arquivo não permitido. Aceitos: ${acceptedTypes.join(", ")}`;
      }
    }

    return null;
  };

  const processFiles = (files: FileList) => {
    const newFiles: UploadingFile[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);

      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }

      const uploadId = `${Date.now()}-${Math.random()}`;
      newFiles.push({
        id: uploadId,
        file,
        progress: 0,
        status: "pending",
      });

      onUploadStart?.(file.name);
    });

    setUploadingFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach((uploadFile) => {
      simulateUpload(uploadFile);
    });
  };

  const simulateUpload = (uploadFile: UploadingFile) => {
    setUploadingFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: "uploading" } : f
      )
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 100) progress = 100;

      onUploadProgress?.(uploadFile.file.name, progress);
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, progress } : f
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "completed", progress: 100 }
              : f
          )
        );
        onUploadComplete?.(uploadFile.file.name, true);
      }
    }, 500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearCompleted = () => {
    setUploadingFiles((prev) =>
      prev.filter((f) => f.status !== "completed" && f.status !== "failed")
    );
  };

  const completedCount = uploadingFiles.filter(
    (f) => f.status === "completed"
  ).length;
  const failedCount = uploadingFiles.filter((f) => f.status === "failed").length;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-accent bg-accent/10"
            : "border-muted-foreground/25 hover:border-accent/50"
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Máximo: {(maxFileSize / 1024 / 1024).toFixed(0)}MB por arquivo
        </p>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
        >
          Selecionar Arquivos
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept={acceptedTypes.join(",")}
        />
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">
              Uploads ({uploadingFiles.length})
            </CardTitle>
            {completedCount > 0 && (
              <Button
                onClick={clearCompleted}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Limpar Concluídos
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadingFiles.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {uploadFile.status === "uploading" && (
                      <Loader2 className="w-4 h-4 animate-spin text-accent flex-shrink-0" />
                    )}
                    {uploadFile.status === "completed" && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                    {uploadFile.status === "failed" && (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    {uploadFile.status === "pending" && (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                    )}

                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      ({(uploadFile.file.size / 1024 / 1024).toFixed(2)}MB)
                    </span>
                  </div>

                  {uploadFile.status !== "pending" && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <Progress
                          value={uploadFile.progress}
                          className="flex-1 h-1.5"
                        />
                        <span className="text-xs text-muted-foreground ml-2">
                          {uploadFile.progress}%
                        </span>
                      </div>
                      {uploadFile.error && (
                        <p className="text-xs text-red-500">{uploadFile.error}</p>
                      )}
                    </div>
                  )}
                </div>

                {(uploadFile.status === "completed" ||
                  uploadFile.status === "failed") && (
                  <Button
                    onClick={() => removeFile(uploadFile.id)}
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            {failedCount > 0 && (
              <p className="text-xs text-red-500 text-center">
                {failedCount} arquivo(s) falharam. Tente novamente.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {uploadingFiles.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          {completedCount > 0 && (
            <span className="text-green-500 mr-2">
              ✓ {completedCount} concluído(s)
            </span>
          )}
          {uploadingFiles.filter((f) => f.status === "uploading").length > 0 && (
            <span className="text-accent">
              ⟳ {uploadingFiles.filter((f) => f.status === "uploading").length}{" "}
              enviando...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
