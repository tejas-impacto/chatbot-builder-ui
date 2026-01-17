import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SupportModelData {
  commonQueries: string[];
  supportChannels: string[];
  supportEmail: string;
  supportPhone: string;
}

interface SupportModelStepProps {
  data: SupportModelData;
  onChange: (data: Partial<SupportModelData>) => void;
}

const queryTypes = ["Pricing", "Sales", "Support", "Troubleshooting", "Other"];
const channels = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "whatsapp", label: "WhatsApp" },
];

const SupportModelStep = ({ data, onChange }: SupportModelStepProps) => {
  const toggleQuery = (query: string) => {
    const current = data.commonQueries || [];
    const updated = current.includes(query)
      ? current.filter((q) => q !== query)
      : [...current, query];
    onChange({ commonQueries: updated });
  };

  const toggleChannel = (channel: string) => {
    const current = data.supportChannels || [];
    const updated = current.includes(channel)
      ? current.filter((c) => c !== channel)
      : [...current, channel];
    onChange({ supportChannels: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Common Customer Query <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {queryTypes.map((query) => (
            <button
              key={query}
              type="button"
              onClick={() => toggleQuery(query)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                data.commonQueries?.includes(query)
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
              }`}
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Existing Support Channels
        </Label>
        <div className="flex flex-wrap gap-6">
          {channels.map((channel) => (
            <div key={channel.id} className="flex items-center space-x-2">
              <Checkbox
                id={channel.id}
                checked={data.supportChannels?.includes(channel.id)}
                onCheckedChange={() => toggleChannel(channel.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor={channel.id}
                className="text-sm font-medium cursor-pointer text-foreground"
              >
                {channel.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {data.supportChannels?.includes("email") && (
        <div className="space-y-2 animate-fade-in">
          <Label htmlFor="supportEmail" className="text-sm font-semibold text-foreground">
            Enter Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="supportEmail"
            type="email"
            value={data.supportEmail}
            onChange={(e) => onChange({ supportEmail: e.target.value })}
            placeholder="Ex: Impacto@gmail.com"
            className="onboarding-input"
          />
        </div>
      )}

      {data.supportChannels?.includes("phone") && (
        <div className="space-y-2 animate-fade-in">
          <Label htmlFor="supportPhone" className="text-sm font-semibold text-foreground">
            Enter Phone <span className="text-destructive">*</span>
          </Label>
          <Input
            id="supportPhone"
            type="tel"
            value={data.supportPhone}
            onChange={(e) => onChange({ supportPhone: e.target.value })}
            placeholder="Ex: +91 9876543210"
            className="onboarding-input"
          />
        </div>
      )}
    </div>
  );
};

export default SupportModelStep;
