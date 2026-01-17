import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, X, File } from "lucide-react";
import type { BotCreationData } from "@/pages/BotCreation";

const documentTypes = [
  "Product Catalog",
  "User Manual",
  "FAQ Document",
  "Policy Document",
  "Training Material",
  "Other",
];

interface DocumentsUploadStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const DocumentsUploadStep = ({ data, onChange }: DocumentsUploadStepProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(
        (file) =>
          file.size <= 10 * 1024 * 1024 &&
          (file.type === "application/pdf" ||
            file.type === "application/msword" ||
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.type === "text/plain")
      );
      onChange({ files: [...data.files, ...validFiles] });
    },
    [data.files, onChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      onChange({ files: [...data.files, ...selectedFiles] });
    }
  };

  const removeFile = (index: number) => {
    const updated = data.files.filter((_, i) => i !== index);
    onChange({ files: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Documents Upload</h3>
          <p className="text-sm text-muted-foreground">Upload resources for your chatbot's knowledge base</p>
        </div>
      </div>

      <div className="grid gap-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Document Type <span className="text-destructive">*</span>
          </Label>
          <Select value={data.documentType} onValueChange={(value) => onChange({ documentType: value })}>
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

        <div className="space-y-2">
          <Label className="text-sm font-medium">Upload Files</Label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30 hover:border-primary/50"
            }`}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOC, TXT • Max 10MB per file
              </p>
            </label>
          </div>
        </div>

        {data.files.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Uploaded Files</Label>
            <div className="space-y-2">
              {data.files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <File className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="documentDescription" className="text-sm font-medium">
            Document Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="documentDescription"
            placeholder="Describe the documents you're uploading (300-500 characters)..."
            value={data.documentDescription}
            onChange={(e) => onChange({ documentDescription: e.target.value })}
            className="onboarding-input min-h-[120px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {data.documentDescription.length}/500 characters
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentsUploadStep;
