import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Headphones, Mail, Phone, MessageCircle } from "lucide-react";
import type { BotCreationData } from "@/pages/BotCreation";

const queryTypes = ["Pricing", "Sales", "Support", "Troubleshooting", "Other"];
const channels = [
  { id: "email", label: "Email", icon: Mail },
  { id: "phone", label: "Phone", icon: Phone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

interface SupportInteractionStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const SupportInteractionStep = ({ data, onChange }: SupportInteractionStepProps) => {
  const toggleQuery = (query: string) => {
    const updated = data.commonQueries.includes(query)
      ? data.commonQueries.filter((q) => q !== query)
      : [...data.commonQueries, query];
    onChange({ commonQueries: updated });
  };

  const toggleChannel = (channel: string) => {
    const updated = data.existingChannels.includes(channel)
      ? data.existingChannels.filter((c) => c !== channel)
      : [...data.existingChannels, channel];
    onChange({ existingChannels: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Headphones className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Support & Customer Interaction Model</h3>
          <p className="text-sm text-muted-foreground">Define how customers interact with you</p>
        </div>
      </div>

      <div className="grid gap-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Common Customer Queries <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {queryTypes.map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => toggleQuery(query)}
                className={`onboarding-chip ${
                  data.commonQueries.includes(query)
                    ? "onboarding-chip-active"
                    : "onboarding-chip-inactive"
                }`}
              >
                {query}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Existing Support Channels</Label>
          <div className="grid sm:grid-cols-3 gap-3">
            {channels.map((channel) => {
              const Icon = channel.icon;
              const isChecked = data.existingChannels.includes(channel.id);
              return (
                <div
                  key={channel.id}
                  onClick={() => toggleChannel(channel.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                    isChecked
                      ? "bg-primary/5 border-primary"
                      : "bg-muted/30 border-transparent hover:border-primary/30"
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Icon className={`w-4 h-4 ${isChecked ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${isChecked ? "text-foreground" : "text-muted-foreground"}`}>
                    {channel.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supportEmail" className="text-sm font-medium">
            Support Email <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="supportEmail"
              type="email"
              placeholder="support@company.com"
              value={data.supportEmail}
              onChange={(e) => onChange({ supportEmail: e.target.value })}
              className="onboarding-input pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportInteractionStep;
