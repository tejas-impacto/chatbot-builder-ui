import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Grid, HelpCircle, Home, FileText, Terminal, Link2, MessageCircle, Check, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StepStatus {
  id: number;
  title: string;
  icon: React.ElementType;
  status: "pending" | "done";
}

interface ActivityLog {
  time: string;
  message: string;
}

const BotCreationProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const agentName = location.state?.agentName || "AI Agent";
  
  const [isComplete, setIsComplete] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [steps, setSteps] = useState<StepStatus[]>([
    { id: 1, title: "Knowledge Base", icon: Grid, status: "pending" },
    { id: 2, title: "Conversation Style", icon: HelpCircle, status: "pending" },
    { id: 3, title: "Purpose Category", icon: Home, status: "pending" },
    { id: 4, title: "Persona & Voice", icon: FileText, status: "pending" },
    { id: 5, title: "Documents Upload", icon: FileText, status: "pending" },
  ]);

  const [activityLogs] = useState<ActivityLog[]>([
    { time: "10:23:45", message: "Answers submitted successfully" },
    { time: "10:23:48", message: "Incorporating answers into knowledge base" },
    { time: "10:24:12", message: "Building knowledge graph (Neo4j)" },
    { time: "10:24:35", message: "Storing document chunks (Milvus)" },
    { time: "10:24:58", message: "Finalizing chatbot setup" },
    { time: "10:25:02", message: "Chatbot creation complete!" },
  ]);

  const botSummary = {
    chatbotId: "bot_93ad297e",
    tenantId: "tenant_001",
    documentsProcessed: "2 (1 business, 1 personalized)",
    entitiesCreated: 12,
    relationshipsCreated: 11,
    chunksStored: 17,
  };

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setCurrentProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const stepTimers = steps.map((_, index) => {
      return setTimeout(() => {
        setSteps((prevSteps) =>
          prevSteps.map((step, i) =>
            i <= index ? { ...step, status: "done" as const } : step
          )
        );
      }, (index + 1) * 1000);
    });

    const completeTimer = setTimeout(() => {
      setIsComplete(true);
    }, 5500);

    return () => {
      clearInterval(progressInterval);
      stepTimers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, []);

  const handleStartChatting = () => {
    navigate("/manage-chatbot");
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-white">CHATBOT AI</span>
          </Link>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Go to Dashboard
          </Button>
        </header>

        {/* Success Content */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Success Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-emerald-400">Chatbot Created Successfully!</h1>
            </div>
            <p className="text-slate-400 ml-11">Your AI agent "{agentName}" is ready to go.</p>
          </div>

          {/* Bot Summary Card */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-400">Chatbot ID</span>
                <span className="text-cyan-400 font-mono">{botSummary.chatbotId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-400">Tenant ID</span>
                <span className="text-cyan-400 font-mono">{botSummary.tenantId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-400">Documents Processed</span>
                <span className="text-cyan-400">{botSummary.documentsProcessed}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-400">Entities Created (Neo4j)</span>
                <span className="text-cyan-400">{botSummary.entitiesCreated}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-slate-400">Relationships Created</span>
                <span className="text-cyan-400">{botSummary.relationshipsCreated}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Chunks Stored (Milvus)</span>
                <span className="text-cyan-400">{botSummary.chunksStored}</span>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              What would you like to do next?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* API Integration */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">API Integration</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4 flex-1">
                  Get curl commands to integrate chat functionality into your application.
                </p>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                  View Curl Commands
                </Button>
              </div>

              {/* Shareable Chat Link */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-white">Shareable Chat Link</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4 flex-1">
                  Generate a link with a pre-created session to share with others.
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  Generate Chat Link
                </Button>
              </div>

              {/* Start Chatting */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-pink-400" />
                  <h3 className="font-semibold text-white">Start Chatting</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4 flex-1">
                  Open the chat window here. You'll need to fill in your details first.
                </p>
                <Button 
                  onClick={handleStartChatting}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                >
                  Start Chatting
                </Button>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Activity Log
            </h2>
            <div className="space-y-3">
              {activityLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-mono">{log.time}</span>
                  </div>
                  <span className={`text-sm ${index === activityLogs.length - 1 ? 'text-emerald-400' : 'text-slate-300'}`}>
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
