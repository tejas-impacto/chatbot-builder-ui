import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout, getValidAccessToken } from "@/lib/auth";
import {
  LayoutDashboard,
  Database,
  Bot,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  AlertCircle,
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  subItems?: { title: string; url: string }[];
}

interface DashboardSidebarProps {
  requiresOnboarding?: boolean;
  onBlockedAction?: () => void;
}

// Check if onboarding is required
const checkOnboardingRequired = () => {
  const isOnboarded = localStorage.getItem('isOnboarded');
  const onboardingSkipped = localStorage.getItem('onboardingSkipped');
  return isOnboarded !== 'true' && onboardingSkipped === 'true';
};

const menuItems: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  {
    title: "Business Information",
    url: "/business-data",
    icon: Database,
    subItems: [
      { title: "Business Data Overview", url: "/business-data/overview" },
      { title: "Document Management", url: "/business-data" },
    ]
  },
  {
    title: "Manage Agents",
    url: "/manage-agents",
    icon: Bot,
    subItems: [
      { title: "All Agents", url: "/manage-agents" },
      { title: "Chat Agents", url: "/manage-agents/chat" },
      { title: "Voice Agents", url: "/manage-agents/voice" },
      { title: "Knowledge Graph", url: "/knowledge-graph" },
    ]
  },
  {
    title: "CRM",
    url: "/leads",
    icon: Users,
    subItems: [
      { title: "Leads", url: "/leads" },
    ]
  },
];

const DashboardSidebar = ({ requiresOnboarding: externalRequiresOnboarding, onBlockedAction }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState<string>("");
  const [tenantId, setTenantId] = useState<string>("");
  const [needsOnboarding, setNeedsOnboarding] = useState(checkOnboardingRequired);

  const requiresOnboarding = externalRequiresOnboarding || needsOnboarding;
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(requiresOnboarding);

  // Navigate safely — navigates to the page but also shows onboarding popup if needed
  const safeNavigate = (url: string) => {
    navigate(url);
    if (requiresOnboarding) {
      setShowOnboardingPopup(true);
      if (onBlockedAction) onBlockedAction();
    }
  };

  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      setTenantId(storedTenantId);
      const fetchCompany = async () => {
        try {
          const accessToken = await getValidAccessToken();
          if (!accessToken) return;
          const response = await fetch(`/api/v1/tenants/${storedTenantId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'accept': '*/*' },
          });
          if (response.ok) {
            const result = await response.json();
            const data = result.responseStructure?.data;
            setCompanyName(data?.brandDisplayName || data?.legalCompanyName || '');
          }
        } catch {
          // ignore
        }
      };
      fetchCompany();
    }
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (item: MenuItem) => {
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname === sub.url);
    }
    return location.pathname === item.url;
  };

  const toggleMenu = (title: string) => {
    setOpenMenus(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
    <Sidebar
      className="border-r border-sidebar-border"
      collapsible="icon"
    >
      <SidebarHeader className={collapsed ? "p-2" : "p-4"}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className={`${collapsed ? "w-8 h-8 rounded-lg" : "w-10 h-10 rounded-xl"} bg-primary flex items-center justify-center flex-shrink-0 transition-all duration-200`}>
            <Bot className={`${collapsed ? "w-4 h-4" : "w-5 h-5"} text-primary-foreground transition-all duration-200`} />
          </div>
          {!collapsed && (
            <>
              <h1 className="text-lg font-bold text-primary flex-1">Agent Builder</h1>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground hover:scale-105"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        {collapsed && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mt-2 p-1.5 rounded-lg hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground hover:scale-105"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* Create Bot Button */}
        {!collapsed && (
          <Button
            variant="outline"
            className={`mt-4 w-full rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 ${
              requiresOnboarding ? 'opacity-75' : ''
            }`}
            onClick={() => safeNavigate("/bot-creation")}
          >
            + Create Agent
          </Button>
        )}
      </SidebarHeader>

      <Separator className={`${collapsed ? "mx-1" : "mx-4"} w-auto transition-all duration-200`} />

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.subItems ? (
                    collapsed ? (
                      <SidebarMenuButton
                        tooltip={item.title}
                        onClick={() => safeNavigate(item.url)}
                        className={`rounded-xl transition-all duration-200 ${
                          isParentActive(item)
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "hover:bg-sidebar-accent"
                        }`}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    ) : (
                    <Collapsible
                      open={openMenus.includes(item.title) || isParentActive(item)}
                      onOpenChange={() => toggleMenu(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          className={`rounded-xl transition-all duration-200 ${
                            isParentActive(item)
                              ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                              : "hover:bg-sidebar-accent"
                          }`}
                        >
                          <item.icon />
                          <span className="flex-1 text-left">{item.title}</span>
                          {(openMenus.includes(item.title) || isParentActive(item)) ? (
                            <ChevronUp className="ml-auto" />
                          ) : (
                            <ChevronDown className="ml-auto" />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-7 mt-1 space-y-0.5 border-l-2 border-primary/20 pl-3">
                          {item.subItems.map((subItem) => (
                            <button
                              key={subItem.title}
                              onClick={() => safeNavigate(subItem.url)}
                              className={`block w-full text-left text-sm py-1.5 px-2 rounded-lg transition-all duration-200 ${
                                isActive(subItem.url)
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent hover:translate-x-0.5"
                              }`}
                            >
                              {subItem.title}
                            </button>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    )
                  ) : (
                    <SidebarMenuButton
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      onClick={() => safeNavigate(item.url)}
                      className={`rounded-xl transition-all duration-200 ${
                        isActive(item.url)
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-sidebar-accent"
                      }`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={collapsed ? "p-2" : "p-4"}>
        {/* Profile */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} mb-2 px-1`}>
          <Avatar className={`${collapsed ? "w-7 h-7" : "w-8 h-8"} flex-shrink-0`}>
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{companyName || 'Company'}</p>
              {tenantId && (
                <p className="text-[10px] text-muted-foreground truncate">ID: {tenantId}</p>
              )}
            </div>
          )}
        </div>
        <Separator className="mb-1" />

        <SidebarMenuButton
          tooltip="Settings"
          onClick={() => safeNavigate("/settings")}
          className={`rounded-xl transition-all duration-200 mb-1 ${
            isActive("/settings")
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "hover:bg-sidebar-accent"
          }`}
        >
          <Settings />
          <span>Settings</span>
        </SidebarMenuButton>

        <SidebarMenuButton
          tooltip="Logout"
          onClick={handleLogout}
          className="rounded-xl transition-all duration-200 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>

    </Sidebar>

    {/* Onboarding required overlay — catches clicks on page content (outside Sidebar to avoid stacking context) */}
    {requiresOnboarding && !showOnboardingPopup && (
      <div
        className="fixed inset-0 z-40 cursor-pointer"
        style={{ left: collapsed ? "var(--sidebar-width-icon)" : "var(--sidebar-width)" }}
        onClick={() => setShowOnboardingPopup(true)}
      />
    )}

    {/* Onboarding popup */}
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
                  onClick={() => setShowOnboardingPopup(false)}
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
    </>
  );
};

export default DashboardSidebar;
