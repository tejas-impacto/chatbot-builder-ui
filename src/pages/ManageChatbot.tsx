import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RefreshCw, Bot, Send, Loader2, X, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LeadFormModal from "@/components/chat/LeadFormModal";
import { createChatServerSession, submitLeadForm, sendMessageWithStream } from "@/lib/chatApi";
import { useToast } from "@/hooks/use-toast";
import { getValidAccessToken } from "@/lib/auth";
import type { UserInfo } from "@/types/chat";
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

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  time: string;
  isStreaming?: boolean;
}

interface LocationState {
  sessionToken?: string;
  botId?: string;
  chatbotName?: string;
  tenantId?: string;
  showLeadForm?: boolean;
  demoMode?: boolean;
}

const ManageChatbot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const state = (location.state as LocationState) || {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(state.showLeadForm || false);
  const [isLeadFormSubmitting, setIsLeadFormSubmitting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(state.sessionToken || null);
  const [botId] = useState<string>(state.botId || "demo-chatbot");
  const [chatbotName] = useState<string>(state.chatbotName || "AI Assistant");
  const [tenantId] = useState<string>(state.tenantId || localStorage.getItem('tenantId') || "");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(state.demoMode || !state.botId);
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Ref for input field focus
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input when streaming ends
  useEffect(() => {
    if (!isStreaming && !showLeadForm) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isStreaming, showLeadForm]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "1",
      text: `Hello! I'm ${chatbotName}. How can I help you today?`,
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMessage]);
  }, [chatbotName]);

  const handleLeadFormSubmit = async (userInfo: UserInfo) => {
    setIsLeadFormSubmitting(true);

    try {
      // Step 1: Create a chat session via Chat Server (for non-demo mode)
      if (botId && botId !== "demo-chatbot" && tenantId) {
        console.log("Creating chat session via Chat Server");
        const sessionResponse = await createChatServerSession(
          tenantId,
          botId,
          chatbotName,
          `Hello! I'm ${chatbotName}. How can I help you today?`
        );
        const newSessionToken = sessionResponse.session_token;
        const newSessionId = sessionResponse.session_id;
        console.log("Chat session created - full response:", JSON.stringify(sessionResponse, null, 2));
        console.log("Using sessionId for lead:", newSessionId);
        console.log("Using sessionToken for auth:", newSessionToken);

        // Store session token for auth (used in X-Session-Token headers)
        setSessionId(newSessionToken);
        setIsDemoMode(false);

        // Step 2: Submit lead form via Main API (use actual sessionId, not token)
        const leadResponse = await submitLeadForm(tenantId, botId, newSessionId, userInfo);
        console.log("Lead form submitted successfully, response:", JSON.stringify(leadResponse, null, 2));

        toast({
          title: "Success",
          description: "Thank you! You can now start chatting.",
        });
      } else {
        // Demo mode - no real session
        toast({
          title: "Demo Mode",
          description: "You can now test the chat interface.",
        });
      }
      setShowLeadForm(false);
    } catch (error) {
      console.error("Failed to submit lead form:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit form. Please try again.",
        variant: "destructive",
      });
      // Still close the form so user can continue in demo mode
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

    if (!isDemoMode && sessionId && tenantId && botId) {
      // Use real API with streaming
      try {
        await sendMessageWithStream(
          tenantId,
          botId,
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

  const handleEndSession = async () => {
    if (!sessionId || isDemoMode) {
      // Demo mode - just navigate back
      navigate(-1);
      return;
    }

    setIsEndingSession(true);
    try {
      const accessToken = await getValidAccessToken();

      const response = await fetch('/api/v1/chat/sessions', {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'X-Session-Token': sessionId,
          ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to end session');
      }

      toast({
        title: "Session Ended",
        description: "Chat session has been ended successfully.",
      });

      // Navigate back to bots list
      navigate('/manage-chatbot/bots');
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Failed to end session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEndingSession(false);
      setShowEndSessionDialog(false);
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
                  <h1 className="text-2xl font-bold text-foreground">Chat Interface</h1>
                  <p className="text-muted-foreground">
                    {isDemoMode ? "Demo mode - Test your chatbot" : `Testing: ${chatbotName}`}
                  </p>
                </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{chatbotName}</h3>
                      <p className="text-sm text-green-500">Online</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEndSessionDialog(true)}
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="End chat session"
                  >
                    <X className="w-4 h-4" />
                  </Button>
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
                        {message.text ? (
                          message.sender === "bot" ? (
                            <div className="text-sm">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p className="my-1">{children}</p>,
                                  ul: ({ children }) => <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>,
                                  ol: ({ children }) => <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>,
                                  li: ({ children }) => <li className="ml-1">{children}</li>,
                                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                  em: ({ children }) => <em className="italic">{children}</em>,
                                  h1: ({ children }) => <h1 className="text-lg font-bold my-2">{children}</h1>,
                                  h2: ({ children }) => <h2 className="text-base font-bold my-2">{children}</h2>,
                                  h3: ({ children }) => <h3 className="text-sm font-bold my-1">{children}</h3>,
                                  code: ({ children }) => <code className="bg-muted-foreground/20 px-1 rounded text-xs">{children}</code>,
                                  a: ({ href, children }) => <a href={href} className="text-primary underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                }}
                              >
                                {message.text}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm">{message.text}</p>
                          )
                        ) : (
                          message.isStreaming && (
                            <span className="flex items-center gap-2 text-sm">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Typing...
                            </span>
                          )
                        )}
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
                {/* Scroll target */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <Input
                    ref={inputRef}
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

      {/* End Session Confirmation Dialog */}
      <AlertDialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Chat Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this chat session? This will close the current conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndSession}
              disabled={isEndingSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isEndingSession ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ending...
                </>
              ) : (
                "End Session"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default ManageChatbot;
