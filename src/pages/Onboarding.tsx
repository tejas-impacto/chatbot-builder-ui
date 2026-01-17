import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import OnboardingStepIndicator from "@/components/onboarding/OnboardingStepIndicator";
import CompanyProfileStep from "@/components/onboarding/steps/CompanyProfileStep";
import BotConfigurationStep from "@/components/onboarding/steps/BotConfigurationStep";
import KnowledgeBaseStep from "@/components/onboarding/steps/KnowledgeBaseStep";

const steps = [
  { id: 1, title: "Company Profile" },
  { id: 2, title: "Bot Configuration" },
  { id: 3, title: "Knowledge Base" },
];

const stepTitles = [
  "Tell Us About Your Business",
  "Configure Your AI Assistant",
  "Upload Your Knowledge Base",
];

const stepDescriptions = [
  "Help us understand your brand and target audience",
  "Set up support preferences, compliance rules, and sales goals",
  "Train your chatbot with your business documents",
];

interface OnboardingData {
  // Company Profile (Step 1)
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
  // Bot Configuration (Step 2)
  commonQueries: string[];
  supportChannels: string[];
  supportEmail: string;
  supportPhone: string;
  regulations: string[];
  restrictedTopics: string;
  botRestrictions: string[];
  enableLeadCapture: boolean;
  captureFields: string[];
  salesPriority: string;
  handoffMethod: string[];
  // Knowledge Base (Step 3)
  documentType: string;
  files: File[];
  documentDescription: string;
}

const initialData: OnboardingData = {
  companyName: "",
  brandName: "",
  industry: "",
  companyWebsite: "",
  businessDescription: "",
  primaryServices: [],
  customerType: "",
  country: "",
  region: "",
  companySize: "",
  monthlyCustomerInteractions: "",
  typicalCustomerQueries: [],
  commonQueries: [],
  supportChannels: [],
  supportEmail: "",
  supportPhone: "",
  regulations: [],
  restrictedTopics: "",
  botRestrictions: [],
  enableLeadCapture: true,
  captureFields: ["email"],
  salesPriority: "medium",
  handoffMethod: [],
  documentType: "Product Documentation",
  files: [],
  documentDescription: "",
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>(initialData);

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    console.log("Onboarding complete:", formData);
    navigate("/");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanyProfileStep
            data={{
              companyName: formData.companyName,
              brandName: formData.brandName,
              industry: formData.industry,
              companyWebsite: formData.companyWebsite,
              businessDescription: formData.businessDescription,
              primaryServices: formData.primaryServices,
              customerType: formData.customerType,
              country: formData.country,
              region: formData.region,
              companySize: formData.companySize,
              monthlyCustomerInteractions: formData.monthlyCustomerInteractions,
              typicalCustomerQueries: formData.typicalCustomerQueries,
            }}
            onChange={updateFormData}
          />
        );
      case 2:
        return (
          <BotConfigurationStep
            data={{
              commonQueries: formData.commonQueries,
              supportChannels: formData.supportChannels,
              supportEmail: formData.supportEmail,
              supportPhone: formData.supportPhone,
              regulations: formData.regulations,
              restrictedTopics: formData.restrictedTopics,
              botRestrictions: formData.botRestrictions,
              enableLeadCapture: formData.enableLeadCapture,
              captureFields: formData.captureFields,
              salesPriority: formData.salesPriority,
              handoffMethod: formData.handoffMethod,
            }}
            onChange={updateFormData}
          />
        );
      case 3:
        return (
          <KnowledgeBaseStep
            data={{
              documentType: formData.documentType,
              files: formData.files,
              documentDescription: formData.documentDescription,
            }}
            onChange={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Step Indicator */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-3xl mx-auto">
          <OnboardingStepIndicator steps={steps} currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content - Centered Single Column */}
      <div className="max-w-3xl mx-auto px-4 py-8 mt-8">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8 lg:p-10">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              {stepTitles[currentStep - 1]}
            </h1>
            <p className="text-muted-foreground mt-2">
              {stepDescriptions[currentStep - 1]}
            </p>
          </div>

          <div className="pr-2">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-border">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-input text-foreground font-semibold hover:bg-muted transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            
            <button
              type="button"
              onClick={currentStep === 3 ? handleFinish : handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {currentStep === 3 ? (
                <>
                  <Check className="w-4 h-4" />
                  Launch Your Chatbot
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
