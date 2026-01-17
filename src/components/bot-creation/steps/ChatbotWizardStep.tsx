import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, BookOpen, MessageSquare, Target, User, Upload, File, X } from "lucide-react";
import type { BotCreationData } from "@/pages/BotCreation";

const servicesOptions = ["HealthTech", "Technology", "Finance", "Design", "Others"];
const responseLengths = ["Short", "Medium", "Detailed"];
const purposes = ["Customer Support", "FAQ", "Marketing", "Other"];
const personas = [
  "Customer Support",
  "FAQ",
  "Sales Marketing",
  "Marketing Manager",
  "Operation Manager",
  "Product Manager",
  "Client Service",
  "Custom",
];
const voiceStyles = ["Friendly", "Casual", "Professional"];

interface ChatbotWizardStepProps {
  data: BotCreationData;
  onChange: (data: Partial<BotCreationData>) => void;
}

const ChatbotWizardStep = ({ data, onChange }: ChatbotWizardStepProps) => {
  const [activeTab, setActiveTab] = useState("knowledge");
  const [isDragging, setIsDragging] = useState(false);

  const toggleService = (service: string) => {
    const updated = data.productsServices.includes(service)
      ? data.productsServices.filter((s) => s !== service)
      : [...data.productsServices, service];
    onChange({ productsServices: updated });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(
        (file) =>
          file.size <= 10 * 1024 * 1024 &&
          (file.type === "application/pdf" ||
            file.type === "application/msword" ||
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.type === "text/plain")
      );
      onChange({ wizardFiles: [...data.wizardFiles, ...validFiles] });
    },
    [data.wizardFiles, onChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      onChange({ wizardFiles: [...data.wizardFiles, ...selectedFiles] });
    }
  };

  const removeFile = (index: number) => {
    const updated = data.wizardFiles.filter((_, i) => i !== index);
    onChange({ wizardFiles: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Chatbot Setup Wizard</h3>
          <p className="text-sm text-muted-foreground">Configure your chatbot's personality and behavior</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-6">
          <TabsTrigger value="knowledge" className="text-xs sm:text-sm">
            <BookOpen className="w-4 h-4 mr-1 hidden sm:inline" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs sm:text-sm">
            <MessageSquare className="w-4 h-4 mr-1 hidden sm:inline" />
            Style
          </TabsTrigger>
          <TabsTrigger value="purpose" className="text-xs sm:text-sm">
            <Target className="w-4 h-4 mr-1 hidden sm:inline" />
            Purpose
          </TabsTrigger>
          <TabsTrigger value="persona" className="text-xs sm:text-sm">
            <User className="w-4 h-4 mr-1 hidden sm:inline" />
            Persona
          </TabsTrigger>
          <TabsTrigger value="docs" className="text-xs sm:text-sm">
            <Upload className="w-4 h-4 mr-1 hidden sm:inline" />
            Docs
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Knowledge Base */}
        <TabsContent value="knowledge" className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="companyOverview" className="text-sm font-medium">
              Company Overview <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="companyOverview"
              placeholder="Provide a brief overview of your company..."
              value={data.companyOverview}
              onChange={(e) => onChange({ companyOverview: e.target.value })}
              className="onboarding-input min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Products / Services <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {servicesOptions.map((service) => (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`onboarding-chip ${
                    data.productsServices.includes(service)
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
            <Label htmlFor="faqs" className="text-sm font-medium">
              Common FAQs
            </Label>
            <Textarea
              id="faqs"
              placeholder="Enter common questions and answers..."
              value={data.faqs}
              onChange={(e) => onChange({ faqs: e.target.value })}
              className="onboarding-input min-h-[100px] resize-none"
            />
          </div>
        </TabsContent>

        {/* Step 2: Conversation Style */}
        <TabsContent value="style" className="space-y-5">
          <div className="p-4 bg-muted/30 rounded-xl space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Chat Settings
            </h4>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Chat Response Length</Label>
              <div className="flex flex-wrap gap-2">
                {responseLengths.map((length) => (
                  <button
                    key={length}
                    type="button"
                    onClick={() => onChange({ chatResponseLength: length })}
                    className={`onboarding-chip ${
                      data.chatResponseLength === length
                        ? "onboarding-chip-active"
                        : "onboarding-chip-inactive"
                    }`}
                  >
                    {length}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatGuidelines" className="text-sm font-medium">
                Chat Guidelines
              </Label>
              <Textarea
                id="chatGuidelines"
                placeholder="Any specific guidelines for chat responses..."
                value={data.chatGuidelines}
                onChange={(e) => onChange({ chatGuidelines: e.target.value })}
                className="onboarding-input min-h-[80px] resize-none"
              />
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-xl space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              🎙️ Voice Settings
            </h4>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Voice Response Length</Label>
              <div className="flex flex-wrap gap-2">
                {responseLengths.map((length) => (
                  <button
                    key={`voice-${length}`}
                    type="button"
                    onClick={() => onChange({ voiceResponseLength: length })}
                    className={`onboarding-chip ${
                      data.voiceResponseLength === length
                        ? "onboarding-chip-active"
                        : "onboarding-chip-inactive"
                    }`}
                  >
                    {length}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="voiceGuidelines" className="text-sm font-medium">
                Voice Guidelines
              </Label>
              <Textarea
                id="voiceGuidelines"
                placeholder="Any specific guidelines for voice responses..."
                value={data.voiceGuidelines}
                onChange={(e) => onChange({ voiceGuidelines: e.target.value })}
                className="onboarding-input min-h-[80px] resize-none"
              />
            </div>
          </div>
        </TabsContent>

        {/* Step 3: Purpose Category */}
        <TabsContent value="purpose" className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Purpose <span className="text-destructive">*</span>
            </Label>
            <div className="grid sm:grid-cols-2 gap-3">
              {purposes.map((purpose) => (
                <button
                  key={purpose}
                  type="button"
                  onClick={() => onChange({ purposeCategory: purpose })}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    data.purposeCategory === purpose
                      ? "bg-primary/5 border-primary"
                      : "bg-muted/30 border-transparent hover:border-primary/30"
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    data.purposeCategory === purpose ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {purpose}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Step 4: Persona & Voice */}
        <TabsContent value="persona" className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Persona</Label>
            <div className="grid sm:grid-cols-3 gap-2">
              {personas.map((persona) => (
                <button
                  key={persona}
                  type="button"
                  onClick={() => onChange({ persona })}
                  className={`onboarding-chip text-center ${
                    data.persona === persona
                      ? "onboarding-chip-active"
                      : "onboarding-chip-inactive"
                  }`}
                >
                  {persona}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Voice Response Style</Label>
            <div className="flex flex-wrap gap-2">
              {voiceStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onChange({ voiceStyle: style })}
                  className={`onboarding-chip ${
                    data.voiceStyle === style
                      ? "onboarding-chip-active"
                      : "onboarding-chip-inactive"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agentName" className="text-sm font-medium">
              Agent Name
            </Label>
            <Input
              id="agentName"
              placeholder="Give your bot a name..."
              value={data.agentName}
              onChange={(e) => onChange({ agentName: e.target.value })}
              className="onboarding-input"
            />
          </div>
        </TabsContent>

        {/* Step 5: Documents Upload */}
        <TabsContent value="docs" className="space-y-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30 hover:border-primary/50"
            }`}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileInput}
              className="hidden"
              id="wizard-file-upload"
            />
            <label htmlFor="wizard-file-upload" className="cursor-pointer">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOC, TXT • Max 10MB per file
              </p>
            </label>
          </div>

          {data.wizardFiles.length > 0 && (
            <div className="space-y-2">
              {data.wizardFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <File className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotWizardStep;
