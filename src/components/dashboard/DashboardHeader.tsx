import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Bot,
  Mic,
  Loader2,
  MessageSquare,
  LayoutDashboard,
  Database,
  FileText,
  Users,
  UserCheck,
  Network,
  Settings,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getValidAccessToken } from "@/lib/auth";
import { getBotsByTenant, getRecentActivity, type Bot as BotType, type ActivityItem } from "@/lib/botApi";

// Navigation items for search
interface NavItem {
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  keywords: string[];
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    description: "Overview and analytics",
    url: "/dashboard",
    icon: LayoutDashboard,
    keywords: ["home", "overview", "analytics", "stats", "metrics"],
  },
  {
    title: "Business Data Overview",
    description: "View your business data",
    url: "/business-data/overview",
    icon: Database,
    keywords: ["data", "business", "overview", "info"],
  },
  {
    title: "Document Management",
    description: "Manage uploaded documents",
    url: "/business-data",
    icon: FileText,
    keywords: ["documents", "files", "upload", "pdf", "manage", "knowledge"],
  },
  {
    title: "Chat Bots",
    description: "View and manage chat bots",
    url: "/manage-chatbot/bots",
    icon: Bot,
    keywords: ["chatbot", "chat", "bots", "text", "agents"],
  },
  {
    title: "Demo Chat Interface",
    description: "Test your chat bots",
    url: "/manage-chatbot",
    icon: Bot,
    keywords: ["demo", "chat", "test", "preview"],
  },
  {
    title: "Voice Bots",
    description: "View and manage voice bots",
    url: "/manage-voicebot/bots",
    icon: Mic,
    keywords: ["voicebot", "voice", "bots", "audio", "agents"],
  },
  {
    title: "Demo Voice Interface",
    description: "Test your voice bots",
    url: "/manage-voicebot",
    icon: Mic,
    keywords: ["demo", "voice", "test", "preview", "call"],
  },
  {
    title: "CRM",
    description: "Customer relationship management",
    url: "/crm",
    icon: Users,
    keywords: ["crm", "customers", "relationship", "management"],
  },
  {
    title: "Leads",
    description: "View and manage leads",
    url: "/leads",
    icon: UserCheck,
    keywords: ["leads", "customers", "contacts", "prospects", "crm"],
  },
  {
    title: "Knowledge Graph",
    description: "Visualize knowledge connections",
    url: "/knowledge-graph",
    icon: Network,
    keywords: ["knowledge", "graph", "connections", "visualization", "network"],
  },
  {
    title: "Settings",
    description: "Application settings",
    url: "/settings",
    icon: Settings,
    keywords: ["settings", "preferences", "config", "configuration"],
  },
  {
    title: "Create New Bot",
    description: "Create a new AI agent",
    url: "/bot-creation",
    icon: Plus,
    keywords: ["create", "new", "bot", "agent", "add"],
  },
];

interface SearchResult {
  type: "navigation" | "bot";
  item: NavItem | BotType;
}

