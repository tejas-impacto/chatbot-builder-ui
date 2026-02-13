import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Bot, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LeadFormModal from "@/components/chat/LeadFormModal";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { VoiceWaveform } from "@/components/voice/VoiceWaveform";
import { VoiceControls } from "@/components/voice/VoiceControls";
import { TranscriptionDisplay } from "@/components/voice/TranscriptionDisplay";
import { createChatServerSession } from "@/lib/chatApi";
import { useToast } from "@/hooks/use-toast";
import type { UserInfo } from "@/types/chat";
import type { VoiceLeadInfo } from "@/lib/voiceApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PublicVoiceChat = () => {
  const { tenantId, botId } = useParams<{ tenantId: string; botId: string }>();
  const { toast } = useToast();

  const [botName, setBotName] = useState("Voice Assistant");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadInfo, setLeadInfo] = useState<VoiceLeadInfo | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Voice chat hook
  const {
    state,
    transcriptions,
    responses,
    audioLevel,
    startCall,
    endCall,
    toggleMute,
    interrupt,
    isConnecting,
  } = useVoiceChat({
    tenantId: tenantId || "",
    botId: botId || "",
    botName,
    onError: (error) => {
      toast({
        title: "Voice Chat Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  // Initialize - get bot config
  useEffect(() => {
    const init = async () => {
      if (!tenantId || !botId) {
        setInitError("Invalid chat link.");
        setIsInitializing(false);
        return;
      }

      try {
        const session = await createChatServerSession(tenantId, botId);
        setBotName(session.chatbot_config?.agent_name || "Voice Assistant");

        if (session.lead_form_required) {
          setShowLeadForm(true);
        }
      } catch (err) {
        console.error("Failed to initialize voice chat:", err);
        setInitError("Unable to start voice chat. Please check the link and try again.");
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [tenantId, botId]);

  const handleLeadFormSubmit = (userInfo: UserInfo) => {
    const voiceLeadInfo: VoiceLeadInfo = {
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      phone: userInfo.phone,
    };
    setLeadInfo(voiceLeadInfo);
    setShowLeadForm(false);
  };

  const handleToggleCall = async () => {
    if (state.isCallActive) {
      endCall();
    } else {
      await startCall(leadInfo || undefined);
    }
  };

  const handleEndSession = () => {
    if (state.isCallActive) {
      endCall();
    }
    setSessionEnded(true);
    setShowEndSessionDialog(false);
    toast({
      title: "Session Ended",
      description: "Your voice chat session has been ended.",
    });
  };

  const getStateBadge = () => {
    switch (state.currentState) {
      case "VOICE_STATE_LISTENING":
        return <Badge variant="default" className="bg-green-500">Listening</Badge>;
      case "VOICE_STATE_RECEIVING":
        return <Badge variant="default" className="bg-blue-500">Receiving</Badge>;
      case "VOICE_STATE_PROCESSING":
        return <Badge variant="default" className="bg-yellow-500">Processing</Badge>;
      case "VOICE_STATE_SPEAKING":
        return <Badge variant="default" className="bg-purple-500">Speaking</Badge>;
      default:
        return <Badge variant="secondary">Idle</Badge>;
    }
  };

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Starting voice chat...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (initError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Voice Chat Unavailable</h2>
          <p className="text-sm text-muted-foreground">{initError}</p>
        </div>
      </div>
    );
  }

  // Session ended state
  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-primary/5 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Bot className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Session Ended</h2>
          <p className="text-sm text-muted-foreground mb-6">Thank you for chatting with us!</p>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-full"
          >
            Start New Call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-primary/5 flex flex-col">
      {/* Top Logo Bar */}
      <header className="p-4 flex items-center justify-center border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <Bot className="w-7 h-7 text-foreground" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-pink rounded-full" />
          </div>
          <span className="text-lg font-bold text-primary">Agent Builder</span>
        </Link>
      </header>

      {/* Voice Chat Area - Centered */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl h-[75vh] border border-border rounded-2xl bg-background shadow-lg flex flex-col relative">
          {/* Lead Form Overlay */}
          {showLeadForm && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
              <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg mx-4">
                <LeadFormModal
                  onSubmit={handleLeadFormSubmit}
                  chatbotName={botName}
                />
              </div>
            </div>
          )}

          {/* Header */}
          <div className="p-4 border-b border-border rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{botName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {state.isConnected ? "Connected" : "Voice Chat"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {state.isCallActive && getStateBadge()}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEndSessionDialog(true)}
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="End session"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Transcription Display */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <TranscriptionDisplay
              transcriptions={transcriptions}
              responses={responses}
              currentState={state.currentState}
              className="h-full"
            />
          </div>

          {/* Waveform Visualization */}
          <div className="px-4 py-2 border-t border-border">
            <VoiceWaveform
              audioLevel={audioLevel}
              isActive={state.isCallActive && !state.isMuted}
              state={state.currentState}
              className="h-16"
            />
          </div>

          {/* Call Controls */}
          <div className="p-6 border-t border-border rounded-b-2xl">
            <VoiceControls
              isCallActive={state.isCallActive}
              isMuted={state.isMuted}
              isSpeaking={state.currentState === "VOICE_STATE_SPEAKING"}
              isConnecting={isConnecting}
              onToggleCall={handleToggleCall}
              onToggleMute={toggleMute}
              onInterrupt={interrupt}
            />
          </div>
        </div>
      </div>

      {/* End Session Confirmation Dialog */}
      <AlertDialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Voice Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this voice chat session? This will close the current conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PublicVoiceChat;
