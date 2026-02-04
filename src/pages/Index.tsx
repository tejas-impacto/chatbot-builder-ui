import { Link } from "react-router-dom";
import { Bot, MessageSquare, BarChart3, Zap, Globe } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen auth-gradient-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
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
      </header>

      {/* Hero */}
      <main className="px-8 py-16 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground leading-tight">
            Build Intelligent
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-primary">
              Conversational AI
            </span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Create powerful chatbots and voice bots for your business with our enterprise-grade AI platform. No coding required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 text-lg font-semibold border-2 border-input text-foreground rounded-full hover:bg-muted transition-all"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: MessageSquare,
              title: "Unlimited Conversations",
              description: "Handle millions of customer interactions simultaneously",
            },
            {
              icon: Globe,
              title: "Multi-channel Integration",
              description: "Deploy across web, mobile, WhatsApp, and more",
            },
            {
              icon: Zap,
              title: "AI-Powered Suggestions",
              description: "Smart response recommendations in real-time",
            },
            {
              icon: BarChart3,
              title: "Analytics Dashboard",
              description: "Deep insights into customer engagement",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-card rounded-2xl border border-border hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
