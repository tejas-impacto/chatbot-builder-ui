import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingUp, BarChart3, TrendingDown, Phone, Mail } from "lucide-react";

interface SalesLeadData {
  enableLeadCapture: boolean;
  captureFields: string[];
  salesPriority: string;
  handoffMethod: string[];
}

interface SalesLeadStepProps {
  data: SalesLeadData;
  onChange: (data: Partial<SalesLeadData>) => void;
}

const captureOptions = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "name", label: "Name" },
];

const priorityOptions = [
  { id: "high", label: "High", icon: TrendingUp },
  { id: "medium", label: "Medium", icon: BarChart3 },
  { id: "low", label: "Low", icon: TrendingDown },
];

const handoffOptions = [
  { id: "call", label: "Call", icon: Phone },
  { id: "mail", label: "Mail", icon: Mail },
];

const SalesLeadStep = ({ data, onChange }: SalesLeadStepProps) => {
  const toggleCaptureField = (field: string) => {
    const current = data.captureFields || [];
    const updated = current.includes(field)
      ? current.filter((f) => f !== field)
      : [...current, field];
    onChange({ captureFields: updated });
  };

  const toggleHandoffMethod = (method: string) => {
    const current = data.handoffMethod || [];
    const updated = current.includes(method)
      ? current.filter((m) => m !== method)
      : [...current, method];
    onChange({ handoffMethod: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Label htmlFor="enableLeadCapture" className="text-sm font-semibold text-foreground">
          Enable Lead Capture
        </Label>
        <Switch
          id="enableLeadCapture"
          checked={data.enableLeadCapture}
          onCheckedChange={(checked) => onChange({ enableLeadCapture: checked })}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      {data.enableLeadCapture && (
        <>
          <div className="flex flex-wrap gap-6 animate-fade-in">
            {captureOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={data.captureFields?.includes(option.id)}
                  onCheckedChange={() => toggleCaptureField(option.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor={option.id}
                  className="text-sm font-medium cursor-pointer text-foreground"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Sales Intent Priority <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-4">
          {priorityOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange({ salesPriority: option.id })}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  data.salesPriority === option.id
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

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Handoff Method <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-4">
          {handoffOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleHandoffMethod(option.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  data.handoffMethod?.includes(option.id)
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
  );
};

export default SalesLeadStep;
