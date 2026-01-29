import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, MessageSquare, Calendar, Loader2, RefreshCw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { getBotsByTenant, type Bot as BotType } from "@/lib/botApi";

const BotsAvailable = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBots = async () => {
    const tenantId = localStorage.getItem('tenantId');

    if (!tenantId) {
      setLoading(false);
      setError('No tenant ID found. Please complete onboarding first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getBotsByTenant(tenantId);
      setBots(response.responseStructure?.data || []);
    } catch (err) {
      console.error('Error fetching bots:', err);
      setError('Failed to load bots. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load bots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  const handleTryBot = (bot: BotType) => {
    const tenantId = localStorage.getItem('tenantId');
    navigate('/manage-chatbot', {
      state: {
        chatbotId: bot.botId,
        chatbotName: bot.agentName,
        tenantId: tenantId,
        showLeadForm: true,
        demoMode: false,
      },
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto">
          <DashboardHeader />

          <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Bots Available</h1>
                <p className="text-muted-foreground">
                  Manage and interact with your created chatbots
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={fetchBots}
                  disabled={loading}
                  className="rounded-full"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => navigate('/bot-creation')}
                  className="rounded-full"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Create New Bot
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading your bots...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={fetchBots} variant="outline" className="rounded-full">
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && bots.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No bots created yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    Create your first AI chatbot to start engaging with your customers.
                  </p>
                  <Button onClick={() => navigate('/bot-creation')} className="rounded-full">
                    <Bot className="w-4 h-4 mr-2" />
                    Create Your First Bot
                  </Button>
                </div>
              </div>
            )}

            {/* Bots Grid */}
            {!loading && !error && bots.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map((bot) => (
                  <Card
                    key={bot.botId}
                    className="border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <CardContent className="p-6">
                      {/* Bot Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{bot.agentName}</h3>
                            <p className="text-xs text-muted-foreground">
                              {bot.channelType || 'TEXT'}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={bot.active ? "default" : "secondary"}
                          className={bot.active ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}
                        >
                          {bot.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {/* Bot Details */}
                      <div className="space-y-3 mb-4">
                        {bot.purposeCategory && (
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Purpose:</span>
                            <span className="text-foreground">{bot.purposeCategory}</span>
                          </div>
                        )}
                        {bot.toneOfVoice && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground ml-6">Tone:</span>
                            <span className="text-foreground capitalize">{bot.toneOfVoice}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Created:</span>
                          <span className="text-foreground">{formatDate(bot.createdAt)}</span>
                        </div>
                      </div>

                      {/* Bot ID */}
                      <div className="mb-4 p-2 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Bot ID</p>
                        <p className="text-xs font-mono text-foreground truncate" title={bot.botId}>
                          {bot.botId}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleTryBot(bot)}
                          className="flex-1 rounded-full"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Try Bot
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default BotsAvailable;
