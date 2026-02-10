import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  Mic,
  Copy,
  Check,
  Code,
  Link2,
  FileText,
  MessageSquare,
  Calendar,
  Upload,
  Eye,
  Loader2,
  File,
  ChevronDown,
  ChevronRight,
  Users,
  ExternalLink as ExternalLinkIcon,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { getValidAccessToken } from "@/lib/auth";
import type { Bot as BotType } from "@/lib/botApi";
import { getUnresolvedQueries, submitQueryAnswers, getLeadInteractions, extractLeadInteractions, type UnresolvedQuery, type LeadInteraction } from "@/lib/botApi";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HelpCircle, ExternalLink, MessageCircle } from "lucide-react";
import { getChatHistory, type ChatHistoryMessage } from "@/lib/chatApi";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface LocationState {
  bot?: BotType;
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

const CHAT_SERVER_URL = "http://172.16.0.99:8002";

const BotDetails = () => {
  const { botId } = useParams<{ botId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = (location.state as LocationState) || {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bot] = useState<BotType | null>(state.bot || null);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [endpointsOpen, setEndpointsOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [queriesOpen, setQueriesOpen] = useState(false);
  const [queries, setQueries] = useState<UnresolvedQuery[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState<UnresolvedQuery | null>(null);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [totalQueries, setTotalQueries] = useState(0);
  const [leads, setLeads] = useState<LeadInteraction[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<ChatHistoryMessage[]>([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationLead, setConversationLead] = useState<LeadInteraction | null>(null);
  const [conversationSummary, setConversationSummary] = useState("");

  const tenantId = localStorage.getItem("tenantId") || "";
  const isVoiceBot = bot?.channelType === "VOICE";
  const documentType = "CHATBOT"; // All bot documents use CHATBOT type, filtered by botId

  // Fetch documents for this bot
  const fetchDocuments = async () => {
    if (!botId) return;

    try {
      setLoadingDocs(true);
      const accessToken = await getValidAccessToken();
      if (!accessToken) throw new Error("No access token");

      const fetchUrl = `/api-doc/v1/documents?tenantId=${tenantId}&documentType=${documentType}&botId=${botId}&page=0&size=100&sortBy=createdAt&sortDir=desc`;
      console.log("Fetching documents from:", fetchUrl);
      console.log("Parameters:", { tenantId, documentType, botId });

      const response = await fetch(fetchUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          accept: "*/*",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch documents");

      const data = await response.json();
      console.log("Documents API response:", data);

      // Try multiple possible response structures
      const docs = data.responseStructure?.data?.content ||
                   data.responseStructure?.data ||
                   data.data?.content ||
                   data.data ||
                   data.content ||
                   [];
      console.log("Documents found:", docs);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchQueries();
    fetchLeads();
  }, [botId]);

  // Fetch unresolved queries for this bot
  const fetchQueries = async () => {
    if (!botId) return;

    try {
      setLoadingQueries(true);
      const response = await getUnresolvedQueries(botId, 0, 20);
      const data = response.responseStructure?.data;
      setQueries(data?.content || []);
      setTotalQueries(data?.totalElements || 0);
    } catch (error) {
      console.error("Error fetching unresolved queries:", error);
    } finally {
      setLoadingQueries(false);
    }
  };

  // Fetch leads/chat history for this bot
  const fetchLeads = async () => {
    if (!botId || !tenantId) return;

    try {
      setLoadingLeads(true);
      const response = await getLeadInteractions(tenantId, botId, 0, 10);
      setLeads(extractLeadInteractions(response).data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleAnswerQuery = (query: UnresolvedQuery) => {
    setSelectedQuery(query);
    setAnswerText("");
    setAnswerDialogOpen(true);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedQuery || !answerText.trim()) return;

    setSubmittingAnswer(true);
    try {
      await submitQueryAnswers([
        {
          queryId: selectedQuery.queryId,
          answer: answerText.trim(),
          approve: true,
        },
      ]);

      toast({
        title: "Answer Submitted",
        description: "Your answer has been submitted successfully.",
      });

      setAnswerDialogOpen(false);
      setSelectedQuery(null);
      setAnswerText("");
      fetchQueries(); // Refresh the list
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleViewConversation = async (lead: LeadInteraction) => {
    if (!lead.sessionId || !botId) return;

    setConversationLead(lead);
    setConversationMessages([]);
    setConversationSummary("");
    setConversationDialogOpen(true);
    setConversationLoading(true);

    try {
      const response = await getChatHistory(lead.tenantId || tenantId, botId, lead.sessionId);
      const data = response.responseStructure?.data;
      setConversationMessages(data?.messages || []);
      setConversationSummary(data?.summary || "");
    } catch (err) {
      console.error("Failed to load conversation:", err);
      toast({
        title: "Error",
        description: "Failed to load conversation history.",
        variant: "destructive",
      });
    } finally {
      setConversationLoading(false);
    }
  };

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      toast({ title: "Copied!", description: "Copied to clipboard" });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !botId) return;

    try {
      setUploading(true);
      const accessToken = await getValidAccessToken();
      if (!accessToken) throw new Error("No access token");

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];

        const response = await fetch(
          `/api-doc/v1/documents/upload?tenantId=${tenantId}&documentType=${documentType}&botId=${botId}&documentName=${encodeURIComponent(file.name)}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              accept: "*/*",
            },
            body: JSON.stringify({ file: base64 }),
          }
        );

        if (!response.ok) throw new Error("Failed to upload document");

        toast({
          title: "Document Uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
        fetchDocuments();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleViewDocument = async (doc: ApiDocument) => {
    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) throw new Error("No access token");

      const response = await fetch(`/api-doc/v1/documents/download/${doc.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/octet-stream",
        },
      });

      if (!response.ok) throw new Error("Failed to download document");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error viewing document:", error);
      toast({
        title: "Error",
        description: "Failed to open document",
        variant: "destructive",
      });
    }
  };



  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "text-red-500";
    if (mimeType.includes("word") || mimeType.includes("doc"))
      return "text-blue-500";
    return "text-gray-500";
  };

  // API Endpoints data
  const endpoints = [
    {
      key: "message",
      title: "Message API (SSE Streaming)",
      method: "POST",
      url: `${CHAT_SERVER_URL}/chat/${tenantId}/${botId}/message`,
      description: "Send a message and receive streaming response",
      curl: `curl -X POST '${CHAT_SERVER_URL}/chat/${tenantId}/${botId}/message' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "message": "Hello, how can you help me?",
    "session_id": "your_session_id"
  }'`,
    },
  ];

  const widgetCode = `<!-- Chatbot Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/widget.js';
    script.setAttribute('data-chatbot-id', '${botId}');
    script.setAttribute('data-tenant-id', '${tenantId}');
    document.body.appendChild(script);
  })();
</script>`;

  if (!bot) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto">
            <DashboardHeader />
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading bot details...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto">
          <DashboardHeader />

          <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h1 className="text-2xl font-bold text-foreground">
                    Bot Details
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    navigate(`/manage-agents/bot/${botId}/edit`)
                  }
                  className="rounded-full"
                  title="Edit Bot Settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() =>
                    navigate(isVoiceBot ? "/manage-voicebot" : "/manage-chatbot", {
                      state: {
                        botId: botId,
                        chatbotName: bot.agentName,
                        tenantId,
                        showLeadForm: true,
                      },
                    })
                  }
                  className="rounded-full"
                >
                  Try Bot
                </Button>
              </div>
            </div>

            {/* Bot Overview Card */}
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      {isVoiceBot ? (
                        <Mic className="w-8 h-8 text-primary" />
                      ) : (
                        <Bot className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        {bot.agentName}
                      </h2>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {bot.channelType || "TEXT"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created: {formatDate(bot.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={bot.active ? "default" : "secondary"}
                    className={
                      bot.active
                        ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        : ""
                    }
                  >
                    {bot.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Bot ID and Tenant ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Bot ID</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-foreground truncate max-w-[200px]">
                        {botId}
                      </code>
                      <button
                        onClick={() => handleCopy(botId || "", "botId")}
                        className="p-1.5 hover:bg-muted rounded"
                      >
                        {copiedField === "botId" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Tenant ID</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-foreground truncate max-w-[200px]">
                        {tenantId}
                      </code>
                      <button
                        onClick={() => handleCopy(tenantId, "tenantId")}
                        className="p-1.5 hover:bg-muted rounded"
                      >
                        {copiedField === "tenantId" ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Expandable Sections */}
              <div className="space-y-4">
                {/* API Endpoints - Expandable */}
                <Collapsible open={endpointsOpen} onOpenChange={setEndpointsOpen}>
                  <Card className="border-border/50">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Code className="w-5 h-5 text-primary" />
                            API Endpoints
                          </CardTitle>
                          {endpointsOpen ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Integration endpoints for external applications
                        </p>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-0">
                        {endpoints.map((endpoint) => (
                          <div key={endpoint.key} className="border border-border/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-foreground">
                                {endpoint.title}
                              </span>
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                                {endpoint.method}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              {endpoint.description}
                            </p>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                              <code className="flex-1 text-xs font-mono text-foreground break-all">
                                {endpoint.url}
                              </code>
                              <button
                                onClick={() => handleCopy(endpoint.url, `${endpoint.key}-url`)}
                                className="p-1 hover:bg-muted rounded"
                              >
                                {copiedField === `${endpoint.key}-url` ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Copy className="w-3 h-3 text-muted-foreground" />
                                )}
                              </button>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs text-muted-foreground">cURL</p>
                                <button
                                  onClick={() => handleCopy(endpoint.curl, `${endpoint.key}-curl`)}
                                  className="text-xs text-primary hover:underline"
                                >
                                  {copiedField === `${endpoint.key}-curl` ? "Copied!" : "Copy"}
                                </button>
                              </div>
                              <pre className="p-2 bg-zinc-900 text-zinc-100 rounded text-xs overflow-x-auto max-h-32">
                                <code>{endpoint.curl}</code>
                              </pre>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Documents - Expandable */}
                <Collapsible open={documentsOpen} onOpenChange={setDocumentsOpen}>
                  <Card className="border-border/50">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Documents
                            <Badge variant="secondary" className="ml-2">
                              {documents.length}
                            </Badge>
                          </CardTitle>
                          {documentsOpen ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Knowledge base documents for this bot
                        </p>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="flex justify-end mb-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="rounded-full"
                          >
                            {uploading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4 mr-2" />
                            )}
                            Upload
                          </Button>
                        </div>
                        {loadingDocs ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : documents.length === 0 ? (
                          <div className="text-center py-6">
                            <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No documents uploaded</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <File className={`w-4 h-4 flex-shrink-0 ${getFileIcon(doc.mimeType)}`} />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {doc.originalFileName || doc.fileName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(doc.size)} • {formatDate(doc.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleViewDocument(doc)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Unresolved Queries - Expandable */}
                <Collapsible open={queriesOpen} onOpenChange={setQueriesOpen}>
                  <Card className="border-border/50">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-primary" />
                            Unresolved Queries
                            {totalQueries > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                {totalQueries}
                              </Badge>
                            )}
                          </CardTitle>
                          {queriesOpen ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Questions the bot couldn't answer
                        </p>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="flex justify-end mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/unresolved-queries/${botId}`)}
                            className="rounded-full"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View All
                          </Button>
                        </div>
                        {loadingQueries ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : queries.length === 0 ? (
                          <div className="text-center py-6">
                            <HelpCircle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No unresolved queries</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {queries.map((query) => (
                              <div
                                key={query.queryId}
                                className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => handleAnswerQuery(query)}
                              >
                                <p className="text-sm font-medium text-foreground line-clamp-2">
                                  {query.query}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(query.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>

                {/* Widget Embed Code - Expandable */}
                <Collapsible open={widgetOpen} onOpenChange={setWidgetOpen}>
                  <Card className="border-border/50">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Link2 className="w-5 h-5 text-primary" />
                            Widget Embed Code
                          </CardTitle>
                          {widgetOpen ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Embed the chatbot widget on your website
                        </p>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-muted-foreground">HTML Code</p>
                          <button
                            onClick={() => handleCopy(widgetCode, "widget")}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            {copiedField === "widget" ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-lg text-xs overflow-x-auto">
                          <code>{widgetCode}</code>
                        </pre>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>

              {/* Right Column - Chat History */}
              <div>
                <Card className="border-border/50 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Chat History & Leads
                        {leads.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {leads.length}
                          </Badge>
                        )}
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/leads")}
                        className="rounded-full"
                      >
                        <ExternalLinkIcon className="w-4 h-4 mr-2" />
                        View All Leads
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recent conversation sessions and captured leads
                    </p>
                  </CardHeader>
                  <CardContent>
                    {loadingLeads ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : leads.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          No conversations yet
                        </p>
                        <p className="text-xs text-muted-foreground/70 text-center max-w-xs">
                          Conversation sessions will appear here when customers interact with your bot
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {leads.map((lead) => {
                          const fullName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Unknown User";
                          const initials = (lead.firstName?.charAt(0) || "") + (lead.lastName?.charAt(0) || "") || "?";

                          return (
                            <div
                              key={lead.leadId || lead.sessionId}
                              className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                                    {initials}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {fullName}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      {lead.email && (
                                        <span className="truncate max-w-[120px]">{lead.email}</span>
                                      )}
                                      {lead.sessionId && (
                                        <span className="font-mono text-[10px] truncate max-w-[80px]" title={lead.sessionId}>
                                          #{lead.sessionId.substring(0, 8)}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {lead.sessionId && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleViewConversation(lead)}
                                      className="rounded-full text-xs h-7 px-2 gap-1"
                                    >
                                      <MessageCircle className="w-3 h-3" />
                                      Chat
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/leads", {
                                      state: {
                                        highlightLeadId: lead.leadId,
                                        highlightSessionId: lead.sessionId
                                      }
                                    })}
                                    className="rounded-full text-xs h-7 px-2"
                                  >
                                    Know More
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>



      {/* Answer Query Dialog */}
      <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Answer Query</DialogTitle>
            <DialogDescription>
              Provide an answer to this unresolved query. The bot will learn from your response.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Query</label>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-foreground">{selectedQuery?.query}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Asked on{" "}
                  {selectedQuery?.createdAt &&
                    new Date(selectedQuery.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Answer</label>
              <Textarea
                placeholder="Type your answer here..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="min-h-[120px] rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAnswerDialogOpen(false);
                setSelectedQuery(null);
                setAnswerText("");
              }}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAnswer}
              disabled={!answerText.trim() || submittingAnswer}
              className="rounded-full"
            >
              {submittingAnswer ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Answer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Conversation Dialog */}
      <Dialog open={conversationDialogOpen} onOpenChange={setConversationDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Conversation History
            </DialogTitle>
            <DialogDescription>
              {conversationLead && (
                <span>
                  {`${conversationLead.firstName || ""} ${conversationLead.lastName || ""}`.trim() || "Unknown User"}
                  {conversationLead.email && ` • ${conversationLead.email}`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {conversationSummary && (
            <div className="px-1 py-2 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Summary</p>
              <p className="text-sm text-foreground">{conversationSummary}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 py-3 min-h-[200px] max-h-[400px]">
            {conversationLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading conversation...
                </div>
              </div>
            ) : conversationMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No messages found for this session</p>
              </div>
            ) : (
              conversationMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConversationDialogOpen(false)}
              className="rounded-full"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default BotDetails;
