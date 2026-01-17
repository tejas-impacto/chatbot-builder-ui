import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompanyProfileData {
  companyName: string;
  brandName: string;
  industry: string;
  companyWebsite: string;
  businessDescription: string;
  primaryServices: string[];
  customerType: string;
  country: string;
  region: string;
  companySize: string;
  monthlyCustomerInteractions: string;
  typicalCustomerQueries: string[];
}

interface CompanyProfileStepProps {
  data: CompanyProfileData;
  onChange: (data: Partial<CompanyProfileData>) => void;
}

const industries = ["HealthTech", "Technology", "Finance", "Design", "Education", "Fintech", "Manufacturing", "Other"];
const services = ["SaaS", "Consulting", "E-commerce", "Healthcare", "FinTech", "EdTech"];
const customerTypes = ["B2B", "B2C", "Both"];
const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"];
const countries = ["India", "USA", "UK", "Germany", "Australia", "Canada", "Other"];
const regions = ["North America", "Europe", "Asia Pacific", "Middle East", "Africa", "Latin America"];
const interactionVolumes = ["Less than 100", "100-500", "500-1000", "1000-5000", "5000+"];
const queryTypes = ["Pricing", "Features", "Technical Support", "Account Issues", "Billing", "General Inquiries", "Product Demo", "Complaints"];

const CompanyProfileStep = ({ data, onChange }: CompanyProfileStepProps) => {
  const toggleService = (service: string) => {
    const current = data.primaryServices || [];
    const updated = current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service];
    onChange({ primaryServices: updated });
  };

  const toggleQuery = (query: string) => {
    const current = data.typicalCustomerQueries || [];
    const updated = current.includes(query)
      ? current.filter((q) => q !== query)
      : [...current, query];
    onChange({ typicalCustomerQueries: updated });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section 1: Brand Identity */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Brand Identity
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-semibold text-foreground">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              placeholder="Enter your company name"
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
              placeholder="Your customer-facing brand"
              className="onboarding-input"
            />
          </div>
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
            Website URL
          </Label>
          <Input
            id="companyWebsite"
            value={data.companyWebsite}
            onChange={(e) => onChange({ companyWebsite: e.target.value })}
            placeholder="https://yourcompany.com"
            className="onboarding-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription" className="text-sm font-semibold text-foreground">
            Tell us about your business <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="businessDescription"
            value={data.businessDescription}
            onChange={(e) => onChange({ businessDescription: e.target.value })}
            placeholder="Describe what makes your business unique..."
            className="onboarding-input min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {data.businessDescription.length}/500
          </p>
        </div>
      </div>

      {/* Section 2: Target Market */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Target Market & Services
        </h2>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            What services do you offer? <span className="text-destructive">*</span>
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
            Who are your customers? <span className="text-destructive">*</span>
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

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">
              Primary Market <span className="text-destructive">*</span>
            </Label>
            <Select value={data.country} onValueChange={(v) => onChange({ country: v })}>
              <SelectTrigger className="onboarding-input">
                <SelectValue placeholder="Select country" />
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
            <Label className="text-sm font-semibold text-foreground">
              Region
            </Label>
            <Select value={data.region} onValueChange={(v) => onChange({ region: v })}>
              <SelectTrigger className="onboarding-input">
                <SelectValue placeholder="Select region" />
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

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Team Size <span className="text-destructive">*</span>
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
                {size} people
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Customer Interactions */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Customer Interactions
        </h2>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Monthly Customer Interactions <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {interactionVolumes.map((volume) => (
              <button
                key={volume}
                type="button"
                onClick={() => onChange({ monthlyCustomerInteractions: volume })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  data.monthlyCustomerInteractions === volume
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
                }`}
              >
                {volume}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Typical Customer Queries <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground">Select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {queryTypes.map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => toggleQuery(query)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  data.typicalCustomerQueries?.includes(query)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
                }`}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileStep;
