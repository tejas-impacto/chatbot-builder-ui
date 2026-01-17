import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bot, Loader2, Sparkles, Brain, Settings, CheckCircle2, XCircle } from "lucide-react";

const stages = [
  { id: 1, label: "Initializing", icon: Loader2, description: "Setting up your AI agent..." },
  { id: 2, label: "Training with business data", icon: Brain, description: "Training in progress..." },
  { id: 3, label: "Configuring persona", icon: Sparkles, description: "Applying personality settings..." },
  { id: 4, label: "Finalizing setup", icon: Settings, description: "Almost there..." },
];

const BotCreationProgress = () => {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  useEffect(() => {
    if (isCancelled) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2;
        
        // Update stage based on progress
        if (newProgress >= 25 && currentStage < 1) setCurrentStage(1);
        if (newProgress >= 50 && currentStage < 2) setCurrentStage(2);
        if (newProgress >= 75 && currentStage < 3) setCurrentStage(3);
        
        if (newProgress >= 100) {
          setIsComplete(true);
          clearInterval(interval);
          // Auto-navigate to dashboard after completion
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
          return 100;
        }
        return newProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [navigate, currentStage, isCancelled]);

  const handleCancel = () => {
    setIsCancelled(true);
    navigate("/bot-creation");
  };

  const handlePause = () => {
    setIsCancelled(true);
  };

  const handleResume = () => {
    setIsCancelled(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-primary/5 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-6 py-12">
        {/* Animated Bot Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
              <Bot className="w-12 h-12 text-primary" />
            </div>
            {!isComplete && !isCancelled && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-spin">
                <Loader2 className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            {isComplete && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            )}
            {isCancelled && !isComplete && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isComplete ? "Your AI Agent is Ready!" : isCancelled ? "Creation Paused" : "Creating Your AI Agent"}
          </h1>
          <p className="text-muted-foreground">
            {isComplete
              ? "Redirecting to dashboard..."
              : isCancelled
              ? "You can resume or cancel the process"
              : "Please wait while we set everything up"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full" />
        </div>

        {/* Stages */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-8">
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const StageIcon = stage.icon;
              const isActive = index === currentStage && !isComplete;
              const isCompleted = index < currentStage || isComplete;
              
              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                    isActive ? "bg-primary/10 border border-primary/20" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isActive ? (
                      <StageIcon className={`w-5 h-5 ${stage.id === 1 || stage.id === 2 ? "animate-spin" : ""}`} />
                    ) : (
                      <StageIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isActive || isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {stage.label}
                    </p>
                    {isActive && (
                      <p className="text-sm text-muted-foreground animate-pulse">{stage.description}</p>
                    )}
                  </div>
                  {isCompleted && (
                    <span className="text-xs text-green-600 font-medium">Complete</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Message */}
        {!isComplete && (
          <div className="text-center mb-8">
            <p className="text-muted-foreground">
              {isCancelled ? "Process paused" : stages[currentStage]?.description}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {!isComplete && (
          <div className="flex justify-center gap-4">
            {isCancelled ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="rounded-full px-6"
                >
                  Cancel Creation
                </Button>
                <Button
                  onClick={handleResume}
                  className="rounded-full px-6 bg-primary hover:bg-primary/90"
                >
                  Resume
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="rounded-full px-6"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePause}
                  className="rounded-full px-6"
                >
                  Pause
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BotCreationProgress;