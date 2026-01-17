import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Bot } from "lucide-react";
import { toast } from "sonner";

import BusinessIdentityStep from "@/components/bot-creation/steps/BusinessIdentityStep";
import WhatYouDoStep from "@/components/bot-creation/steps/WhatYouDoStep";
import SupportInteractionStep from "@/components/bot-creation/steps/SupportInteractionStep";
import ComplianceRiskStep from "@/components/bot-creation/steps/ComplianceRiskStep";
import SalesLeadCaptureStep from "@/components/bot-creation/steps/SalesLeadCaptureStep";
import DocumentsUploadStep from "@/components/bot-creation/steps/DocumentsUploadStep";
import ChatbotWizardStep from "@/components/bot-creation/steps/ChatbotWizardStep";

export interface BotCreationData {
  // Step 1: Business Identity
  companyName: string;
  brandName: string;
  industry: string;
  companyWebsite: string;
  businessDescription: string;
  
  // Step 2: What You Do & Who You Serve
  primaryServices: string[];
  customerType: string;
  country: string;
  region: string;
  companySize: string;
  
  // Step 3: Support & Customer Interaction Model
  commonQueries: string[];
  existingChannels: string[];
  supportEmail: string;
  
  // Step 4: Compliance & Risk
  regulations: string[];
  restrictedTopics: string;
  botRestrictions: string[];
  
  // Step 5: Sales & Lead Capture
  leadCaptureFields: string[];
  salesPriority: string;
  handoffMethod: string;
  
  // Step 6: Documents Upload
  documentType: string;
  files: File[];
  documentDescription: string;
  
  // Step 7: Chatbot Setup Wizard
  companyOverview: string;
  productsServices: string[];
  faqs: string;
  chatResponseLength: string;
  chatGuidelines: string;
  voiceResponseLength: string;
  voiceGuidelines: string;
  purposeCategory: string;
  persona: string;
  voiceStyle: string;
  agentName: string;
  wizardFiles: File[];
}

const initialData: BotCreationData = {
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
  existingChannels: [],
  supportEmail: "",
  regulations: [],
  restrictedTopics: "",
  botRestrictions: [],
  leadCaptureFields: [],
  salesPriority: "",
  handoffMethod: "",
  documentType: "",
  files: [],
  documentDescription: "",
  companyOverview: "",
  productsServices: [],
  faqs: "",
  chatResponseLength: "",
  chatGuidelines: "",
  voiceResponseLength: "",
  voiceGuidelines: "",
  purposeCategory: "",
  persona: "",
  voiceStyle: "",
  agentName: "",
  wizardFiles: [],
};

const steps = [
  { id: 1, title: "Business Identity", description: "Tell us about your company" },
  { id: 2, title: "What You Do", description: "Products & customers" },
  { id: 3, title: "Support Model", description: "Customer interaction" },
  { id: 4, title: "Compliance", description: "Regulations & restrictions" },
  { id: 5, title: "Lead Capture", description: "Sales configuration" },
  { id: 6, title: "Documents", description: "Upload resources" },
  { id: 7, title: "Chatbot Wizard", description: "Configure your bot" },
];

const BotCreation = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BotCreationData>(initialData);

  const updateFormData = (data: Partial<BotCreationData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Bot Creation Data:", formData);
    navigate("/bot-creation-progress");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BusinessIdentityStep data={formData} onChange={updateFormData} />;
      case 2:
        return <WhatYouDoStep data={formData} onChange={updateFormData} />;
      case 3:
        return <SupportInteractionStep data={formData} onChange={updateFormData} />;
      case 4:
        return <ComplianceRiskStep data={formData} onChange={updateFormData} />;
      case 5:
        return <SalesLeadCaptureStep data={formData} onChange={updateFormData} />;
      case 6:
        return <DocumentsUploadStep data={formData} onChange={updateFormData} />;
      case 7:
        return <ChatbotWizardStep data={formData} onChange={updateFormData} />;
      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-primary/5">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">CHATBOT AI</h1>
            <p className="text-sm text-muted-foreground">Create your intelligent assistant</p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep > step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden sm:block ${
                    currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progressPercentage} className="h-1.5" />
        </div>

        {/* Current Step Info */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Step {currentStep}: {steps[currentStep - 1].title}
          </h2>
          <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="rounded-full px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="rounded-full px-6 bg-primary hover:bg-primary/90"
          >
            {currentStep === steps.length ? "Create Bot" : "Continue"}
            {currentStep < steps.length && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BotCreation;
