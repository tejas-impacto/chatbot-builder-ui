import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Users,
  Loader2,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Bot,
  Hash,
  Clock,
  MoreVertical,
  MessageSquare,
  Mic,
  History,
  Trash2,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import InfoTooltip from "@/components/ui/info-tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { getLeadInteractions, extractLeadInteractions, getBotsByTenant, initiateLeadDeletion, confirmLeadDeletion, type LeadInteraction, type Bot as BotType } from "@/lib/botApi";
import { getChatHistory, type ChatHistoryMessage } from "@/lib/chatApi";

type LeadStatus = "new" | "contacted" | "qualified" | "converted";

interface LeadWithStatus extends LeadInteraction {
  status: LeadStatus;
  source: "chat" | "voice";
  location?: string;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: "New", color: "text-blue-600", bgColor: "bg-blue-100" },
  contacted: { label: "Contacted", color: "text-orange-600", bgColor: "bg-orange-100" },
  qualified: { label: "Qualified", color: "text-purple-600", bgColor: "bg-purple-100" },
  converted: { label: "Converted", color: "text-green-600", bgColor: "bg-green-100" },
};

interface LocationState {
  highlightLeadId?: string;
  highlightSessionId?: string;
}

const Leads = () => {
  const location = useLocation();
  const { toast } = useToast();
  const state = (location.state as LocationState) || {};
  const tenantId = localStorage.getItem("tenantId") || "";
  const [leads, setLeads] = useState<LeadWithStatus[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [selectedLead, setSelectedLead] = useState<LeadWithStatus | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<LeadStatus | "all">("all");
  const [conversationOpen, setConversationOpen] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<ChatHistoryMessage[]>([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationSummary, setConversationSummary] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [bots, setBots] = useState<BotType[]>([]);
  const [botFilter, setBotFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [pendingSessionIds, setPendingSessionIds] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const pageSize = 20;

  // Derive status based on interactions and time
  const deriveStatus = (lead: LeadInteraction): LeadStatus => {
    const interactions = lead.totalInteractions || 0;
    const createdAt = new Date(lead.createdAt);
    const daysSinceCreated = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Recent leads (created within the last 24 hours) are "new"
    if (daysSinceCreated < 1) return "new";
    if (interactions >= 5) return "converted";
    if (interactions >= 3) return "qualified";
    if (interactions >= 1 || daysSinceCreated > 1) return "contacted";
    return "new";
  };

  // Derive source based on channelType or default to chat
  const deriveSource = (lead: LeadInteraction): "chat" | "voice" => {
    // Check if lead has channelType in the lead object
    const channelType = (lead as any).channelType || (lead.lead as any)?.channelType;
    if (channelType === "VOICE") return "voice";
    return "chat";
  };

  const fetchLeads = useCallback(async (page: number = 0, search?: string, botId?: string) => {
    if (!tenantId) {
      setLoading(false);
      setError("No tenant ID found. Please complete onboarding first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSelectedLeadIds(new Set());
      const filterBotId = botId !== undefined ? botId : (botFilter !== "all" ? botFilter : undefined);
      const response = await getLeadInteractions(tenantId, filterBotId || undefined, page, pageSize, search);
      const { data: leadsData, total, currentPage: responsePage } = extractLeadInteractions(response);

      // Enhance leads with derived status and source
      const enhancedLeads: LeadWithStatus[] = leadsData.map((lead) => ({
        ...lead,
        status: deriveStatus(lead),
        source: deriveSource(lead),
        location: (lead.lead as any)?.location || (lead.lead as any)?.city,
      }));

      setLeads(enhancedLeads);
      setFilteredLeads(enhancedLeads);
      setTotalLeads(total);
      setCurrentPage(responsePage);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load leads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [tenantId, toast, botFilter]);

  // Debounce timer for search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  // Fetch bots for the filter dropdown
  useEffect(() => {
    const fetchBots = async () => {
      if (!tenantId) return;
      try {
        const response = await getBotsByTenant(tenantId);
        setBots(response.responseStructure?.data || []);
      } catch {
        // Non-critical, ignore
      }
    };
    fetchBots();
  }, [tenantId]);

  // Handle highlighting a specific lead from navigation state
  useEffect(() => {
    if (!loading && leads.length > 0 && (state.highlightLeadId || state.highlightSessionId)) {
      const leadToHighlight = leads.find(
        (lead) =>
          lead.leadId === state.highlightLeadId ||
          lead.sessionId === state.highlightSessionId
      );
      if (leadToHighlight) {
        setSelectedLead(leadToHighlight);
        // Clear the state after handling to prevent re-triggering
        window.history.replaceState({}, document.title);
      }
    }
  }, [loading, leads, state.highlightLeadId, state.highlightSessionId]);

  // Debounced server-side search
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      fetchLeads(0, searchQuery || undefined);
    }, 400);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Re-fetch when bot filter changes
  useEffect(() => {
    fetchLeads(0, searchQuery || undefined);
  }, [botFilter]);

  // Apply client-side search + status filter on top of server results
  useEffect(() => {
    let result = leads;

    // Client-side search filter (in case backend doesn't support search)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((lead) => {
        const name = `${lead.firstName || ""} ${lead.lastName || ""}`.toLowerCase();
        const email = (lead.email || "").toLowerCase();
        const phone = (lead.phone || "").toLowerCase();
        const leadId = (lead.leadId || "").toLowerCase();
        const sessionId = (lead.sessionId || "").toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q) || leadId.includes(q) || sessionId.includes(q);
      });
    }

    // Status filter
    if (activeStatusFilter !== "all") {
      result = result.filter((lead) => lead.status === activeStatusFilter);
    }

    // Sort by date
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredLeads(result);
  }, [leads, activeStatusFilter, searchQuery, sortOrder]);

  // Unique key per lead row (leadId alone can repeat across bots)
  const getLeadUniqueKey = (lead: LeadWithStatus) =>
    `${lead.botId || ""}_${lead.leadId || ""}_${lead.sessionId || ""}`;

  // Selection helpers
  const toggleLeadSelection = (key: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === filteredLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(filteredLeads.map((l) => getLeadUniqueKey(l))));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLeadIds.size === 0) return;

    // Get sessionIds directly from the selected lead objects
    const sessionIdsToDelete = [...new Set(
      filteredLeads
        .filter((lead) => selectedLeadIds.has(getLeadUniqueKey(lead)))
        .map((lead) => lead.sessionId)
        .filter(Boolean)
    )];

    if (sessionIdsToDelete.length === 0) {
      toast({
        title: "Error",
        description: "No valid sessions found for the selected leads.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await initiateLeadDeletion(tenantId, sessionIdsToDelete);
      setPendingSessionIds(sessionIdsToDelete);
      setOtpValue("");
      setOtpDialogOpen(true);
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your email.",
      });
    } catch (err) {
      console.error("Failed to initiate lead deletion:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to initiate deletion.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!otpValue || otpValue.length < 6) return;

    setIsConfirming(true);
    try {
      const result = await confirmLeadDeletion(tenantId, pendingSessionIds, otpValue);
      setOtpDialogOpen(false);
      setOtpValue("");
      setPendingSessionIds([]);
      setSelectedLeadIds(new Set());
      toast({
        title: "Leads Deleted",
        description: result
          ? `Successfully deleted ${result.leadsDeleted || 0} lead(s) and ${result.interactionsDeleted || 0} interaction(s).`
          : "Leads deleted successfully.",
      });
      fetchLeads(currentPage, searchQuery || undefined);
    } catch (err) {
      console.error("Failed to confirm lead deletion:", err);
      toast({
        title: "Verification Failed",
        description: err instanceof Error ? err.message : "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);

      if (diffMins < 60) return `${diffMins} mins ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffWeeks === 1) return "1 week ago";
      return `${diffWeeks} weeks ago`;
    } catch {
      return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "?";
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getStatusCounts = () => {
    return {
      new: leads.filter((l) => l.status === "new").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
      qualified: leads.filter((l) => l.status === "qualified").length,
      converted: leads.filter((l) => l.status === "converted").length,
    };
  };

  const statusCounts = getStatusCounts();
  const totalPages = Math.ceil(totalLeads / pageSize);

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      fetchLeads(currentPage - 1, searchQuery || undefined, botFilter !== "all" ? botFilter : undefined);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      fetchLeads(currentPage + 1, searchQuery || undefined, botFilter !== "all" ? botFilter : undefined);
    }
  };

  const handleViewConversation = async (lead: LeadWithStatus) => {
    if (!lead.sessionId || !lead.botId) {
      toast({
        title: "Error",
        description: `Missing ${!lead.sessionId ? 'session ID' : 'bot ID'} for this lead.`,
        variant: "destructive",
      });
      return;
    }

    setConversationMessages([]);
    setConversationSummary("");
    setConversationOpen(true);
    setConversationLoading(true);

    const useTenantId = lead.tenantId || tenantId;
    console.log("View Conversation - tenantId:", useTenantId, "botId:", lead.botId, "sessionId:", lead.sessionId);

    try {
      const response = await getChatHistory(useTenantId, lead.botId, lead.sessionId);
      console.log("Chat history response:", response);
      const data = response.responseStructure?.data;
      setConversationMessages(data?.messages || []);
      setConversationSummary(data?.summary || "");
    } catch (err: any) {
      console.error("Failed to load conversation:", err);
      toast({
        title: "Error",
        description: err?.message || "Failed to load conversation history.",
        variant: "destructive",
      });
    } finally {
      setConversationLoading(false);
    }
  };

  const updateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.leadId === leadId ? { ...lead, status: newStatus } : lead
      )
    );
    toast({
      title: "Status Updated",
      description: `Lead status changed to ${STATUS_CONFIG[newStatus].label}`,
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
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">Customer Relationship Management <InfoTooltip text="Track and manage customer leads captured by your AI agents" size="md" /></h1>
                <p className="text-muted-foreground">
                  Manage leads captured by your AI agents
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fetchLeads(currentPage, searchQuery || undefined, botFilter !== "all" ? botFilter : undefined)}
                disabled={loading}
                className="rounded-full"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            {!loading && !error && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                  className={`border-border/50 shadow-md cursor-pointer transition-all hover:shadow-lg ${
                    activeStatusFilter === "all" ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setActiveStatusFilter("all")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">Total Leads <InfoTooltip text="Total number of leads captured across all agents" /></p>
                        <p className="text-3xl font-bold text-foreground">{totalLeads || leads.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`border-border/50 shadow-md cursor-pointer transition-all hover:shadow-lg ${
                    activeStatusFilter === "contacted" ? "ring-2 ring-orange-500" : ""
                  }`}
                  onClick={() => setActiveStatusFilter(activeStatusFilter === "contacted" ? "all" : "contacted")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">Contacted <InfoTooltip text="Leads that have had at least one interaction" /></p>
                        <p className="text-3xl font-bold text-foreground">{statusCounts.contacted}</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100">Contacted</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`border-border/50 shadow-md cursor-pointer transition-all hover:shadow-lg ${
                    activeStatusFilter === "converted" ? "ring-2 ring-green-500" : ""
                  }`}
                  onClick={() => setActiveStatusFilter(activeStatusFilter === "converted" ? "all" : "converted")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">Converted <InfoTooltip text="Leads that completed the desired action or purchase" /></p>
                        <p className="text-3xl font-bold text-foreground">{statusCounts.converted}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-600 hover:bg-green-100">Converted</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`border-border/50 shadow-md cursor-pointer transition-all hover:shadow-lg ${
                    activeStatusFilter === "new" ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setActiveStatusFilter(activeStatusFilter === "new" ? "all" : "new")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">New Leads <InfoTooltip text="Leads captured in the last 24 hours" /></p>
                        <p className="text-3xl font-bold text-foreground">{statusCounts.new}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100">New</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Search Bar, Delete & Bot Filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {/* Unselect All */}
                {selectedLeadIds.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLeadIds(new Set())}
                    className="rounded-full"
                  >
                    Unselect All
                  </Button>
                )}

                {/* Sort by Date */}
                <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
                  <SelectTrigger className="w-[170px] rounded-full">
                    <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>

                {/* Bot Filter */}
                <Select value={botFilter} onValueChange={setBotFilter}>
                  <SelectTrigger className="w-[200px] rounded-full">
                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Filter by bot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bots</SelectItem>
                    {bots.map((bot) => (
                      <SelectItem key={bot.botId} value={bot.botId}>
                        {bot.agentName || bot.botId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Delete Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={selectedLeadIds.size === 0 || isDeleting}
                  className="rounded-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? "Deleting..." : `Delete${selectedLeadIds.size > 0 ? ` (${selectedLeadIds.size})` : ""}`}
                </Button>
              </div>
            </div>
            

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading leads...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button
                    onClick={() => fetchLeads()}
                    variant="outline"
                    className="rounded-full"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredLeads.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchQuery || activeStatusFilter !== "all" ? "No matching leads" : "No leads yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    {searchQuery || activeStatusFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Leads will appear here when customers interact with your chatbots."}
                  </p>
                </div>
              </div>
            )}

            {/* Lead Cards */}
            {!loading && !error && filteredLeads.length > 0 && (
              <Card className="border-border/50">
                {/* Select All Header */}
                <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/20">
                  <Checkbox
                    checked={selectedLeadIds.size === filteredLeads.length && filteredLeads.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="text-xs text-muted-foreground">
                    {selectedLeadIds.size > 0
                      ? `${selectedLeadIds.size} of ${filteredLeads.length} selected`
                      : "Select all"}
                  </span>
                </div>
                <CardContent className="p-0 divide-y divide-border">
                  {filteredLeads.map((lead, index) => {
                    const statusConfig = STATUS_CONFIG[lead.status];
                    const fullName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Unknown";
                    const uniqueKey = getLeadUniqueKey(lead);
                    const isSelected = selectedLeadIds.has(uniqueKey);

                    return (
                      <div
                        key={`${lead.leadId || lead.sessionId}-${index}`}
                        className={`p-4 hover:bg-muted/30 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${isSelected ? "bg-primary/5" : ""}`}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div className="flex items-center justify-between">
                          {/* Left side - Checkbox, Avatar and Info */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Checkbox */}
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleLeadSelection(uniqueKey)}
                              onClick={(e) => e.stopPropagation()}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
                            />
                            {/* Avatar */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold ${getAvatarColor(
                                fullName
                              )}`}
                            >
                              {getInitials(lead.firstName, lead.lastName)}
                            </div>

                            {/* Name and Contact Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-foreground">{fullName}</span>
                                <Badge className={`${statusConfig.bgColor} ${statusConfig.color} hover:${statusConfig.bgColor}`}>
                                  {statusConfig.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                {lead.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {lead.email}
                                  </span>
                                )}
                                {lead.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {lead.phone}
                                  </span>
                                )}
                                {lead.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {lead.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right side - Source, Session ID and Actions */}
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <span>Source:</span>
                                <span className="font-medium text-foreground flex items-center gap-1">
                                  {lead.source === "voice" ? (
                                    <>
                                      <Mic className="w-3 h-3" />
                                      Voice Bot
                                    </>
                                  ) : (
                                    <>
                                      <MessageSquare className="w-3 h-3" />
                                      Website Chat
                                    </>
                                  )}
                                </span>
                              </div>
                              {lead.sessionId && (
                                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                  <Hash className="w-3 h-3" />
                                  <span className="font-mono truncate max-w-[120px]" title={lead.sessionId}>
                                    {lead.sessionId.substring(0, 12)}...
                                  </span>
                                </div>
                              )}
                              <div className="text-muted-foreground">
                                Last contact: {formatRelativeTime(lead.createdAt)}
                              </div>
                            </div>

                            {/* Actions Menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.leadId, "new"); }}>
                                  Mark as New
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.leadId, "contacted"); }}>
                                  Mark as Contacted
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.leadId, "qualified"); }}>
                                  Mark as Qualified
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateLeadStatus(lead.leadId, "converted"); }}>
                                  Mark as Converted
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        Page {currentPage + 1} of {totalPages} ({totalLeads} total leads)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 0 || loading}
                          className="rounded-full"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={currentPage >= totalPages - 1 || loading}
                          className="rounded-full"
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                  selectedLead ? getAvatarColor(`${selectedLead.firstName} ${selectedLead.lastName}`) : ""
                }`}
              >
                {selectedLead && getInitials(selectedLead.firstName, selectedLead.lastName)}
              </div>
              <div>
                <span className="block">
                  {selectedLead?.firstName || selectedLead?.lastName
                    ? `${selectedLead?.firstName || ""} ${selectedLead?.lastName || ""}`.trim()
                    : "Unknown Lead"}
                </span>
                {selectedLead && (
                  <Badge className={`${STATUS_CONFIG[selectedLead.status].bgColor} ${STATUS_CONFIG[selectedLead.status].color} mt-1`}>
                    {STATUS_CONFIG[selectedLead.status].label}
                  </Badge>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-5 py-4 overflow-y-auto flex-1">
              {/* Contact & Source Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Mail className="w-3 h-3" />
                    Email
                  </div>
                  <p className="text-sm font-medium">{selectedLead.email || "-"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Phone className="w-3 h-3" />
                    Phone
                  </div>
                  <p className="text-sm font-medium">{selectedLead.phone || "-"}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    {selectedLead.source === "voice" ? <Mic className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                    Source
                  </div>
                  <p className="text-sm font-medium">{selectedLead.source === "voice" ? "Voice Bot" : "Website Chat"}</p>
                </div>
              </div>

              {/* IDs - Row 1: Lead ID + Bot ID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Hash className="w-3 h-3" />
                    Lead ID
                  </div>
                  <p className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                    {selectedLead.leadId || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Bot className="w-3 h-3" />
                    Bot ID
                  </div>
                  <p className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                    {selectedLead.botId || "-"}
                  </p>
                </div>
              </div>

              {/* IDs - Row 2: Session ID + Created At */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Hash className="w-3 h-3" />
                    Session ID
                  </div>
                  <p className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                    {selectedLead.sessionId || "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Clock className="w-3 h-3" />
                    Created At
                  </div>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{formatDate(selectedLead.createdAt)}</p>
                </div>
              </div>

              {/* Captured Data */}
              {selectedLead.lead && Object.keys(selectedLead.lead).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Captured Data</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    {Object.entries(selectedLead.lead).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start gap-2">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-medium text-right break-all">
                          {value || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Total Interactions</span>
                <span className="text-sm font-semibold">{selectedLead.totalInteractions || 0}</span>
              </div>

              {/* View Conversations Button */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => handleViewConversation(selectedLead)}
                  disabled={!selectedLead.sessionId}
                >
                  <History className="w-4 h-4 mr-2" />
                  View Conversations
                </Button>
              </div>

              {/* Status Change Buttons */}
              <div className="flex gap-2 pt-2">
                {(["new", "contacted", "qualified", "converted"] as LeadStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={selectedLead.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      updateLeadStatus(selectedLead.leadId, status);
                      setSelectedLead({ ...selectedLead, status });
                    }}
                    className="flex-1"
                  >
                    {STATUS_CONFIG[status].label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Conversation History Dialog */}
      <Dialog open={conversationOpen} onOpenChange={setConversationOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Conversation History
            </DialogTitle>
            {selectedLead && (
              <p className="text-sm text-muted-foreground">
                {`${selectedLead.firstName || ""} ${selectedLead.lastName || ""}`.trim() || "Unknown User"}
                {selectedLead.email && ` • ${selectedLead.email}`}
              </p>
            )}
          </DialogHeader>

          {conversationSummary && (
            <div className="px-1 py-2 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Summary</p>
              <p className="text-sm text-foreground">{conversationSummary}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 py-3 min-h-[200px] max-h-[400px]">
            {conversationLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading conversation...
                </div>
              </div>
            ) : conversationMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No messages found for this session</p>
              </div>
            ) : (
              conversationMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setConversationOpen(false)}
              className="rounded-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* OTP Confirmation Dialog for Lead Deletion */}
      <Dialog open={otpDialogOpen} onOpenChange={(open) => {
        if (!open && !isConfirming) {
          setOtpDialogOpen(false);
          setOtpValue("");
          setPendingSessionIds([]);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Deletion</DialogTitle>
            <DialogDescription>
              A verification code has been sent to your admin email. Enter the 6-digit OTP to confirm deletion of {pendingSessionIds.length} lead(s).
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setOtpDialogOpen(false);
                setOtpValue("");
                setPendingSessionIds([]);
              }}
              disabled={isConfirming}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={otpValue.length < 6 || isConfirming}
            >
              {isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Leads;
