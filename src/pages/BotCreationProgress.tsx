import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Grid, HelpCircle, Home, FileText, Terminal, Link2, MessageCircle, Check, Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface StepStatus {
  id: number;
  title: string;
  icon: React.ElementType;
  status: "pending" | "done" | "error";
}

interface LocationState {
  sessionToken?: string;
  chatbotId?: string;
  chatbotName?: string;
  tenantId?: string;
  documentsUploaded?: number;
  agentName?: string;
  demoMode?: boolean;
  wsUrl?: string;
  formData?: Record<string, unknown>;
  files?: File[];
}

interface ActivityLog {
  time: string;
  message: string;
  type?: "info" | "success" | "error";
}

interface BotSummary {
  chatbotId: string;
  tenantId: string;
  documentsProcessed: string;
  entitiesCreated: number;
  relationshipsCreated: number;
  chunksStored: number;
}

interface WebSocketMessage {
  type?: string;
  event?: string;
  status?: string;
  step?: number;
  progress?: number;
  percentage?: number;
  message?: string;
  msg?: string;
  stage?: string;
  stage_display?: string;
  stage_icon?: string;
  current_step?: number;
  total_steps?: number;
  details?: unknown;
  data?: {
    documentsProcessed?: string;
    entitiesCreated?: number;
    relationshipsCreated?: number;
    chunksStored?: number;
    progress?: number;
    step?: number;
    message?: string;
  };
}

const BotCreationProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = (location.state as LocationState) || {};

  // Extract data from navigation state
  const agentName = state.agentName || state.chatbotName || "AI Agent";
  const chatbotId = state.chatbotId || "demo-chatbot";
  const tenantId = state.tenantId || localStorage.getItem('tenantId') || "";
  const sessionToken = state.sessionToken;
  const isDemoMode = state.demoMode || !sessionToken;
  const wsUrl = state.wsUrl || "";
  const files = state.files || [];

  const wsRef = useRef<WebSocket | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [steps, setSteps] = useState<StepStatus[]>([
    { id: 1, title: "Knowledge Base", icon: Grid, status: "pending" },
    { id: 2, title: "Conversation Style", icon: HelpCircle, status: "pending" },
    { id: 3, title: "Purpose Category", icon: Home, status: "pending" },
    { id: 4, title: "Persona & Voice", icon: FileText, status: "pending" },
    { id: 5, title: "Documents Upload", icon: FileText, status: "pending" },
  ]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [botSummary, setBotSummary] = useState<BotSummary>({
    chatbotId: chatbotId,
    tenantId: tenantId,
    documentsProcessed: "0",
    entitiesCreated: 0,
    relationshipsCreated: 0,
    chunksStored: 0,
  });

  const addLog = useCallback((message: string, type: "info" | "success" | "error" = "info") => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    setActivityLogs(prev => [...prev, { time, message, type }]);
  }, []);

  const updateStepStatus = useCallback((stepIndex: number, status: "pending" | "done" | "error") => {
    setSteps(prevSteps =>
      prevSteps.map((step, i) =>
        i === stepIndex ? { ...step, status } : step
      )
    );
  }, []);

  // WebSocket connection and message handling
  useEffect(() => {
    if (!wsUrl) {
      // Fallback to simulation if no WebSocket URL provided
      addLog("No WebSocket URL provided, running in simulation mode", "info");
      const cleanup = runSimulation();
      return cleanup;
    }

    addLog("Connecting to server...", "info");

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      addLog("Connected to server", "success");
      addLog("Waiting for bot creation progress...", "info");
      // Bot was already created via POST /api/v1/bots
      // WebSocket is used to receive progress updates only
    };

    ws.onmessage = (event) => {
      try {
        console.log("Raw WebSocket data:", event.data);
        const message = JSON.parse(event.data);
        console.log("Parsed WebSocket message:", message);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
        // Try to handle as plain text message
        addLog(String(event.data), "info");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      addLog("Connection error occurred", "error");
      setHasError(true);
      setErrorMessage("Failed to connect to the server. Please try again.");
      toast({
        title: "Connection Error",
        description: "Failed to connect to the chatbot creation service.",
        variant: "destructive",
      });
    };

    ws.onclose = (event) => {
      if (!isComplete && !hasError) {
        addLog(`Connection closed (code: ${event.code})`, "info");
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log("WebSocket message received:", message);

    // Extract values from various possible field names
    const messageType = message.type || message.event || message.status || "";
    const progressValue = message.progress ?? message.percentage ?? message.data?.progress;
    const messageText = message.message || message.msg || message.data?.message;
    const stepValue = message.step ?? message.current_step ?? message.data?.step;

    // Update progress if available
    if (progressValue !== undefined) {
      setCurrentProgress(progressValue);
      // Auto-update steps based on progress percentage
      const completedSteps = Math.floor((progressValue / 100) * steps.length);
      for (let i = 0; i < completedSteps; i++) {
        updateStepStatus(i, "done");
      }
    }

    // Log any message
    if (messageText) {
      addLog(messageText, "info");
    }

    // Handle specific message types
    const typeNormalized = messageType.toLowerCase();

    if (typeNormalized.includes("error") || typeNormalized === "failed") {
      setHasError(true);
      setErrorMessage(messageText || "An error occurred during chatbot creation.");
      addLog(messageText || "Error occurred", "error");
      toast({
        title: "Error",
        description: messageText || "An error occurred during chatbot creation.",
        variant: "destructive",
      });
      return;
    }

    if (typeNormalized.includes("complete") || typeNormalized === "done" || typeNormalized === "finished" || typeNormalized === "success") {
      setCurrentProgress(100);
      steps.forEach((_, index) => updateStepStatus(index, "done"));
      if (message.data) {
        setBotSummary(prev => ({
          ...prev,
          documentsProcessed: message.data?.documentsProcessed || prev.documentsProcessed,
          entitiesCreated: message.data?.entitiesCreated || prev.entitiesCreated,
          relationshipsCreated: message.data?.relationshipsCreated || prev.relationshipsCreated,
          chunksStored: message.data?.chunksStored || prev.chunksStored,
        }));
      }
      addLog("Chatbot creation complete!", "success");
      setIsComplete(true);
      return;
    }

    if (typeNormalized.includes("step") && stepValue !== undefined) {
      updateStepStatus(stepValue - 1, "done");
      addLog(`Step ${stepValue} completed: ${steps[stepValue - 1]?.title}`, "success");
      return;
    }

    // Handle stage-based progress
    if (message.stage) {
      const stageNormalized = message.stage.toLowerCase();
      if (stageNormalized === "completed" || stageNormalized === "complete" || stageNormalized === "done") {
        setCurrentProgress(100);
        steps.forEach((_, index) => updateStepStatus(index, "done"));
        addLog("Chatbot creation complete!", "success");
        setIsComplete(true);
      }
    }

    // If no specific type matched but we have data, just log it
    if (!messageType && !progressValue && !messageText) {
      console.log("Unhandled message format:", message);
    }
  }, [addLog, updateStepStatus, steps, toast]);

  // Simulation fallback when no WebSocket
  const runSimulation = useCallback(() => {
    const progressInterval = setInterval(() => {
      setCurrentProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const simulationLogs = [
      { delay: 500, message: "Answers submitted successfully" },
      { delay: 1500, message: "Incorporating answers into knowledge base" },
      { delay: 2500, message: "Building knowledge graph (Neo4j)" },
      { delay: 3500, message: "Storing document chunks (Milvus)" },
      { delay: 4500, message: "Finalizing chatbot setup" },
      { delay: 5000, message: "Chatbot creation complete!" },
    ];

    const logTimers = simulationLogs.map(({ delay, message }) => {
      return setTimeout(() => addLog(message, delay === 5000 ? "success" : "info"), delay);
    });

    const stepTimers = steps.map((_, index) => {
      return setTimeout(() => {
        updateStepStatus(index, "done");
      }, (index + 1) * 1000);
    });

    const completeTimer = setTimeout(() => {
      setBotSummary(prev => ({
        ...prev,
        documentsProcessed: `${files.length} documents`,
        entitiesCreated: 12,
        relationshipsCreated: 11,
        chunksStored: 17,
      }));
      setIsComplete(true);
    }, 5500);

    return () => {
      clearInterval(progressInterval);
      logTimers.forEach(clearTimeout);
      stepTimers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [addLog, updateStepStatus, files.length, steps]);

  const handleStartChatting = () => {
    navigate("/manage-chatbot", {
      state: {
        sessionToken,
        chatbotId,
        chatbotName: agentName,
        tenantId,
        showLeadForm: true,
        demoMode: isDemoMode,
      },
    });
  };

  const handleRetry = () => {
    navigate("/bot-creation");
  };

  // Error state UI
  if (hasError) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary">CHATBOT AI</span>
          </Link>
        </header>

        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Creation Failed</h1>
            <p className="text-muted-foreground mb-6">{errorMessage}</p>

            {/* Activity Log for debugging */}
            {activityLogs.length > 0 && (
              <div className="bg-card rounded-xl border border-border shadow-sm p-4 mb-6 text-left">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Activity Log
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activityLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground font-mono text-xs">{log.time}</span>
                      <span className={log.type === "error" ? "text-red-500" : "text-foreground"}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
              <Button onClick={handleRetry} className="bg-primary hover:bg-primary/90">
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary">CHATBOT AI</span>
          </Link>
        </header>

        {/* Success Content */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Success Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-emerald-600">Chatbot Created Successfully!</h1>
            </div>
            <p className="text-muted-foreground ml-11">Your AI agent "{agentName}" is ready to go.</p>
          </div>

          {/* Bot Summary Card */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 mb-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Chatbot ID</span>
                <span className="text-primary font-mono">{botSummary.chatbotId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Tenant ID</span>
                <span className="text-primary font-mono">{botSummary.tenantId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Documents Processed</span>
                <span className="text-primary">{botSummary.documentsProcessed}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Entities Created (Neo4j)</span>
                <span className="text-primary">{botSummary.entitiesCreated}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Relationships Created</span>
                <span className="text-primary">{botSummary.relationshipsCreated}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Chunks Stored (Milvus)</span>
                <span className="text-primary">{botSummary.chunksStored}</span>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              What would you like to do next?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* API Integration */}
              <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">API Integration</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Get curl commands to integrate chat functionality into your application.
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  View Curl Commands
                </Button>
              </div>

              {/* Shareable Chat Link */}
              <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Shareable Chat Link</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Generate a link with a pre-created session to share with others.
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Generate Chat Link
                </Button>
              </div>

              {/* Start Chatting */}
              <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Start Chatting</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  Open the chat window here. You'll need to fill in your details first.
                </p>
                <Button
                  onClick={handleStartChatting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Start Chatting
                </Button>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Activity Log
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {activityLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {log.type === "error" ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span className="text-xs font-mono">{log.time}</span>
                  </div>
                  <span className={`text-sm ${
                    log.type === "success" ? 'text-emerald-600' :
                    log.type === "error" ? 'text-red-500' :
                    'text-foreground'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-primary">CHATBOT AI</span>
        </Link>
      </header>

      {/* Progress Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="w-full max-w-md">
          {/* Steps List */}
          <div className="space-y-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    step.status === "done" ? "bg-card shadow-md" : "bg-transparent"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step.status === "done"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Step {step.id}</span>
                      {step.status === "done" && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full">
                          Done
                        </span>
                      )}
                    </div>
                    <h3 className={`font-semibold ${
                      step.status === "done" ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {step.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <Progress value={currentProgress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              Creating your AI agent...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BotCreationProgress;
