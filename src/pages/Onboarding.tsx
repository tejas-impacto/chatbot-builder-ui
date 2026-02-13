import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Bot, Check, Loader2, SkipForward } from "lucide-react";
import OnboardingStepIndicator from "@/components/onboarding/OnboardingStepIndicator";
import { useToast } from "@/hooks/use-toast";
import { getValidAccessToken } from "@/lib/auth";
import CompanyProfileStep from "@/components/onboarding/steps/CompanyProfileStep";
import BotConfigurationStep from "@/components/onboarding/steps/BotConfigurationStep";
import KnowledgeBaseStep from "@/components/onboarding/steps/KnowledgeBaseStep";

const steps = [
  { id: 1, title: "Company Profile" },
  { id: 2, title: "Business Configuration" },
  { id: 3, title: "Knowledge Base" },
];

const stepTitles = [
  "Tell Us About Your Business",
  "Configure Your Business Settings",
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
  otherIndustry: string;
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
  otherIndustry: "",
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
  supportChannels: ["email", "phone"],
  ticketingTool: "",
  supportEmail: "",
  supportPhone: "",
  regulations: [],
  restrictedTopics: "",
  botRestrictions: "",
  enableLeadCapture: true,
  captureFields: ["name", "email", "phone"],
  salesPriority: "High",
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
          prompt: `You are an expert business analyst extracting comprehensive company information from a website.

EXTRACTION GUIDELINES:
1. **Company Identity**: Extract the full legal name, brand name, and industry. Write a comprehensive company description (2-3 sentences) summarizing what the company does, their history, unique value proposition, and service areas.

2. **Services**: List ALL products and services mentioned, including sub-services. Be thorough - check navigation menus, service pages, and footer links.

3. **Customer Type**: Determine B2B, B2C, or Both based on the target audience mentioned (businesses, consumers, municipalities, etc.)

4. **Geography**: Extract country and specific regions/states they serve. Look for "service area", "locations", "we serve" sections.

5. **Company Size**: Look for employee counts in About Us, Careers, or footer. Check for phrases like "team of X", "X+ employees", "X dedicated professionals".

6. **Support Channels - CRITICAL**:
   - Extract ACTUAL phone numbers (format: xxx-xxx-xxxx or (xxx) xxx-xxxx)
   - Extract ACTUAL email addresses (format: name@domain.com)
   - Check Contact page, footer, header, and About Us for contact information
   - Look for support@, info@, contact@, help@ email addresses
   - Look for toll-free numbers (800, 888, 877), main office, and emergency hotlines

7. **Typical Queries**: Infer from FAQs, service descriptions, and contact page what customers typically ask about.

8. **Communication Style**: Analyze the website tone - formal, semi-formal, or casual.

9. **Brand Adjectives**: Extract words the company uses to describe themselves from About Us, mission statements, and taglines.

10. **Compliance**: Look for privacy policy mentions of GDPR, HIPAA, PCI-DSS, SOC 2, ISO certifications.

IMPORTANT:
- For support_email and support_phone: Extract the ACTUAL contact information, not boolean values
- Return null for truly missing information, never return "Not provided" as a string
- Be thorough and extract all available contact methods`,
          schema: {
            type: "object",
            properties: {
              company_identity: {
                type: "object",
                properties: {
                  legal_company_name: { type: "string" },
                  brand_display_name: { type: "string" },
                  industry: { type: "string" },
                  company_website: { type: "string" },
                  company_description: { type: "string" }
                }
              },
              business_operations_context: {
                type: "object",
                properties: {
                  primary_products_services: { type: "array", items: { type: "string" } },
                  target_customers: {
                    type: "object",
                    properties: {
                      customer_type: { type: "string", enum: ["B2B", "B2C", "Both"] },
                      customer_geography: {
                        type: "object",
                        properties: {
                          country: { type: "string" },
                          region: { type: "string" }
                        }
                      }
                    }
                  },
                  business_size: {
                    type: "object",
                    properties: {
                      employees_range: { type: "string" },
                      monthly_customer_interactions: { type: "integer" }
                    }
                  }
                }
              },
              support_communication_context: {
                type: "object",
                properties: {
                  typical_customer_queries: {
                    type: "object",
                    properties: {
                      pricing: { type: "boolean" },
                      support: { type: "boolean" },
                      troubleshooting: { type: "boolean" },
                      sales: { type: "boolean" },
                      policy_compliance: { type: "boolean" },
                      custom_queries: { type: "array", items: { type: "string" } }
                    }
                  },
                  existing_support_channels: {
                    type: "object",
                    properties: {
                      phone: { type: "boolean", description: "Whether phone support is available" },
                      email: { type: "boolean", description: "Whether email support is available" },
                      whatsapp: { type: "boolean", description: "Whether WhatsApp support is available" },
                      ticketing_tool: { type: "string", description: "Name of ticketing system if mentioned (e.g., Zendesk, Freshdesk)" },
                      support_email: { type: "string", description: "The actual support/contact email address found on the website (e.g., support@company.com, info@company.com, contact@company.com)" },
                      support_phone: { type: "string", description: "The actual support/contact phone number found on the website including toll-free, main office, or emergency numbers (e.g., 800-xxx-xxxx, (508) xxx-xxxx)" }
                    }
                  },
                  escalation_preference: { type: "string", enum: ["Phone", "Ticket", "Email"] }
                }
              },
              compliance_and_risk: {
                type: "object",
                properties: {
                  gdpr_required: { type: "boolean" },
                  hipaa_required: { type: "boolean" },
                  pci_dss_required: { type: "boolean" },
                  soc2_required: { type: "boolean" },
                  iso27001_required: { type: "boolean" },
                  restricted_topics: { type: "string" },
                  must_not_instructions: { type: "string" }
                }
              },
              sales_lead_capture_context: {
                type: "object",
                properties: {
                  is_lead_capture_required: { type: "boolean" },
                  mandatory_lead_fields: {
                    type: "object",
                    properties: {
                      name: { type: "boolean" },
                      phone: { type: "boolean" },
                      email: { type: "boolean" },
                      company: { type: "boolean" }
                    }
                  },
                  sales_intent_priority: { type: "string", enum: ["High", "Medium", "Low"] }
                }
              },
              default_business_tone: {
                type: "object",
                properties: {
                  communication_style: { type: "string", enum: ["Formal", "Semi-formal", "Casual", "Friendly"] },
                  brand_adjectives: { type: "array", items: { type: "string" } },
                  words_to_avoid: { type: "array", items: { type: "string" } }
                }
              },
              admin_and_access: {
                type: "object",
                properties: {
                  primary_admin_email: { type: "string" },
                  secondary_admin_emails: { type: "array", items: { type: "string" } },
                  notification_preferences: {
                    type: "object",
                    properties: {
                      email_notifications: { type: "boolean" },
                      sms_notifications: { type: "boolean" },
                      in_app_notifications: { type: "boolean" }
                    }
                  }
                }
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
            'United Arab Emirates': 'UAE',
            'Republic of Korea': 'South Korea',
            'Korea': 'South Korea',
          };
          return countryMap[country] || country;
        };

        const mapRegion = (region: string): string => {
          const regionLower = region.toLowerCase();
          if (regionLower === 'all' || regionLower === 'global' || regionLower === 'worldwide') return 'Global';
          if (regionLower.includes('north america')) return 'North America';
          if (regionLower.includes('central america')) return 'Central America';
          if (regionLower.includes('south america')) return 'South America';
          if (regionLower.includes('latin')) return 'Latin America';
          if (regionLower.includes('western europe')) return 'Western Europe';
          if (regionLower.includes('eastern europe')) return 'Eastern Europe';
          if (regionLower.includes('northern europe') || regionLower.includes('scandinavia')) return 'Northern Europe';
          if (regionLower.includes('southern europe')) return 'Southern Europe';
          if (regionLower.includes('europe')) return 'Western Europe';
          if (regionLower.includes('east asia')) return 'East Asia';
          if (regionLower.includes('south asia')) return 'South Asia';
          if (regionLower.includes('southeast asia')) return 'Southeast Asia';
          if (regionLower.includes('central asia')) return 'Central Asia';
          if (regionLower.includes('asia') || regionLower.includes('pacific')) return 'Asia Pacific';
          if (regionLower.includes('middle east')) return 'Middle East';
          if (regionLower.includes('north africa')) return 'North Africa';
          if (regionLower.includes('sub-saharan') || regionLower.includes('subsaharan')) return 'Sub-Saharan Africa';
          if (regionLower.includes('africa')) return 'Africa';
          if (regionLower.includes('caribbean')) return 'Caribbean';
          if (regionLower.includes('oceania') || regionLower.includes('australasia')) return 'Oceania';
          return region;
        };

        const mapIndustry = (industry: string): { industry: string; otherIndustry: string } => {
          const industryLower = industry.toLowerCase();
          if (industryLower.includes('health') || industryLower.includes('medical')) return { industry: 'HealthTech', otherIndustry: '' };
          if (industryLower.includes('tech') || industryLower.includes('software') || industryLower.includes('it')) return { industry: 'Technology', otherIndustry: '' };
          if (industryLower.includes('finance') || industryLower.includes('bank') || industryLower.includes('insurance')) return { industry: 'Finance', otherIndustry: '' };
          if (industryLower.includes('fintech')) return { industry: 'Fintech', otherIndustry: '' };
          if (industryLower.includes('design') || industryLower.includes('creative')) return { industry: 'Design', otherIndustry: '' };
          if (industryLower.includes('education') || industryLower.includes('learning')) return { industry: 'Education', otherIndustry: '' };
          if (industryLower.includes('manufacturing') || industryLower.includes('construction') || industryLower.includes('industrial')) return { industry: 'Manufacturing', otherIndustry: '' };
          // If no match, select "Other" and store the original industry value
          return { industry: 'Other', otherIndustry: industry };
        };

        const mapServices = (services: string[]): string[] => {
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

        const mapCompanySize = (size: string): string => {
          if (!size) return '';
          const sizeLower = size.toLowerCase();
          if (sizeLower.includes('1-10') || sizeLower.includes('1 to 10')) return '1-10';
          if (sizeLower.includes('11-50') || sizeLower.includes('11 to 50')) return '11-50';
          if (sizeLower.includes('51-200') || sizeLower.includes('51 to 200')) return '51-200';
          if (sizeLower.includes('201-500') || sizeLower.includes('201 to 500')) return '201-500';
          if (sizeLower.includes('500+') || sizeLower.includes('500 ') || sizeLower.includes('600') || sizeLower.includes('1000')) return '500+';
          // Try to extract number
          const match = size.match(/(\d+)/);
          if (match) {
            const num = parseInt(match[1]);
            if (num <= 10) return '1-10';
            if (num <= 50) return '11-50';
            if (num <= 200) return '51-200';
            if (num <= 500) return '201-500';
            return '500+';
          }
          return '';
        };

        const mapCommunicationStyle = (style: string): string => {
          if (!style) return 'Semi-formal';
          const styleLower = style.toLowerCase();
          if (styleLower.includes('formal') && !styleLower.includes('semi')) return 'Formal';
          if (styleLower.includes('casual') || styleLower.includes('friendly')) return 'Casual';
          return 'Semi-formal';
        };

        const isValidValue = (value: unknown): boolean => {
          if (value === null || value === undefined) return false;
          if (typeof value === 'string') {
            const lower = value.toLowerCase();
            return value.trim() !== '' && !lower.includes('not provided') && !lower.includes('not found');
          }
          return true;
        };

        // Map scraped data to ALL form fields across steps
        const updates: Partial<OnboardingData> = {};

        // Step 1: Company Profile fields
        if (isValidValue(scraped.company_identity?.legal_company_name)) {
          updates.companyName = scraped.company_identity.legal_company_name;
        }
        if (isValidValue(scraped.company_identity?.brand_display_name)) {
          updates.brandName = scraped.company_identity.brand_display_name;
        }
        if (isValidValue(scraped.company_identity?.industry)) {
          const industryMapping = mapIndustry(scraped.company_identity.industry);
          updates.industry = industryMapping.industry;
          updates.otherIndustry = industryMapping.otherIndustry;
        }
        if (isValidValue(scraped.company_identity?.company_description)) {
          updates.businessDescription = scraped.company_identity.company_description;
        }
        if (scraped.business_operations_context?.primary_products_services?.length > 0) {
          const mappedServices = mapServices(scraped.business_operations_context.primary_products_services);
          if (mappedServices.length > 0) {
            updates.primaryServices = mappedServices;
          }
        }
        if (isValidValue(scraped.business_operations_context?.target_customers?.customer_type)) {
          updates.customerType = scraped.business_operations_context.target_customers.customer_type;
        }
        if (isValidValue(scraped.business_operations_context?.target_customers?.customer_geography?.country)) {
          updates.country = mapCountry(scraped.business_operations_context.target_customers.customer_geography.country);
        }
        if (isValidValue(scraped.business_operations_context?.target_customers?.customer_geography?.region)) {
          updates.region = mapRegion(scraped.business_operations_context.target_customers.customer_geography.region);
        }
        if (isValidValue(scraped.business_operations_context?.business_size?.employees_range)) {
          const mappedSize = mapCompanySize(scraped.business_operations_context.business_size.employees_range);
          if (mappedSize) {
            updates.companySize = mappedSize;
          }
        }

        // Typical customer queries
        if (scraped.support_communication_context?.typical_customer_queries) {
          const queries = scraped.support_communication_context.typical_customer_queries;
          updates.typicalCustomerQueries = {
            pricing: queries.pricing || false,
            support: queries.support || false,
            troubleshooting: queries.troubleshooting || false,
            sales: queries.sales || false,
            policyCompliance: queries.policy_compliance || false,
            customQueries: queries.custom_queries || [],
          };
        }

        // Step 2: Bot Configuration fields
        if (scraped.support_communication_context?.existing_support_channels) {
          const channels: string[] = [];
          const supportChannels = scraped.support_communication_context.existing_support_channels;
          if (supportChannels.phone) channels.push('phone');
          if (supportChannels.email) channels.push('email');
          if (supportChannels.whatsapp) channels.push('whatsapp');
          if (channels.length > 0) {
            updates.supportChannels = channels;
          }
          if (isValidValue(supportChannels.support_email)) {
            updates.supportEmail = supportChannels.support_email;
          }
          if (isValidValue(supportChannels.support_phone)) {
            updates.supportPhone = supportChannels.support_phone;
          }
          if (isValidValue(supportChannels.ticketing_tool)) {
            updates.ticketingTool = supportChannels.ticketing_tool;
          }
        }

        if (isValidValue(scraped.support_communication_context?.escalation_preference)) {
          updates.escalationPreference = scraped.support_communication_context.escalation_preference;
        }

        // Compliance regulations
        if (scraped.compliance_and_risk) {
          const compliance = scraped.compliance_and_risk;
          const regulations: string[] = [];
          if (compliance.gdpr_required) regulations.push('GDPR');
          if (compliance.hipaa_required) regulations.push('HIPAA');
          if (compliance.pci_dss_required) regulations.push('PCI-DSS');
          if (compliance.soc2_required) regulations.push('SOC 2');
          if (compliance.iso27001_required) regulations.push('ISO 27001');
          if (regulations.length > 0) {
            updates.regulations = regulations;
          }
          if (isValidValue(compliance.restricted_topics) && compliance.restricted_topics.toLowerCase() !== 'none') {
            updates.restrictedTopics = compliance.restricted_topics;
          }
          if (isValidValue(compliance.must_not_instructions)) {
            updates.botRestrictions = compliance.must_not_instructions;
          }
        }

        // Lead capture settings
        if (scraped.sales_lead_capture_context) {
          const leadContext = scraped.sales_lead_capture_context;
          if (typeof leadContext.is_lead_capture_required === 'boolean') {
            updates.enableLeadCapture = leadContext.is_lead_capture_required;
          }
          if (isValidValue(leadContext.sales_intent_priority)) {
            updates.salesPriority = leadContext.sales_intent_priority;
          }
          if (leadContext.mandatory_lead_fields) {
            const fields: string[] = [];
            if (leadContext.mandatory_lead_fields.name) fields.push('name');
            if (leadContext.mandatory_lead_fields.email) fields.push('email');
            if (leadContext.mandatory_lead_fields.phone) fields.push('phone');
            if (leadContext.mandatory_lead_fields.company) fields.push('company');
            if (fields.length > 0) {
              updates.captureFields = fields;
            }
          }
        }

        // Communication style and brand tone
        if (isValidValue(scraped.default_business_tone?.communication_style)) {
          updates.communicationStyle = mapCommunicationStyle(scraped.default_business_tone.communication_style);
        }
        if (scraped.default_business_tone?.brand_adjectives?.length > 0) {
          updates.brandAdjectives = scraped.default_business_tone.brand_adjectives;
        }
        if (scraped.default_business_tone?.words_to_avoid?.length > 0) {
          updates.wordsToAvoid = scraped.default_business_tone.words_to_avoid;
        }

        // Admin emails (only if valid)
        if (isValidValue(scraped.admin_and_access?.primary_admin_email)) {
          updates.primaryAdminEmail = scraped.admin_and_access.primary_admin_email;
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

  const handleNext = async () => {
    if (currentStep === 2) {
      // On step 2, submit onboarding data before moving to step 3
      await handleSubmitOnboarding();
    } else if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Submit onboarding data (called when moving from step 2 to step 3)
  const handleSubmitOnboarding = async () => {
    setIsSubmitting(true);

    try {
      // Get valid access token (refreshes if expired)
      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        throw new Error('Session expired. Please login again.');
      }

      // Get tenantId from localStorage (will be empty for new users)
      const storedTenantId = localStorage.getItem('tenantId') || '';

      // Build typicalCustomerQueries as key-value object
      const typicalCustomerQueriesObj: Record<string, string> = {};
      if (formData.typicalCustomerQueries.pricing) typicalCustomerQueriesObj.pricing = 'true';
      if (formData.typicalCustomerQueries.support) typicalCustomerQueriesObj.support = 'true';
      if (formData.typicalCustomerQueries.troubleshooting) typicalCustomerQueriesObj.troubleshooting = 'true';
      if (formData.typicalCustomerQueries.sales) typicalCustomerQueriesObj.sales = 'true';
      if (formData.typicalCustomerQueries.policyCompliance) typicalCustomerQueriesObj.policyCompliance = 'true';
      formData.typicalCustomerQueries.customQueries.forEach((query, index) => {
        typicalCustomerQueriesObj[`customQuery${index + 1}`] = query;
      });

      // Map monthlyCustomerInteractions to a number
      const interactionMap: Record<string, number> = {
        'Less than 100': 50,
        '100-500': 300,
        '500-1000': 750,
        '1000-5000': 3000,
        '5000+': 5000,
      };
      const monthlyInteractions = interactionMap[formData.monthlyCustomerInteractions] || 0;

      // Map form data to API structure (matching backend schema)
      const onboardingPayload = {
        tenantId: storedTenantId,
        companyIdentity: {
          legalCompanyName: formData.companyName,
          brandDisplayName: formData.brandName,
          industry: formData.industry === 'Other' ? formData.otherIndustry : formData.industry,
          companyWebsite: formData.companyWebsite,
          companyDescription: formData.businessDescription,
        },
        primaryProductsServices: formData.primaryServices,
        customerType: formData.customerType === 'Both' ? 'B2B2C' : formData.customerType,
        customerGeography: {
          country: formData.country,
          region: formData.region,
        },
        businessSize: {
          employeesRange: formData.companySize,
          monthlyCustomerInteractions: monthlyInteractions,
        },
        typicalCustomerQueries: typicalCustomerQueriesObj,
        existingSupportChannels: {
          phone: formData.supportChannels.includes("phone"),
          email: formData.supportChannels.includes("email"),
          whatsapp: formData.supportChannels.includes("whatsapp"),
          ticketingTool: formData.ticketingTool || '',
          supportEmail: formData.supportEmail || '',
          supportPhone: formData.supportPhone || '',
        },
        escalationPreference: formData.escalationPreference,
        gdprRequired: formData.regulations.includes("GDPR"),
        hippa: formData.regulations.includes("HIPAA"),
        pcidss: formData.regulations.includes("PCI-DSS"),
        soc2: formData.regulations.includes("SOC 2"),
        iso27001: formData.regulations.includes("ISO 27001"),
        restrictedTopics: formData.restrictedTopics,
        mustNotInstructions: formData.botRestrictions,
        communicationStyle: formData.communicationStyle,
        brandAdjectives: formData.brandAdjectives,
        wordsToAvoid: formData.wordsToAvoid,
        primaryAdminEmail: formData.primaryAdminEmail || '',
        secondaryAdminEmails: formData.secondaryAdminEmails,
        notificationPreferences: {
          emailNotifications: formData.notificationPreferences.emailNotifications,
          smsNotifications: formData.notificationPreferences.smsNotifications,
          inAppNotifications: formData.notificationPreferences.inAppNotifications,
        },
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

      // Extract tenantId from response and store it
      const tenantId = data.responseStructure?.data?.tenantId;
      if (tenantId) {
        localStorage.setItem('tenantId', tenantId);
      }

      // Update onboarding status in localStorage
      localStorage.setItem('isOnboarded', 'true');

      toast({
        title: "Success",
        description: "Business information saved successfully!",
      });

      // Move to step 3 (document upload)
      setCurrentStep(3);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload documents and finish onboarding (called on step 3)
  const handleFinish = async () => {
    setIsSubmitting(true);

    try {
      const tenantId = localStorage.getItem('tenantId');

      // If no files to upload, just navigate to dashboard
      if (!formData.files || formData.files.length === 0) {
        toast({
          title: "Success",
          description: "Onboarding completed successfully!",
        });
        navigate("/dashboard");
        return;
      }

      // Get valid access token (refreshes if expired)
      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        throw new Error('Session expired. Please login again.');
      }

      if (!tenantId) {
        throw new Error('Tenant ID not found. Please go back and complete the previous steps.');
      }

      // Upload documents
      const uploadFormData = new FormData();

      // Append all files with the same key 'files'
      for (const file of formData.files) {
        uploadFormData.append('files', file);
      }

      uploadFormData.append('tenantId', tenantId);
      uploadFormData.append('documentType', 'BUSINESS');
      uploadFormData.append('botId', '');
      uploadFormData.append('description', formData.documentDescription || '');

      const uploadResponse = await fetch(
        `/api-doc/v1/documents/upload/multiple`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: uploadFormData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Document upload failed');
      }

      // Update document uploaded status
      localStorage.setItem('documentUploaded', 'true');

      toast({
        title: "Success",
        description: "Onboarding completed successfully!",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Upload Failed",
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
              otherIndustry: formData.otherIndustry,
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
      {/* Header */}
      <header className="flex items-center px-6 py-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <Bot className="w-8 h-8 text-foreground" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-brand-pink rounded-full" />
          </div>
          <span className="text-lg font-bold text-primary">Agent Builder</span>
        </Link>
      </header>

      {/* Step Indicator */}
      <div className="bg-card/50">
        <div className="max-w-3xl mx-auto">
          <OnboardingStepIndicator steps={steps} currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content - Centered Single Column */}
      <div className="max-w-3xl mx-auto px-4 py-8 mt-8">
        <div className="bg-card rounded-2xl border border-border shadow-md p-8 lg:p-10">
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
                    Finishing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Finish Onboarding
                  </>
                )
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Skip Button - Only show on first step */}
            {currentStep === 1 && (
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('onboardingSkipped', 'true');
                  navigate('/dashboard');
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                <SkipForward className="w-4 h-4" />
                Skip for now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
