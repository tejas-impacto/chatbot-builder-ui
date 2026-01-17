import { ReactNode } from "react";
import { Bot, CheckCircle2 } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  variant?: "login" | "signup";
}

const features = [
  "Unlimited chatbot conversations",
  "AI-powered response suggestions",
  "Multi-channel integration",
  "Advanced analytics dashboard",
];

const AuthLayout = ({ children, variant = "login" }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md animate-fade-in">
          {children}
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 auth-gradient-bg items-center justify-center p-16 relative overflow-hidden">
        {/* Decorative wave pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg
            className="absolute top-0 left-0 w-full"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="hsl(var(--brand-cyan))"
              opacity="0.1"
            />
          </svg>
          <svg
            className="absolute bottom-0 left-0 w-full rotate-180"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="hsl(var(--brand-cyan))"
              opacity="0.1"
            />
          </svg>
        </div>

        <div className="text-center z-10 max-w-lg animate-fade-in">
          {/* Logo */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Bot className="w-12 h-12 text-foreground" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-pink rounded-full" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-brand-cyan rounded-full" />
            </div>
          </div>
          
          <span className="text-primary font-bold text-lg tracking-wide">CHATBOT AI</span>

          {variant === "login" ? (
            <>
              <h2 className="mt-8 text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
                Build Intelligent
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-primary">
                  Conversational AI
                </span>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Create powerful chatbots and voice bots for your business with our enterprise-grade AI platform.
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-8 text-4xl lg:text-5xl font-extrabold text-foreground leading-tight">
                Start Building
                <br />
                Today
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Join thousands of businesses using our AI platform to automate customer interactions.
              </p>

              {/* Features Grid */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="feature-check">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-left">{feature}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