const DashboardHeader = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("");

  // Search state
  const [bots, setBots] = useState<BotType[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<ActivityItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    setTenantId(storedTenantId);

    // Fetch company name and bots
    const fetchData = async () => {
      if (!storedTenantId) return;

      try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) return;

        // Fetch company name
        const response = await fetch(`/api/v1/tenants/${storedTenantId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'accept': '*/*',
          },
        });

        if (response.ok) {
          const result = await response.json();
          const tenantData = result.responseStructure?.data;
          setCompanyName(tenantData?.brandDisplayName || tenantData?.legalCompanyName || '');
        }

        // Fetch bots for search
        const botsResponse = await getBotsByTenant(storedTenantId);
        const botsData = botsResponse.responseStructure?.data || [];
        setBots(botsData);

        // Fetch recent activity for notifications
        try {
          const activityResponse = await getRecentActivity(storedTenantId, 0, 10);
          setNotifications(activityResponse.data || []);
        } catch {
          // Skip if activity fetch fails
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search navigation items
    navigationItems.forEach((item) => {
      const matchesTitle = item.title.toLowerCase().includes(query);
      const matchesDescription = item.description.toLowerCase().includes(query);
      const matchesKeywords = item.keywords.some((keyword) =>
        keyword.toLowerCase().includes(query)
      );

      if (matchesTitle || matchesDescription || matchesKeywords) {
        results.push({ type: "navigation", item });
      }
    });

    // Search bots
    bots.forEach((bot) => {
      const matchesName = bot.agentName?.toLowerCase().includes(query);
      const matchesPurpose = bot.purposeCategory?.toLowerCase().includes(query);
      const matchesType = bot.channelType?.toLowerCase().includes(query);

      if (matchesName || matchesPurpose || matchesType) {
        results.push({ type: "bot", item: bot });
      }
    });

    setSearchResults(results);
    setShowDropdown(true);
    setIsSearching(false);
  }, [searchQuery, bots]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavSelect = (navItem: NavItem) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(navItem.url);
  };

  const handleBotSelect = (bot: BotType) => {
    setShowDropdown(false);
    setSearchQuery("");

    // Navigate to the appropriate bot interface based on channel type
    if (bot.channelType === 'VOICE') {
      navigate("/manage-voicebot", {
        state: {
          botId: bot.botId,
          botName: bot.agentName,
          tenantId: bot.tenantId,
        },
      });
    } else {
      navigate("/manage-chatbot", {
        state: {
          botId: bot.botId,
          chatbotName: bot.agentName,
          tenantId: bot.tenantId,
        },
      });
    }
  };

  // Group results by type
  const navResults = searchResults.filter((r) => r.type === "navigation");
  const botResults = searchResults.filter((r) => r.type === "bot");

  const formatActionType = (actionType: string) => {
    return actionType
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {companyName ? `Welcome back, ${companyName}` : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted-foreground">Start using your AI Agent</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search with dropdown */}
          <div ref={searchRef} className="relative w-72 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search agents, pages, features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              className="pl-10 rounded-full bg-muted/50 border-none"
            />

            {/* Search dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                {isSearching ? (
                  <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-auto">
                    {/* Navigation Results */}
                    {navResults.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                          Pages & Features
                        </div>
                        <ul>
                          {navResults.map((result) => {
                            const navItem = result.item as NavItem;
                            const Icon = navItem.icon;
                            return (
                              <li key={navItem.url}>
                                <button
                                  onClick={() => handleNavSelect(navItem)}
                                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {navItem.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {navItem.description}
                                    </p>
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Bot Results */}
                    {botResults.length > 0 && (
                      <div>
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30">
                          AI Agents
                        </div>
                        <ul>
                          {botResults.map((result) => {
                            const bot = result.item as BotType;
                            return (
                              <li key={bot.botId}>
                                <button
                                  onClick={() => handleBotSelect(bot)}
                                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                                >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    bot.channelType === 'VOICE' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-primary/10'
                                  }`}>
                                    {bot.channelType === 'VOICE' ? (
                                      <Mic className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    ) : (
                                      <Bot className="w-4 h-4 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {bot.agentName}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {bot.channelType === 'VOICE' ? 'Voice Bot' : 'Chat Bot'} • {bot.purposeCategory || 'General'}
                                    </p>
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm text-foreground">Recent Activity</h3>
                <p className="text-xs text-muted-foreground">Latest updates across your bots</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                ) : (
                  <ul>
                    {notifications.map((activity) => (
                      <li
                        key={activity.id}
                        className="px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 cursor-pointer"
                        onClick={() => {
                          setNotificationsOpen(false);
                          if (activity.entityType === 'LEAD') {
                            navigate('/leads', { state: { highlightLeadId: activity.entityId } });
                          } else if (activity.entityType === 'BOT') {
                            navigate(`/manage-agents/bot/${activity.entityId}`, {
                              state: { bot: bots.find(b => b.botId === activity.entityId) },
                            });
                          } else if (activity.entityType === 'SESSION') {
                            navigate('/leads', { state: { highlightSessionId: activity.entityId } });
                          } else {
                            navigate('/manage-agents');
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activity.entityType === 'BOT'
                              ? 'bg-primary/10'
                              : activity.entityType === 'LEAD'
                              ? 'bg-green-500/10'
                              : 'bg-blue-500/10'
                          }`}>
                            {activity.entityType === 'BOT' ? (
                              <Bot className="w-4 h-4 text-primary" />
                            ) : activity.entityType === 'LEAD' ? (
                              <Users className="w-4 h-4 text-green-600" />
                            ) : (
                              <MessageSquare className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {formatActionType(activity.actionType)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {activity.entityName || activity.entityType}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                            {formatTimeAgo(activity.createdAt)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <Avatar className="w-9 h-9">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>{companyName ? companyName.charAt(0).toUpperCase() : 'C'}</AvatarFallback>
            </Avatar>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-foreground">{companyName || 'Company'}</p>
              {tenantId && (
                <p className="text-xs text-muted-foreground">ID: {tenantId}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
