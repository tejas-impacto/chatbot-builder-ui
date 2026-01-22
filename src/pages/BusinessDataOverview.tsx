import { useState, useEffect } from "react";
import { Building2, Globe, Users, Phone, Shield, Target, Palette, Bell, Pencil, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useToast } from "@/hooks/use-toast";
import { getValidAccessToken } from "@/lib/auth";

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
  typicalCustomerQueries: Record<string, string>;
  escalationPreference: string;
  phoneEnabled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  ticketingTool: string;
  supportEmail: string;
  supportPhone: string;
  gdprRequired: boolean;
  hippa: boolean;
  pcidss: boolean;
  soc2: boolean;
  iso27001: boolean;
  restrictedTopics: string;
  mustNotInstructions: string;
  leadCaptureRequired: boolean;
  salesIntentPriority: string;
  salesHandoffMethod: string;
  nameRequired: boolean;
  phoneRequired: boolean;
  emailRequired: boolean;
  companyRequired: boolean;
  communicationStyle: string;
  brandAdjectives: string[];
  wordsToAvoid: string[];
  primaryAdminEmail: string;
  secondaryAdminEmails: string[];
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
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
  typicalCustomerQueries: {},
  escalationPreference: "",
  phoneEnabled: false,
  emailEnabled: false,
  whatsappEnabled: false,
  ticketingTool: "",
  supportEmail: "",
  supportPhone: "",
  gdprRequired: false,
  hippa: false,
  pcidss: false,
  soc2: false,
  iso27001: false,
  restrictedTopics: "",
  mustNotInstructions: "",
  leadCaptureRequired: false,
  salesIntentPriority: "",
  salesHandoffMethod: "",
  nameRequired: false,
  phoneRequired: false,
  emailRequired: false,
  companyRequired: false,
  communicationStyle: "",
  brandAdjectives: [],
  wordsToAvoid: [],
  primaryAdminEmail: "",
  secondaryAdminEmails: [],
  emailNotifications: false,
  smsNotifications: false,
  inAppNotifications: false,
};

