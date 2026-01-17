import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Package, Users, MapPin, Building } from "lucide-react";
import type { BotCreationData } from "@/pages/BotCreation";

const services = ["HealthTech", "Technology", "Finance", "Design"];
const customerTypes = ["B2B", "B2C", "Both"];
const companySizes = ["0-50", "50-100", "100-500", "500-1000"];

interface WhatYouDoStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const WhatYouDoStep = ({ data, onChange }: WhatYouDoStepProps) => {
  const toggleService = (service: string) => {
    const updated = data.primaryServices.includes(service)
      ? data.primaryServices.filter((s) => s !== service)
      : [...data.primaryServices, service];
    onChange({ primaryServices: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">What You Do & Who You Serve</h3>
          <p className="text-sm text-muted-foreground">Define your products and target audience</p>
        </div>
      </div>

      <div className="grid gap-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Primary Products / Services <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                className={`onboarding-chip ${
                  data.primaryServices.includes(service)
                    ? "onboarding-chip-active"
                    : "onboarding-chip-inactive"
                }`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Customer Type <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {customerTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ customerType: type })}
                className={`onboarding-chip ${
                  data.customerType === type
                    ? "onboarding-chip-active"
                    : "onboarding-chip-inactive"
                }`}
              >
                <Users className="w-4 h-4 mr-1 inline" />
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-muted/30 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            Customer Geography
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Country <span className="text-destructive">*</span>
              </Label>
              <Input
                id="country"
                placeholder="Enter country"
                value={data.country}
                onChange={(e) => onChange({ country: e.target.value })}
                className="onboarding-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region" className="text-sm font-medium">
                Region <span className="text-destructive">*</span>
              </Label>
              <Input
                id="region"
                placeholder="Enter region"
                value={data.region}
                onChange={(e) => onChange({ region: e.target.value })}
                className="onboarding-input"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            <Building className="w-4 h-4 inline mr-1" />
            Company Size <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {companySizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ companySize: size })}
                className={`onboarding-chip ${
                  data.companySize === size
                    ? "onboarding-chip-active"
                    : "onboarding-chip-inactive"
                }`}
              >
                {size} employees
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatYouDoStep;
