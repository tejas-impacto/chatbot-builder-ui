import { useState } from "react";
import { Search, Plus, MoreVertical, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: "New" | "Contacted" | "Qualified" | "Converted";
  source: string;
  lastContact: string;
  avatar?: string;
}

const CRM = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const leads: Lead[] = [
    { id: 1, name: "John Smith", email: "john.smith@example.com", phone: "+1 234 567 8900", location: "New York, USA", status: "New", source: "Website Chat", lastContact: "2 hours ago" },
    { id: 2, name: "Sarah Johnson", email: "sarah.j@example.com", phone: "+1 234 567 8901", location: "Los Angeles, USA", status: "Contacted", source: "Voice Bot", lastContact: "1 day ago" },
    { id: 3, name: "Mike Wilson", email: "mike.w@example.com", phone: "+1 234 567 8902", location: "Chicago, USA", status: "Qualified", source: "Website Chat", lastContact: "3 days ago" },
    { id: 4, name: "Emily Brown", email: "emily.b@example.com", phone: "+1 234 567 8903", location: "Houston, USA", status: "Converted", source: "Voice Bot", lastContact: "1 week ago" },
    { id: 5, name: "David Lee", email: "david.l@example.com", phone: "+1 234 567 8904", location: "Phoenix, USA", status: "New", source: "Website Chat", lastContact: "Just now" },
  ];

  const getStatusColor = (status: Lead["status"]) => {
    const colors = {
      New: "bg-blue-500/10 text-blue-600",
      Contacted: "bg-yellow-500/10 text-yellow-600",
      Qualified: "bg-purple-500/10 text-purple-600",
      Converted: "bg-green-500/10 text-green-600",
    };
    return colors[status];
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusCounts = {
    New: leads.filter(l => l.status === "New").length,
    Contacted: leads.filter(l => l.status === "Contacted").length,
    Qualified: leads.filter(l => l.status === "Qualified").length,
    Converted: leads.filter(l => l.status === "Converted").length,
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-auto">
          <DashboardHeader />

          <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Customer Relationship Management</h1>
                <p className="text-muted-foreground">Manage leads captured by your AI agents</p>
              </div>
              <Button className="rounded-full bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(statusCounts).map(([status, count]) => (
                <Card key={status} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{status}</p>
                        <p className="text-2xl font-bold text-foreground">{count}</p>
                      </div>
                      <Badge className={getStatusColor(status as Lead["status"])}>{status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full bg-muted/50 border-none"
                />
              </div>
            </div>

            {/* Leads List */}
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="border-border/50 hover:border-primary/30 hover:shadow-sm transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={lead.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {lead.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{lead.name}</h3>
                            <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lead.location}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Source: {lead.source}</p>
                          <p className="text-xs text-muted-foreground">Last contact: {lead.lastContact}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CRM;
