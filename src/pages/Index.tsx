import { Link } from "react-router-dom";
import {
  Bot,
  Mic,
  BarChart3,
  Zap,
  FileText,
  Upload,
  Users,
  Network,
  Sparkles,
  Headphones,
  HelpCircle,
  TrendingUp,
  Megaphone,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const agentTypes = [
  {
    icon: Bot,
    title: "AI Chat Agents",
    description:
      "Text-based assistants for customer support, lead generation, FAQ handling, and marketing — deployed on your website in minutes.",
    features: [
      "Customizable persona and tone of voice",
      "Built-in lead capture forms",
      "Knowledge base trained on your documents",
      "Real-time streaming responses",
    ],
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: Mic,
    title: "AI Voice Agents",
    description:
      "Voice assistants for phone support and customer interactions with natural conversation flow.",
    features: [
      "Adjustable voice speed and response length",
      "Professional, friendly, or casual tone",
      "Same knowledge base as your chat agent",
      "Seamless voice-to-lead capture",
    ],
    accent: "bg-accent/10 text-accent",
  },
];

const steps = [
  {
    icon: FileText,
    title: "Define Your Knowledge Base",
    description:
      "Add your company overview, product features, FAQs, or upload documents (PDF, DOCX, and more).",
  },
  {
    icon: Sparkles,
    title: "Customize Your Agent",
    description:
      "Choose a persona, set the tone of voice, configure response style, and define the conversation purpose.",
  },
  {
    icon: Users,
    title: "Enable Lead Capture",
    description:
      "Configure which customer details to collect — name, email, phone, company — with sales priority settings.",
  },
  {
    icon: BarChart3,
    title: "Deploy & Monitor",
    description:
      "Go live instantly. Track conversations, manage leads in your CRM, and visualize your knowledge graph.",
  },
];

const capabilities = [
  {
    icon: Zap,
    title: "No-Code Bot Builder",
    description:
      "Create chat and voice agents through an intuitive step-by-step wizard. No programming required.",
  },
  {
    icon: Upload,
    title: "Smart Knowledge Base",
    description:
      "Upload PDFs, Word docs, spreadsheets, and more. Your agent learns from your actual business data.",
  },
  {
    icon: Users,
    title: "Built-in CRM",
    description:
      "Automatically capture leads from conversations. Track status from New to Contacted to Qualified to Converted.",
  },
  {
    icon: Network,
    title: "Knowledge Graph",
    description:
      "Visualize how your business data connects. Explore relationships between concepts, products, and FAQs.",
  },
  {
    icon: Sparkles,
    title: "Persona & Tone Control",
    description:
      "Choose from personas like Sales Executive, Technical Support, or FAQ Expert. Set the perfect tone for your brand.",
  },
  {
    icon: BarChart3,
    title: "Conversation Analytics",
    description:
      "Track active bots, total sessions, and engagement. View full conversation histories for every lead.",
  },
];

const useCases = [
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Resolve inquiries 24/7 with an AI agent trained on your support docs.",
    bg: "bg-pink-50",
    iconColor: "text-pink-500",
  },
  {
    icon: HelpCircle,
    title: "FAQ Automation",
    description: "Instantly answer common questions with zero wait time.",
    bg: "bg-green-50",
    iconColor: "text-green-500",
  },
  {
    icon: TrendingUp,
    title: "Lead Generation",
    description: "Capture qualified leads automatically during every conversation.",
    bg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    icon: Megaphone,
    title: "Marketing",
    description: "Engage visitors with personalized product recommendations.",
    bg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
];

const Index = () => {
  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border/50">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="w-8 h-8 text-foreground" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-brand-pink rounded-full" />
            </div>
            <span className="text-primary font-bold text-lg">Agent Builder</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="px-8 py-20 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground leading-tight">
              Build AI Chat & Voice Agents
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                That Know Your Business
              </span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Create intelligent chatbots and voice assistants in minutes — no code required.
              Upload your business data, customize the persona, and deploy across channels.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
              >
                Start Building Free
              </Link>
              <button
                onClick={scrollToHowItWorks}
                className="px-8 py-4 text-lg font-semibold border-2 border-input text-foreground rounded-full hover:bg-muted transition-all"
              >
                See How It Works
              </button>
            </div>
          </div>
        </section>

        {/* What You Can Build */}
        <section className="px-8 py-16 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              What You Can Build
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Two powerful agent types, one unified platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {agentTypes.map((agent, index) => (
              <div
                key={index}
                className="p-8 bg-card rounded-2xl border border-border hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`w-14 h-14 rounded-xl ${agent.accent} flex items-center justify-center mb-5`}>
                  <agent.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {agent.title}
                </h3>
                <p className="text-muted-foreground mb-6">{agent.description}</p>
                <ul className="space-y-3">
                  {agent.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-8 py-16 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How It Works
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Go from idea to live agent in four simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative p-6 bg-card rounded-2xl border border-border text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 z-10" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Key Capabilities */}
        <section className="px-8 py-16 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Everything You Need
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              A complete platform to build, deploy, and manage your AI agents.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-2xl border border-border hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <cap.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {cap.title}
                </h3>
                <p className="text-sm text-muted-foreground">{cap.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-8 py-16 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Built for Every Business Need
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Deploy AI agents tailored to your specific use case.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-2xl border border-border hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl ${useCase.bg} flex items-center justify-center mb-4`}>
                  <useCase.icon className={`w-6 h-6 ${useCase.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {useCase.title}
                </h3>
                <p className="text-sm text-muted-foreground">{useCase.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-8 py-20 max-w-7xl mx-auto">
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Ready to Build Your AI Agent?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Get started in minutes. No credit card required.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              Create Your First Agent
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-8 py-8 border-t border-border/50">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Agent Builder. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
