import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { BotCreationData } from "@/pages/BotCreation";
import InfoTooltip from "@/components/ui/info-tooltip";

interface LeadCaptureStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const captureOptions = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "name", label: "Full Name" },
  { id: "company", label: "Company" },
];


const LeadCaptureStep = ({ data, onChange }: LeadCaptureStepProps) => {
  const toggleCaptureField = (field: string) => {
    const current = data.captureFields || [];
    const updated = current.includes(field)
      ? current.filter((f) => f !== field)
      : [...current, field];
    onChange({ captureFields: updated });
  };

  return (
    <div className="space-y-6">
      {/* Enable Lead Capture Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
        <div>
          <Label htmlFor="enableLeadCapture" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Enable Lead Capture
            <InfoTooltip text="Toggle whether the agent collects visitor contact details during conversations" />
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
        <div className="space-y-6 animate-fade-in">
          {/* Information to Collect */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              Information to collect
              <InfoTooltip text="Select which contact fields the agent will ask visitors to provide" />
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

        </div>
      )}
    </div>
  );
};

export default LeadCaptureStep;
