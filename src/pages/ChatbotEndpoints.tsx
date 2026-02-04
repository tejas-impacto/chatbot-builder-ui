import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Copy, Check, ArrowLeft, Terminal, Code, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";

interface LocationState {
  botId?: string;
  chatbotName?: string;
  tenantId?: string;
}

const CHAT_SERVER_URL = "http://172.16.0.99:8002";

const ChatbotEndpoints = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = (location.state as LocationState) || {};

  const botId = state.botId || localStorage.getItem('botId') || "demo-chatbot";
  const chatbotName = state.chatbotName || "AI Agent";
  const tenantId = state.tenantId || localStorage.getItem('tenantId') || "";

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      toast({
        title: "Copied!",
        description: "Copied to clipboard",
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const endpoints = [
    {
      key: "leadForm",
      title: "Lead Form API",
      method: "POST",
      url: `${CHAT_SERVER_URL}/chat/${tenantId}/${botId}/lead-form`,
      description: "Submit user information before starting a chat session",
      curl: `curl -X POST '${CHAT_SERVER_URL}/chat/${tenantId}/${botId}/lead-form' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "session_id": "your_session_id",
    "user_info": {
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890"
    }
  }'`,
    },
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
    {
      key: "session",
      title: "Create Session API",
      method: "POST",
      url: `/api/v1/chat/sessions`,
      description: "Create a new chat session (requires authentication)",
      curl: `curl -X POST '/api/v1/chat/sessions' \\
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "botId": "${botId}",
    "channelType": "TEXT",
    "metadata": {}
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
                  <h1 className="text-2xl font-bold text-foreground">API Endpoints</h1>
                </div>
                <p className="text-muted-foreground ml-12">
                  Integration endpoints for "{chatbotName}"
                </p>
              </div>
            </div>

            {/* Chatbot Info */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  Chatbot Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Chatbot ID</p>
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-foreground">{botId}</code>
                      <button
                        onClick={() => handleCopy(botId, "botId")}
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
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Tenant ID</p>
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

            {/* API Endpoints */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                API Endpoints
              </h2>

              {endpoints.map((endpoint) => (
                <Card key={endpoint.key} className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{endpoint.title}</CardTitle>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                        {endpoint.method}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* URL */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Endpoint URL</p>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <code className="flex-1 text-sm font-mono text-foreground break-all">
                          {endpoint.url}
                        </code>
                        <button
                          onClick={() => handleCopy(endpoint.url, `${endpoint.key}-url`)}
                          className="p-1.5 hover:bg-muted rounded flex-shrink-0"
                        >
                          {copiedField === `${endpoint.key}-url` ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Curl Command */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">cURL Command</p>
                        <button
                          onClick={() => handleCopy(endpoint.curl, `${endpoint.key}-curl`)}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {copiedField === `${endpoint.key}-curl` ? (
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
                      <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-lg text-xs overflow-x-auto">
                        <code>{endpoint.curl}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Widget Embed Code */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  Widget Embed Code
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add this script to your website to embed the chatbot widget
                </p>
              </CardHeader>
              <CardContent>
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
                <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-lg text-xs overflow-x-auto">
                  <code>{widgetCode}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ChatbotEndpoints;
