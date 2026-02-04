import { useState, useEffect } from "react";
import { Edit2, Camera, Eye, EyeOff, Save, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useToast } from "@/hooks/use-toast";
import { getValidAccessToken, logout } from "@/lib/auth";

type TabType = "Basic" | "Account" | "Security";

interface TenantData {
  tenantId: string;
  legalCompanyName: string;
  brandDisplayName: string;
  industry: string;
  companyWebsite: string;
  companyDescription: string;
  primaryProductsServices: string[];
  customerType: string;
  country: string;
  region: string;
  employeesRange: string;
  monthlyCustomerInteractions: number;
  primaryAdminEmail: string;
}

const initialTenantData: TenantData = {
  tenantId: "",
  legalCompanyName: "",
  brandDisplayName: "",
  industry: "",
  companyWebsite: "",
  companyDescription: "",
  primaryProductsServices: [],
  customerType: "",
  country: "",
  region: "",
  employeesRange: "",
  monthlyCustomerInteractions: 0,
  primaryAdminEmail: "",
};

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("Basic");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tenantData, setTenantData] = useState<TenantData>(initialTenantData);
  const [editedData, setEditedData] = useState<TenantData>(initialTenantData);

  const tabs: TabType[] = ["Basic", "Account", "Security"];

  useEffect(() => {
    fetchTenantData();
  }, []);

  const fetchTenantData = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getValidAccessToken();
      const tenantId = localStorage.getItem('tenantId');

      if (!accessToken || !tenantId) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/v1/tenants/${tenantId}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch tenant data');
      }

      const data = result.responseStructure?.data;
      if (data) {
        setTenantData(data);
        setEditedData(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({ ...tenantData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({ ...tenantData });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const accessToken = await getValidAccessToken();
      const tenantId = localStorage.getItem('tenantId');

      if (!accessToken || !tenantId) {
        throw new Error('Authentication required');
      }

      // Map editedData to onboarding API payload structure
      const onboardingPayload = {
        tenantId: tenantId,
        companyIdentity: {
          legalCompanyName: editedData.legalCompanyName,
          brandDisplayName: editedData.brandDisplayName,
          industry: editedData.industry,
          companyWebsite: editedData.companyWebsite,
          companyDescription: editedData.companyDescription,
        },
        primaryProductsServices: editedData.primaryProductsServices,
        customerType: editedData.customerType,
        customerGeography: {
          country: editedData.country,
          region: editedData.region,
        },
        businessSize: {
          employeesRange: editedData.employeesRange,
          monthlyCustomerInteractions: editedData.monthlyCustomerInteractions,
        },
      };

      const response = await fetch('/api/v1/tenants/onboarding', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(onboardingPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save settings');
      }

      setTenantData({ ...editedData });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof TenantData, value: string | string[] | number) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogout = () => {
    logout();
  };

  const displayData = isEditing ? editedData : tenantData;

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto">
            <DashboardHeader />
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto">
          <DashboardHeader />

          <div className="p-6">
            <div className="max-w-3xl">
              {/* Tabs */}
              <div className="flex gap-2 mb-8">
                {tabs.map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? "default" : "ghost"}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-6 ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "Basic" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-foreground">Personal Information</h2>
                    {!isEditing ? (
                      <Button variant="ghost" size="icon" onClick={handleEdit}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        {displayData.brandDisplayName?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <Button variant="default" className="rounded-full bg-primary" disabled={!isEditing}>
                        <Camera className="w-4 h-4 mr-2" />
                        Replace Photo
                      </Button>
                      <Button variant="outline" className="rounded-full" disabled={!isEditing}>
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="displayName" className="text-sm text-muted-foreground">
                        Display Name
                      </Label>
                      <Input
                        id="displayName"
                        value={displayData.brandDisplayName || ""}
                        onChange={(e) => handleInputChange('brandDisplayName', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2 rounded-xl border-border/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm text-muted-foreground">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={displayData.primaryAdminEmail || ""}
                        onChange={(e) => handleInputChange('primaryAdminEmail', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2 rounded-xl border-border/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm text-muted-foreground">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={displayData.country || ""}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2 rounded-xl border-border/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Account" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-foreground">Account</h2>
                    {!isEditing ? (
                      <Button variant="ghost" size="icon" onClick={handleEdit}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                          Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="tenantId" className="text-sm text-muted-foreground">
                        Tenant ID
                      </Label>
                      <Input
                        id="tenantId"
                        value={displayData.tenantId || localStorage.getItem('tenantId') || ""}
                        disabled
                        className="mt-2 rounded-xl border-border/50 bg-muted/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyName" className="text-sm text-muted-foreground">
                        Company name *
                      </Label>
                      <Input
                        id="companyName"
                        value={displayData.legalCompanyName || ""}
                        onChange={(e) => handleInputChange('legalCompanyName', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2 rounded-xl border-border/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="brandName" className="text-sm text-muted-foreground">
                        Brand Name *
                      </Label>
                      <Input
                        id="brandName"
                        value={displayData.brandDisplayName || ""}
                        onChange={(e) => handleInputChange('brandDisplayName', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2 rounded-xl border-border/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="industry" className="text-sm text-muted-foreground">
                        Industry *
                      </Label>
                      <Select
                        value={displayData.industry || ""}
                        onValueChange={(value) => handleInputChange('industry', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-2 rounded-xl border-border/50">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fintech">Fintech</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="saas">SaaS</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="companyWebsite" className="text-sm text-muted-foreground">
                        Company website *
                      </Label>
                      <Input
                        id="companyWebsite"
                        value={displayData.companyWebsite || ""}
                        onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2 rounded-xl border-border/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyDescription" className="text-sm text-muted-foreground">
                        Company description *
                      </Label>
                      <Textarea
                        id="companyDescription"
                        value={displayData.companyDescription || ""}
                        onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2 rounded-xl border-border/50 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="productsServices" className="text-sm text-muted-foreground">
                        Primary products / services?
                      </Label>
                      <Input
                        id="productsServices"
                        value={displayData.primaryProductsServices?.join(', ') || ""}
                        onChange={(e) => handleInputChange('primaryProductsServices', e.target.value.split(',').map(s => s.trim()))}
                        disabled={!isEditing}
                        className="mt-2 rounded-xl border-border/50"
                        placeholder="Separate multiple with commas"
                      />
                    </div>

                    <div>
                      <Label htmlFor="employeesRange" className="text-sm text-muted-foreground">
                        Company Size *
                      </Label>
                      <Select
                        value={displayData.employeesRange || ""}
                        onValueChange={(value) => handleInputChange('employeesRange', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-2 rounded-xl border-border/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="customerType" className="text-sm text-muted-foreground">
                        Target Audience *
                      </Label>
                      <Select
                        value={displayData.customerType || ""}
                        onValueChange={(value) => handleInputChange('customerType', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-2 rounded-xl border-border/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B2B">B2B</SelectItem>
                          <SelectItem value="B2C">B2C</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="customerGeography" className="text-sm text-muted-foreground">
                        Customer Geography *
                      </Label>
                      <Input
                        id="customerGeography"
                        value={displayData.region || ""}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                        disabled={!isEditing}
                        className="mt-2 rounded-xl border-border/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Security" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-foreground">Security</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-foreground mb-4">Password</h3>
                      <div>
                        <Label htmlFor="currentPassword" className="text-sm text-muted-foreground">
                          Current Password
                        </Label>
                        <div className="relative mt-2">
                          <Input
                            id="currentPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="rounded-xl border-border/50 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-4 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        Change Password
                      </Button>
                    </div>

                    <div className="pt-6 border-t border-border">
                      <h3 className="font-medium text-foreground mb-4">Multi-factor authentication (MFA)</h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Authenticator app</p>
                            <p className="text-sm text-muted-foreground">Use authenticator app for 2-step verification</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Push notification</p>
                            <p className="text-sm text-muted-foreground">Approve sign-ins and verify in multi factor auth</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                      <h3 className="font-medium text-foreground mb-4">Session Management</h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Log out</p>
                            <p className="text-sm text-muted-foreground">Sign out of your current session</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={handleLogout}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Log out of All Devices</p>
                            <p className="text-sm text-muted-foreground">
                              Log out of all sessions on all devices including your current session.
                              <br />It may take ~30 mins for other devices to be logged out.
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={handleLogout}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out all
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
