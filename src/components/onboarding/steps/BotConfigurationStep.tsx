import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, BarChart3, TrendingDown, Phone, Mail, MessageSquare, Webhook } from "lucide-react";

interface BotConfigurationData {
  supportChannels: string[];
  ticketingTool: string;
  supportEmail: string;
  supportPhone: string;
  regulations: string[];
  restrictedTopics: string;
  botRestrictions: string;
  enableLeadCapture: boolean;
  captureFields: string[];
  salesPriority: string;
  handoffMethod: string;
  escalationPreference: string;
  communicationStyle: string;
  brandAdjectives: string[];
  wordsToAvoid: string[];
  primaryAdminEmail: string;
  secondaryAdminEmails: string[];
  notificationPreferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    inAppNotifications: boolean;
  };
}

interface BotConfigurationStepProps {
  data: BotConfigurationData;
  onChange: (data: Partial<BotConfigurationData>) => void;
}

const channels = [
  { id: "email", label: "Email", icon: Mail },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
];
const regulations = ["GDPR", "HIPAA", "PCI-DSS", "SOC 2", "ISO 27001", "None"];
const captureOptions = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "name", label: "Full Name" },
  { id: "company", label: "Company" },
];
const priorityOptions = [
  { id: "High", label: "Aggressive", icon: TrendingUp, desc: "Capture leads early" },
  { id: "Medium", label: "Balanced", icon: BarChart3, desc: "After building rapport" },
  { id: "Low", label: "Soft", icon: TrendingDown, desc: "Only when asked" },
];
const handoffOptions = [
  { id: "Call", label: "Schedule Call", icon: Phone },
  { id: "Email", label: "Send Email", icon: Mail },
  { id: "CRM", label: "Add to CRM", icon: Webhook },
];
const escalationOptions = [
  { id: "Phone", label: "Phone" },
  { id: "Ticket", label: "Ticket" },
  { id: "Email", label: "Email" },
];
const communicationStyleOptions = [
  { id: "Formal", label: "Formal", desc: "Professional and business-like" },
  { id: "Semi-formal", label: "Semi-formal", desc: "Friendly but professional" },
  { id: "Casual", label: "Casual", desc: "Relaxed and conversational" },
];