const BusinessDataOverview = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tenantData, setTenantData] = useState<TenantData>(initialTenantData);
  const [editedData, setEditedData] = useState<TenantData>(initialTenantData);

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
        description: error instanceof Error ? error.message : "Failed to load business data",
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
        typicalCustomerQueries: editedData.typicalCustomerQueries,
        existingSupportChannels: {
          phone: editedData.phoneEnabled,
          email: editedData.emailEnabled,
          whatsapp: editedData.whatsappEnabled,
          ticketingTool: editedData.ticketingTool,
          supportEmail: editedData.supportEmail,
          supportPhone: editedData.supportPhone,
        },
        escalationPreference: editedData.escalationPreference,
        gdprRequired: editedData.gdprRequired,
        hippa: editedData.hippa,
        pcidss: editedData.pcidss,
        soc2: editedData.soc2,
        iso27001: editedData.iso27001,
        restrictedTopics: editedData.restrictedTopics,
        mustNotInstructions: editedData.mustNotInstructions,
        isLeadCaptureRequired: editedData.leadCaptureRequired,
        mandatoryLeadFields: {
          name: editedData.nameRequired,
          phone: editedData.phoneRequired,
          email: editedData.emailRequired,
          company: editedData.companyRequired,
        },
        salesIntentPriority: editedData.salesIntentPriority,
        salesHandoffMethod: editedData.salesHandoffMethod,
        communicationStyle: editedData.communicationStyle,
        brandAdjectives: editedData.brandAdjectives,
        wordsToAvoid: editedData.wordsToAvoid,
        primaryAdminEmail: editedData.primaryAdminEmail,
        secondaryAdminEmails: editedData.secondaryAdminEmails,
        notificationPreferences: {
          emailNotifications: editedData.emailNotifications,
          smsNotifications: editedData.smsNotifications,
          inAppNotifications: editedData.inAppNotifications,
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
        throw new Error(result.message || 'Failed to save changes');
      }

      toast({
        title: "Success",
        description: "Business information updated successfully!",
      });
      setTenantData({ ...editedData });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof TenantData>(field: K, value: TenantData[K]) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const data = isEditing ? editedData : tenantData;

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

          <div className="p-6 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Business Data Overview</h1>
                <p className="text-muted-foreground">View and manage your business information</p>
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-full bg-primary text-primary-foreground"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleEdit}
                  className="rounded-full bg-background border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {/* Company Identity */}
              <Section
                icon={<Building2 className="w-5 h-5" />}
                title="Company Identity"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Legal Company Name"
                    value={data.legalCompanyName}
                    onChange={(v) => updateField('legalCompanyName', v)}
                    editing={isEditing}
                  />
                  <Field
                    label="Brand Display Name"
                    value={data.brandDisplayName}
                    onChange={(v) => updateField('brandDisplayName', v)}
                    editing={isEditing}
                  />
                  <Field
                    label="Industry"
                    value={data.industry}
                    onChange={(v) => updateField('industry', v)}
                    editing={isEditing}
                  />
                  <Field
                    label="Company Website"
                    value={data.companyWebsite}
                    onChange={(v) => updateField('companyWebsite', v)}
                    editing={isEditing}
                  />
                </div>
                <div className="mt-4">
                  <Field
                    label="Company Description"
                    value={data.companyDescription}
                    onChange={(v) => updateField('companyDescription', v)}
                    editing={isEditing}
                    multiline
                  />
                </div>
              </Section>

              {/* Business Operations */}
              <Section
                icon={<Globe className="w-5 h-5" />}
                title="Business Operations"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Primary Products/Services"
                    value={data.primaryProductsServices?.join(', ') || ''}
                    onChange={(v) => updateField('primaryProductsServices', v.split(',').map(s => s.trim()).filter(Boolean))}
                    editing={isEditing}
                  />
                  <SelectField
                    label="Customer Type"
                    value={data.customerType}
                    onChange={(v) => updateField('customerType', v)}
                    editing={isEditing}
                    options={[
                      { value: 'B2B', label: 'B2B' },
                      { value: 'B2C', label: 'B2C' },
                      { value: 'B2B2C', label: 'Both (B2B2C)' },
                    ]}
                  />
                  <Field
                    label="Country"
                    value={data.country}
                    onChange={(v) => updateField('country', v)}
                    editing={isEditing}
                  />
                  <Field
                    label="Region"
                    value={data.region}
                    onChange={(v) => updateField('region', v)}
                    editing={isEditing}
                  />
                  <SelectField
                    label="Company Size"
                    value={data.employeesRange}
                    onChange={(v) => updateField('employeesRange', v)}
                    editing={isEditing}
                    options={[
                      { value: '1-10', label: '1-10 employees' },
                      { value: '11-50', label: '11-50 employees' },
                      { value: '51-200', label: '51-200 employees' },
                      { value: '201-500', label: '201-500 employees' },
                      { value: '500+', label: '500+ employees' },
                    ]}
                  />
                  <Field
                    label="Monthly Customer Interactions"
                    value={String(data.monthlyCustomerInteractions || 0)}
                    onChange={(v) => updateField('monthlyCustomerInteractions', parseInt(v) || 0)}
                    editing={isEditing}
                    type="number"
                  />
                </div>
              </Section>

              {/* Support Channels */}
              <Section
                icon={<Phone className="w-5 h-5" />}
                title="Support Channels"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <CheckboxField
                    label="Phone Support"
                    checked={data.phoneEnabled}
                    onChange={(v) => updateField('phoneEnabled', v)}
                    editing={isEditing}
                  />
                  <CheckboxField
                    label="Email Support"
                    checked={data.emailEnabled}
                    onChange={(v) => updateField('emailEnabled', v)}
                    editing={isEditing}
                  />
                  <CheckboxField
                    label="WhatsApp Support"
                    checked={data.whatsappEnabled}
                    onChange={(v) => updateField('whatsappEnabled', v)}
                    editing={isEditing}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Support Email"
                    value={data.supportEmail}
                    onChange={(v) => updateField('supportEmail', v)}
                    editing={isEditing}
                  />
                  <Field
                    label="Support Phone"
                    value={data.supportPhone}
                    onChange={(v) => updateField('supportPhone', v)}
                    editing={isEditing}
                  />
                  <Field
                    label="Ticketing Tool"
                    value={data.ticketingTool}
                    onChange={(v) => updateField('ticketingTool', v)}
                    editing={isEditing}
                  />
                  <SelectField
                    label="Escalation Preference"
                    value={data.escalationPreference}
                    onChange={(v) => updateField('escalationPreference', v)}
                    editing={isEditing}
                    options={[
                      { value: 'Phone', label: 'Phone' },
                      { value: 'Email', label: 'Email' },
                      { value: 'Ticket', label: 'Ticket' },
                    ]}
                  />
                </div>
              </Section>

              {/* Compliance & Risk */}
              <Section
                icon={<Shield className="w-5 h-5" />}
                title="Compliance & Risk"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <CheckboxField
                    label="GDPR"
                    checked={data.gdprRequired}
                    onChange={(v) => updateField('gdprRequired', v)}
                    editing={isEditing}
                  />
                  <CheckboxField
                    label="HIPAA"
                    checked={data.hippa}
                    onChange={(v) => updateField('hippa', v)}
                    editing={isEditing}
                  />
                  <CheckboxField
                    label="PCI-DSS"
                    checked={data.pcidss}
                    onChange={(v) => updateField('pcidss', v)}
                    editing={isEditing}
                  />
                  <CheckboxField
                    label="SOC 2"
                    checked={data.soc2}
                    onChange={(v) => updateField('soc2', v)}
                    editing={isEditing}
                  />
                  <CheckboxField
                    label="ISO 27001"
                    checked={data.iso27001}
                    onChange={(v) => updateField('iso27001', v)}
                    editing={isEditing}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Field
                    label="Restricted Topics"
                    value={data.restrictedTopics}
                    onChange={(v) => updateField('restrictedTopics', v)}
                    editing={isEditing}
                    multiline
                  />
                  <Field
                    label="Bot Restrictions (Must Not)"
                    value={data.mustNotInstructions}
                    onChange={(v) => updateField('mustNotInstructions', v)}
                    editing={isEditing}
                    multiline
                  />
                </div>
              </Section>

              {/* Lead Capture & Sales */}
              <Section
                icon={<Target className="w-5 h-5" />}
                title="Lead Capture & Sales"
              >
                <div className="mb-4">
                  <CheckboxField
                    label="Enable Lead Capture"
                    checked={data.leadCaptureRequired}
                    onChange={(v) => updateField('leadCaptureRequired', v)}
                    editing={isEditing}
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <CheckboxField
                    label="Name Required"
                    checked={data.nameRequired}
                    onChange={(v) => updateField('nameRequired', v)}
                    editing={isEditing}
                  />
                  <CheckboxField
                    label="Phone Required"
                    checked={data.phoneRequired}
                    onChange={(v) => updateField('phoneRequired', v)}
                    editing={isEditing}
                  />
                  <CheckboxField
                    label="Email Required"
                    checked={data.emailRequired}
                    onChange={(v) => updateField('emailRequired', v)}
                    editing={isEditing}
                  />
                  <CheckboxField
                    label="Company Required"
                    checked={data.companyRequired}
                    onChange={(v) => updateField('companyRequired', v)}
                    editing={isEditing}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Sales Intent Priority"
                    value={data.salesIntentPriority}
                    onChange={(v) => updateField('salesIntentPriority', v)}
                    editing={isEditing}
                    options={[
                      { value: 'High', label: 'High' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'Low', label: 'Low' },
                    ]}
                  />
                  <SelectField
                    label="Sales Handoff Method"
                    value={data.salesHandoffMethod}
                    onChange={(v) => updateField('salesHandoffMethod', v)}
                    editing={isEditing}
                    options={[
                      { value: 'Email', label: 'Email' },
                      { value: 'CRM', label: 'CRM' },
                      { value: 'Call', label: 'Call' },
                      { value: 'Webhook', label: 'Webhook' },
                    ]}
                  />
                </div>
              </Section>

              {/* Brand Tone */}
              <Section
                icon={<Palette className="w-5 h-5" />}
                title="Brand Tone & Style"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Communication Style"
                    value={data.communicationStyle}
                    onChange={(v) => updateField('communicationStyle', v)}
                    editing={isEditing}
                    options={[
                      { value: 'Formal', label: 'Formal' },
                      { value: 'Semi-formal', label: 'Semi-formal' },
                      { value: 'Casual', label: 'Casual' },
                      { value: 'Friendly', label: 'Friendly' },
                    ]}
                  />
                  <Field
                    label="Brand Adjectives"
                    value={data.brandAdjectives?.join(', ') || ''}
                    onChange={(v) => updateField('brandAdjectives', v.split(',').map(s => s.trim()).filter(Boolean))}
                    editing={isEditing}
                    placeholder="e.g., Professional, Innovative, Reliable"
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Words to Avoid"
                      value={data.wordsToAvoid?.join(', ') || ''}
                      onChange={(v) => updateField('wordsToAvoid', v.split(',').map(s => s.trim()).filter(Boolean))}
                      editing={isEditing}
                      placeholder="e.g., Cheap, Guarantee, Promise"
                    />
                  </div>
                </div>
              </Section>

              {/* Admin & Notifications */}
              <Section
                icon={<Bell className="w-5 h-5" />}
                title="Admin & Notifications"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Field
                    label="Primary Admin Email"
                    value={data.primaryAdminEmail}
                    onChange={(v) => updateField('primaryAdminEmail', v)}
                    editing={isEditing}
                  />
                  <Field
                    label="Secondary Admin Emails"
                    value={data.secondaryAdminEmails?.join(', ') || ''}
                    onChange={(v) => updateField('secondaryAdminEmails', v.split(',').map(s => s.trim()).filter(Boolean))}
                    editing={isEditing}
                    placeholder="Comma-separated emails"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <CheckboxField
                    label="Email Notifications"
                    checked={data.emailNotifications}
                    onChange={(v) => updateField('emailNotifications', v)}
                    editing={isEditing}
                  />
                  <CheckboxField
                    label="SMS Notifications"
                    checked={data.smsNotifications}
                    onChange={(v) => updateField('smsNotifications', v)}
                    editing={isEditing}
                  />
                  <CheckboxField
                    label="In-App Notifications"
                    checked={data.inAppNotifications}
                    onChange={(v) => updateField('inAppNotifications', v)}
                    editing={isEditing}
                  />
                </div>
              </Section>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

