import React, { useEffect, useRef, useState } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { oneDark } from "@codemirror/theme-one-dark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, RotateCcw, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => Promise<void>;
  language?: "javascript" | "json" | "xml" | "html" | "css" | "text";
  readOnly?: boolean;
  height?: string;
  fileName?: string;
}

/**
 * Code editor component with syntax highlighting
 */
export function CodeEditor({
  value,
  onChange,
  onSave,
  language = "text",
  readOnly = false,
  height = "400px",
  fileName,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Get language extension based on file type
  const getLanguageExtension = () => {
    switch (language) {
      case "javascript":
        return javascript();
      case "json":
        return json();
      case "xml":
        return xml();
      case "html":
        return html();
      case "css":
        return css();
      default:
        return [];
    }
  };

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        getLanguageExtension(),
        oneDark,
        EditorView.editable.of(!readOnly),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange?.(newValue);
            setHasChanges(true);
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  // Update editor content when value prop changes
  useEffect(() => {
    if (!viewRef.current) return;

    const currentValue = viewRef.current.state.doc.toString();
    if (currentValue !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value,
        },
      });
      setHasChanges(false);
    }
  }, [value]);

  const handleSave = async () => {
    if (!viewRef.current || !onSave) return;

    try {
      setIsSaving(true);
      const content = viewRef.current.state.doc.toString();
      await onSave(content);
      setHasChanges(false);
      toast.success("Arquivo salvo com sucesso");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar arquivo"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    if (!viewRef.current) return;

    const content = viewRef.current.state.doc.toString();
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast.success("Conteúdo copiado");
  };

  const handleReset = () => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      changes: {
        from: 0,
        to: viewRef.current.state.doc.length,
        insert: value,
      },
    });
    setHasChanges(false);
    toast.info("Alterações descartadas");
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">
          {fileName && <span className="font-mono text-xs">{fileName}</span>}
          {hasChanges && <span className="text-red-500 ml-2">*</span>}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="h-auto p-2"
            title="Copiar conteúdo"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>

          {hasChanges && (
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="h-auto p-2"
              title="Descartar alterações"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}

          {onSave && (
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || readOnly}
              size="sm"
              className="h-auto px-3"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={editorRef}
          style={{ height }}
          className="border-t border-border overflow-hidden"
        />
      </CardContent>
    </Card>
  );
}

/**
 * File editor modal
 */
export function FileEditorModal({
  fileName,
  content,
  language = "text",
  onSave,
  onClose,
}: {
  fileName: string;
  content: string;
  language?: "javascript" | "json" | "xml" | "html" | "css" | "text";
  onSave: (content: string) => Promise<void>;
  onClose: () => void;
}) {
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = async () => {
    await onSave(editedContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
          <CardTitle className="font-mono text-sm">{fileName}</CardTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-auto p-1"
          >
            ✕
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <CodeEditor
            value={editedContent}
            onChange={setEditedContent}
            language={language}
            height="100%"
          />
        </CardContent>
        <div className="border-t border-border p-4 flex justify-end gap-2">
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </Card>
    </div>
  );
}
