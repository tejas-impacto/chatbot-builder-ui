import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";

import KnowledgeBaseStep from "@/components/bot-creation/steps/KnowledgeBaseStep";
import ConversationStyleStep from "@/components/bot-creation/steps/ConversationStyleStep";
import PurposeCategoryStep from "@/components/bot-creation/steps/PurposeCategoryStep";
import PersonaVoiceStep from "@/components/bot-creation/steps/PersonaVoiceStep";
import UploadDocumentsStep from "@/components/bot-creation/steps/UploadDocumentsStep";

export interface BotCreationData {
  // Step 1: Knowledge Base
  companyOverview: string;
  productFeatures: string;
  commonFaqs: string;
  
  // Step 2: Conversation Style
  chatResponseLength: string;
  chatGuidelines: string;
  voiceResponseLength: string;
  voiceGuidelines: string;
  
  // Step 3: Purpose Category
  purpose: string;
  
  // Step 4: Persona & Voice
  persona: string;
  voiceTone: string;
  agentName: string;
  
  // Step 5: Upload Documents
  files: File[];
}

const initialData: BotCreationData = {
  companyOverview: "",
  productFeatures: "",
  commonFaqs: "",
  chatResponseLength: "medium",
  chatGuidelines: "",
  voiceResponseLength: "medium",
  voiceGuidelines: "",
  purpose: "",
  persona: "",
  voiceTone: "friendly",
  agentName: "",
  files: [],
};

const steps = [
  { id: 1, title: "Knowledge Base", description: "Provide information for your AI agent" },
  { id: 2, title: "Conversation Style", description: "Define how your agent communicates" },
  { id: 3, title: "Purpose Category", description: "What will this agent primarily do?" },
  { id: 4, title: "Persona & Voice", description: "Define your bot's personality" },
  { id: 5, title: "Upload Documents", description: "Add files to enhance agent knowledge" },
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
    navigate("/bot-creation-progress", { state: { agentName: formData.agentName || "AI Agent" } });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <KnowledgeBaseStep data={formData} onChange={updateFormData} />;
      case 2:
        return <ConversationStyleStep data={formData} onChange={updateFormData} />;
      case 3:
        return <PurposeCategoryStep data={formData} onChange={updateFormData} />;
      case 4:
        return <PersonaVoiceStep data={formData} onChange={updateFormData} />;
      case 5:
        return <UploadDocumentsStep data={formData} onChange={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-primary">CHATBOT AI</span>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-6 py-8">
        {/* Robot Icon */}
        <div className="mb-6">
          <div className="relative">
            <div className="w-16 h-12 bg-foreground rounded-xl flex items-center justify-center relative">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-background rounded-full" />
                <div className="w-3 h-3 bg-background rounded-full" />
              </div>
              {/* Antenna */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-foreground" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rounded-full" />
            </div>
            {/* Decorative lines */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2">
              <div className="flex flex-col gap-0.5">
                <div className="w-6 h-1 bg-primary rounded-full" />
                <div className="w-6 h-1 bg-pink-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-lg p-8">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 flex-1">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    currentStep >= step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <span className="ml-4 text-sm text-muted-foreground whitespace-nowrap">
              Step {String(currentStep).padStart(2, '0')} /{String(steps.length).padStart(2, '0')}
            </span>
          </div>

          {/* Step Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Separator */}
          <div className="border-t border-border mb-6" />

          {/* Navigation */}
          <div className="flex justify-between items-center">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                className="rounded-full px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={handleNext}
              className="rounded-full px-8 bg-primary hover:bg-primary/90"
            >
              {currentStep === steps.length ? "Create Bot" : "Continue"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BotCreation;
