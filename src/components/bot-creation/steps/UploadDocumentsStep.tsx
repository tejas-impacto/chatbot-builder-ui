import { useCallback, useState } from "react";
import { BotCreationData } from "@/pages/BotCreation";
import { Upload, FileText, X } from "lucide-react";

interface UploadDocumentsStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const UploadDocumentsStep = ({ data, onChange }: UploadDocumentsStepProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      onChange({ files: [...data.files, ...droppedFiles] });
    },
    [data.files, onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        onChange({ files: [...data.files, ...selectedFiles] });
      }
    },
    [data.files, onChange]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = data.files.filter((_, i) => i !== index);
      onChange({ files: newFiles });
    },
    [data.files, onChange]
  );

  return (
    <div className="space-y-6">
      {/* Illustration */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
            <div className="relative">
              {/* Document illustration */}
              <div className="w-16 h-20 bg-primary/30 rounded-lg relative">
                <div className="absolute top-3 left-3 right-3 space-y-1.5">
                  <div className="h-1.5 bg-orange-400 rounded-full w-2/3" />
                  <div className="h-1 bg-background rounded-full" />
                  <div className="h-1 bg-background rounded-full" />
                  <div className="h-1 bg-background rounded-full" />
                  <div className="h-1 bg-background rounded-full w-3/4" />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-2 -left-4 w-6 h-6 border-2 border-foreground/20 rounded-full" />
              <div className="absolute -top-1 right-0 w-6 h-3 bg-muted rounded-full flex items-center justify-end pr-1">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              </div>
              <div className="absolute bottom-0 -left-2 text-primary text-lg">✦</div>
              <div className="absolute top-1/2 -right-4 w-2 h-2 bg-orange-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-primary/50"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          onChange={handleFileInput}
          accept=".pdf,.doc,.docx,.txt"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Upload className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm">
            <span className="text-primary font-medium">Click to upload</span>
            <span className="text-muted-foreground"> or drag and drop</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, DOC, TXT, or other documents
          </p>
        </label>
      </div>

      {/* Uploaded Files */}
      {data.files.length > 0 && (
        <div className="space-y-2">
          {data.files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadDocumentsStep;
