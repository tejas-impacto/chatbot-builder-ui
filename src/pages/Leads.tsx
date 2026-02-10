import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { getLeadInteractions, extractLeadInteractions, type LeadInteraction } from "@/lib/botApi";
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
  const pageSize = 20;

  // Derive status based on interactions and time
  const deriveStatus = (lead: LeadInteraction): LeadStatus => {
    const interactions = lead.totalInteractions || 0;
    const createdAt = new Date(lead.createdAt);
    const daysSinceCreated = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

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

  const fetchLeads = async (page: number = 0) => {
    if (!tenantId) {
      setLoading(false);
      setError("No tenant ID found. Please complete onboarding first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getLeadInteractions(tenantId, undefined, page, pageSize);
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
  };

  useEffect(() => {
    fetchLeads();
  }, []);

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

  useEffect(() => {
    let filtered = leads;

    // Apply status filter
    if (activeStatusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === activeStatusFilter);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.firstName?.toLowerCase().includes(query) ||
          lead.lastName?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.includes(query)
      );
    }

    setFilteredLeads(filtered);
  }, [searchQuery, leads, activeStatusFilter]);

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
      fetchLeads(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      fetchLeads(currentPage + 1);
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
                <h1 className="text-2xl font-bold text-foreground">Customer Relationship Management</h1>
                <p className="text-muted-foreground">
                  Manage leads captured by your AI agents
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fetchLeads(currentPage)}
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
                  className={`border-border/50 cursor-pointer transition-all hover:shadow-md ${
                    activeStatusFilter === "all" ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setActiveStatusFilter("all")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Leads</p>
                        <p className="text-3xl font-bold text-foreground">{totalLeads || leads.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`border-border/50 cursor-pointer transition-all hover:shadow-md ${
                    activeStatusFilter === "contacted" ? "ring-2 ring-orange-500" : ""
                  }`}
                  onClick={() => setActiveStatusFilter(activeStatusFilter === "contacted" ? "all" : "contacted")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Contacted</p>
                        <p className="text-3xl font-bold text-foreground">{statusCounts.contacted}</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100">Contacted</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`border-border/50 cursor-pointer transition-all hover:shadow-md ${
                    activeStatusFilter === "qualified" ? "ring-2 ring-purple-500" : ""
                  }`}
                  onClick={() => setActiveStatusFilter(activeStatusFilter === "qualified" ? "all" : "qualified")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Qualified</p>
                        <p className="text-3xl font-bold text-foreground">{statusCounts.qualified}</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-600 hover:bg-purple-100">Qualified</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`border-border/50 cursor-pointer transition-all hover:shadow-md ${
                    activeStatusFilter === "new" ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setActiveStatusFilter(activeStatusFilter === "new" ? "all" : "new")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">New Leads</p>
                        <p className="text-3xl font-bold text-foreground">{statusCounts.new}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100">New</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
              />
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
                <CardContent className="p-0 divide-y divide-border">
                  {filteredLeads.map((lead, index) => {
                    const statusConfig = STATUS_CONFIG[lead.status];
                    const fullName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Unknown";

                    return (
                      <div
                        key={`${lead.leadId || lead.sessionId}-${index}`}
                        className="p-4 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div className="flex items-center justify-between">
                          {/* Left side - Avatar and Info */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
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
            <div className="space-y-6 py-4 overflow-y-auto flex-1">
              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>

              {/* Source Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Source</h4>
                <div className="flex items-center gap-2">
                  {selectedLead.source === "voice" ? (
                    <>
                      <Mic className="w-4 h-4 text-primary" />
                      <span className="text-sm">Voice Bot</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span className="text-sm">Website Chat</span>
                    </>
                  )}
                </div>
              </div>

              {/* IDs */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Identifiers</h4>
                <div className="grid grid-cols-1 gap-3">
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
                    <p className="text-sm">{formatDate(selectedLead.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Captured Data */}
              {selectedLead.lead && Object.keys(selectedLead.lead).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Captured Data</h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    {Object.entries(selectedLead.lead).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start gap-4">
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
    </SidebarProvider>
  );
};

export default Leads;
