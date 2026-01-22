import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { RefreshCw, Bot, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LeadFormModal from "@/components/chat/LeadFormModal";
import { submitLeadForm, sendMessageWithStream } from "@/lib/chatApi";
import { useToast } from "@/hooks/use-toast";
import type { UserInfo } from "@/types/chat";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  time: string;
  isStreaming?: boolean;
}

interface LocationState {
  sessionToken?: string;
  chatbotId?: string;
  chatbotName?: string;
  tenantId?: string;
  showLeadForm?: boolean;
  demoMode?: boolean;
}

const ManageChatbot = () => {
  const location = useLocation();
  const { toast } = useToast();
  const state = (location.state as LocationState) || {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(state.showLeadForm || false);
  const [isLeadFormSubmitting, setIsLeadFormSubmitting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId] = useState<string | null>(state.sessionToken || null);
  const [chatbotId] = useState<string>(state.chatbotId || "demo-chatbot");
  const [chatbotName] = useState<string>(state.chatbotName || "AI Assistant");
  const [tenantId] = useState<string>(state.tenantId || localStorage.getItem('tenantId') || "");
  const [isDemoMode] = useState<boolean>(state.demoMode || !state.sessionToken);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "1",
      text: `Hello! I'm ${chatbotName}. How can I help you today?`,
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
  }, [chatbotName]);

  const handleLeadFormSubmit = async (userInfo: UserInfo) => {
    setIsLeadFormSubmitting(true);

    // Debug log to identify missing data
    console.log('Lead form submit - sessionId:', sessionId, 'tenantId:', tenantId, 'chatbotId:', chatbotId);

    try {
      // Submit lead form to API if we have the required data
      if (sessionId && tenantId && chatbotId) {
        console.log('Calling submitLeadForm API...');
        await submitLeadForm(tenantId, chatbotId, sessionId, userInfo);
        toast({
          title: "Success",
          description: "Thank you! You can now start chatting.",
        });
      } else {
        console.log('Missing required data - skipping API call');
      }
      setShowLeadForm(false);
    } catch (error) {
      console.error("Failed to submit lead form:", error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
      // Still close the form so user can continue
      setShowLeadForm(false);
    } finally {
      setIsLeadFormSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Add placeholder for bot response
    const botMessageId = (Date.now() + 1).toString();
    const botMessage: Message = {
      id: botMessageId,
      text: "",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };
    setMessages(prev => [...prev, botMessage]);
    setIsStreaming(true);

    if (!isDemoMode && sessionId && tenantId && chatbotId) {
      // Use real API with streaming
      try {
        await sendMessageWithStream(
          tenantId,
          chatbotId,
          sessionId,
          userMessage.text,
          // onToken
          (token) => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === botMessageId
                  ? { ...msg, text: msg.text + token }
                  : msg
              )
            );
          },
          // onComplete
          () => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === botMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            );
            setIsStreaming(false);
          },
          // onError
          (error) => {
            console.error("Stream error:", error);
            setMessages(prev =>
              prev.map(msg =>
                msg.id === botMessageId
                  ? { ...msg, text: "Sorry, something went wrong. Please try again.", isStreaming: false }
                  : msg
              )
            );
            setIsStreaming(false);
          }
        );
      } catch (error) {
        console.error("Send message error:", error);
        setIsStreaming(false);
      }
    } else {
      // Demo mode: simulate bot response
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId
              ? { ...msg, text: "Thank you for your message. I'm processing your request...", isStreaming: false }
              : msg
          )
        );
        setIsStreaming(false);
      }, 1000);
    }
  };

  const handleResetChat = () => {
    setMessages([{
      id: "1",
      text: `Hello! I'm ${chatbotName}. How can I help you today?`,
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    // Show lead form again on reset if it was initially required
    if (state.showLeadForm) {
      setShowLeadForm(true);
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
                <h1 className="text-2xl font-bold text-foreground">Chat Interface</h1>
                <p className="text-muted-foreground">
                  {isDemoMode ? "Demo mode - Test your chatbot" : "Live chat with your AI assistant"}
                </p>
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

            {/* Chat Container */}
            <div className="flex-1 border border-border rounded-2xl bg-background flex flex-col relative">
              {/* Lead Form Overlay */}
              {showLeadForm && (
                <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                  <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg">
                    <LeadFormModal
                      onSubmit={handleLeadFormSubmit}
                      isLoading={isLeadFormSubmitting}
                      chatbotName={chatbotName}
                    />
                  </div>
                </div>
              )}

              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{chatbotName}</h3>
                    <p className="text-sm text-green-500">Online</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${message.sender === "user" ? "justify-end" : ""}`}
                  >
                    {message.sender === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[70%] ${message.sender === "user" ? "order-first" : ""}`}>
                      <div
                        className={`p-3 rounded-2xl ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">
                          {message.text || (message.isStreaming && (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Typing...
                            </span>
                          ))}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                    </div>
                    {message.sender === "user" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder={showLeadForm ? "Please fill out the form first..." : "Type a message"}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !showLeadForm && handleSendMessage()}
                    className="flex-1 rounded-full border-border/50"
                    disabled={showLeadForm || isStreaming}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="rounded-full bg-primary hover:bg-primary/90"
                    disabled={showLeadForm || isStreaming || !inputMessage.trim()}
                  >
                    {isStreaming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ManageChatbot;
