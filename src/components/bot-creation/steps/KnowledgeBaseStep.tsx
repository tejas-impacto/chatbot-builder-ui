import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InfoTooltip from "@/components/ui/info-tooltip";
import { BotCreationData } from "@/pages/BotCreation";

interface KnowledgeBaseStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const KnowledgeBaseStep = ({ data, onChange }: KnowledgeBaseStepProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          Bot Overview
          <InfoTooltip text="A brief summary of what your agent does and who it serves" />
        </Label>
        <Textarea
          placeholder="Enter Bot Overview"
          value={data.companyOverview}
          onChange={(e) => onChange({ companyOverview: e.target.value })}
          className="min-h-[100px] rounded-xl border-input focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          Product / Service Features
          <InfoTooltip text="Key features your agent should know about your products or services" />
        </Label>
        <Textarea
          placeholder="Enter key features"
          value={data.productFeatures}
          onChange={(e) => onChange({ productFeatures: e.target.value })}
          className="min-h-[100px] rounded-xl border-input focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
          Common FAQs
          <InfoTooltip text="Frequently asked questions your agent should be prepared to answer" />
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
