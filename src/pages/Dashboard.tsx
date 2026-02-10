import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Mic,
  MessageSquare,
  TrendingUp,
  Plus,
  Upload,
  Settings,
  MoreVertical,
  Zap,
  AlertCircle,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getDashboardMetrics, getBotsByTenant, getRecentActivity, type DashboardMetrics, type Bot as BotType, type ActivityItem } from "@/lib/botApi";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);
  const [metricsData, setMetricsData] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [bots, setBots] = useState<BotType[]>([]);
  const [botsLoading, setBotsLoading] = useState(true);
  const [recentActivityItems, setRecentActivityItems] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    // Check if onboarding was skipped and not completed
    const onboardingCompleted = localStorage.getItem('isOnboarded');
    const onboardingSkipped = localStorage.getItem('onboardingSkipped');

    if (onboardingSkipped === 'true' && onboardingCompleted !== 'true') {
      setRequiresOnboarding(true);
      setShowOnboardingPopup(true);
    }
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const tenantId = localStorage.getItem('tenantId');
        console.log('Fetching dashboard metrics for tenantId:', tenantId);
        if (!tenantId) {
          setMetricsLoading(false);
          return;
        }

        const response = await getDashboardMetrics(tenantId);
        console.log('Dashboard metrics response:', response);
        if (response.responseStructure?.data) {
          console.log('Setting metrics data:', response.responseStructure.data);
          setMetricsData(response.responseStructure.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const tenantId = localStorage.getItem('tenantId');
        if (!tenantId) {
          setBotsLoading(false);
          return;
        }

        const response = await getBotsByTenant(tenantId);
        if (response.responseStructure?.data) {
          setBots(response.responseStructure.data);
        }
      } catch (error) {
        console.error('Failed to fetch bots:', error);
      } finally {
        setBotsLoading(false);
      }
    };

    fetchBots();
  }, []);

  // Fetch recent activity from /api/v1/activity
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const tenantId = localStorage.getItem('tenantId');
        if (!tenantId) {
          setActivityLoading(false);
          return;
        }

        const response = await getRecentActivity(tenantId, 0, 10);
        setRecentActivityItems(response.data || []);
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Handler to show popup when user tries to perform a blocked action
  const handleBlockedAction = () => {
    if (requiresOnboarding) {
      setShowOnboardingPopup(true);
    }
  };

  const metrics = [
    {
      title: "Active Chatbots",
      value: metricsLoading ? "-" : String(metricsData?.bots?.textBots ?? 0),
      icon: Bot,
      trend: `${metricsData?.bots?.totalActive ?? 0} total active`,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Active Voice Bots",
      value: metricsLoading ? "-" : String(metricsData?.bots?.voiceBots ?? 0),
      icon: Mic,
      trend: "Voice assistants",
      color: "bg-accent/10 text-accent"
    },
    {
      title: "Total Sessions",
      value: metricsLoading ? "-" : String(metricsData?.sessions?.total ?? 0),
      icon: MessageSquare,
      trend: `${metricsData?.sessions?.textSessions ?? 0} text, ${metricsData?.sessions?.voiceSessions ?? 0} voice`,
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      title: "Text Sessions",
      value: metricsLoading ? "-" : String(metricsData?.sessions?.textSessions ?? 0),
      icon: TrendingUp,
      trend: "Chat conversations",
      color: "bg-green-500/10 text-green-500"
    },
  ];

  const quickActions = [
    { title: "Create Chat Bot", icon: Bot, description: "Build a new AI chatbot" },
    { title: "Create Voice Bot", icon: Mic, description: "Create a voice assistant" },
    { title: "Manage Agents", icon: Settings, description: "Configure your agents" },
    { title: "Upload Data", icon: Upload, description: "Add training data" },
  ];



  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5">
        <DashboardSidebar
          requiresOnboarding={requiresOnboarding}
          onBlockedAction={handleBlockedAction}
        />

        <main className="flex-1 overflow-auto">
          <DashboardHeader />

          {/* Onboarding Incomplete Popup */}
          {showOnboardingPopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card rounded-2xl border border-border shadow-xl p-6 max-w-md mx-4 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Complete Your Onboarding</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't completed the onboarding process yet. Complete it to unlock all features and set up your AI assistant.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => navigate('/onboarding')}
                        className="flex-1 rounded-full"
                      >
                        Complete Onboarding
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowOnboardingPopup(false);
                        }}
                        className="rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 space-y-8">
            {/* Metrics */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric) => (
                  <Card key={metric.title} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                          <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{metric.trend}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${metric.color} flex items-center justify-center`}>
                          <metric.icon className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Card
                    key={action.title}
                    className={`border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group ${
                      requiresOnboarding ? 'opacity-75' : ''
                    }`}
                    onClick={() => {
                      if (requiresOnboarding) {
                        handleBlockedAction();
                      } else {
                        // Handle navigation based on action
                        if (action.title === "Create Chat Bot") {
                          navigate("/bot-creation");
                        } else if (action.title === "Create Voice Bot") {
                          navigate("/bot-creation", { state: { voiceEnabled: true } });
                        } else if (action.title === "Upload Data") {
                          navigate("/business-data");
                        } else if (action.title === "Manage Agents") {
                          navigate("/manage-agents");
                        }
                      }
                    }}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <action.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-1 border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activityLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : recentActivityItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Zap className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  ) : (
                    recentActivityItems.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          if (activity.entityType === 'LEAD') {
                            navigate('/leads', { state: { highlightLeadId: activity.entityId } });
                          } else if (activity.entityType === 'BOT') {
                            navigate(`/manage-agents/bot/${activity.entityId}`, {
                              state: { bot: bots.find(b => b.botId === activity.entityId) },
                            });
                          } else if (activity.entityType === 'SESSION') {
                            navigate('/leads', { state: { highlightSessionId: activity.entityId } });
                          }
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{formatActionType(activity.actionType)}</p>
                          <p className="text-xs text-muted-foreground">{activity.entityName || activity.entityType}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{formatTimeAgo(activity.createdAt)}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Most Used Bots */}
              <Card className="lg:col-span-2 border-border/50 shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Most Used Bots
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${requiresOnboarding ? 'opacity-75' : ''}`}
                    onClick={() => {
                      if (requiresOnboarding) {
                        handleBlockedAction();
                      } else {
                        navigate("/manage-agents");
                      }
                    }}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {botsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : bots.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Bot className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground mb-4">No bots created yet</p>
                      <Button
                        onClick={() => navigate('/bot-creation')}
                        className="rounded-full"
                        disabled={requiresOnboarding}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Bot
                      </Button>
                    </div>
                  ) : (
                    bots.slice(0, 4).map((bot) => (
                      <div
                        key={bot.botId}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => navigate(`/manage-agents/bot/${bot.botId}`, { state: { bot } })}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            {bot.channelType === 'VOICE' ? (
                              <Mic className="w-6 h-6 text-primary" />
                            ) : (
                              <Bot className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">{bot.agentName}</p>
                              <Badge
                                variant={bot.active ? "default" : "secondary"}
                                className={bot.active ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}
                              >
                                {bot.active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {bot.channelType === 'VOICE' ? 'Voice' : 'Chat'}
                              </Badge>
                            </div>
                            {bot.purposeCategory && (
                              <p className="text-xs text-muted-foreground mt-1">Purpose: {bot.purposeCategory}</p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;