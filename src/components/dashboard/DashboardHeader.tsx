import { useState, useEffect } from "react";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getValidAccessToken } from "@/lib/auth";

const DashboardHeader = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    setTenantId(storedTenantId);

    // Fetch company name from tenant data
    const fetchCompanyName = async () => {
      if (!storedTenantId) return;

      try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) return;

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
      } catch (err) {
        console.error('Failed to fetch company name:', err);
      }
    };

    fetchCompanyName();
  }, []);

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
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for AI Agent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-muted/50 border-none"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>

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
