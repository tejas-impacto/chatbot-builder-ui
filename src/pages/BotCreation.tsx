import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createChatSession } from "@/lib/chatApi";
import { getValidAccessToken } from "@/lib/auth";

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

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

const BotCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BotCreationData>(initialData);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

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

  // Upload a single document
  const uploadDocument = async (file: File, tenantId: string, accessToken: string): Promise<boolean> => {
    try {
      const base64File = await fileToBase64(file);

      const response = await fetch(
        `/api-doc/v1/documents/upload?tenantId=${tenantId}&documentType=BUSINESS&documentName=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'accept': '*/*',
          },
          body: JSON.stringify({ file: base64File }),
        }
      );

      if (!response.ok) {
        console.error(`Failed to upload ${file.name}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      return false;
    }
  };

  const handleSubmit = async () => {
    setIsCreating(true);
    console.log("Bot Creation Data:", formData);

    try {
      const tenantId = localStorage.getItem('tenantId') || '';
      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Upload documents first if any
      if (formData.files.length > 0) {
        setUploadProgress(`Uploading documents (0/${formData.files.length})...`);

        let successCount = 0;
        for (let i = 0; i < formData.files.length; i++) {
          setUploadProgress(`Uploading documents (${i + 1}/${formData.files.length})...`);
          const success = await uploadDocument(formData.files[i], tenantId, accessToken);
          if (success) successCount++;
        }

        if (successCount > 0) {
          toast({
            title: "Documents Uploaded",
            description: `Successfully uploaded ${successCount} of ${formData.files.length} documents.`,
          });
        }

        if (successCount < formData.files.length) {
          toast({
            title: "Warning",
            description: `${formData.files.length - successCount} documents failed to upload.`,
            variant: "destructive",
          });
        }
      }

      setUploadProgress("Creating bot...");

      // For now, use a placeholder chatbotId - this will be replaced when backend provides real chatbot creation
      const chatbotId = "demo-chatbot"; // TODO: Get from actual bot creation API response

      // Create chat session
      const sessionResponse = await createChatSession(chatbotId);
      const sessionData = sessionResponse.responseStructure?.data;

      if (sessionData?.sessionToken) {
        // Navigate to chat interface with session data
        navigate("/manage-chatbot", {
          state: {
            sessionToken: sessionData.sessionToken,
            chatbotId: sessionData.chatbotId || chatbotId,
            chatbotName: sessionData.chatbotName || formData.agentName || "AI Agent",
            tenantId,
            showLeadForm: true,
          },
        });
      } else {
        throw new Error('No session token received');
      }
    } catch (error) {
      console.error("Failed to create bot:", error);
      toast({
        title: "Error",
        description: "Failed to initialize chat session. Navigating to demo mode.",
        variant: "destructive",
      });
      // Fallback to demo mode
      navigate("/manage-chatbot", {
        state: {
          chatbotName: formData.agentName || "AI Agent",
          showLeadForm: true,
          demoMode: true,
        },
      });
    } finally {
      setIsCreating(false);
      setUploadProgress("");
    }
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
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadProgress || "Creating..."}
                </>
              ) : (
                currentStep === steps.length ? "Create Bot" : "Continue"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BotCreation;