const BotConfigurationStep = ({ data, onChange }: BotConfigurationStepProps) => {
  const toggleChannel = (channel: string) => {
    const current = data.supportChannels || [];
    const updated = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel];
    onChange({ supportChannels: updated });
  };

  const toggleRegulation = (regulation: string) => {
    const current = data.regulations || [];
    const updated = current.includes(regulation)
      ? current.filter((r) => r !== regulation)
      : [...current, regulation];
    onChange({ regulations: updated });
  };

  const toggleCaptureField = (field: string) => {
    const current = data.captureFields || [];
    const updated = current.includes(field)
      ? current.filter((f) => f !== field)
      : [...current, field];
    onChange({ captureFields: updated });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section 1: Customer Support Setup */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Customer Support Setup
        </h2>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Existing support channels
          </Label>
          <div className="flex flex-wrap gap-4">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div key={channel.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={channel.id}
                    checked={data.supportChannels?.includes(channel.id)}
                    onCheckedChange={() => toggleChannel(channel.id)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor={channel.id} className="flex items-center gap-2 text-sm font-medium cursor-pointer text-foreground">
                    <Icon className="w-4 h-4" />
                    {channel.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {data.supportChannels?.includes("email") && (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="supportEmail" className="text-sm font-semibold text-foreground">
              Support Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="supportEmail"
              type="email"
              value={data.supportEmail}
              onChange={(e) => onChange({ supportEmail: e.target.value })}
              placeholder="support@yourcompany.com"
              className="onboarding-input"
            />
          </div>
        )}

        {data.supportChannels?.includes("phone") && (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="supportPhone" className="text-sm font-semibold text-foreground">
              Support Phone
            </Label>
            <Input
              id="supportPhone"
              type="tel"
              value={data.supportPhone}
              onChange={(e) => onChange({ supportPhone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="onboarding-input"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="ticketingTool" className="text-sm font-semibold text-foreground">
            Ticketing Tool (if any)
          </Label>
          <Input
            id="ticketingTool"
            value={data.ticketingTool}
            onChange={(e) => onChange({ ticketingTool: e.target.value })}
            placeholder="e.g., Zendesk, Freshdesk, Intercom..."
            className="onboarding-input"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Escalation Preference <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {escalationOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange({ escalationPreference: option.id })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  data.escalationPreference === option.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Compliance & Guardrails */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Compliance & Guardrails
        </h2>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Applicable regulations
          </Label>
          <div className="flex flex-wrap gap-2">
            {regulations.map((regulation) => (
              <button
                key={regulation}
                type="button"
                onClick={() => toggleRegulation(regulation)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  data.regulations?.includes(regulation)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
                }`}
              >
                {regulation}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="restrictedTopics" className="text-sm font-semibold text-foreground">
            Topics the bot should avoid
          </Label>
          <Input
            id="restrictedTopics"
            value={data.restrictedTopics}
            onChange={(e) => onChange({ restrictedTopics: e.target.value })}
            placeholder="e.g., pricing negotiations, refund policies..."
            className="onboarding-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="botRestrictions" className="text-sm font-semibold text-foreground">
            The chatbot should never... <span className="text-destructive">*</span>
          </Label>
          <Input
            id="botRestrictions"
            value={data.botRestrictions}
            onChange={(e) => onChange({ botRestrictions: e.target.value })}
            placeholder="e.g., Never share customer data, never provide legal advice..."
            className="onboarding-input"
          />
        </div>
      </div>

      {/* Section 3: Lead Capture */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Lead Capture & Sales
        </h2>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
          <div>
            <Label htmlFor="enableLeadCapture" className="text-sm font-semibold text-foreground">
              Enable Lead Capture
            </Label>
            <p className="text-xs text-muted-foreground mt-1">Collect visitor information for follow-up</p>
          </div>
          <Switch
            id="enableLeadCapture"
            checked={data.enableLeadCapture}
            onCheckedChange={(checked) => onChange({ enableLeadCapture: checked })}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {data.enableLeadCapture && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">
                Information to collect
              </Label>
              <div className="flex flex-wrap gap-4">
                {captureOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`capture-${option.id}`}
                      checked={data.captureFields?.includes(option.id)}
                      onCheckedChange={() => toggleCaptureField(option.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor={`capture-${option.id}`} className="text-sm font-medium cursor-pointer text-foreground">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">
                Lead capture approach
              </Label>
              <div className="grid md:grid-cols-3 gap-3">
                {priorityOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onChange({ salesPriority: option.id })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                        data.salesPriority === option.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{option.label}</span>
                      <span className={`text-xs ${data.salesPriority === option.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {option.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">
                Sales handoff method
              </Label>
              <div className="flex flex-wrap gap-3">
                {handoffOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onChange({ handoffMethod: option.id })}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        data.handoffMethod === option.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Communication Style */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Communication Style
        </h2>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Bot Communication Style <span className="text-destructive">*</span>
          </Label>
          <div className="grid md:grid-cols-3 gap-3">
            {communicationStyleOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange({ communicationStyle: option.id })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  data.communicationStyle === option.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
                }`}
              >
                <span>{option.label}</span>
                <span className={`text-xs text-center ${data.communicationStyle === option.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {option.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 5: Admin & Notifications */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Admin & Notifications
        </h2>

        <div className="space-y-2">
          <Label htmlFor="primaryAdminEmail" className="text-sm font-semibold text-foreground">
            Primary Admin Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="primaryAdminEmail"
            type="email"
            value={data.primaryAdminEmail}
            onChange={(e) => onChange({ primaryAdminEmail: e.target.value })}
            placeholder="admin@yourcompany.com"
            className="onboarding-input"
          />
          <p className="text-xs text-muted-foreground">Main contact for account notifications and alerts</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div>
              <Label htmlFor="emailNotifications" className="text-sm font-semibold text-foreground">
                Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Receive alerts and updates via email</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={data.notificationPreferences?.emailNotifications}
              onCheckedChange={(checked) =>
                onChange({
                  notificationPreferences: {
                    ...data.notificationPreferences,
                    emailNotifications: checked
                  }
                })
              }
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div>
              <Label htmlFor="smsNotifications" className="text-sm font-semibold text-foreground">
                SMS Notifications
              </Label>
              <p className="text-xs text-muted-foreground mt-1">Get text message alerts for urgent matters</p>
            </div>
            <Switch
              id="smsNotifications"
              checked={data.notificationPreferences?.smsNotifications}
              onCheckedChange={(checked) =>
                onChange({
                  notificationPreferences: {
                    ...data.notificationPreferences,
                    smsNotifications: checked
                  }
                })
              }
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div>
              <Label htmlFor="inAppNotifications" className="text-sm font-semibold text-foreground">
                In-App Notifications
              </Label>
              <p className="text-xs text-muted-foreground mt-1">See notifications within the dashboard</p>
            </div>
            <Switch
              id="inAppNotifications"
              checked={data.notificationPreferences?.inAppNotifications}
              onCheckedChange={(checked) =>
                onChange({
                  notificationPreferences: {
                    ...data.notificationPreferences,
                    inAppNotifications: checked
                  }
                })
              }
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotConfigurationStep;
