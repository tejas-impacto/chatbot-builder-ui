import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BotCreationData } from "@/pages/BotCreation";

interface KnowledgeBaseStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const KnowledgeBaseStep = ({ data, onChange }: KnowledgeBaseStepProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Company Overview
        </Label>
        <Textarea
          placeholder="Enter Company Overview"
          value={data.companyOverview}
          onChange={(e) => onChange({ companyOverview: e.target.value })}
          className="min-h-[100px] rounded-xl border-input focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Product / Service Features
        </Label>
        <Textarea
          placeholder="Enter key features"
          value={data.productFeatures}
          onChange={(e) => onChange({ productFeatures: e.target.value })}
          className="min-h-[100px] rounded-xl border-input focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Common FAQs
        </Label>
        <Textarea
          placeholder="Enter Common FAQs"
          value={data.commonFaqs}
          onChange={(e) => onChange({ commonFaqs: e.target.value })}
          className="min-h-[100px] rounded-xl border-input focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
};

export default KnowledgeBaseStep;
