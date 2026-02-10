import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BotCreationData } from "@/pages/BotCreation";
import { 
  Headphones, 
  HelpCircle, 
  TrendingUp, 
  Zap, 
  Settings, 
  Package, 
  Sparkles, 
  Star 
} from "lucide-react";

interface PersonaVoiceStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
  errors?: Record<string, string>;
  botType: "chat" | "voice" | "both";
}

const personaOptions = [
  { value: "technical-support", label: "Technical Support", icon: Headphones, iconBg: "bg-pink-100", iconColor: "text-pink-500" },
  { value: "faq-expert", label: "FAQ Expert", icon: HelpCircle, iconBg: "bg-green-100", iconColor: "text-green-500" },
  { value: "sales-executive", label: "Sales Executive", icon: TrendingUp, iconBg: "bg-blue-100", iconColor: "text-blue-500" },
  { value: "marketing-manager", label: "Marketing Manager", icon: Zap, iconBg: "bg-emerald-100", iconColor: "text-emerald-500" },
  { value: "operation-manager", label: "Operation Manager", icon: Settings, iconBg: "bg-purple-100", iconColor: "text-purple-500" },
  { value: "product-manager", label: "Product Manager", icon: Package, iconBg: "bg-indigo-100", iconColor: "text-indigo-500" },
  { value: "client-service", label: "Client Service", icon: Sparkles, iconBg: "bg-red-100", iconColor: "text-red-500" },
  { value: "custom", label: "Custom", icon: Star, iconBg: "bg-amber-100", iconColor: "text-amber-500" },
];

const voiceToneOptions = [
  { value: "friendly", label: "Friendly", description: "Warm, approachable and casual" },
  { value: "casual", label: "Casual", description: "Relax and conversation" },
  { value: "professional", label: "Professional", description: "Formal and business - Like" },
];

const PersonaVoiceStep = ({ data, onChange, errors, botType }: PersonaVoiceStepProps) => {
  return (
    <div className="space-y-6">
      {/* Select Persona */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Select Persona <span className="text-destructive">*</span>
        </Label>
        <div className={`grid grid-cols-4 gap-3 ${errors?.persona ? 'rounded-xl ring-1 ring-destructive p-1' : ''}`}>
          {personaOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ persona: option.value })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                  data.persona === option.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-input hover:border-primary/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${option.iconBg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${option.iconColor}`} />
                </div>
                <span className={`text-xs font-medium text-center ${
                  data.persona === option.value ? "text-primary" : "text-muted-foreground"
                }`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
        {errors?.persona && (
          <p className="text-sm text-destructive">{errors.persona}</p>
        )}
      </div>

      {/* Tone of the voice - for voice and both */}
      {(botType === "voice" || botType === "both") && (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Tone of the voice
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {voiceToneOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ voiceTone: option.value })}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  data.voiceTone === option.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-input hover:border-primary/50"
                }`}
              >
                <span className={`block font-medium ${
                  data.voiceTone === option.value ? "text-primary" : "text-muted-foreground"
                }`}>
                  {option.label}
                </span>
                <span className={`text-xs ${
                  data.voiceTone === option.value ? "text-primary/80" : "text-muted-foreground/60"
                }`}>
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Name of the agent */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Name of the agent <span className="text-destructive">*</span>
        </Label>
        <Input
          placeholder="Enter your agent name"
          value={data.agentName}
          onChange={(e) => onChange({ agentName: e.target.value })}
          className={`rounded-xl focus:ring-2 focus:ring-primary/20 ${
            errors?.agentName ? 'border-destructive' : 'border-input'
          }`}
        />
        {errors?.agentName && (
          <p className="text-sm text-destructive">{errors.agentName}</p>
        )}
      </div>
    </div>
  );
};

export default PersonaVoiceStep;
