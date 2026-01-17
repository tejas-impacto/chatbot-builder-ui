import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentsUploadData {
  documentType: string;
  files: File[];
  documentDescription: string;
}

interface DocumentsUploadStepProps {
  data: DocumentsUploadData;
  onChange: (data: Partial<DocumentsUploadData>) => void;
}

const documentTypes = [
  "Product Catalog",
  "Company Policies",
  "FAQ Document",
  "Knowledge Base",
  "Training Materials",
  "Other",
];

const DocumentsUploadStep = ({ data, onChange }: DocumentsUploadStepProps) => {
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="documentType" className="text-sm font-semibold text-foreground">
          Document Type <span className="text-destructive">*</span>
        </Label>
        <Select value={data.documentType} onValueChange={(v) => onChange({ documentType: v })}>
          <SelectTrigger className="onboarding-input">
            <SelectValue placeholder="Product Catalog" />
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
            : "border-input bg-muted/30"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Help us understand your business better
          </h3>
          
          {/* Illustration */}
          <div className="mb-6">
            <svg viewBox="0 0 200 150" className="w-40 h-30 mx-auto">
              {/* Cloud/circle background */}
              <ellipse cx="100" cy="75" rx="60" ry="45" fill="hsl(var(--primary))" opacity="0.15" />
              
              {/* Document */}
              <rect x="70" y="40" width="60" height="70" rx="6" fill="hsl(var(--primary))" />
              <rect x="78" y="50" width="30" height="6" rx="2" fill="hsl(var(--brand-cyan))" />
              <rect x="78" y="62" width="44" height="4" rx="2" fill="white" opacity="0.9" />
              <rect x="78" y="72" width="44" height="4" rx="2" fill="white" opacity="0.7" />
              <rect x="78" y="82" width="36" height="4" rx="2" fill="white" opacity="0.7" />
              <rect x="78" y="92" width="40" height="4" rx="2" fill="white" opacity="0.7" />
              
              {/* Toggle/switch decoration */}
              <rect x="140" y="50" width="24" height="12" rx="6" fill="hsl(var(--brand-cyan))" />
              <circle cx="158" cy="56" r="4" fill="white" />
              <circle cx="145" cy="45" r="4" fill="hsl(var(--brand-cyan))" />
              
              {/* Decorative elements */}
              <path d="M55 85 Q50 75 55 65" stroke="hsl(var(--foreground))" strokeWidth="2" fill="none" />
              <circle cx="165" cy="100" r="4" fill="hsl(var(--brand-cyan))" opacity="0.5" />
              <path d="M58 115 L62 119 L58 123" stroke="hsl(var(--brand-cyan))" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-dashed border-primary text-primary font-medium hover:bg-primary/5 transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
        </div>
      </div>

      {/* File list */}
      {data.files && data.files.length > 0 && (
        <div className="space-y-2">
          {data.files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="documentDescription" className="text-sm font-semibold text-foreground">
          Document Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="documentDescription"
          value={data.documentDescription}
          onChange={(e) => onChange({ documentDescription: e.target.value })}
          placeholder="300-500 Characters"
          className="onboarding-input min-h-[100px] resize-none"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">
          {data.documentDescription?.length || 0}/500
        </p>
      </div>
    </div>
  );
};

export default DocumentsUploadStep;
