import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Bot, Send, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LeadFormModal from "@/components/chat/LeadFormModal";
import { createChatServerSession, sendMessageWithStream, endChatSession } from "@/lib/chatApi";
import { createLead } from "@/lib/botApi";
import { useToast } from "@/hooks/use-toast";
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

const PublicChat = () => {
  const { tenantId, botId } = useParams<{ tenantId: string; botId: string }>();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [botName, setBotName] = useState("AI Assistant");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isLeadFormSubmitting, setIsLeadFormSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [welcomeText, setWelcomeText] = useState("");
  const [leadUserInfo, setLeadUserInfo] = useState<UserInfo | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input when ready
  useEffect(() => {
    if (!isStreaming && !showLeadForm && !isInitializing) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isStreaming, showLeadForm, isInitializing]);

  // Initialize: create session on mount, then decide whether to show lead form
  useEffect(() => {
    const init = async () => {
      if (!tenantId || !botId) {
        setInitError("Invalid chat link.");
        setIsInitializing(false);
        return;
      }

      try {
        const session = await createChatServerSession(tenantId, botId);
        setSessionToken(session.session_token);
        setBotName(session.chatbot_config?.agent_name || "AI Assistant");
        setWelcomeText(
          session.chatbot_config?.welcome_message ||
          `Hello! I'm ${session.chatbot_config?.agent_name || "AI Assistant"}. How can I help you today?`
        );

        if (session.lead_form_required) {
          // Show lead form before starting chat
          setShowLeadForm(true);
        } else {
          // No lead form needed — go straight to chat
          const welcomeMessage: Message = {
            id: "1",
            text: session.chatbot_config?.welcome_message ||
              `Hello! I'm ${session.chatbot_config?.agent_name || "AI Assistant"}. How can I help you today?`,
            sender: "bot",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages([welcomeMessage]);
        }
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        setInitError("Unable to start chat. Please check the link and try again.");
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, [tenantId, botId]);

  // Lead form submit: create new session WITH lead info, store user info for lead capture on session end
  const handleLeadFormSubmit = async (userInfo: UserInfo) => {
    if (!tenantId || !botId) return;

    setIsLeadFormSubmitting(true);
    try {
      // Create a new session with lead info (backend needs this to create lead stub)
      const session = await createChatServerSession(
        tenantId,
        botId,
        botName,
        welcomeText,
        {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email,
          phone: userInfo.phone,
        }
      );
      setSessionToken(session.session_token);
      setSessionId(session.session_id || session.session_token);
      setLeadUserInfo(userInfo);

      const welcomeMessage: Message = {
        id: "1",
        text: welcomeText,
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([welcomeMessage]);
      setShowLeadForm(false);
    } catch (err) {
      console.error("Failed to submit lead:", err);
      toast({
        title: "Error",
        description: "Failed to submit your information. Please try again.",
        variant: "destructive",
      });
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
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    const botMessageId = (Date.now() + 1).toString();
    const botMessage: Message = {
      id: botMessageId,
      text: "",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, botMessage]);
    setIsStreaming(true);

    if (sessionToken && tenantId && botId) {
      try {
        await sendMessageWithStream(
          tenantId,
          botId,
          sessionToken,
          userMessage.text,
          (token) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, text: msg.text + token } : msg
              )
            );
          },
          () => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
              )
            );
            setIsStreaming(false);
          },
          (error) => {
            console.error("Stream error:", error);
            setMessages((prev) =>
              prev.map((msg) =>
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
    }
  };

  const handleEndSession = async () => {
    // Capture lead BEFORE ending session (session token must still be valid)
    if (leadUserInfo && tenantId && botId && sessionToken) {
      console.log("Creating lead on session end:", {
        tenantId, botId, sessionId, sessionToken,
        firstName: leadUserInfo.firstName, email: leadUserInfo.email,
      });
      try {
        const leadResponse = await createLead({
          tenantId,
          botId,
          sessionId: sessionId || sessionToken,
          sessionToken: sessionToken,
          firstName: leadUserInfo.firstName,
          lastName: leadUserInfo.lastName,
          email: leadUserInfo.email,
          phone: leadUserInfo.phone,
          channelType: 'CHAT',
          lead: {
            Source: 'Website Chat',
            Channel: 'CHAT',
          },
        });
        console.log("Lead created successfully:", leadResponse);
      } catch (err) {
        console.error("Failed to capture lead:", err);
        toast({
          title: "Lead Capture Failed",
          description: err instanceof Error ? err.message : "Failed to capture lead.",
          variant: "destructive",
        });
      }
    } else {
      console.warn("Skipping lead capture - missing data:", {
        hasLeadUserInfo: !!leadUserInfo,
        tenantId, botId, sessionToken,
      });
    }

    // End session after lead is captured
    if (sessionToken) {
      endChatSession(sessionToken, tenantId).catch((err) => {
        console.error("Failed to end chat session:", err);
      });
    }

    setSessionToken(null);
    setSessionEnded(true);
    setShowEndSessionDialog(false);
    toast({
      title: "Session Ended",
      description: "Your chat session has been ended.",
    });
  };

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Starting chat...</p>
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
          <h2 className="text-lg font-semibold text-foreground mb-2">Chat Unavailable</h2>
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
            Start New Chat
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

      {/* Chat Area - Centered, not full width */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl h-[75vh] border border-border rounded-2xl bg-background shadow-lg flex flex-col relative">
          {/* Lead Form Overlay */}
          {showLeadForm && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
              <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-lg mx-4">
                <LeadFormModal
                  onSubmit={handleLeadFormSubmit}
                  isLoading={isLeadFormSubmitting}
                  chatbotName={botName}
                />
              </div>
            </div>
          )}

          {/* Chat Header */}
          <div className="p-4 border-b border-border rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{botName}</h3>
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
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border rounded-b-2xl">
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

export default PublicChat;
