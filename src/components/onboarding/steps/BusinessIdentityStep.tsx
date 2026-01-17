import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BusinessIdentityData {
  companyName: string;
  brandName: string;
  industry: string;
  companyWebsite: string;
  businessDescription: string;
}

interface BusinessIdentityStepProps {
  data: BusinessIdentityData;
  onChange: (data: Partial<BusinessIdentityData>) => void;
}

const industries = [
  "HealthTech",
  "Technology", 
  "Finance",
  "Design",
  "Education",
  "Fintech",
  "Manufacturing",
  "Other"
];

const BusinessIdentityStep = ({ data, onChange }: BusinessIdentityStepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-sm font-semibold text-foreground">
          Company name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="companyName"
          value={data.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
          placeholder="Ex: Impacto"
          className="onboarding-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brandName" className="text-sm font-semibold text-foreground">
          Brand Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="brandName"
          value={data.brandName}
          onChange={(e) => onChange({ brandName: e.target.value })}
          placeholder="Ex: Impacto"
          className="onboarding-input"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Industry <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {industries.map((industry) => (
            <button
              key={industry}
              type="button"
              onClick={() => onChange({ industry })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                data.industry === industry
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyWebsite" className="text-sm font-semibold text-foreground">
          Company Website <span className="text-destructive">*</span>
        </Label>
        <Input
          id="companyWebsite"
          value={data.companyWebsite}
          onChange={(e) => onChange({ companyWebsite: e.target.value })}
          placeholder="Ex: https://impacto.com"
          className="onboarding-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessDescription" className="text-sm font-semibold text-foreground">
          Business Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="businessDescription"
          value={data.businessDescription}
          onChange={(e) => onChange({ businessDescription: e.target.value })}
          placeholder="300-500 Characters"
          className="onboarding-input min-h-[100px] resize-none"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">
          {data.businessDescription.length}/500
        </p>
      </div>
    </div>
  );
};

export default BusinessIdentityStep;
