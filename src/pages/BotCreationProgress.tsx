import { useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Check, X, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useBotCreationWebSocket, type ProgressData, type StatusDetails, type ClarificationRequest } from "@/hooks/useBotCreationWebSocket";
import { ClarificationQuestionDialog } from "@/components/bot-creation/ClarificationQuestionDialog";
import { cancelBotCreation, deleteBot } from "@/lib/botApi";
import { SessionExpiredError, logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface BotConfig {
  company_overview: string;
  product_features: string;
  customer_faqs: string;
  conversation_style: {
    chat_length: string;
    chat_guidelines: string;
    voice_length: string;
    voice_guidelines: string;
  };
  purpose_category: string;
  persona: string;
  tone_of_voice: string;
  agent_name: string;
  channelType?: 'VOICE' | 'TEXT';
}

interface LocationState {
  botId?: string;
  ticket?: string;
  sessionId?: string;
  agentName?: string;
  tenantId?: string;
  documentsUploaded?: number;
  botConfig?: BotConfig;
  // Legacy fields for backwards compatibility
  sessionToken?: string;
  chatbotName?: string;
  demoMode?: boolean;
}

const BotCreationProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = (location.state as LocationState) || {};

  // Get botId from state
  const botId = state.botId || "";
  const ticket = state.ticket || "";
  const agentName = state.agentName || state.chatbotName || "AI Agent";
  const tenantId = state.tenantId || localStorage.getItem('tenantId') || "";
  const hasWebSocketConnection = !!(state.botId && state.ticket);
  const botConfig = state.botConfig || null;

  const [isComplete, setIsComplete] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("Initializing...");
  const [stageDisplay, setStageDisplay] = useState("Getting Started");
  const [stageIcon, setStageIcon] = useState("🚀");
  const [statusDetails, setStatusDetails] = useState<StatusDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Clarification question state
  const [clarificationRequest, setClarificationRequest] = useState<ClarificationRequest | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // WebSocket progress handler
  const handleProgress = useCallback((data: ProgressData) => {
    setCurrentProgress(data.progress);
    setCurrentStatus(data.message);
    setStageDisplay(data.stageDisplay);
    setStageIcon(data.stageIcon);
    setStatusDetails(data.details || null);
  }, []);

  // WebSocket complete handler
  const handleComplete = useCallback(() => {
    setCurrentProgress(100);
    setCurrentStatus("Complete!");
    setStageDisplay("All Done!");
    setStageIcon("🎉");
    setIsComplete(true);
  }, []);

  // WebSocket error handler
  const handleError = useCallback((err: string) => {
    setError(err);
    toast({
      title: "Error",
      description: err,
      variant: "destructive",
    });
  }, [toast]);

  // Clarification request handler
  const handleClarificationRequest = useCallback((data: ClarificationRequest) => {
    setClarificationRequest(data);
    // Update stage display to show we're waiting for input
    setStageDisplay("Clarification Needed");
    setStageIcon("💬");
    setCurrentStatus("Please answer the questions to continue");
  }, []);

  // Connect to WebSocket if we have the necessary data
  const { isConnected, sendClarificationResponse } = useBotCreationWebSocket(
    hasWebSocketConnection ? botId : null,
    hasWebSocketConnection ? ticket : null,
    botConfig,
    handleProgress,
    handleComplete,
    handleError,
    handleClarificationRequest
  );

  // Handle clarification answer submission
  const handleSubmitClarificationAnswer = useCallback((answers: Record<string, string>) => {
    setIsSubmittingAnswer(true);
    sendClarificationResponse(answers);

    // Clear the clarification request and resume normal display
    setClarificationRequest(null);
    setIsSubmittingAnswer(false);
    setStageDisplay("Processing...");
    setStageIcon("⏳");
    setCurrentStatus("Processing your answers...");
  }, [sendClarificationResponse]);

  // Cancel bot creation and delete the bot
  const handleCancel = async () => {
    if (!botId) {
      navigate('/dashboard');
      return;
    }

    setIsCancelling(true);
    try {
      // First cancel the bot creation session
      await cancelBotCreation(botId);

      // Then delete the bot completely
      if (tenantId) {
        await deleteBot(botId, tenantId);
      }

      toast({
        title: "Cancelled",
        description: "Bot creation has been cancelled and bot deleted.",
      });
      navigate('/dashboard');
    } catch (e) {
      // Handle session expiration gracefully
      if (e instanceof SessionExpiredError) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        logout();
        return;
      }
      console.error('Failed to cancel:', e);
      // Navigate anyway
      navigate('/dashboard');
    }
  };

  // Navigate to appropriate interface based on bot type
  const handleStartChatting = () => {
    const isVoiceBot = botConfig?.channelType === 'VOICE';
    const targetRoute = isVoiceBot ? "/manage-voicebot" : "/manage-chatbot";

    navigate(targetRoute, {
      state: {
        botId: botId,
        chatbotName: agentName,
        tenantId,
        showLeadForm: true,
      },
    });
  };

  // Success screen
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
            {botConfig?.channelType === 'VOICE' ? 'Voice Bot' : 'Chatbot'} Created Successfully!
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
  if (error) {
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
              onClick={() => navigate('/bot-creation')}
              className="rounded-full px-6"
            >
              Try Again
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
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
        <Button
          variant="outline"
          onClick={handleCancel}
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
      </header>

      {/* Progress Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
        <div className="w-full max-w-md">
          {/* Connection Status */}
          {hasWebSocketConnection && (
            <div className="mb-6 text-center">
              <span className={`inline-flex items-center gap-2 text-sm ${isConnected ? 'text-green-500' : 'text-muted-foreground'}`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-muted-foreground animate-pulse'}`} />
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          )}

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
              <Progress value={currentProgress} className="h-3" />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-muted-foreground">{currentProgress}%</span>
                {statusDetails?.total && (
                  <span className="text-sm text-muted-foreground">
                    {statusDetails.completed || 0}/{statusDetails.total} chunks
                  </span>
                )}
              </div>
            </div>

            {/* Current Status Message */}
            <p className="text-center text-muted-foreground mb-4">
              {currentStatus || "Creating your AI agent..."}
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
        onSubmit={handleSubmitClarificationAnswer}
        isSubmitting={isSubmittingAnswer}
      />
    </div>
  );
};

export default BotCreationProgress;
