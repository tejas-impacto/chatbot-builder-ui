import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Grid, HelpCircle, Home, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StepStatus {
  id: number;
  title: string;
  icon: React.ElementType;
  status: "pending" | "done";
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

  useEffect(() => {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setCurrentProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Update steps sequentially
    const stepTimers = steps.map((_, index) => {
      return setTimeout(() => {
        setSteps((prevSteps) =>
          prevSteps.map((step, i) =>
            i <= index ? { ...step, status: "done" as const } : step
          )
        );
      }, (index + 1) * 1000);
    });

    // Complete after all steps
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
    }, 5500);

    return () => {
      clearInterval(progressInterval);
      stepTimers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, []);

  const handleStartUsing = () => {
    navigate("/dashboard");
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50/30 via-background to-amber-50/20">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary">CHATBOT AI</span>
          </Link>
        </header>

        {/* Success Card */}
        <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
          <div className="w-full max-w-lg bg-card rounded-2xl border border-border shadow-lg p-12 text-center">
            {/* Happy Robot */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-28 h-20 bg-foreground rounded-2xl flex items-center justify-center relative">
                  {/* Eyes */}
                  <div className="flex gap-4">
                    <div className="w-4 h-4 bg-background rounded-full" />
                    <div className="w-4 h-4 bg-background rounded-full" />
                  </div>
                  {/* Smile */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-4 border-b-4 border-background rounded-b-full" />
                </div>
                {/* Antenna */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-4 bg-foreground" />
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full" />
                {/* Decorative lines */}
                <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                  <div className="flex flex-col gap-1">
                    <div className="w-8 h-1.5 bg-primary rounded-full" />
                    <div className="w-8 h-1.5 bg-pink-400 rounded-full" />
                    <div className="w-8 h-1.5 bg-cyan-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-3">Agent Ready!</h1>
            <p className="text-muted-foreground mb-8">
              Your AI chatbot <span className="font-semibold text-primary">"{agentName}"</span> is ready
            </p>

            <Button
              onClick={handleStartUsing}
              className="w-full rounded-full py-6 text-lg bg-primary hover:bg-primary/90"
            >
              Start Using
            </Button>
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
