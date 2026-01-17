import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import OnboardingStepIndicator from "@/components/onboarding/OnboardingStepIndicator";
import OnboardingIllustration from "@/components/onboarding/OnboardingIllustration";
import BusinessIdentityStep from "@/components/onboarding/steps/BusinessIdentityStep";
import WhatYouDoStep from "@/components/onboarding/steps/WhatYouDoStep";
import SupportModelStep from "@/components/onboarding/steps/SupportModelStep";
import ComplianceRiskStep from "@/components/onboarding/steps/ComplianceRiskStep";
import SalesLeadStep from "@/components/onboarding/steps/SalesLeadStep";
import DocumentsUploadStep from "@/components/onboarding/steps/DocumentsUploadStep";

const steps = [
  { id: 1, title: "Business Identity" },
  { id: 2, title: "What You Do &", subtitle: "Who You Serve" },
  { id: 3, title: "Support & Customer", subtitle: "Interaction Model" },
  { id: 4, title: "Compliance & Risk" },
  { id: 5, title: "Sales & Lead Capture" },
  { id: 6, title: "Documents Upload" },
];

const stepTitles = [
  "Business Identity",
  "What You Do & Who You Serve",
  "Support & Customer Interaction Model",
  "Compliance & Risk",
  "Sales & Lead Capture",
  "Documents Upload",
];

interface OnboardingData {
  // Step 1
  companyName: string;
  brandName: string;
  industry: string;
  companyWebsite: string;
  businessDescription: string;
  // Step 2
  primaryServices: string[];
  customerType: string;
  country: string;
  region: string;
  companySize: string;
  // Step 3
  commonQueries: string[];
  supportChannels: string[];
  supportEmail: string;
  supportPhone: string;
  // Step 4
  regulations: string[];
  restrictedTopics: string;
  botRestrictions: string[];
  // Step 5
  enableLeadCapture: boolean;
  captureFields: string[];
  salesPriority: string;
  handoffMethod: string[];
  // Step 6
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
  commonQueries: [],
  supportChannels: [],
  supportEmail: "",
  supportPhone: "",
  regulations: [],
  restrictedTopics: "",
  botRestrictions: [],
  enableLeadCapture: true,
  captureFields: ["email"],
  salesPriority: "high",
  handoffMethod: [],
  documentType: "Product Catalog",
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
    if (currentStep < 6) {
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
    // Navigate to dashboard or next step
    navigate("/");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessIdentityStep
            data={{
              companyName: formData.companyName,
              brandName: formData.brandName,
              industry: formData.industry,
              companyWebsite: formData.companyWebsite,
              businessDescription: formData.businessDescription,
            }}
            onChange={updateFormData}
          />
        );
      case 2:
        return (
          <WhatYouDoStep
            data={{
              primaryServices: formData.primaryServices,
              customerType: formData.customerType,
              country: formData.country,
              region: formData.region,
              companyWebsite: formData.companyWebsite,
              companySize: formData.companySize,
            }}
            onChange={updateFormData}
          />
        );
      case 3:
        return (
          <SupportModelStep
            data={{
              commonQueries: formData.commonQueries,
              supportChannels: formData.supportChannels,
              supportEmail: formData.supportEmail,
              supportPhone: formData.supportPhone,
            }}
            onChange={updateFormData}
          />
        );
      case 4:
        return (
          <ComplianceRiskStep
            data={{
              regulations: formData.regulations,
              restrictedTopics: formData.restrictedTopics,
              botRestrictions: formData.botRestrictions,
            }}
            onChange={updateFormData}
          />
        );
      case 5:
        return (
          <SalesLeadStep
            data={{
              enableLeadCapture: formData.enableLeadCapture,
              captureFields: formData.captureFields,
              salesPriority: formData.salesPriority,
              handoffMethod: formData.handoffMethod,
            }}
            onChange={updateFormData}
          />
        );
      case 6:
        return (
          <DocumentsUploadStep
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
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto">
          <OnboardingStepIndicator steps={steps} currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Form Section */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-8 lg:p-10">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-8">
              {stepTitles[currentStep - 1]}
            </h1>

            {renderStep()}

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
                onClick={currentStep === 6 ? handleFinish : handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {currentStep === 6 ? (
                  <>
                    <Check className="w-4 h-4" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Illustration Section */}
          <div className="hidden lg:block sticky top-8">
            <OnboardingIllustration step={currentStep} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
