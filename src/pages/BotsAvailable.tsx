import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bot, MessageSquare, Calendar, Loader2, RefreshCw, Play, Pencil, Trash2, LogIn, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { getBotsByTenant, deleteBot, type Bot as BotType } from "@/lib/botApi";
import { SessionExpiredError, logout } from "@/lib/auth";
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

const BotsAvailable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [botToDelete, setBotToDelete] = useState<BotType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine if we're viewing voicebots or chatbots based on route
  const isVoicebotView = location.pathname.includes('/manage-voicebot');

  // Filter bots based on the current view
  const filteredBots = useMemo(() => {
    return bots.filter(bot => {
      if (isVoicebotView) {
        return bot.channelType === 'VOICE';
      } else {
        // Show TEXT, CHAT, or bots without channelType (legacy) in chatbot view
        return bot.channelType !== 'VOICE';
      }
    });
  }, [bots, isVoicebotView]);

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
      setSessionExpired(false);
      const response = await getBotsByTenant(tenantId);
      setBots(response.responseStructure?.data || []);
    } catch (err) {
      console.error('Error fetching bots:', err);
      if (err instanceof SessionExpiredError) {
        setSessionExpired(true);
        setError('Your session has expired. Please login again.');
        toast({
          title: "Session Expired",
          description: "Please login again to continue.",
          variant: "destructive",
        });
      } else {
        setError('Failed to load bots. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load bots. Please try again.",
          variant: "destructive",
        });
      }
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

  const handleBotClick = (bot: BotType) => {
    // Navigate to bot details page based on channel type
    const basePath = bot.channelType === 'VOICE' ? '/manage-voicebot' : '/manage-chatbot';
    navigate(`${basePath}/bot/${bot.botId}`, {
      state: { bot },
    });
  };

  const handleTryBot = (bot: BotType, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const tenantId = localStorage.getItem('tenantId');

    if (bot.channelType === 'VOICE') {
      // Navigate to voice chat interface
      navigate('/manage-voicebot', {
        state: {
          botId: bot.botId,
          botName: bot.agentName,
          tenantId: tenantId,
        },
      });
    } else {
      // Navigate to text chat interface
      navigate('/manage-chatbot', {
        state: {
          botId: bot.botId,
          chatbotName: bot.agentName,
          tenantId: tenantId,
          showLeadForm: true,
          demoMode: false,
        },
      });
    }
  };

  const handleEditBot = (bot: BotType) => {
    const basePath = bot.channelType === 'VOICE' ? '/manage-voicebot' : '/manage-chatbot';
    navigate(`${basePath}/bot/${bot.botId}/edit`);
  };

  const handleDeleteClick = (bot: BotType) => {
    setBotToDelete(bot);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!botToDelete) return;
    const tenantId = localStorage.getItem('tenantId');
    if (!tenantId) return;

    setIsDeleting(true);
    try {
      await deleteBot(botToDelete.botId, tenantId);
      toast({
        title: "Bot Deleted",
        description: `${botToDelete.agentName} has been permanently deleted.`,
      });
      fetchBots();
    } catch (err) {
      console.error('Failed to delete bot:', err);
      toast({
        title: "Error",
        description: "Failed to delete bot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setBotToDelete(null);
    }
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
                <h1 className="text-2xl font-bold text-foreground">
                  {isVoicebotView ? 'Voicebots Available' : 'Chatbots Available'}
                </h1>
                <p className="text-muted-foreground">
                  {isVoicebotView
                    ? 'Manage and interact with your voice assistants'
                    : 'Manage and interact with your chatbots'}
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
                  {isVoicebotView ? <Mic className="w-4 h-4 mr-2" /> : <Bot className="w-4 h-4 mr-2" />}
                  {isVoicebotView ? 'Create New Voicebot' : 'Create New Chatbot'}
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
                    {sessionExpired ? (
                      <LogIn className="w-8 h-8 text-destructive" />
                    ) : (
                      <Bot className="w-8 h-8 text-destructive" />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  {sessionExpired ? (
                    <Button onClick={() => logout()} className="rounded-full">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login Again
                    </Button>
                  ) : (
                    <Button onClick={fetchBots} variant="outline" className="rounded-full">
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredBots.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    {isVoicebotView ? <Mic className="w-10 h-10 text-primary" /> : <Bot className="w-10 h-10 text-primary" />}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {isVoicebotView ? 'No voicebots created yet' : 'No chatbots created yet'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    {isVoicebotView
                      ? 'Create your first voice assistant to start voice conversations with your customers.'
                      : 'Create your first AI chatbot to start engaging with your customers.'}
                  </p>
                  <Button onClick={() => navigate('/bot-creation')} className="rounded-full">
                    {isVoicebotView ? <Mic className="w-4 h-4 mr-2" /> : <Bot className="w-4 h-4 mr-2" />}
                    {isVoicebotView ? 'Create Your First Voicebot' : 'Create Your First Chatbot'}
                  </Button>
                </div>
              </div>
            )}

            {/* Bots Grid */}
            {!loading && !error && filteredBots.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBots.map((bot) => (
                  <Card
                    key={bot.botId}
                    className="border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => handleBotClick(bot)}
                  >
                    <CardContent className="p-6">
                      {/* Bot Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            {bot.channelType === 'VOICE' ? (
                              <Mic className="w-6 h-6 text-primary" />
                            ) : (
                              <Bot className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{bot.agentName}</h3>
                            <p className="text-xs text-muted-foreground">
                              {bot.channelType === 'VOICE' ? 'Voice' : 'Text'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBot(bot);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(bot);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
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
                          onClick={(e) => handleTryBot(bot, e)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{botToDelete?.agentName}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBotToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default BotsAvailable;
