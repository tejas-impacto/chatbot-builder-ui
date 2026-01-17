import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BotCreationData } from "@/pages/BotCreation";

interface ConversationStyleStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const responseLengthOptions = [
  { value: "short", label: "Short", description: "Brief to the point answer" },
  { value: "medium", label: "Medium", description: "Balance Detail Level" },
  { value: "detailed", label: "Detailed", description: "Comprehensive Response" },
];

const ConversationStyleStep = ({ data, onChange }: ConversationStyleStepProps) => {
  return (
    <div className="space-y-6">
      {/* Chat Response Length */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Chat Response Length
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {responseLengthOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ chatResponseLength: option.value })}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                data.chatResponseLength === option.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-input hover:border-primary/50"
              }`}
            >
              <span className={`block font-medium ${
                data.chatResponseLength === option.value ? "text-primary" : "text-muted-foreground"
              }`}>
                {option.label}
              </span>
              <span className={`text-xs ${
                data.chatResponseLength === option.value ? "text-primary/80" : "text-muted-foreground/60"
              }`}>
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Guidelines */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Chat Guidelines
        </Label>
        <Input
          placeholder="Enter Chat Guidelines"
          value={data.chatGuidelines}
          onChange={(e) => onChange({ chatGuidelines: e.target.value })}
          className="rounded-xl border-input focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Voice Response Length */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Voice Response Length
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {responseLengthOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ voiceResponseLength: option.value })}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                data.voiceResponseLength === option.value
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-input hover:border-primary/50"
              }`}
            >
              <span className={`block font-medium ${
                data.voiceResponseLength === option.value ? "text-primary" : "text-muted-foreground"
              }`}>
                {option.label}
              </span>
              <span className={`text-xs ${
                data.voiceResponseLength === option.value ? "text-primary/80" : "text-muted-foreground/60"
              }`}>
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Guidelines */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Voice Guidelines
        </Label>
        <Input
          placeholder="Enter Voice Guidelines"
          value={data.voiceGuidelines}
          onChange={(e) => onChange({ voiceGuidelines: e.target.value })}
          className="rounded-xl border-input focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
};

export default ConversationStyleStep;
