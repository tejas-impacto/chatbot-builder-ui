import { useState, useEffect } from "react";
import {
  Users,
  Loader2,
  RefreshCw,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Bot,
  Hash,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { getLeadInteractions, type LeadInteraction } from "@/lib/botApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Leads = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<LeadInteraction[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [selectedLead, setSelectedLead] = useState<LeadInteraction | null>(null);
  const pageSize = 20;

  const fetchLeads = async (page: number = 0) => {
    const tenantId = localStorage.getItem("tenantId");

    if (!tenantId) {
      setLoading(false);
      setError("No tenant ID found. Please complete onboarding first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getLeadInteractions(tenantId, undefined, page, pageSize);
      const leadsData = response.data || [];
      setLeads(leadsData);
      setFilteredLeads(leadsData);
      setTotalLeads(response.total || 0);
      setCurrentPage(response.currentPage || 0);
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

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLeads(leads);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = leads.filter(
        (lead) =>
          lead.firstName?.toLowerCase().includes(query) ||
          lead.lastName?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.includes(query) ||
          lead.botId?.toLowerCase().includes(query)
      );
      setFilteredLeads(filtered);
    }
  }, [searchQuery, leads]);

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
                <h1 className="text-2xl font-bold text-foreground">Leads</h1>
                <p className="text-muted-foreground">
                  View and manage your customer leads
                </p>
              </div>
              <div className="flex gap-3">
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
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads by name, email, phone, or bot ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
              />
            </div>

            {/* Stats Cards */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Leads</p>
                        <p className="text-2xl font-bold text-foreground">
                          {totalLeads}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold text-foreground">
                          {
                            leads.filter((lead) => {
                              const createdAt = new Date(lead.createdAt);
                              const now = new Date();
                              return (
                                createdAt.getMonth() === now.getMonth() &&
                                createdAt.getFullYear() === now.getFullYear()
                              );
                            }).length
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

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
                    {searchQuery ? "No matching leads" : "No leads yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    {searchQuery
                      ? "Try adjusting your search criteria."
                      : "Leads will appear here when customers interact with your chatbots."}
                  </p>
                </div>
              </div>
            )}

            {/* Leads Table */}
            {!loading && !error && filteredLeads.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead ID</TableHead>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Bot ID</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow
                          key={lead.leadId || lead.sessionId}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <TableCell>
                            <span className="text-xs font-mono text-muted-foreground" title={lead.leadId}>
                              {lead.leadId ? lead.leadId.substring(0, 12) + "..." : "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-primary">
                                  {getInitials(lead.firstName, lead.lastName)}
                                </span>
                              </div>
                              <span className="font-medium">
                                {lead.firstName || lead.lastName
                                  ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim()
                                  : "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {lead.email || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {lead.phone || "-"}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-mono text-muted-foreground" title={lead.botId}>
                              {lead.botId ? lead.botId.substring(0, 12) + "..." : "-"}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                            {formatDate(lead.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {selectedLead && getInitials(selectedLead.firstName, selectedLead.lastName)}
                </span>
              </div>
              <span>
                {selectedLead?.firstName || selectedLead?.lastName
                  ? `${selectedLead?.firstName || ""} ${selectedLead?.lastName || ""}`.trim()
                  : "Unknown Lead"}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-6 py-4">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Leads;
