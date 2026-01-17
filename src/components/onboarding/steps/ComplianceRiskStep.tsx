import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ComplianceRiskData {
  regulations: string[];
  restrictedTopics: string;
  botRestrictions: string[];
}

interface ComplianceRiskStepProps {
  data: ComplianceRiskData;
  onChange: (data: Partial<ComplianceRiskData>) => void;
}

const regulations = ["GDPR", "HIPAA", "PCI-DSS", "None", "Other"];
const restrictions = ["Give legal advice", "Give medical advice", "Give financial advice"];

const ComplianceRiskStep = ({ data, onChange }: ComplianceRiskStepProps) => {
  const toggleRegulation = (regulation: string) => {
    const current = data.regulations || [];
    const updated = current.includes(regulation)
      ? current.filter((r) => r !== regulation)
      : [...current, regulation];
    onChange({ regulations: updated });
  };

  const toggleRestriction = (restriction: string) => {
    const current = data.botRestrictions || [];
    const updated = current.includes(restriction)
      ? current.filter((r) => r !== restriction)
      : [...current, restriction];
    onChange({ botRestrictions: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Applicable Regulations <span className="text-destructive">*</span>
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
          Restricted Topics
        </Label>
        <Input
          id="restrictedTopics"
          value={data.restrictedTopics}
          onChange={(e) => onChange({ restrictedTopics: e.target.value })}
          placeholder="Ex: Impacto"
          className="onboarding-input"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Bot must NOT <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {restrictions.map((restriction) => (
            <button
              key={restriction}
              type="button"
              onClick={() => toggleRestriction(restriction)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                data.botRestrictions?.includes(restriction)
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
              }`}
            >
              {restriction}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceRiskStep;
