import { useState } from "react";
import { Upload, Search, FileText, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface UploadedFile {
  id: number;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
}

const BusinessDataManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const uploadedFiles: UploadedFile[] = [
    { id: 1, name: "Product Catalog 2024.pdf", size: "2.4 MB", uploadDate: "Dec 20, 2024", type: "pdf" },
    { id: 2, name: "User Guide 2024.docx", size: "1.2 MB", uploadDate: "Jan 15, 2024", type: "docx" },
    { id: 3, name: "Marketing Strategy 2024.pptx", size: "3.5 MB", uploadDate: "Feb 10, 2024", type: "pptx" },
    { id: 4, name: "Sales Report Q1 2024.xlsx", size: "850 KB", uploadDate: "Mar 5, 2024", type: "xlsx" },
    { id: 5, name: "Project Timeline 2024.gantt", size: "500 KB", uploadDate: "Apr 1, 2024", type: "gantt" },
  ];

  const getFileColor = (type: string) => {
    const colors: Record<string, string> = {
      pdf: "bg-orange-100 text-orange-600",
      docx: "bg-blue-100 text-blue-600",
      pptx: "bg-pink-100 text-pink-600",
      xlsx: "bg-green-100 text-green-600",
      gantt: "bg-purple-100 text-purple-600",
    };
    return colors[type] || "bg-gray-100 text-gray-600";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file drop
  };

  const filteredFiles = uploadedFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-auto">
          <DashboardHeader />

          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Business Data Management</h1>
                <p className="text-muted-foreground">Manage your knowledge base and training data</p>
              </div>
              <Button className="rounded-full bg-background border border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>

            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-2xl p-12 text-center mb-8 transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Upload Business Data</h3>
                  <p className="text-muted-foreground">
                    <button className="text-primary hover:underline">Click to upload</button> or drag and drop
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">PDF, DOC, TXT, or other documents (max 10MB each)</p>
                </div>
              </div>
            </div>

            {/* Uploaded Files */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Uploaded Files</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for Files"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-full bg-muted/50 border-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredFiles.map((file) => (
                  <div 
                    key={file.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all bg-background"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileColor(file.type)}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{file.size} • Uploaded {file.uploadDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default BusinessDataManagement;
