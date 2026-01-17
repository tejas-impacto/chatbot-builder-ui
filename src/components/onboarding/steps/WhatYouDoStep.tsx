import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WhatYouDoData {
  primaryServices: string[];
  customerType: string;
  country: string;
  region: string;
  companyWebsite: string;
  companySize: string;
}

interface WhatYouDoStepProps {
  data: WhatYouDoData;
  onChange: (data: Partial<WhatYouDoData>) => void;
}

const services = ["HealthTech", "Technology", "Finance", "Design"];
const customerTypes = ["B2B", "B2C", "Both"];
const companySizes = ["0-50", "50-100", "100-500", "500-1000"];
const countries = ["India", "USA", "UK", "Germany", "Australia", "Other"];
const regions = ["North", "South", "East", "West", "Islands", "Other"];

const WhatYouDoStep = ({ data, onChange }: WhatYouDoStepProps) => {
  const toggleService = (service: string) => {
    const current = data.primaryServices || [];
    const updated = current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service];
    onChange({ primaryServices: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Primary Products / Services <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => toggleService(service)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                data.primaryServices?.includes(service)
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
              }`}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Customer Type <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {customerTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ customerType: type })}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                data.customerType === type
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Customer Geography</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-xs text-muted-foreground">
              Country <span className="text-destructive">*</span>
            </Label>
            <Select value={data.country} onValueChange={(v) => onChange({ country: v })}>
              <SelectTrigger className="onboarding-input">
                <SelectValue placeholder="Ex: India" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="region" className="text-xs text-muted-foreground">
              Region <span className="text-destructive">*</span>
            </Label>
            <Select value={data.region} onValueChange={(v) => onChange({ region: v })}>
              <SelectTrigger className="onboarding-input">
                <SelectValue placeholder="Ex: Islands" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          placeholder="Ex: Impacto"
          className="onboarding-input"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">
          Company Size <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {companySizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onChange({ companySize: size })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                data.companySize === size
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatYouDoStep;
