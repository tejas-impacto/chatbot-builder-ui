import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Loader2, Bot, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getValidAccessToken, SessionExpiredError, logout } from "@/lib/auth";
import { createBot, initBotCreationSession, CreateBotRequest } from "@/lib/botApi";

import KnowledgeBaseStep from "@/components/bot-creation/steps/KnowledgeBaseStep";
import ConversationStyleStep from "@/components/bot-creation/steps/ConversationStyleStep";
import PurposeCategoryStep from "@/components/bot-creation/steps/PurposeCategoryStep";
import PersonaVoiceStep from "@/components/bot-creation/steps/PersonaVoiceStep";
import UploadDocumentsStep from "@/components/bot-creation/steps/UploadDocumentsStep";

// Helper to capitalize first letter (backend expects 'Short', 'Medium', 'Long')
const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export interface BotCreationData {
  // Bot Type Selection
  botType: "chat" | "voice";

  // Step 1: Knowledge Base
  companyOverview: string;
  productFeatures: string;
  commonFaqs: string;

  // Step 2: Conversation Style
  chatResponseLength: string;
  chatGuidelines: string;
  voiceResponseLength: string;
  voiceGuidelines: string;
  voiceSpeed: string;

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
  botType: "chat",
  companyOverview: "",
  productFeatures: "",
  commonFaqs: "",
  chatResponseLength: "medium",
  chatGuidelines: "",
  voiceResponseLength: "medium",
  voiceGuidelines: "",
  voiceSpeed: "normal",
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
  const location = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BotCreationData>(initialData);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // Check if voice bot should be pre-enabled from navigation state
  useEffect(() => {
    const state = location.state as { voiceEnabled?: boolean } | null;
    if (state?.voiceEnabled) {
      setFormData(prev => ({ ...prev, botType: "voice" }));
    }
  }, [location.state]);

  const updateFormData = (data: Partial<BotCreationData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Clear errors for fields being updated
    if (Object.keys(stepErrors).length > 0) {
      const updatedErrors = { ...stepErrors };
      Object.keys(data).forEach(key => {
        delete updatedErrors[key];
      });
      setStepErrors(updatedErrors);
    }
  };

  // Validate current step before proceeding
  const validateStep = (step: number): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 3: // Purpose Category
        if (!formData.purpose) {
          errors.purpose = 'Please select a purpose category';
        }
        break;
      case 4: // Persona & Voice
        if (!formData.agentName?.trim()) {
          errors.agentName = 'Agent name is required';
        }
        if (!formData.persona) {
          errors.persona = 'Please select a persona';
        }
        break;
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleNext = () => {
    // Validate current step before proceeding
    const { isValid, errors } = validateStep(currentStep);
    if (!isValid) {
      setStepErrors(errors);
      return;
    }
    setStepErrors({});

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

  // Upload documents using multipart/form-data
  const uploadDocuments = async (files: File[], tenantId: string, botId: string, accessToken: string, botType: "chat" | "voice"): Promise<{ success: boolean; error?: string }> => {
    try {
      const formData = new FormData();

      // Add all files
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Add other fields
      formData.append('tenantId', tenantId);
      formData.append('documentType', 'CHATBOT'); // All bot documents use CHATBOT type, filtered by botId
      formData.append('botId', botId);
      formData.append('description', botType === 'voice' ? 'Voicebot knowledge base documents' : 'Chatbot knowledge base documents');

      const response = await fetch(
        `/api-doc/v1/documents/upload/multiple`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'accept': '*/*',
            // Don't set Content-Type - browser will set it with boundary for FormData
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || `Upload failed with status ${response.status}`;
        console.error('Failed to upload documents:', errorMsg);
        return { success: false, error: errorMsg };
      }

      return { success: true };
    } catch (error) {
      console.error('Error uploading documents:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const handleSubmit = async () => {
    setIsCreating(true);
    console.log("Bot Creation Data:", formData);

    const tenantId = localStorage.getItem('tenantId') || '';

    try {
      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        throw new Error('No access token available');
      }

      if (!tenantId) {
        throw new Error('No tenant ID found. Please complete onboarding first.');
      }

      // Step 1: Create Bot with form data
      setUploadProgress("Creating bot...");

      const createBotPayload: CreateBotRequest = {
        tenantId,
        conversationStyle: {
          chatLength: formData.chatResponseLength || 'medium',
          chatGuidelines: formData.chatGuidelines || '',
          voiceLength: formData.voiceResponseLength || 'medium',
          voiceGuidelines: formData.voiceGuidelines || '',
        },
        channelType: formData.botType === 'voice' ? 'VOICE' : 'TEXT',
        purposeCategory: formData.purpose || '',
        persona: formData.persona || '',
        agentName: formData.agentName || 'My Chatbot',
        toneOfVoice: formData.voiceTone || 'friendly',
      };

      const createBotResponse = await createBot(createBotPayload);
      const botId = createBotResponse.responseStructure.data.bot_id;
      console.log("Bot created with ID:", botId);

      // Step 2: Upload Documents (with botId)
      if (formData.files.length > 0) {
        setUploadProgress(`Uploading ${formData.files.length} document(s)...`);

        const result = await uploadDocuments(formData.files, tenantId, botId, accessToken, formData.botType);

        if (result.success) {
          toast({
            title: "Documents Uploaded",
            description: `Successfully uploaded ${formData.files.length} document(s).`,
          });
        } else {
          toast({
            title: "Upload failed",
            description: result.error || "Failed to upload documents",
            variant: "destructive",
          });
          console.error('Upload failed:', result.error);
        }
      }

      // Step 3: Initialize Bot Creation Session
      setUploadProgress("Initializing bot creation session...");
      const initResponse = await initBotCreationSession(botId);
      const { ticket, session_id } = initResponse.responseStructure.data;
      console.log("Bot creation session initialized:", { ticket, session_id });

      // Step 4: Navigate to progress page with WebSocket connection info and bot config
      navigate("/bot-creation-progress", {
        state: {
          botId,
          ticket,
          sessionId: session_id,
          agentName: formData.agentName || "AI Agent",
          tenantId,
          documentsUploaded: formData.files.length,
          // Include knowledge base data for WebSocket bot_config (snake_case format)
          // Note: chat_length and voice_length must be capitalized: 'Short', 'Medium', or 'Long'
          botConfig: {
            company_overview: formData.companyOverview || '',
            product_features: formData.productFeatures || '',
            customer_faqs: formData.commonFaqs || '',
            conversation_style: {
              chat_length: capitalize(formData.chatResponseLength) || 'Medium',
              chat_guidelines: formData.chatGuidelines || '',
              voice_length: capitalize(formData.voiceResponseLength) || 'Medium',
              voice_guidelines: formData.voiceGuidelines || '',
            },
            purpose_category: formData.purpose || '',
            persona: formData.persona || '',
            tone_of_voice: formData.voiceTone || 'friendly',
            agent_name: formData.agentName || 'My Chatbot',
          },
        },
      });
    } catch (error) {
      // Handle session expiration gracefully
      if (error instanceof SessionExpiredError) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        logout();
        return;
      }
      console.error("Failed to create bot:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create bot",
        variant: "destructive",
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
        return <ConversationStyleStep data={formData} onChange={updateFormData} botType={formData.botType} />;
      case 3:
        return <PurposeCategoryStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 4:
        return <PersonaVoiceStep data={formData} onChange={updateFormData} errors={stepErrors} />;
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
          <span className="text-lg font-bold text-primary">Agent Builder</span>
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

          {/* Bot Type Selection - Show on Step 1 */}
          {currentStep === 1 && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">
                Select Bot Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => updateFormData({ botType: "chat" })}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    formData.botType === "chat"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.botType === "chat" ? "bg-primary/20" : "bg-muted"
                    }`}>
                      <Bot className={`w-5 h-5 ${
                        formData.botType === "chat" ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <span className={`font-semibold ${
                      formData.botType === "chat" ? "text-primary" : "text-foreground"
                    }`}>
                      Chat Bot
                    </span>
                  </div>
                  <p className={`text-xs ${
                    formData.botType === "chat" ? "text-primary/80" : "text-muted-foreground"
                  }`}>
                    Text-based conversations for customer support and engagement
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => updateFormData({ botType: "voice" })}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    formData.botType === "voice"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-input hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.botType === "voice" ? "bg-primary/20" : "bg-muted"
                    }`}>
                      <Mic className={`w-5 h-5 ${
                        formData.botType === "voice" ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <span className={`font-semibold ${
                      formData.botType === "voice" ? "text-primary" : "text-foreground"
                    }`}>
                      Voice Bot
                    </span>
                  </div>
                  <p className={`text-xs ${
                    formData.botType === "voice" ? "text-primary/80" : "text-muted-foreground"
                  }`}>
                    Voice-enabled assistant for phone support and voice interactions
                  </p>
                </button>
              </div>
            </div>
          )}

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
