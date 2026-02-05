import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
import {
  LayoutDashboard,
  Database,
  Bot,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
  Network
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

const menuItems: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  {
    title: "Business Data Manage",
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
    ]
  },
  {
    title: "CRM",
    url: "/crm",
    icon: Users,
    subItems: [
      { title: "Leads", url: "/leads" },
    ]
  },
  { title: "Knowledge Graph", url: "/knowledge-graph", icon: Network },
];

const DashboardSidebar = ({ requiresOnboarding = false, onBlockedAction }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [openMenus, setOpenMenus] = useState<string[]>([]);

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
    <Sidebar 
      className="border-r border-sidebar-border"
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-primary">Agent Builder</h1>
            </div>
          )}
        </div>

        {/* Create Bot Button */}
        {!collapsed && (
          <Button
            variant="outline"
            className={`mt-4 w-full rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground ${
              requiresOnboarding ? 'opacity-75' : ''
            }`}
            onClick={() => {
              if (requiresOnboarding && onBlockedAction) {
                onBlockedAction();
              } else {
                navigate("/bot-creation");
              }
            }}
          >
            + Create Bot
          </Button>
        )}

      </SidebarHeader>

      <Separator className="mx-4 w-auto" />

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.subItems ? (
                    <Collapsible 
                      open={openMenus.includes(item.title) || isParentActive(item)}
                      onOpenChange={() => toggleMenu(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          tooltip={item.title}
                          className={`rounded-xl transition-all duration-200 w-full ${
                            isParentActive(item)
                              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                              : "hover:bg-sidebar-accent"
                          }`}
                        >
                          <div className="flex items-center gap-3 w-full px-3 py-2.5">
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && (
                              <>
                                <span className="flex-1 text-left text-sm">{item.title}</span>
                                {openMenus.includes(item.title) || isParentActive(item) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </>
                            )}
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {!collapsed && (
                          <div className="ml-6 mt-1 space-y-1 border-l-2 border-border pl-4">
                            {item.subItems.map((subItem) => (
                              <button
                                key={subItem.title}
                                onClick={() => navigate(subItem.url)}
                                className={`block w-full text-left text-sm py-2 px-2 rounded-lg transition-colors ${
                                  isActive(subItem.url)
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {subItem.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                      className={`rounded-xl transition-all duration-200 ${
                        isActive(item.url) 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "hover:bg-sidebar-accent"
                      }`}
                    >
                      <button
                        onClick={() => navigate(item.url)}
                        className="flex items-center gap-3 w-full px-3 py-2.5"
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && (
                          <span className="flex-1 text-left text-sm">{item.title}</span>
                        )}
                      </button>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenuButton
          tooltip="Settings"
          onClick={() => navigate("/settings")}
          className={`rounded-xl transition-all duration-200 w-full mb-2 ${
            isActive("/settings")
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "hover:bg-sidebar-accent"
          }`}
        >
          <div className="flex items-center gap-3 w-full px-3 py-2.5">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </div>
        </SidebarMenuButton>
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl ${
            collapsed ? "px-2" : "px-3"
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;