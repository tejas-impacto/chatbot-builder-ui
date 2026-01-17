import { useState } from "react";
import { Edit2, Camera, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

type TabType = "Basic" | "Account" | "Security";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabType>("Basic");
  const [showPassword, setShowPassword] = useState(false);

  const tabs: TabType[] = ["Basic", "Account", "Security"];

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
                    <Button variant="ghost" size="icon">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>KR</AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <Button variant="default" className="rounded-full bg-primary">
                        <Camera className="w-4 h-4 mr-2" />
                        Replace Photo
                      </Button>
                      <Button variant="outline" className="rounded-full">
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
                        defaultValue="Karthik Kumar" 
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
                        defaultValue="Karthik.kumar@abc.com" 
                        className="mt-2 rounded-xl border-border/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm text-muted-foreground">
                        Location
                      </Label>
                      <Input 
                        id="location" 
                        defaultValue="India" 
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
                    <Button variant="ghost" size="icon">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="tenantId" className="text-sm text-muted-foreground">
                        Tenant ID
                      </Label>
                      <Input 
                        id="tenantId" 
                        defaultValue="4567891011" 
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
                        defaultValue="Impacto" 
                        className="mt-2 rounded-xl border-border/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="brandName" className="text-sm text-muted-foreground">
                        Brand Name *
                      </Label>
                      <Input 
                        id="brandName" 
                        defaultValue="Flypro" 
                        className="mt-2 rounded-xl border-border/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="industry" className="text-sm text-muted-foreground">
                        Industry *
                      </Label>
                      <Select defaultValue="fintech">
                        <SelectTrigger className="mt-2 rounded-xl border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fintech">Fintech</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="saas">SaaS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="companyWebsite" className="text-sm text-muted-foreground">
                        Company website *
                      </Label>
                      <Input 
                        id="companyWebsite" 
                        defaultValue="impacto.com" 
                        className="mt-2 rounded-xl border-border/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyDescription" className="text-sm text-muted-foreground">
                        Company description *
                      </Label>
                      <Textarea 
                        id="companyDescription" 
                        defaultValue="We make products for enterprise.." 
                        className="mt-2 rounded-xl border-border/50 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="productsServices" className="text-sm text-muted-foreground">
                        Primary products / services?
                      </Label>
                      <Input 
                        id="productsServices" 
                        defaultValue="Fintech" 
                        className="mt-2 rounded-xl border-border/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="businessDuration" className="text-sm text-muted-foreground">
                        Business Duration *
                      </Label>
                      <Select defaultValue="select">
                        <SelectTrigger className="mt-2 rounded-xl border-border/50">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="0-1">0-1 years</SelectItem>
                          <SelectItem value="1-5">1-5 years</SelectItem>
                          <SelectItem value="5+">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="targetAudience" className="text-sm text-muted-foreground">
                        Target Audience *
                      </Label>
                      <Select defaultValue="smb">
                        <SelectTrigger className="mt-2 rounded-xl border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smb">SMB</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="consumer">Consumer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="customerGeography" className="text-sm text-muted-foreground">
                        Customer Geography *
                      </Label>
                      <Input 
                        id="customerGeography" 
                        defaultValue="Pan India" 
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
                    <Button variant="ghost" size="icon">
                      <Edit2 className="w-4 h-4" />
                    </Button>
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
                            defaultValue="Karthik@12345" 
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
                            <p className="text-sm text-muted-foreground">Use authenticator app for 2-step verification exp.</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Push notification</p>
                            <p className="text-sm text-muted-foreground">Approve sign-ins and verify in multi factor authe...</p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Log out of All Devices</p>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full">
                            Log out
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Log out of All Devices</p>
                            <p className="text-sm text-muted-foreground">Log out of all sessions on all devices including your current session. 
                            <br />It may take ~30 mins for other devices to be logged out.</p>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                            Log out
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
