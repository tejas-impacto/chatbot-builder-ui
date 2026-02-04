import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bot, ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { getBotById, updateBot, type Bot as BotType } from "@/lib/botApi";

const BotEdit = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [agentName, setAgentName] = useState("");
  const [channelType, setChannelType] = useState("");
  const [purposeCategory, setPurposeCategory] = useState("");
  const [persona, setPersona] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("");
  const [chatLength, setChatLength] = useState("");
  const [chatGuidelines, setChatGuidelines] = useState("");
  const [voiceLength, setVoiceLength] = useState("");
  const [voiceGuidelines, setVoiceGuidelines] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [tenantId, setTenantId] = useState("");

  useEffect(() => {
    const fetchBot = async () => {
      if (!botId) {
        setError("Bot ID is missing");
        setLoading(false);
        return;
      }

      const storedTenantId = localStorage.getItem("tenantId");
      if (!storedTenantId) {
        setError("Tenant ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      setTenantId(storedTenantId);

      try {
        setLoading(true);
        setError(null);
        const response = await getBotById(botId, storedTenantId);
        const bot = response.responseStructure?.data;

        if (bot) {
          setAgentName(bot.agentName || "");
          setChannelType(bot.channelType || "");
          setPurposeCategory(bot.purposeCategory || "");
          setPersona(bot.persona || "");
          setToneOfVoice(bot.toneOfVoice || "");
          setChatLength(bot.chatLength || "");
          setChatGuidelines(bot.chatGuidelines || "");
          setVoiceLength(bot.voiceLength || "");
          setVoiceGuidelines(bot.voiceGuidelines || "");
          setIsActive(bot.active);
        }
      } catch (err) {
        console.error("Error fetching bot:", err);
        setError("Failed to load bot details. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load bot details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBot();
  }, [botId, toast]);

  const handleSave = async () => {
    if (!botId || !tenantId) return;

    setSaving(true);
    try {
      await updateBot(botId, {
        tenantId,
        conversationStyle: {
          chatLength,
          chatGuidelines,
          voiceLength,
          voiceGuidelines,
        },
        channelType,
        purposeCategory,
        persona,
        agentName,
        toneOfVoice,
        isActive,
      });

      toast({
        title: "Success",
        description: "Bot updated successfully.",
      });

      // Navigate back to bots list
      const basePath = channelType === "VOICE" ? "/manage-voicebot" : "/manage-chatbot";
      navigate(`${basePath}/bots`);
    } catch (err) {
      console.error("Error updating bot:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update bot.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto">
          <DashboardHeader />

          <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Edit Bot</h1>
                <p className="text-muted-foreground">
                  Update your bot configuration
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading bot details...</p>
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
                  <Button onClick={() => navigate(-1)} variant="outline" className="rounded-full">
                    Go Back
                  </Button>
                </div>
              </div>
            )}

            {/* Edit Form */}
            {!loading && !error && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="agentName">Agent Name</Label>
                      <Input
                        id="agentName"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="Enter agent name"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="channelType">Channel Type</Label>
                      <Input
                        id="channelType"
                        value={channelType}
                        disabled
                        className="rounded-xl bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Channel type cannot be changed after creation
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purposeCategory">Purpose Category</Label>
                      <Input
                        id="purposeCategory"
                        value={purposeCategory}
                        onChange={(e) => setPurposeCategory(e.target.value)}
                        placeholder="Enter purpose category"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="toneOfVoice">Tone of Voice</Label>
                      <Select value={toneOfVoice} onValueChange={setToneOfVoice}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="isActive">Active Status</Label>
                        <p className="text-xs text-muted-foreground">
                          Enable or disable this bot
                        </p>
                      </div>
                      <Switch
                        id="isActive"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Persona */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Persona</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={persona}
                      onChange={(e) => setPersona(e.target.value)}
                      placeholder="Describe the bot's persona..."
                      className="min-h-[200px] rounded-xl"
                    />
                  </CardContent>
                </Card>

                {/* Chat Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Chat Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="chatLength">Chat Response Length</Label>
                      <Select value={chatLength} onValueChange={setChatLength}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="chatGuidelines">Chat Guidelines</Label>
                      <Textarea
                        id="chatGuidelines"
                        value={chatGuidelines}
                        onChange={(e) => setChatGuidelines(e.target.value)}
                        placeholder="Enter chat guidelines..."
                        className="min-h-[120px] rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Voice Configuration - Only show for VOICE channel */}
                {channelType === "VOICE" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Voice Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="voiceLength">Voice Response Length</Label>
                        <Select value={voiceLength} onValueChange={setVoiceLength}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="long">Long</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="voiceGuidelines">Voice Guidelines</Label>
                        <Textarea
                          id="voiceGuidelines"
                          value={voiceGuidelines}
                          onChange={(e) => setVoiceGuidelines(e.target.value)}
                          placeholder="Enter voice guidelines..."
                          className="min-h-[120px] rounded-xl"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {!loading && !error && (
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="rounded-full"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="rounded-full"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Bot
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default BotEdit;
