import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bot, ArrowLeft, Loader2, Save, Upload, Info, X, Play, Square, Trash2, Users } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { getBotById, updateBot, deleteBot, type Bot as BotType } from "@/lib/botApi";
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
import { VOICE_OPTIONS, LANGUAGE_OPTIONS } from "@/types/voice";

const BotEdit = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const [tenantId, setTenantId] = useState("");
  const [isLeadCaptureRequired, setIsLeadCaptureRequired] = useState(false);
  const [leadNameRequired, setLeadNameRequired] = useState(false);
  const [leadPhoneRequired, setLeadPhoneRequired] = useState(false);
  const [leadEmailRequired, setLeadEmailRequired] = useState(false);
  const [leadCompanyRequired, setLeadCompanyRequired] = useState(false);
  const [salesIntentPriority, setSalesIntentPriority] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [voiceCloneFile, setVoiceCloneFile] = useState<File | null>(null);
  const [isPlayingClone, setIsPlayingClone] = useState(false);
  const voiceCloneInputRef = useRef<HTMLInputElement>(null);
  const cloneAudioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayClone = () => {
    if (!voiceCloneFile) return;

    if (isPlayingClone && cloneAudioRef.current) {
      cloneAudioRef.current.pause();
      cloneAudioRef.current.currentTime = 0;
      setIsPlayingClone(false);
      return;
    }

    const url = URL.createObjectURL(voiceCloneFile);
    const audio = new Audio(url);
    cloneAudioRef.current = audio;

    audio.onended = () => {
      setIsPlayingClone(false);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      setIsPlayingClone(false);
      URL.revokeObjectURL(url);
      toast({ title: "Playback error", description: "Could not play the audio file.", variant: "destructive" });
    };

    audio.play();
    setIsPlayingClone(true);
  };

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

          setIsLeadCaptureRequired(bot.leadCaptureRequired || false);
          setLeadNameRequired(bot.nameRequired || false);
          setLeadPhoneRequired(bot.phoneRequired || false);
          setLeadEmailRequired(bot.emailRequired || false);
          setLeadCompanyRequired(bot.companyRequired || false);
          setSalesIntentPriority(bot.salesIntentPriority || "");

          // Load voice/language settings from localStorage for voice bots
          if (bot.channelType === "VOICE" && botId) {
            const savedVoice = localStorage.getItem(`voice_settings_${botId}_voice`);
            const savedLanguage = localStorage.getItem(`voice_settings_${botId}_language`);
            if (savedVoice) setSelectedVoice(savedVoice);
            if (savedLanguage) setSelectedLanguage(savedLanguage);
          }
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
        is_lead_capture_required: isLeadCaptureRequired,
        leadNameRequired,
        leadPhoneRequired,
        leadEmailRequired,
        leadCompanyRequired,
        salesIntentPriority: salesIntentPriority || undefined,
      });

      // Save voice/language settings to localStorage for voice bots
      if (channelType === "VOICE" && botId) {
        localStorage.setItem(`voice_settings_${botId}_voice`, selectedVoice);
        localStorage.setItem(`voice_settings_${botId}_language`, selectedLanguage);
      }

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

  const handleDeleteBot = async () => {
    if (!botId || !tenantId) return;

    setIsDeleting(true);
    try {
      await deleteBot(botId, tenantId);
      toast({
        title: "Bot Deleted",
        description: `${agentName} has been permanently deleted.`,
      });
      const basePath = channelType === "VOICE" ? "/manage-voicebot" : "/manage-chatbot";
      navigate(`${basePath}/bots`);
    } catch (err) {
      console.error("Failed to delete bot:", err);
      toast({
        title: "Error",
        description: "Failed to delete bot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
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
                {/* Left Column */}
                <div className="space-y-6">
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
                          <Label htmlFor="selectedVoice">Voice</Label>
                          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select voice" />
                            </SelectTrigger>
                            <SelectContent>
                              {VOICE_OPTIONS.map((voice) => (
                                <SelectItem key={voice.value} value={voice.value}>
                                  {voice.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            The AI voice used for responses
                          </p>
                        </div>

                        {/* Voice Clone Upload */}
                        <div className="space-y-2">
                          <Label>Voice Clone</Label>
                          <input
                            ref={voiceCloneInputRef}
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setVoiceCloneFile(file);
                              }
                            }}
                          />
                          {voiceCloneFile ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted/30">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Upload className="w-4 h-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {voiceCloneFile.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(voiceCloneFile.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    if (cloneAudioRef.current) {
                                      cloneAudioRef.current.pause();
                                      cloneAudioRef.current = null;
                                    }
                                    setIsPlayingClone(false);
                                    setVoiceCloneFile(null);
                                    if (voiceCloneInputRef.current) {
                                      voiceCloneInputRef.current.value = "";
                                    }
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              {/* Play cloned voice preview */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePlayClone}
                                className="w-full rounded-xl gap-2"
                              >
                                {isPlayingClone ? (
                                  <>
                                    <Square className="w-3.5 h-3.5 fill-current" />
                                    Stop Preview
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    Play Cloned Voice
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => voiceCloneInputRef.current?.click()}
                              className="w-full border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                            >
                              <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1.5" />
                              <p className="text-sm text-muted-foreground">
                                Click to upload voice audio
                              </p>
                              <p className="text-xs text-muted-foreground/70 mt-0.5">
                                MP3, WAV, or M4A
                              </p>
                            </button>
                          )}
                          <div className="flex items-start gap-1.5 mt-1">
                            <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">
                              Upload 5-10 seconds of clear speech for best voice cloning results. Avoid background noise.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="selectedLanguage">Language</Label>
                          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGE_OPTIONS.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            The language for voice interactions
                          </p>
                        </div>

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

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Lead Capture Configuration */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Lead Capture
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-xl">
                        <div>
                          <Label htmlFor="leadCaptureToggle" className="text-sm font-semibold">
                            Enable Lead Capture
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Collect visitor information before chat starts
                          </p>
                        </div>
                        <Switch
                          id="leadCaptureToggle"
                          checked={isLeadCaptureRequired}
                          onCheckedChange={setIsLeadCaptureRequired}
                        />
                      </div>

                      {isLeadCaptureRequired && (
                        <div className="space-y-2 animate-fade-in">
                          <Label className="text-sm font-medium">Mandatory Fields</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="edit-lead-name"
                                checked={leadNameRequired}
                                onCheckedChange={(checked) => setLeadNameRequired(!!checked)}
                              />
                              <Label htmlFor="edit-lead-name" className="text-sm cursor-pointer">Name</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="edit-lead-email"
                                checked={leadEmailRequired}
                                onCheckedChange={(checked) => setLeadEmailRequired(!!checked)}
                              />
                              <Label htmlFor="edit-lead-email" className="text-sm cursor-pointer">Email</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="edit-lead-phone"
                                checked={leadPhoneRequired}
                                onCheckedChange={(checked) => setLeadPhoneRequired(!!checked)}
                              />
                              <Label htmlFor="edit-lead-phone" className="text-sm cursor-pointer">Phone</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="edit-lead-company"
                                checked={leadCompanyRequired}
                                onCheckedChange={(checked) => setLeadCompanyRequired(!!checked)}
                              />
                              <Label htmlFor="edit-lead-company" className="text-sm cursor-pointer">Company</Label>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Persona */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Persona</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={persona}
                        onChange={(e) => setPersona(e.target.value)}
                        placeholder="Describe the bot's persona..."
                        className="min-h-[100px] rounded-xl"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!loading && !error && (
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  disabled={saving || isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Bot
                </Button>
                <div className="flex gap-3">
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
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{agentName}"? This action cannot be undone.
              All associated data and conversation history will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBot}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Bot"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default BotEdit;
