import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RefreshCw, Bot, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { VoiceWaveform } from "@/components/voice/VoiceWaveform";
import { VoiceControls } from "@/components/voice/VoiceControls";
import { TranscriptionDisplay } from "@/components/voice/TranscriptionDisplay";
import LeadFormModal from "@/components/chat/LeadFormModal";
import { useToast } from "@/hooks/use-toast";
import type { VoiceLeadInfo } from "@/lib/voiceApi";
import type { UserInfo } from "@/types/chat";

interface LocationState {
  botId: string;
  tenantId: string;
  botName: string;
}

const ManageVoicebot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const locationState = location.state as LocationState | null;

  // Voice settings
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  // Lead form state
  const [showLeadForm, setShowLeadForm] = useState(true);
  const [leadInfo, setLeadInfo] = useState<VoiceLeadInfo | null>(null);

  // Get bot info from location state or use defaults for testing
  const tenantId = locationState?.tenantId || localStorage.getItem("tenantId") || "";
  const botId = locationState?.botId || "";
  const botName = locationState?.botName || "Voice Assistant";

  // Load voice settings from localStorage (configured in BotDetails)
  useEffect(() => {
    if (botId) {
      const savedVoice = localStorage.getItem(`voice_settings_${botId}_voice`);
      const savedLanguage = localStorage.getItem(`voice_settings_${botId}_language`);
      if (savedVoice) setSelectedVoice(savedVoice);
      if (savedLanguage) setSelectedLanguage(savedLanguage);
    }
  }, [botId]);

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
    tenantId,
    botId,
    botName,
    voice: selectedVoice,
    language: selectedLanguage,
    onError: (error) => {
      toast({
        title: "Voice Chat Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  const handleResetChat = () => {
    if (state.isCallActive) {
      endCall();
    }
    // Reset lead form to show again
    setShowLeadForm(true);
    setLeadInfo(null);
  };

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
      if (!botId) {
        toast({
          title: "No Bot Selected",
          description: "Please select a voicebot to start a conversation.",
          variant: "destructive",
        });
        return;
      }
      if (!leadInfo) {
        toast({
          title: "Lead Information Required",
          description: "Please fill out your information first.",
          variant: "destructive",
        });
        return;
      }
      await startCall(leadInfo);
    }
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5">
        <DashboardSidebar />

        <main className="flex-1 flex flex-col">
          <DashboardHeader />

          <div className="p-6 flex-1">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Voice Chat Interface</h1>
                  <p className="text-muted-foreground">
                    {botName ? `Testing: ${botName}` : "Select a voicebot to start"}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleResetChat}
                variant="outline"
                className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                disabled={!state.isCallActive}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                End & Reset
              </Button>
            </div>

            {/* No Bot Warning */}
            {!botId && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No voicebot selected. Please go back and select a voicebot to test, or navigate from the Bots Available page.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Display */}
            {state.error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {/* Voice Chat Container - Full Width */}
            <div className="max-w-4xl mx-auto">
              <div className="border border-border rounded-2xl bg-background flex flex-col h-[calc(100vh-160px)] min-h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{botName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {state.isConnected ? "Connected" : "Not connected"}
                        </p>
                      </div>
                    </div>
                    {getStateBadge()}
                  </div>
                </div>

                {/* Lead Form or Chat Content */}
                {showLeadForm ? (
                  <div className="flex-1 flex items-center justify-center p-6">
                    <Card className="w-full max-w-md">
                      <CardContent className="p-0">
                        <LeadFormModal
                          onSubmit={handleLeadFormSubmit}
                          chatbotName={botName}
                        />
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <>
                    {/* Transcription Display - scrollable area */}
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
                    <div className="p-6 border-t border-border">
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
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ManageVoicebot;
