import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import OnboardingStepIndicator from "@/components/onboarding/OnboardingStepIndicator";
import { useToast } from "@/hooks/use-toast";
import { getValidAccessToken } from "@/lib/auth";
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

interface TypicalCustomerQueries {
  pricing: boolean;
  support: boolean;
  troubleshooting: boolean;
  sales: boolean;
  policyCompliance: boolean;
  customQueries: string[];
}

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
  typicalCustomerQueries: TypicalCustomerQueries;
  // Bot Configuration (Step 2)
  supportChannels: string[];
  ticketingTool: string;
  supportEmail: string;
  supportPhone: string;
  regulations: string[];
  restrictedTopics: string;
  botRestrictions: string;
  enableLeadCapture: boolean;
  captureFields: string[];
  salesPriority: string;
  handoffMethod: string;
  escalationPreference: string;
  communicationStyle: string;
  brandAdjectives: string[];
  wordsToAvoid: string[];
  primaryAdminEmail: string;
  secondaryAdminEmails: string[];
  notificationPreferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    inAppNotifications: boolean;
  };
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
  customerType: "B2B",
  country: "",
  region: "",
  companySize: "",
  monthlyCustomerInteractions: "",
  typicalCustomerQueries: {
    pricing: false,
    support: false,
    troubleshooting: false,
    sales: false,
    policyCompliance: false,
    customQueries: [],
  },
  supportChannels: [],
  ticketingTool: "",
  supportEmail: "",
  supportPhone: "",
  regulations: [],
  restrictedTopics: "",
  botRestrictions: "",
  enableLeadCapture: true,
  captureFields: ["name", "email", "phone"],
  salesPriority: "High",
  handoffMethod: "Call",
  escalationPreference: "Phone",
  communicationStyle: "Semi-formal",
  brandAdjectives: [],
  wordsToAvoid: [],
  primaryAdminEmail: "",
  secondaryAdminEmails: [],
  notificationPreferences: {
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
  },
  documentType: "Product Documentation",
  files: [],
  documentDescription: "",
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScrapingWebsite, setIsScrapingWebsite] = useState(false);

  // Check URL params for initial step (e.g., ?step=3 for document upload only)
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const step = parseInt(stepParam);
      if (step >= 1 && step <= 3) {
        setCurrentStep(step);
      }
    }
  }, [searchParams]);

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleWebsiteScrape = async (url: string) => {
    // Validate URL
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return;
    }

    setIsScrapingWebsite(true);

    try {
      const response = await fetch('http://10.108.228.76:3002/v1/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fc-test',
        },
        body: JSON.stringify({
          urls: [url],
          prompt: "Extract ONLY factual information from this website. STRICT RULES: For monthlyCustomerInteractions and employeesRange fields - return null unless the website explicitly states the exact number. Do not invent any numbers.",
          schema: {
            type: "object",
            properties: {
              companyIdentity: {
                type: "object",
                properties: {
                  legalCompanyName: { type: ["string", "null"] },
                  brandDisplayName: { type: ["string", "null"] },
                  industry: { type: ["string", "null"] },
                  companyWebsite: { type: ["string", "null"] },
                  companyDescription: { type: ["string", "null"] }
                }
              },
              primaryProductsServices: {
                type: "array",
                items: { type: "string" }
              },
              customerType: {
                type: ["string", "null"],
                enum: ["B2B", "B2C", "Both", null]
              },
              customerGeography: {
                type: "object",
                properties: {
                  country: { type: ["string", "null"] },
                  region: { type: ["string", "null"] }
                }
              },
              existingSupportChannels: {
                type: "object",
                properties: {
                  phone: { type: ["boolean", "null"] },
                  email: { type: ["boolean", "null"] },
                  whatsapp: { type: ["boolean", "null"] }
                }
              },
              communicationStyle: { type: ["string", "null"] },
              brandAdjectives: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        }),
      });

      const result = await response.json();

      if (result && result.data) {
        const scraped = result.data;

        // Helper functions to map API values to form options
        const mapCountry = (country: string): string => {
          const countryMap: Record<string, string> = {
            'United States': 'USA',
            'United States of America': 'USA',
            'US': 'USA',
            'United Kingdom': 'UK',
            'Britain': 'UK',
            'Great Britain': 'UK',
          };
          return countryMap[country] || country;
        };

        const mapRegion = (region: string): string => {
          const regionLower = region.toLowerCase();
          if (regionLower.includes('north america') || regionLower.includes('northeast') || regionLower.includes('new england')) {
            return 'North America';
          }
          if (regionLower.includes('europe')) return 'Europe';
          if (regionLower.includes('asia') || regionLower.includes('pacific')) return 'Asia Pacific';
          if (regionLower.includes('middle east')) return 'Middle East';
          if (regionLower.includes('africa')) return 'Africa';
          if (regionLower.includes('latin') || regionLower.includes('south america')) return 'Latin America';
          return region;
        };

        const mapIndustry = (industry: string): string => {
          const industryLower = industry.toLowerCase();
          if (industryLower.includes('health') || industryLower.includes('medical')) return 'HealthTech';
          if (industryLower.includes('tech') || industryLower.includes('software') || industryLower.includes('it')) return 'Technology';
          if (industryLower.includes('finance') || industryLower.includes('bank') || industryLower.includes('insurance')) return 'Finance';
          if (industryLower.includes('fintech')) return 'Fintech';
          if (industryLower.includes('design') || industryLower.includes('creative')) return 'Design';
          if (industryLower.includes('education') || industryLower.includes('learning')) return 'Education';
          if (industryLower.includes('manufacturing') || industryLower.includes('construction') || industryLower.includes('industrial')) return 'Manufacturing';
          return 'Other';
        };

        const mapServices = (services: string[]): string[] => {
          const validServices = ['SaaS', 'Consulting', 'E-commerce', 'Healthcare', 'FinTech', 'EdTech'];
          const mapped: string[] = [];
          services.forEach(service => {
            const serviceLower = service.toLowerCase();
            if (serviceLower.includes('saas') || serviceLower.includes('software')) mapped.push('SaaS');
            if (serviceLower.includes('consult')) mapped.push('Consulting');
            if (serviceLower.includes('commerce') || serviceLower.includes('retail')) mapped.push('E-commerce');
            if (serviceLower.includes('health') || serviceLower.includes('medical')) mapped.push('Healthcare');
            if (serviceLower.includes('fintech') || serviceLower.includes('finance')) mapped.push('FinTech');
            if (serviceLower.includes('education') || serviceLower.includes('learning')) mapped.push('EdTech');
          });
          return [...new Set(mapped)]; // Remove duplicates
        };

        // Map scraped data to ALL form fields across steps
        const updates: Partial<OnboardingData> = {};

        // Step 1: Company Profile fields
        if (scraped.companyIdentity?.legalCompanyName) {
          updates.companyName = scraped.companyIdentity.legalCompanyName;
        }
        if (scraped.companyIdentity?.brandDisplayName) {
          updates.brandName = scraped.companyIdentity.brandDisplayName;
        }
        if (scraped.companyIdentity?.industry) {
          updates.industry = mapIndustry(scraped.companyIdentity.industry);
        }
        if (scraped.companyIdentity?.companyDescription) {
          updates.businessDescription = scraped.companyIdentity.companyDescription;
        }
        if (scraped.primaryProductsServices?.length > 0) {
          const mappedServices = mapServices(scraped.primaryProductsServices);
          if (mappedServices.length > 0) {
            updates.primaryServices = mappedServices;
          }
        }
        if (scraped.customerType) {
          updates.customerType = scraped.customerType;
        }
        if (scraped.customerGeography?.country) {
          updates.country = mapCountry(scraped.customerGeography.country);
        }
        if (scraped.customerGeography?.region) {
          updates.region = mapRegion(scraped.customerGeography.region);
        }

        // Step 2: Bot Configuration fields
        if (scraped.existingSupportChannels) {
          const channels: string[] = [];
          if (scraped.existingSupportChannels.phone) channels.push('phone');
          if (scraped.existingSupportChannels.email) channels.push('email');
          if (scraped.existingSupportChannels.whatsapp) channels.push('chat');
          if (channels.length > 0) {
            updates.supportChannels = channels;
          }
        }
        if (scraped.communicationStyle) {
          updates.communicationStyle = scraped.communicationStyle;
        }
        if (scraped.brandAdjectives?.length > 0) {
          updates.brandAdjectives = scraped.brandAdjectives;
        }

        if (Object.keys(updates).length > 0) {
          setFormData((prev) => ({ ...prev, ...updates }));
          toast({
            title: "Auto-filled",
            description: "Company information extracted from website",
          });
        }
      }
    } catch (error) {
      console.error('Website scraping failed:', error);
      toast({
        title: "Extraction Failed",
        description: "Could not extract information from website",
        variant: "destructive",
      });
    } finally {
      setIsScrapingWebsite(false);
    }
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

  const handleFinish = async () => {
    setIsSubmitting(true);

    try {
      // Get valid access token (refreshes if expired)
      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        throw new Error('Session expired. Please login again.');
      }

      // Map form data to API structure (matching backend schema)
      const onboardingPayload = {
        companyIdentity: {
          legalCompanyName: formData.companyName,
          brandDisplayName: formData.brandName,
          industry: formData.industry,
          companyWebsite: formData.companyWebsite,
          companyDescription: formData.businessDescription,
        },
        primaryProductsServices: formData.primaryServices,
        customerType: formData.customerType,
        customerGeography: {
          country: formData.country,
          region: formData.region,
        },
        businessSize: {
          employeesRange: formData.companySize,
          monthlyCustomerInteractions: parseInt(formData.monthlyCustomerInteractions) || 0,
        },
        typicalCustomerQueries: {
          pricing: formData.typicalCustomerQueries.pricing,
          support: formData.typicalCustomerQueries.support,
          troubleshooting: formData.typicalCustomerQueries.troubleshooting,
          sales: formData.typicalCustomerQueries.sales,
          policyCompliance: formData.typicalCustomerQueries.policyCompliance,
          customQueries: formData.typicalCustomerQueries.customQueries,
        },
        existingSupportChannels: {
          phone: formData.supportChannels.includes("phone"),
          email: formData.supportChannels.includes("email"),
          whatsapp: formData.supportChannels.includes("whatsapp"),
          ticketingTool: formData.ticketingTool || null,
          supportEmail: formData.supportEmail || null,
          supportPhone: formData.supportPhone || null,
        },
        escalationPreference: formData.escalationPreference,
        gdprRequired: formData.regulations.includes("GDPR"),
        hipaaRequired: formData.regulations.includes("HIPAA"),
        pciDssRequired: formData.regulations.includes("PCI-DSS"),
        soc2Required: formData.regulations.includes("SOC 2"),
        iso27001Required: formData.regulations.includes("ISO 27001"),
        restrictedTopics: formData.restrictedTopics,
        mustNotInstructions: formData.botRestrictions,
        isLeadCaptureRequired: formData.enableLeadCapture,
        mandatoryLeadFields: {
          name: formData.captureFields.includes("name"),
          phone: formData.captureFields.includes("phone"),
          email: formData.captureFields.includes("email"),
          company: formData.captureFields.includes("company"),
        },
        salesIntentPriority: formData.salesPriority,
        salesHandoffMethod: formData.handoffMethod,
        communicationStyle: formData.communicationStyle,
        brandAdjectives: formData.brandAdjectives,
        wordsToAvoid: formData.wordsToAvoid,
        primaryAdminEmail: formData.primaryAdminEmail,
        secondaryAdminEmails: formData.secondaryAdminEmails,
        notificationPreferences: formData.notificationPreferences,
      };

      const response = await fetch('/api/v1/tenants/onboarding', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(onboardingPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Onboarding failed');
      }

      // Extract tenantId from response
      const tenantId = data.responseStructure?.data?.tenantId;

      // Upload documents if files are present and onboarding was successful
      if (tenantId && formData.files && formData.files.length > 0) {
        try {
          const uploadFormData = new FormData();

          // Append all files with the same key 'files'
          for (const file of formData.files) {
            uploadFormData.append('files', file);
          }

          uploadFormData.append('tenantId', tenantId);
          uploadFormData.append('documentType', 'BUSINESS');
          uploadFormData.append('chatbotId', '');
          uploadFormData.append('description', formData.documentDescription || '');

          const uploadResponse = await fetch(
            `/api/v1/documents/upload/multiple`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
              body: uploadFormData,
            }
          );

          if (!uploadResponse.ok) {
            console.error('Document upload failed');
          } else {
            console.log('Documents uploaded successfully');
          }
        } catch (uploadError) {
          console.error('Error uploading documents:', uploadError);
        }
      }

      // Store tenantId in localStorage for future use
      if (tenantId) {
        localStorage.setItem('tenantId', tenantId);
      }

      // Update onboarding status in localStorage
      localStorage.setItem('isOnboarded', 'true');

      toast({
        title: "Success",
        description: data.responseStructure?.toastMessage || "Onboarding completed successfully!",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Onboarding Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
            onWebsiteScrape={handleWebsiteScrape}
            isScrapingWebsite={isScrapingWebsite}
          />
        );
      case 2:
        return (
          <BotConfigurationStep
            data={{
              supportChannels: formData.supportChannels,
              ticketingTool: formData.ticketingTool,
              supportEmail: formData.supportEmail,
              supportPhone: formData.supportPhone,
              regulations: formData.regulations,
              restrictedTopics: formData.restrictedTopics,
              botRestrictions: formData.botRestrictions,
              enableLeadCapture: formData.enableLeadCapture,
              captureFields: formData.captureFields,
              salesPriority: formData.salesPriority,
              handoffMethod: formData.handoffMethod,
              escalationPreference: formData.escalationPreference,
              communicationStyle: formData.communicationStyle,
              brandAdjectives: formData.brandAdjectives,
              wordsToAvoid: formData.wordsToAvoid,
              primaryAdminEmail: formData.primaryAdminEmail,
              secondaryAdminEmails: formData.secondaryAdminEmails,
              notificationPreferences: formData.notificationPreferences,
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
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 3 ? (
                isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Launch Your Chatbot
                  </>
                )
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
