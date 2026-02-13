import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Check, X, Loader2, Minimize2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ClarificationQuestionDialog } from "@/components/bot-creation/ClarificationQuestionDialog";
import { useBotCreation } from "@/contexts/BotCreationContext";

const BotCreationProgress = () => {
  const navigate = useNavigate();

  const {
    status,
    isConnected,
    isMinimized,
    progress,
    currentMessage,
    stageDisplay,
    stageIcon,
    statusDetails,
    error,
    session,
    clarificationRequest,
    isCancelling,
    isSubmittingAnswer,
    expand,
    setExpanded,
    minimize,
    dismiss,
    cancelSession,
    sendClarificationResponse,
  } = useBotCreation();

  const agentName = session?.agentName || "AI Agent";
  const botId = session?.botId || "";
  const botConfig = session?.botConfig || null;
  const tenantId = session?.tenantId || "";

  // On mount, mark as expanded (not minimized) without re-navigating
  useEffect(() => {
    if (status !== 'idle' && isMinimized) {
      setExpanded();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If no active session, redirect to dashboard
  useEffect(() => {
    if (status === 'idle') {
      navigate('/dashboard', { replace: true });
    }
  }, [status, navigate]);

  if (status === 'idle') {
    return null;
  }

  const handleMinimize = () => {
    minimize();
    navigate('/dashboard');
  };

  // Navigate to appropriate interface based on bot type
  const handleStartChatting = () => {
    const isVoiceBot = (botConfig as any)?.channelType === 'VOICE';
    const targetRoute = isVoiceBot ? "/manage-voicebot" : "/manage-chatbot";

    dismiss();
    navigate(targetRoute, {
      state: {
        botId: botId,
        chatbotName: agentName,
        tenantId,
        showLeadForm: botConfig?.lead_capture?.is_lead_capture_required ?? false,
      },
    });
  };

  // Success screen
  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="w-12 h-12 text-green-500" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {(botConfig as any)?.channelType === 'VOICE' ? 'Voice Bot' : 'Chatbot'} Created Successfully!
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

  // Error screen
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          {/* Error Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <X className="w-12 h-12 text-destructive" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-8">
            {error}
          </p>

          {/* Retry/Back Button */}
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => { dismiss(); navigate('/bot-creation'); }}
              className="rounded-full px-6"
            >
              Try Again
            </Button>
            <Button
              onClick={() => { dismiss(); navigate('/dashboard'); }}
              className="rounded-full px-6"
            >
              Back to Dashboard
            </Button>
          </div>
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
          <span className="text-lg font-bold text-primary">Agent Builder</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleMinimize}
            className="rounded-full"
          >
            <Minimize2 className="w-4 h-4 mr-2" />
            Minimize
          </Button>
          <Button
            variant="outline"
            onClick={cancelSession}
            disabled={isCancelling}
            className="rounded-full"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Progress Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="w-full max-w-md">
          {/* Connection Status */}
          <div className="mb-6 text-center">
            <span className={`inline-flex items-center gap-2 text-sm ${isConnected ? 'text-green-500' : 'text-muted-foreground'}`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-muted-foreground animate-pulse'}`} />
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>

          {/* Dynamic Status Card */}
          <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
            {/* Stage Icon */}
            <div className="text-center mb-6">
              <span className="text-6xl">{stageIcon}</span>
            </div>

            {/* Stage Display */}
            <h2 className="text-xl font-bold text-center text-foreground mb-6">
              {stageDisplay}
            </h2>

            {/* Progress Bar */}
            <div className="mb-6">
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-muted-foreground">{progress}%</span>
                {statusDetails?.total && (
                  <span className="text-sm text-muted-foreground">
                    {statusDetails.completed || 0}/{statusDetails.total} chunks
                  </span>
                )}
              </div>
            </div>

            {/* Current Status Message */}
            <p className="text-center text-muted-foreground mb-4">
              {currentMessage || "Creating your AI agent..."}
            </p>

            {/* Document Name (if available) */}
            {statusDetails?.document && (
              <p className="text-center text-sm text-muted-foreground/70 truncate">
                📄 {statusDetails.document}
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Clarification Question Dialog */}
      <ClarificationQuestionDialog
        open={!!clarificationRequest}
        clarificationRequest={clarificationRequest}
        onSubmit={sendClarificationResponse}
        isSubmitting={isSubmittingAnswer}
      />
    </div>
  );
};

export default BotCreationProgress;
