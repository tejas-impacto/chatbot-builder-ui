import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Camera, Save, Loader2, AlertCircle, X, Eye, EyeOff } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import InfoTooltip from "@/components/ui/info-tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useToast } from "@/hooks/use-toast";
import { getValidAccessToken } from "@/lib/auth";

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

// Decode JWT payload to extract user info (name, email)
const decodeJwtPayload = (): { name?: string; email?: string } => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return {};
    const payload = token.split('.')[1];
    if (!payload) return {};
    const decoded = JSON.parse(atob(payload));
    return { name: decoded.name || decoded.given_name, email: decoded.email || decoded.sub };
  } catch {
    return {};
  }
};

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("Basic");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tenantData, setTenantData] = useState<TenantData>(initialTenantData);
  const [editedData, setEditedData] = useState<TenantData>(initialTenantData);
  const [jwtUser] = useState(decodeJwtPayload);
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);

  const needsOnboarding = localStorage.getItem('isOnboarded') !== 'true' && localStorage.getItem('onboardingSkipped') === 'true';

  const tabs: TabType[] = ["Basic", "Account", "Security"];

  const handleTabClick = (tab: TabType) => {
    if (needsOnboarding && (tab === "Account" || tab === "Security")) {
      setShowOnboardingPopup(true);
    } else {
      setActiveTab(tab);
    }
  };

  // Password change state
  type PasswordStep = "idle" | "otp-sent" | "verify" | "new-password";
  const [pwStep, setPwStep] = useState<PasswordStep>("idle");
  const [pwOtp, setPwOtp] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const userEmail = tenantData.primaryAdminEmail || jwtUser.email || "";

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    if (!userEmail) {
      toast({ title: "Error", description: "No email found for your account", variant: "destructive" });
      return;
    }
    setPwLoading(true);
    try {
      const response = await fetch('/api/v1/password/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.responseStructure?.toastMessage || 'Failed to send OTP');
      toast({ title: "OTP Sent", description: `Verification code sent to ${userEmail}` });
      setPwStep("otp-sent");
      setResendCooldown(60);
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to send OTP", variant: "destructive" });
    } finally {
      setPwLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (pwOtp.length !== 6) return;
    setPwLoading(true);
    try {
      const response = await fetch('/api/v1/password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
        body: JSON.stringify({ email: userEmail, otp: pwOtp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.responseStructure?.toastMessage || 'Invalid OTP');
      toast({ title: "Verified", description: "OTP verified successfully" });
      setPwStep("new-password");
    } catch (error) {
      toast({ title: "Verification Failed", description: error instanceof Error ? error.message : "Invalid OTP", variant: "destructive" });
    } finally {
      setPwLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (pwNew !== pwConfirm) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (pwNew.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setPwLoading(true);
    try {
      const response = await fetch('/api/v1/password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
        body: JSON.stringify({ email: userEmail, otp: pwOtp, newPassword: pwNew, confirmPassword: pwConfirm }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.responseStructure?.toastMessage || 'Failed to reset password');
      toast({ title: "Success", description: "Password changed successfully" });
      // Reset state
      setPwStep("idle");
      setPwOtp("");
      setPwNew("");
      setPwConfirm("");
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to reset password", variant: "destructive" });
    } finally {
      setPwLoading(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setPwStep("idle");
    setPwOtp("");
    setPwNew("");
    setPwConfirm("");
    setPwLoading(false);
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  const fetchTenantData = async () => {
    setIsLoading(true);
    try {
      const accessToken = await getValidAccessToken();
      const tenantId = localStorage.getItem('tenantId');

      if (!accessToken || !tenantId) {
        // No tenant yet (onboarding not done) — just show empty fields
        return;
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
                    onClick={() => handleTabClick(tab)}
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
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold text-foreground">Personal Information</h2>
                      <InfoTooltip text="Your basic profile details visible across the platform" size="md" />
                    </div>
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
                  <div className="flex items-center gap-4 opacity-50">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        {(displayData.brandDisplayName || jwtUser.name || "U").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex gap-2">
                        <Button variant="default" className="rounded-full bg-primary" disabled>
                          <Camera className="w-4 h-4 mr-2" />
                          Replace Photo
                        </Button>
                        <Button variant="outline" className="rounded-full" disabled>
                          Remove
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5">Coming soon</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="displayName" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Display Name
                        <InfoTooltip text="The name shown across the platform and to your customers" />
                      </Label>
                      <Input
                        id="displayName"
                        value={displayData.brandDisplayName || jwtUser.name || ""}
                        onChange={(e) => handleInputChange('brandDisplayName', e.target.value)}
                        readOnly={!isEditing}
                        className={`mt-2 rounded-xl border-border/50 ${!isEditing ? "cursor-default focus:ring-0" : ""}`}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Email
                        <InfoTooltip text="Primary email used for account notifications and login" />
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={displayData.primaryAdminEmail || jwtUser.email || ""}
                        onChange={(e) => handleInputChange('primaryAdminEmail', e.target.value)}
                        readOnly={!isEditing}
                        className={`mt-2 rounded-xl border-border/50 ${!isEditing ? "cursor-default focus:ring-0" : ""}`}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Location
                        <InfoTooltip text="Your country or region for localization purposes" />
                      </Label>
                      <Input
                        id="location"
                        value={displayData.country || ""}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        readOnly={!isEditing}
                        className={`mt-2 rounded-xl border-border/50 ${!isEditing ? "cursor-default focus:ring-0" : ""}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Account" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold text-foreground">Account</h2>
                      <InfoTooltip text="Company and business details used to personalize your AI agents" size="md" />
                    </div>
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
                      <Label htmlFor="tenantId" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Tenant ID
                        <InfoTooltip text="Your unique account identifier — cannot be changed" />
                      </Label>
                      <Input
                        id="tenantId"
                        value={displayData.tenantId || localStorage.getItem('tenantId') || ""}
                        disabled
                        className="mt-2 rounded-xl border-border/50 bg-muted/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyName" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Company name *
                        <InfoTooltip text="Official registered name of your company" />
                      </Label>
                      <Input
                        id="companyName"
                        value={displayData.legalCompanyName || ""}
                        onChange={(e) => handleInputChange('legalCompanyName', e.target.value)}
                        readOnly={!isEditing}
                        className={`mt-2 rounded-xl border-border/50 ${!isEditing ? "cursor-default focus:ring-0" : ""}`}
                      />
                    </div>

                    <div>
                      <Label htmlFor="brandName" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Brand Name *
                        <InfoTooltip text="The name customers see when interacting with your agents" />
                      </Label>
                      <Input
                        id="brandName"
                        value={displayData.brandDisplayName || ""}
                        onChange={(e) => handleInputChange('brandDisplayName', e.target.value)}
                        readOnly={!isEditing}
                        className={`mt-2 rounded-xl border-border/50 ${!isEditing ? "cursor-default focus:ring-0" : ""}`}
                      />
                    </div>

                    <div>
                      <Label htmlFor="industry" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Industry *
                        <InfoTooltip text="Your business sector — helps tailor agent responses" />
                      </Label>
                      <Select
                        value={displayData.industry || ""}
                        onValueChange={(value) => handleInputChange('industry', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-2 rounded-xl border-border/50 disabled:opacity-100 disabled:text-foreground disabled:cursor-default">
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
                      <Label htmlFor="companyWebsite" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Company website *
                        <InfoTooltip text="Your company's main website URL" />
                      </Label>
                      <Input
                        id="companyWebsite"
                        value={displayData.companyWebsite || ""}
                        onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                        readOnly={!isEditing}
                        className={`mt-2 rounded-xl border-border/50 ${!isEditing ? "cursor-default focus:ring-0" : ""}`}
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyDescription" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Company description *
                        <InfoTooltip text="A brief summary of what your company does" />
                      </Label>
                      <Textarea
                        id="companyDescription"
                        value={displayData.companyDescription || ""}
                        onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                        readOnly={!isEditing}
                        className={`mt-2 rounded-xl border-border/50 min-h-[100px] ${!isEditing ? "cursor-default focus:ring-0" : ""}`}
                      />
                    </div>

                    <div>
                      <Label htmlFor="productsServices" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Primary products / services?
                        <InfoTooltip text="The main offerings your agents should know about" />
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
                      <Label htmlFor="employeesRange" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Company Size *
                        <InfoTooltip text="Number of employees in your organization" />
                      </Label>
                      <Select
                        value={displayData.employeesRange || ""}
                        onValueChange={(value) => handleInputChange('employeesRange', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-2 rounded-xl border-border/50 disabled:opacity-100 disabled:text-foreground disabled:cursor-default">
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
                      <Label htmlFor="customerType" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Target Audience *
                        <InfoTooltip text="Whether you serve businesses, consumers, or both" />
                      </Label>
                      <Select
                        value={displayData.customerType || ""}
                        onValueChange={(value) => handleInputChange('customerType', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-2 rounded-xl border-border/50 disabled:opacity-100 disabled:text-foreground disabled:cursor-default">
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
                      <Label htmlFor="customerGeography" className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Customer Geography *
                        <InfoTooltip text="The primary region your customers are located in" />
                      </Label>
                      <Input
                        id="customerGeography"
                        value={displayData.region || ""}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                        readOnly={!isEditing}
                        className={`mt-2 rounded-xl border-border/50 ${!isEditing ? "cursor-default focus:ring-0" : ""}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Security" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">Security <InfoTooltip text="Manage your password, authentication, and session settings" size="md" /></h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-foreground flex items-center gap-1.5">Password <InfoTooltip text="Change your account login password" size="md" /></h3>
                        {pwStep === "idle" && (
                          <Button variant="outline" className="rounded-full" onClick={handleSendOtp} disabled={pwLoading || !userEmail}>
                            {pwLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Change Password
                          </Button>
                        )}
                        {pwStep !== "idle" && (
                          <Button variant="ghost" size="sm" onClick={handleCancelPasswordChange} className="text-muted-foreground">
                            Cancel
                          </Button>
                        )}
                      </div>

                      {/* OTP Step */}
                      {pwStep === "otp-sent" && (
                        <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
                          <p className="text-sm text-muted-foreground">
                            Enter the 6-digit code sent to <span className="font-medium text-foreground">{userEmail}</span>
                          </p>
                          <div className="flex justify-center">
                            <InputOTP maxLength={6} value={pwOtp} onChange={setPwOtp} disabled={pwLoading}>
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => { if (resendCooldown === 0) handleSendOtp(); }}
                              disabled={resendCooldown > 0}
                              className={`text-sm ${resendCooldown > 0 ? "text-muted-foreground" : "text-primary hover:underline"}`}
                            >
                              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                            </button>
                            <Button onClick={handleVerifyOtp} disabled={pwOtp.length !== 6 || pwLoading} className="rounded-full">
                              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                              Verify
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* New Password Step */}
                      {pwStep === "new-password" && (
                        <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/30">
                          <div>
                            <Label className="text-sm text-muted-foreground">New Password</Label>
                            <div className="relative mt-1">
                              <Input
                                type={showPwNew ? "text" : "password"}
                                value={pwNew}
                                onChange={(e) => setPwNew(e.target.value)}
                                placeholder="Enter new password"
                                className="rounded-xl border-border/50 pr-10"
                                disabled={pwLoading}
                              />
                              <button type="button" onClick={() => setShowPwNew(!showPwNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showPwNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Min 8 chars, uppercase, lowercase, digit, and special char</p>
                          </div>
                          <div>
                            <Label className="text-sm text-muted-foreground">Confirm Password</Label>
                            <div className="relative mt-1">
                              <Input
                                type={showPwConfirm ? "text" : "password"}
                                value={pwConfirm}
                                onChange={(e) => setPwConfirm(e.target.value)}
                                placeholder="Confirm new password"
                                className="rounded-xl border-border/50 pr-10"
                                disabled={pwLoading}
                              />
                              <button type="button" onClick={() => setShowPwConfirm(!showPwConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {showPwConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button onClick={handleResetPassword} disabled={!pwNew || !pwConfirm || pwLoading} className="rounded-full">
                              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                              Set Password
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-border">
                      <h3 className="font-medium text-foreground mb-4 flex items-center gap-1.5">Multi-factor authentication (MFA) <InfoTooltip text="Add extra layers of security to protect your account" size="md" /></h3>

                      <div className="space-y-4 opacity-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Authenticator app</p>
                            <p className="text-sm text-muted-foreground">Use authenticator app for 2-step verification</p>
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Coming soon</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Push notification</p>
                            <p className="text-sm text-muted-foreground">Approve sign-ins and verify in multi factor auth</p>
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Coming soon</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border">
                      <h3 className="font-medium text-foreground mb-4 flex items-center gap-1.5">Session Management <InfoTooltip text="Control active login sessions across your devices" size="md" /></h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between opacity-50">
                          <div>
                            <p className="font-medium text-foreground">Log out of All Devices</p>
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Coming soon</span>
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

      {/* Onboarding popup for Account/Security tabs */}
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
                  Complete the onboarding process to access Account and Security settings.
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
    </SidebarProvider>
  );
};

export default Settings;
