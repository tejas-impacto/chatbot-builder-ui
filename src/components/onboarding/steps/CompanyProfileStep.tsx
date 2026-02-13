import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import InfoTooltip from "@/components/ui/info-tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TypicalCustomerQueries {
  pricing: boolean;
  support: boolean;
  troubleshooting: boolean;
  sales: boolean;
  policyCompliance: boolean;
  customQueries: string[];
}

interface CompanyProfileData {
  companyName: string;
  brandName: string;
  industry: string;
  otherIndustry: string;
  companyWebsite: string;
  businessDescription: string;
  primaryServices: string[];
  customerType: string;
  country: string;
  region: string;
  companySize: string;
  monthlyCustomerInteractions: string;
  typicalCustomerQueries: TypicalCustomerQueries;
}

interface CompanyProfileStepProps {
  data: CompanyProfileData;
  onChange: (data: Partial<CompanyProfileData>) => void;
  onWebsiteScrape: (url: string) => void;
  isScrapingWebsite: boolean;
}

const industries = ["HealthTech", "Technology", "Finance", "Design", "Education", "Fintech", "Manufacturing", "Other"];
const services = ["SaaS", "Consulting", "E-commerce", "Healthcare", "FinTech", "EdTech"];
const customerTypes = ["B2B", "B2C", "Both"];
const companySizes = ["1-10", "11-50", "51-200", "201-500", "500+"];
const countries = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina", "Brazil", "Brunei", "Bulgaria",
  "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Estonia", "Ethiopia",
  "Finland", "France",
  "Georgia", "Germany", "Ghana", "Greece", "Guatemala",
  "Honduras", "Hong Kong", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kuwait", "Kyrgyzstan",
  "Latvia", "Lebanon", "Libya", "Lithuania", "Luxembourg",
  "Macau", "Malaysia", "Maldives", "Malta", "Mexico", "Moldova", "Mongolia", "Morocco", "Myanmar",
  "Nepal", "Netherlands", "New Zealand", "Nigeria", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palestine", "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saudi Arabia", "Senegal", "Serbia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tanzania", "Thailand", "Tunisia", "Turkey", "Turkmenistan",
  "UAE", "Uganda", "UK", "Ukraine", "Uruguay", "USA", "Uzbekistan",
  "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe",
  "Global", "Other",
];
const regions = [
  "North America", "Central America", "South America", "Latin America",
  "Western Europe", "Eastern Europe", "Northern Europe", "Southern Europe",
  "East Asia", "South Asia", "Southeast Asia", "Central Asia", "Asia Pacific",
  "Middle East", "North Africa", "Sub-Saharan Africa", "Africa",
  "Caribbean", "Oceania",
  "Global",
];
const interactionVolumes = ["Less than 100", "100-500", "500-1000", "1000-5000", "5000+"];

// Map query types to their keys in the TypicalCustomerQueries interface
const queryTypeOptions = [
  { key: "pricing", label: "Pricing" },
  { key: "support", label: "Support" },
  { key: "troubleshooting", label: "Troubleshooting" },
  { key: "sales", label: "Sales" },
  { key: "policyCompliance", label: "Policy & Compliance" },
] as const;

const CompanyProfileStep = ({ data, onChange, onWebsiteScrape, isScrapingWebsite }: CompanyProfileStepProps) => {
  const toggleService = (service: string) => {
    const current = data.primaryServices || [];
    const updated = current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service];
    onChange({ primaryServices: updated });
  };

  const toggleQuery = (queryKey: keyof Omit<TypicalCustomerQueries, 'customQueries'>) => {
    const currentQueries = data.typicalCustomerQueries || {
      pricing: false,
      support: false,
      troubleshooting: false,
      sales: false,
      policyCompliance: false,
      customQueries: [],
    };

    onChange({
      typicalCustomerQueries: {
        ...currentQueries,
        [queryKey]: !currentQueries[queryKey],
      }
    });
  };

  const isQuerySelected = (queryKey: keyof Omit<TypicalCustomerQueries, 'customQueries'>) => {
    return data.typicalCustomerQueries?.[queryKey] || false;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Section 1: Brand Identity */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-1.5">
          Brand Identity
          <InfoTooltip text="Basic information about your company and brand" size="md" />
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Company Name <span className="text-destructive">*</span>
              <InfoTooltip text="Your official registered company name" />
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
            <Label htmlFor="brandName" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Brand Name <span className="text-destructive">*</span>
              <InfoTooltip text="The name your customers know you by" />
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
          <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Industry <span className="text-destructive">*</span>
            <InfoTooltip text="Your business sector — helps tailor agent responses" />
          </Label>
          <div className="flex flex-wrap gap-2">
            {industries.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => onChange({ industry, ...(industry !== 'Other' && { otherIndustry: '' }) })}
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
          {data.industry === 'Other' && (
            <Input
              value={data.otherIndustry || ''}
              onChange={(e) => onChange({ otherIndustry: e.target.value })}
              placeholder="Please specify your industry"
              className="onboarding-input mt-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyWebsite" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Website URL
            <InfoTooltip text="Your company website — we can auto-fill details from it" />
          </Label>
          <div className="relative">
            <Input
              id="companyWebsite"
              value={data.companyWebsite}
              onChange={(e) => onChange({ companyWebsite: e.target.value })}
              onBlur={(e) => onWebsiteScrape(e.target.value)}
              placeholder="https://yourcompany.com"
              className="onboarding-input"
              disabled={isScrapingWebsite}
            />
            {isScrapingWebsite && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>
          {isScrapingWebsite && (
            <p className="text-xs text-muted-foreground">Extracting company information...</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Tell us about your business <span className="text-destructive">*</span>
            <InfoTooltip text="A brief description to help your agent understand your business" />
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
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-1.5">
          Target Market & Services
          <InfoTooltip text="Define your audience and service offerings" size="md" />
        </h2>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            What services do you offer? <span className="text-destructive">*</span>
            <InfoTooltip text="Select the types of services your business provides" />
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
          <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Who are your customers? <span className="text-destructive">*</span>
            <InfoTooltip text="Whether you serve businesses, consumers, or both" />
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
            <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Primary Market <span className="text-destructive">*</span>
              <InfoTooltip text="The main country where your customers are located" />
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
            <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Region
              <InfoTooltip text="The geographic region your business primarily operates in" />
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
          <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Team Size <span className="text-destructive">*</span>
            <InfoTooltip text="The number of employees in your organization" />
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
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-1.5">
          Customer Interactions
          <InfoTooltip text="Details about how customers interact with your business" size="md" />
        </h2>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Monthly Customer Interactions <span className="text-destructive">*</span>
            <InfoTooltip text="Approximate number of customer inquiries you receive each month" />
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
          <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            Typical Customer Queries <span className="text-destructive">*</span>
            <InfoTooltip text="Common topics your customers ask about — helps train the agent" />
          </Label>
          <p className="text-xs text-muted-foreground">Select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {queryTypeOptions.map((query) => (
              <button
                key={query.key}
                type="button"
                onClick={() => toggleQuery(query.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isQuerySelected(query.key)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background border border-input text-foreground hover:border-primary/50 hover:bg-muted"
                }`}
              >
                {query.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileStep;
