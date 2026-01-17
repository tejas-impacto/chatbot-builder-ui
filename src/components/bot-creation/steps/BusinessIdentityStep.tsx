import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Globe, FileText } from "lucide-react";
import type { BotCreationData } from "@/pages/BotCreation";

const industries = [
  "HealthTech",
  "Technology",
  "Finance",
  "Design",
  "Education",
  "Fintech",
  "Manufacturing",
  "Other",
];

interface BusinessIdentityStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const BusinessIdentityStep = ({ data, onChange }: BusinessIdentityStepProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Business Identity</h3>
          <p className="text-sm text-muted-foreground">Tell us about your company</p>
        </div>
      </div>

      <div className="grid gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              placeholder="Enter company name"
              value={data.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              className="onboarding-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brandName" className="text-sm font-medium">
              Brand Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="brandName"
              placeholder="Enter brand name"
              value={data.brandName}
              onChange={(e) => onChange({ brandName: e.target.value })}
              className="onboarding-input"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Industry <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {industries.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => onChange({ industry })}
                className={`onboarding-chip ${
                  data.industry === industry
                    ? "onboarding-chip-active"
                    : "onboarding-chip-inactive"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyWebsite" className="text-sm font-medium">
            Company Website <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="companyWebsite"
              placeholder="https://www.example.com"
              value={data.companyWebsite}
              onChange={(e) => onChange({ companyWebsite: e.target.value })}
              className="onboarding-input pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription" className="text-sm font-medium">
            Business Description <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Textarea
              id="businessDescription"
              placeholder="Describe your business in 300-500 characters..."
              value={data.businessDescription}
              onChange={(e) => onChange({ businessDescription: e.target.value })}
              className="onboarding-input pl-10 min-h-[120px] resize-none"
              maxLength={500}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {data.businessDescription.length}/500 characters
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessIdentityStep;
