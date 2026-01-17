import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import BotCreation from "./pages/BotCreation";
import BotCreationProgress from "./pages/BotCreationProgress";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import BusinessDataManagement from "./pages/BusinessDataManagement";
import ManageChatbot from "./pages/ManageChatbot";
import ManageVoicebot from "./pages/ManageVoicebot";
import CRM from "./pages/CRM";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/bot-creation" element={<BotCreation />} />
          <Route path="/bot-creation-progress" element={<BotCreationProgress />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/business-data" element={<BusinessDataManagement />} />
          <Route path="/business-data/*" element={<BusinessDataManagement />} />
          <Route path="/manage-chatbot" element={<ManageChatbot />} />
          <Route path="/manage-chatbot/*" element={<ManageChatbot />} />
          <Route path="/manage-voicebot" element={<ManageVoicebot />} />
          <Route path="/manage-voicebot/*" element={<ManageVoicebot />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
