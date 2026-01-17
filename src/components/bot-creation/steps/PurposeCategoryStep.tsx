import { Label } from "@/components/ui/label";
import { BotCreationData } from "@/pages/BotCreation";
import { Headphones, HelpCircle, Megaphone, Star } from "lucide-react";

interface PurposeCategoryStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const purposeOptions = [
  { 
    value: "customer-support", 
    label: "Customer Support", 
    icon: Headphones,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-500"
  },
  { 
    value: "faq", 
    label: "FAQ", 
    icon: HelpCircle,
    iconBg: "bg-green-100",
    iconColor: "text-green-500"
  },
  { 
    value: "marketing", 
    label: "Marketing", 
    icon: Megaphone,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500"
  },
  { 
    value: "other", 
    label: "Other", 
    icon: Star,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500"
  },
];

const PurposeCategoryStep = ({ data, onChange }: PurposeCategoryStepProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Select Purpose
        </Label>
        <div className="grid grid-cols-4 gap-4">
          {purposeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ purpose: option.value })}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-200 ${
                  data.purpose === option.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-input hover:border-primary/50"
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${option.iconBg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${option.iconColor}`} />
                </div>
                <span className={`text-sm font-medium ${
                  data.purpose === option.value ? "text-primary" : "text-muted-foreground"
                }`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PurposeCategoryStep;