// Helper Components
interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const Section = ({ icon, title, children }: SectionProps) => (
  <div className="bg-card rounded-2xl border border-border p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </div>
);

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  editing: boolean;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
}

const Field = ({ label, value, onChange, editing, multiline, type = "text", placeholder }: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
    {editing ? (
      multiline ? (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="resize-none"
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <Input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )
    ) : (
      <p className="text-foreground py-2 px-3 bg-muted/30 rounded-md min-h-[40px]">
        {value || <span className="text-muted-foreground italic">Not set</span>}
      </p>
    )}
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  editing: boolean;
  options: { value: string; label: string }[];
}

const SelectField = ({ label, value, onChange, editing, options }: SelectFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
    {editing ? (
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <p className="text-foreground py-2 px-3 bg-muted/30 rounded-md min-h-[40px]">
        {options.find(o => o.value === value)?.label || value || <span className="text-muted-foreground italic">Not set</span>}
      </p>
    )}
  </div>
);

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  editing: boolean;
}

const CheckboxField = ({ label, checked, onChange, editing }: CheckboxFieldProps) => (
  <div className="flex items-center gap-2">
    <Checkbox
      checked={checked || false}
      onCheckedChange={(v) => onChange(v === true)}
      disabled={!editing}
    />
    <label className="text-sm text-foreground">{label}</label>
  </div>
);

export default BusinessDataOverview;
