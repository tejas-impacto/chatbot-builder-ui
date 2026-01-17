import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, User, Mail, Phone, PhoneCall } from "lucide-react";
import type { BotCreationData } from "@/pages/BotCreation";

const captureFields = [
  { id: "name", label: "Name", icon: User },
  { id: "email", label: "Email", icon: Mail },
  { id: "phone", label: "Phone", icon: Phone },
];

const priorities = [
  { id: "high", label: "High", color: "bg-green-500" },
  { id: "medium", label: "Medium", color: "bg-amber-500" },
  { id: "low", label: "Low", color: "bg-gray-400" },
];

const handoffMethods = [
  { id: "call", label: "Schedule a Call", icon: PhoneCall },
  { id: "mail", label: "Send Email", icon: Mail },
];

interface SalesLeadCaptureStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const SalesLeadCaptureStep = ({ data, onChange }: SalesLeadCaptureStepProps) => {
  const toggleCaptureField = (field: string) => {
    const updated = data.leadCaptureFields.includes(field)
      ? data.leadCaptureFields.filter((f) => f !== field)
      : [...data.leadCaptureFields, field];
    onChange({ leadCaptureFields: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Sales & Lead Capture</h3>
          <p className="text-sm text-muted-foreground">Configure lead collection and handoff</p>
        </div>
      </div>

      <div className="grid gap-5">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Enable Lead Capture</Label>
          <div className="grid sm:grid-cols-3 gap-3">
            {captureFields.map((field) => {
              const Icon = field.icon;
              const isChecked = data.leadCaptureFields.includes(field.id);
              return (
                <div
                  key={field.id}
                  onClick={() => toggleCaptureField(field.id)}
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
                    {field.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Sales Intent Priority <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {priorities.map((priority) => (
              <button
                key={priority.id}
                type="button"
                onClick={() => onChange({ salesPriority: priority.id })}
                className={`onboarding-chip flex items-center gap-2 ${
                  data.salesPriority === priority.id
                    ? "onboarding-chip-active"
                    : "onboarding-chip-inactive"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${priority.color}`} />
                {priority.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Handoff Method <span className="text-destructive">*</span>
          </Label>
          <div className="grid sm:grid-cols-2 gap-3">
            {handoffMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = data.handoffMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => onChange({ handoffMethod: method.id })}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all border ${
                    isSelected
                      ? "bg-primary/5 border-primary"
                      : "bg-muted/30 border-transparent hover:border-primary/30"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesLeadCaptureStep;
