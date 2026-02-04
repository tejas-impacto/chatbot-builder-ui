import { useState, useEffect, useRef } from "react";
import { Upload, Search, FileText, Eye, Trash2, Loader2, RefreshCw, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useToast } from "@/hooks/use-toast";
import { getValidAccessToken } from "@/lib/auth";
import { getBotsByTenant, type Bot as BotType } from "@/lib/botApi";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
  downloadUrl: string;
}

interface ApiDocument {
  id: string;
  tenantId: string;
  botId: string;
  documentType: string;
  fileName: string;
  originalFileName: string;
  description: string;
  mimeType: string;
  size: number;
  metadata: Record<string, unknown>;
  downloadUrl: string;
  createdAt?: string;
}

// Helper to get file extension from mimeType or filename
const getFileExtension = (mimeType: string, fileName: string): string => {
  const mimeToExt: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/plain': 'txt',
    'text/csv': 'csv',
  };

  if (mimeToExt[mimeType]) return mimeToExt[mimeType];

  // Fallback to filename extension
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext || 'file';
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// Helper to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Recently uploaded';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Recently uploaded';
  }
};

const ChatbotDocuments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [bots, setBots] = useState<BotType[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const [loadingBots, setLoadingBots] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch bots on mount
  useEffect(() => {
    const fetchBots = async () => {
      const tenantId = localStorage.getItem('tenantId');

      if (!tenantId) {
        setLoadingBots(false);
        setError('No tenant ID found');
        return;
      }

      try {
        const response = await getBotsByTenant(tenantId);
        const botsList = response.responseStructure?.data || [];
        setBots(botsList);

        // Auto-select first bot if available
        if (botsList.length > 0) {
          setSelectedBotId(botsList[0].botId);
        }
      } catch (err) {
        console.error('Error fetching bots:', err);
        toast({
          title: "Error",
          description: "Failed to load bots. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingBots(false);
      }
    };

    fetchBots();
  }, [toast]);

  // Fetch documents when bot is selected
  useEffect(() => {
    if (!selectedBotId) {
      setDocuments([]);
      return;
    }

    const fetchDocuments = async () => {
      const tenantId = localStorage.getItem('tenantId');

      if (!tenantId) {
        setError('No tenant ID found');
        return;
      }

      setLoadingDocs(true);
      setError(null);

      try {
        const accessToken = await getValidAccessToken();

        if (!accessToken) {
          setError('Session expired. Please login again.');
          return;
        }

        const response = await fetch(
          `/api-doc/v1/documents?tenantId=${tenantId}&documentType=CHATBOT&botId=${selectedBotId}&page=0&size=50&sortBy=createdAt&sortDir=desc`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }

        const result = await response.json();

        // Map API response to UploadedFile format
        const mappedDocs: UploadedFile[] = (result.data || []).map((doc: ApiDocument) => ({
          id: doc.id,
          name: doc.originalFileName || doc.fileName,
          size: formatFileSize(doc.size),
          uploadDate: formatDate(doc.createdAt),
          type: getFileExtension(doc.mimeType, doc.originalFileName || doc.fileName),
          downloadUrl: doc.downloadUrl,
        }));

        setDocuments(mappedDocs);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents');
        toast({
          title: "Error",
          description: "Failed to load documents. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchDocuments();
  }, [selectedBotId, toast]);

  const getFileColor = (type: string) => {
    const colors: Record<string, string> = {
      pdf: "bg-orange-100 text-orange-600",
      doc: "bg-blue-100 text-blue-600",
      docx: "bg-blue-100 text-blue-600",
      pptx: "bg-pink-100 text-pink-600",
      xlsx: "bg-green-100 text-green-600",
      xls: "bg-green-100 text-green-600",
      txt: "bg-gray-100 text-gray-600",
      csv: "bg-green-100 text-green-600",
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

    if (!selectedBotId) {
      toast({
        title: "Select a Bot",
        description: "Please select a bot first before uploading documents.",
        variant: "destructive",
      });
      return;
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUploadFiles(Array.from(files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedBotId) {
      toast({
        title: "Select a Bot",
        description: "Please select a bot first before uploading documents.",
        variant: "destructive",
      });
      return;
    }

    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadFiles(Array.from(files));
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadFiles = async (files: File[]) => {
    const tenantId = localStorage.getItem('tenantId');

    if (!tenantId) {
      toast({
        title: "Error",
        description: "No tenant ID found. Please login again.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBotId) {
      toast({
        title: "Error",
        description: "Please select a bot first.",
        variant: "destructive",
      });
      return;
    }

    const accessToken = await getValidAccessToken();

    if (!accessToken) {
      toast({
        title: "Error",
        description: "Session expired. Please login again.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    for (const file of files) {
      try {
        const base64File = await fileToBase64(file);

        const response = await fetch(
          `/api-doc/v1/documents/upload?tenantId=${tenantId}&documentType=CHATBOT&botId=${selectedBotId}&documentName=${encodeURIComponent(file.name)}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'accept': '*/*',
            },
            body: JSON.stringify({ file: base64File }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Upload failed');
        }

        const result = await response.json();
        const uploadedDoc = result.response?.data;

        if (uploadedDoc) {
          // Add the new document to the list
          const newDoc: UploadedFile = {
            id: uploadedDoc.id,
            name: uploadedDoc.originalFileName || uploadedDoc.fileName,
            size: formatFileSize(uploadedDoc.size),
            uploadDate: 'Just now',
            type: getFileExtension(uploadedDoc.mimeType, uploadedDoc.originalFileName || uploadedDoc.fileName),
            downloadUrl: uploadedDoc.downloadUrl || '',
          };
          setDocuments(prev => [newDoc, ...prev]);
        }

        toast({
          title: "Success",
          description: `"${file.name}" uploaded successfully.`,
        });
      } catch (err) {
        console.error('Error uploading file:', err);
        toast({
          title: "Error",
          description: `Failed to upload "${file.name}". Please try again.`,
          variant: "destructive",
        });
      }
    }

    setUploading(false);
  };

  const filteredFiles = documents.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDocument = async (downloadUrl: string) => {
    if (!downloadUrl) {
      toast({
        title: "Error",
        description: "Download URL not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        toast({
          title: "Error",
          description: "Session expired. Please login again.",
          variant: "destructive",
        });
        return;
      }

      // The downloadUrl from API is "/api/v1/documents/download/{id}"
      // but download endpoint is on document service, so use /api-doc/ prefix
      let fetchUrl = downloadUrl;
      if (downloadUrl.startsWith('/api/v1/documents/download/')) {
        fetchUrl = downloadUrl.replace('/api/', '/api-doc/');
      }

      // Fetch the document with authentication headers
      const response = await fetch(fetchUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accept': 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      // Create a blob from the response
      const blob = await response.blob();

      // Create an object URL and open it in a new tab
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank');

      // Clean up the object URL after a delay to allow the new tab to load
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 60000);

    } catch (err) {
      console.error('Error viewing document:', err);
      toast({
        title: "Error",
        description: "Failed to open document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = async (documentId: string, documentName: string) => {
    try {
      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        toast({
          title: "Error",
          description: "Session expired. Please login again.",
          variant: "destructive",
        });
        return;
      }

      setDeletingId(documentId);

      const response = await fetch(
        `/api-doc/v1/documents/${documentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'accept': '*/*',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Remove document from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));

      toast({
        title: "Success",
        description: `"${documentName}" deleted successfully.`,
      });
    } catch (err) {
      console.error('Error deleting document:', err);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefresh = () => {
    if (selectedBotId) {
      // Trigger re-fetch by updating selectedBotId
      const currentBot = selectedBotId;
      setSelectedBotId('');
      setTimeout(() => setSelectedBotId(currentBot), 0);
    }
  };

  const selectedBot = bots.find(b => b.botId === selectedBotId);

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
                <h1 className="text-2xl font-bold text-foreground">Chatbot Documents</h1>
                <p className="text-muted-foreground">Manage documents for your chatbots</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Bot Selector */}
                <Select value={selectedBotId} onValueChange={setSelectedBotId} disabled={loadingBots}>
                  <SelectTrigger className="w-[220px]">
                    <Bot className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder={loadingBots ? "Loading bots..." : "Select a bot"} />
                  </SelectTrigger>
                  <SelectContent>
                    {bots.map((bot) => (
                      <SelectItem key={bot.botId} value={bot.botId}>
                        {bot.agentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={!selectedBotId || loadingDocs}
                  className="rounded-full"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingDocs ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {!selectedBotId ? (
              // No bot selected state
              <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">Select a Chatbot</h3>
                    <p className="text-muted-foreground">
                      Choose a chatbot from the dropdown above to view and manage its documents
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 transition-colors ${
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
                      <h3 className="font-semibold text-foreground">
                        {uploading ? 'Uploading...' : `Upload Documents for ${selectedBot?.agentName || 'Chatbot'}`}
                      </h3>
                      <p className="text-muted-foreground">
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          Click to upload
                        </button> or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">PDF, DOC, DOCX, TXT files</p>
                    </div>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Documents List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">
                      Documents ({filteredFiles.length})
                    </h2>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-full bg-muted/50 border-none"
                      />
                    </div>
                  </div>

                  {loadingDocs ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>{error}</p>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="font-medium">No documents found</p>
                      <p className="text-sm">Upload documents to train your chatbot</p>
                    </div>
                  ) : (
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
                              <p className="text-sm text-muted-foreground">{file.size} • {file.uploadDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => handleViewDocument(file.downloadUrl)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteDocument(file.id, file.name)}
                              disabled={deletingId === file.id}
                            >
                              {deletingId === file.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ChatbotDocuments;
