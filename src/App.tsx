import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { startTokenRefreshTimer, isAuthenticated } from "@/lib/auth";
import { BotCreationProvider } from "@/contexts/BotCreationContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GoogleCallback from "./pages/GoogleCallback";
import GoogleUserWelcome from "./pages/GoogleUserWelcome";
import SetupPassword from "./pages/SetupPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Onboarding from "./pages/Onboarding";
import BotCreation from "./pages/BotCreation";
import BotCreationProgress from "./pages/BotCreationProgress";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import BusinessDataManagement from "./pages/BusinessDataManagement";
import BusinessDataOverview from "./pages/BusinessDataOverview";
import ManageChatbot from "./pages/ManageChatbot";
import ManageVoicebot from "./pages/ManageVoicebot";
import BotsAvailable from "./pages/BotsAvailable";
import ChatbotEndpoints from "./pages/ChatbotEndpoints";
import ChatbotDocuments from "./pages/ChatbotDocuments";
import VoicebotDocuments from "./pages/VoicebotDocuments";
import BotDetails from "./pages/BotDetails";
import BotEdit from "./pages/BotEdit";
import UnresolvedQueries from "./pages/UnresolvedQueries";
import CRM from "./pages/CRM";
import Leads from "./pages/Leads";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import PublicChat from "./pages/PublicChat";
import PublicVoiceChat from "./pages/PublicVoiceChat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Start token refresh timer on app load if user is authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      startTokenRefreshTimer();
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <BotCreationProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/google-user-welcome" element={<GoogleUserWelcome />} />
          <Route path="/setup-password" element={<SetupPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/chat/:tenantId/:botId" element={<PublicChat />} />
          <Route path="/voice/:tenantId/:botId" element={<PublicVoiceChat />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/bot-creation" element={<BotCreation />} />
          <Route path="/bot-creation-progress" element={<BotCreationProgress />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/manage-agents" element={<BotsAvailable />} />
          <Route path="/manage-agents/chat" element={<BotsAvailable />} />
          <Route path="/manage-agents/voice" element={<BotsAvailable />} />
          <Route path="/manage-agents/bot/:botId" element={<BotDetails />} />
          <Route path="/manage-agents/bot/:botId/edit" element={<BotEdit />} />
          <Route path="/business-data" element={<BusinessDataManagement />} />
          <Route path="/business-data/overview" element={<BusinessDataOverview />} />
          <Route path="/manage-chatbot" element={<ManageChatbot />} />
          <Route path="/manage-chatbot/bots" element={<BotsAvailable />} />
          <Route path="/manage-chatbot/endpoints" element={<ChatbotEndpoints />} />
          <Route path="/manage-chatbot/documents" element={<ChatbotDocuments />} />
          <Route path="/manage-chatbot/bot/:botId" element={<BotDetails />} />
          <Route path="/manage-chatbot/bot/:botId/edit" element={<BotEdit />} />
          <Route path="/unresolved-queries/:botId" element={<UnresolvedQueries />} />
          <Route path="/manage-chatbot/*" element={<ManageChatbot />} />
          <Route path="/manage-voicebot" element={<ManageVoicebot />} />
          <Route path="/manage-voicebot/bots" element={<BotsAvailable />} />
          <Route path="/manage-voicebot/endpoints" element={<ChatbotEndpoints />} />
          <Route path="/manage-voicebot/documents" element={<VoicebotDocuments />} />
          <Route path="/manage-voicebot/bot/:botId" element={<BotDetails />} />
          <Route path="/manage-voicebot/bot/:botId/edit" element={<BotEdit />} />
          <Route path="/manage-voicebot/*" element={<ManageVoicebot />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BotCreationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
