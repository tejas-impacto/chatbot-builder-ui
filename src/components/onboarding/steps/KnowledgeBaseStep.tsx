import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X, File, Image, FileSpreadsheet } from "lucide-react";
import InfoTooltip from "@/components/ui/info-tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KnowledgeBaseData {
  documentType: string;
  files: File[];
  documentDescription: string;
}

interface KnowledgeBaseStepProps {
  data: KnowledgeBaseData;
  onChange: (data: Partial<KnowledgeBaseData>) => void;
}

const documentTypes = [
  "Product Documentation",
  "FAQs & Help Articles",
  "Company Policies",
  "Training Materials",
  "Sales Collateral",
  "Technical Specs",
  "Other",
];

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return Image;
  if (['xlsx', 'xls', 'csv'].includes(ext || '')) return FileSpreadsheet;
  return FileText;
};

const KnowledgeBaseStep = ({ data, onChange }: KnowledgeBaseStepProps) => {
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    onChange({ files: [...(data.files || []), ...droppedFiles] });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      onChange({ files: [...(data.files || []), ...selectedFiles] });
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...(data.files || [])];
    updatedFiles.splice(index, 1);
    onChange({ files: updatedFiles });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-1.5">
          Train Your AI Assistant
          <InfoTooltip text="Upload documents to teach your agent about your business" size="md" />
        </h2>
        
        <p className="text-sm text-muted-foreground">
          Upload documents that will help your chatbot understand your business and provide accurate responses.
        </p>

        <div className="space-y-2">
          <Label htmlFor="documentType" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Document Category <span className="text-destructive">*</span>
            <InfoTooltip text="Select the type of documents you are uploading" />
          </Label>
          <Select value={data.documentType} onValueChange={(v) => onChange({ documentType: v })}>
            <SelectTrigger className="onboarding-input">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-input bg-muted/20 hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-10 text-center">
            {/* Upload illustration */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-10 h-10 text-primary" />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              Drop files here to upload
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              or click to browse your computer
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.pptx,.ppt,.json,.md"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Upload className="w-4 h-4" />
              Browse Files
            </button>

            <p className="text-xs text-muted-foreground mt-4">
              Supports PDF, Word, Excel, PowerPoint, CSV, JSON, and Markdown files
            </p>
          </div>
        </div>

        {/* File list */}
        {data.files && data.files.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Uploaded Files ({data.files.length})
              <InfoTooltip text="Files that will be used to train your AI agent" />
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.files.map((file, index) => {
                const FileIcon = getFileIcon(file.name);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50 group hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-2 hover:bg-destructive/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="documentDescription" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Additional context
            <InfoTooltip text="Any extra instructions or context to help the AI understand your documents" />
          </Label>
          <Textarea
            id="documentDescription"
            value={data.documentDescription}
            onChange={(e) => onChange({ documentDescription: e.target.value })}
            placeholder="Provide any additional context about these documents or specific instructions for the AI..."
            className="onboarding-input min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {data.documentDescription?.length || 0}/500
          </p>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseStep;
