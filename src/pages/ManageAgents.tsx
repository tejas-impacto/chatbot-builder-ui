import { useNavigate } from "react-router-dom";
import { Bot, Mic, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const ManageAgents = () => {
  const navigate = useNavigate();

  const agentTypes = [
    {
      id: "chat",
      title: "Chat Bots",
      description: "Manage your text-based AI chatbots for customer support, sales, and engagement.",
      icon: Bot,
      color: "bg-blue-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-500",
      route: "/manage-chatbot/bots",
    },
    {
      id: "voice",
      title: "Voice Bots",
      description: "Manage your voice-enabled AI assistants for phone support and voice interactions.",
      icon: Mic,
      color: "bg-purple-500",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-500",
      route: "/manage-voicebot/bots",
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto">
          <DashboardHeader />

          <div className="p-6">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Manage Your AI Agents
              </h1>
              <p className="text-muted-foreground text-lg">
                Select the type of agent you want to manage
              </p>
            </div>

            {/* Agent Type Cards */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {agentTypes.map((agent) => {
                const Icon = agent.icon;
                return (
                  <Card
                    key={agent.id}
                    className="group cursor-pointer border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                    onClick={() => navigate(agent.route)}
                  >
                    <CardContent className="p-8">
                      {/* Icon */}
                      <div className={`w-20 h-20 rounded-2xl ${agent.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-10 h-10 ${agent.textColor}`} />
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl font-bold text-foreground mb-3">
                        {agent.title}
                      </h2>

                      {/* Description */}
                      <p className="text-muted-foreground mb-6">
                        {agent.description}
                      </p>

                      {/* Action Button */}
                      <Button
                        className="w-full rounded-full group-hover:bg-primary group-hover:text-primary-foreground"
                        variant="outline"
                      >
                        View Bots
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Help Text */}
            <p className="text-center text-sm text-muted-foreground mt-12">
              Need help? Visit our documentation or contact support.
            </p>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ManageAgents;
