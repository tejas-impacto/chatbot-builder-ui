import { useState } from "react";
import { RefreshCw, Bot, Phone, Volume2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  time: string;
}

const ManageVoicebot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your voice assistant. Click the call button to start a conversation.", sender: "bot", time: "10:00 AM" },
    { id: 2, text: "Voice call connected. How can I help you today?", sender: "bot", time: "10:00 AM" }
  ]);
  const [voiceSpeed, setVoiceSpeed] = useState([50]);
  const [voicePitch, setVoicePitch] = useState([50]);
  const [isCallActive, setIsCallActive] = useState(false);

  const handleResetChat = () => {
    setMessages([
      { id: 1, text: "Hello! I'm your voice assistant. Click the call button to start a conversation.", sender: "bot", time: "10:00 AM" }
    ]);
    setIsCallActive(false);
  };

  const toggleCall = () => {
    setIsCallActive(!isCallActive);
    if (!isCallActive) {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Voice call connected. How can I help you today?",
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
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
              <div>
                <h1 className="text-2xl font-bold text-foreground">Demo Voice Chat Interface</h1>
                <p className="text-muted-foreground">Test your voice bot with this interactive demo</p>
              </div>
              <Button 
                onClick={handleResetChat}
                variant="outline" 
                className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Chat
              </Button>
            </div>

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Voice Chat Container */}
              <div className="lg:col-span-2 border border-border rounded-2xl bg-background flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Voice Conversation</h3>
                      <p className="text-sm text-muted-foreground">Interactive voice chat demonstration</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className="flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="max-w-[70%]">
                        <div className="p-3 rounded-2xl bg-muted">
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Call Controls */}
                <div className="p-6 border-t border-border">
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full w-12 h-12"
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                    <Button 
                      onClick={toggleCall}
                      size="icon" 
                      className={`rounded-full w-14 h-14 ${
                        isCallActive ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
                      }`}
                    >
                      <Phone className="w-6 h-6" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full w-12 h-12"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Voice Settings Panel */}
              <div className="border border-border rounded-2xl bg-background p-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">Voice Settings</h2>
                <p className="text-sm text-muted-foreground mb-6">Configure voice options</p>

                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Voice Model</Label>
                    <Select defaultValue="neural">
                      <SelectTrigger className="mt-2 rounded-xl border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neural">Neural (HD) Default</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="wavenet">WaveNet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">Language</Label>
                    <Select defaultValue="english">
                      <SelectTrigger className="mt-2 rounded-xl border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">Voice Speed</Label>
                    <Slider
                      value={voiceSpeed}
                      onValueChange={setVoiceSpeed}
                      max={100}
                      step={1}
                      className="mt-3"
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Slow</span>
                      <span>Normal</span>
                      <span>Fast</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground">Voice Pitch</Label>
                    <Slider
                      value={voicePitch}
                      onValueChange={setVoicePitch}
                      max={100}
                      step={1}
                      className="mt-3"
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>Default</span>
                      <span>High</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h3 className="font-medium text-foreground mb-4">Call Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-primary">Total Calls</span>
                        <span className="font-medium text-foreground">24</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-primary">Avg Duration</span>
                        <span className="font-medium text-foreground">3m 45s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-primary">Success Rate</span>
                        <span className="font-medium text-green-500">100%</span>
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
