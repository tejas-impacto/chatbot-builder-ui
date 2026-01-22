import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Grid, HelpCircle, Home, FileText, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StepStatus {
  id: number;
  title: string;
  icon: React.ElementType;
  status: "pending" | "done";
}

interface LocationState {
  sessionToken?: string;
  chatbotId?: string;
  chatbotName?: string;
  tenantId?: string;
  documentsUploaded?: number;
  agentName?: string;
  demoMode?: boolean;
}

const BotCreationProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const agentName = state.agentName || state.chatbotName || "AI Agent";
  const chatbotId = state.chatbotId || "demo-chatbot";
  const tenantId = state.tenantId || localStorage.getItem('tenantId') || "";
  const sessionToken = state.sessionToken;
  const isDemoMode = state.demoMode || !sessionToken;

  const [isComplete, setIsComplete] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [steps, setSteps] = useState<StepStatus[]>([
    { id: 1, title: "Knowledge Base", icon: Grid, status: "pending" },
    { id: 2, title: "Conversation Style", icon: HelpCircle, status: "pending" },
    { id: 3, title: "Purpose Category", icon: Home, status: "pending" },
    { id: 4, title: "Persona & Voice", icon: FileText, status: "pending" },
    { id: 5, title: "Documents Upload", icon: FileText, status: "pending" },
  ]);

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

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="w-12 h-12 text-green-500" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Chatbot Created Successfully!
          </h1>
          <p className="text-muted-foreground mb-8">
            Your AI agent "{agentName}" is ready to go.
          </p>

          {/* Single Action Button */}
          <Button
            onClick={handleStartChatting}
            className="rounded-full px-8 bg-primary hover:bg-primary/90"
          >
            Go Explore!
          </Button>
        </div>
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
