import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, AlertTriangle, Ban } from "lucide-react";
import type { BotCreationData } from "@/pages/BotCreation";

const regulations = ["GDPR", "HIPAA", "PCI-DSS", "None", "Other"];
const restrictions = [
  { id: "legal", label: "Give legal advice" },
  { id: "medical", label: "Give medical advice" },
  { id: "financial", label: "Give financial advice" },
];

interface ComplianceRiskStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const ComplianceRiskStep = ({ data, onChange }: ComplianceRiskStepProps) => {
  const toggleRegulation = (regulation: string) => {
    const updated = data.regulations.includes(regulation)
      ? data.regulations.filter((r) => r !== regulation)
      : [...data.regulations, regulation];
    onChange({ regulations: updated });
  };

  const toggleRestriction = (restriction: string) => {
    const updated = data.botRestrictions.includes(restriction)
      ? data.botRestrictions.filter((r) => r !== restriction)
      : [...data.botRestrictions, restriction];
    onChange({ botRestrictions: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Compliance & Risk</h3>
          <p className="text-sm text-muted-foreground">Define regulatory requirements and restrictions</p>
        </div>
      </div>

      <div className="grid gap-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Applicable Regulations <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {regulations.map((regulation) => (
              <button
                key={regulation}
                type="button"
                onClick={() => toggleRegulation(regulation)}
                className={`onboarding-chip ${
                  data.regulations.includes(regulation)
                    ? "onboarding-chip-active"
                    : "onboarding-chip-inactive"
                }`}
              >
                {regulation}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="restrictedTopics" className="text-sm font-medium">
            <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-500" />
            Restricted Topics
          </Label>
          <Textarea
            id="restrictedTopics"
            placeholder="List any topics the bot should avoid discussing..."
            value={data.restrictedTopics}
            onChange={(e) => onChange({ restrictedTopics: e.target.value })}
            className="onboarding-input min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            <Ban className="w-4 h-4 inline mr-1 text-destructive" />
            Bot must NOT <span className="text-destructive">*</span>
          </Label>
          <div className="grid gap-3">
            {restrictions.map((restriction) => {
              const isChecked = data.botRestrictions.includes(restriction.id);
              return (
                <div
                  key={restriction.id}
                  onClick={() => toggleRestriction(restriction.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${
                    isChecked
                      ? "bg-destructive/5 border-destructive/50"
                      : "bg-muted/30 border-transparent hover:border-destructive/30"
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    className="data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                  />
                  <span className={`text-sm font-medium ${isChecked ? "text-destructive" : "text-muted-foreground"}`}>
                    {restriction.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceRiskStep;
