import { useState } from "react";
import { RefreshCw, Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  time: string;
}

const ManageChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", sender: "bot", time: "10:00 AM" }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInputMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: "Thank you for your message. I'm processing your request...",
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleResetChat = () => {
    setMessages([
      { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", sender: "bot", time: "10:00 AM" }
    ]);
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
                <h1 className="text-2xl font-bold text-foreground">Demo Chat Interface</h1>
                <p className="text-muted-foreground">Test your chatbot in a live preview environment</p>
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
            <div className="flex-1 border border-border rounded-2xl bg-background flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Customer Support Bot</h3>
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
                        <p className="text-sm">{message.text}</p>
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
                    placeholder="Type a message"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 rounded-full border-border/50"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    size="icon" 
                    className="rounded-full bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
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
