import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RefreshCw, Bot, Settings2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { VoiceWaveform } from "@/components/voice/VoiceWaveform";
import { VoiceControls } from "@/components/voice/VoiceControls";
import { TranscriptionDisplay } from "@/components/voice/TranscriptionDisplay";
import { VOICE_OPTIONS, LANGUAGE_OPTIONS } from "@/types/voice";
import { useToast } from "@/hooks/use-toast";

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

  // Get bot info from location state or use defaults for testing
  const tenantId = locationState?.tenantId || localStorage.getItem("tenantId") || "";
  const botId = locationState?.botId || "";
  const botName = locationState?.botName || "Voice Assistant";

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
      await startCall();
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

        <main className="flex-1 overflow-auto flex flex-col">
          <DashboardHeader />

          <div className="p-6 flex-1 flex flex-col">
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

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Voice Chat Container */}
              <div className="lg:col-span-2 border border-border rounded-2xl bg-background flex flex-col min-h-[600px]">
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

                {/* Transcription Display */}
                <TranscriptionDisplay
                  transcriptions={transcriptions}
                  responses={responses}
                  currentState={state.currentState}
                  className="flex-1"
                />

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
              </div>

              {/* Voice Settings Panel */}
              <div className="border border-border rounded-2xl bg-background p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Voice Settings</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">Configure voice options before starting a call</p>

                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Voice</Label>
                    <Select
                      value={selectedVoice}
                      onValueChange={setSelectedVoice}
                      disabled={state.isCallActive}
                    >
                      <SelectTrigger className="mt-2 rounded-xl border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICE_OPTIONS.map((voice) => (
                          <SelectItem key={voice.value} value={voice.value}>
                            {voice.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">Language</Label>
                    <Select
                      value={selectedLanguage}
                      onValueChange={setSelectedLanguage}
                      disabled={state.isCallActive}
                    >
                      <SelectTrigger className="mt-2 rounded-xl border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-medium text-foreground mb-4">Session Info</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className="font-medium text-foreground">
                          {state.isCallActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Messages</span>
                        <span className="font-medium text-foreground">
                          {transcriptions.filter(t => t.isFinal).length + responses.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Microphone</span>
                        <span className={`font-medium ${state.isMuted ? "text-destructive" : "text-green-500"}`}>
                          {state.isMuted ? "Muted" : "Active"}
                        </span>
                      </div>
                      {state.sessionId && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Session ID</span>
                          <span className="font-medium text-foreground text-xs truncate max-w-[120px]" title={state.sessionId}>
                            {state.sessionId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-medium text-foreground mb-4">Bot Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Bot ID</span>
                        <span className="font-medium text-foreground text-xs truncate max-w-[120px]" title={botId}>
                          {botId || "Not selected"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tenant ID</span>
                        <span className="font-medium text-foreground text-xs truncate max-w-[120px]" title={tenantId}>
                          {tenantId || "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ManageVoicebot;
