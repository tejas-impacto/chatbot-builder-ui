import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  subtitle?: string;
}

interface OnboardingStepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const OnboardingStepIndicator = ({ steps, currentStep }: OnboardingStepIndicatorProps) => {
  return (
    <div className="w-full px-6 py-8">
      <div className="flex items-center justify-between relative max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step node with label */}
              <div className="flex flex-col items-center relative z-10">
                {/* Step circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted border-2 border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>

                {/* Step label */}
                <div className="mt-3 text-center absolute top-full pt-1 whitespace-nowrap">
                  <p
                    className={`text-sm font-medium transition-colors ${
                      isActive || isCompleted ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.subtitle && (
                    <p
                      className={`text-xs mt-0.5 transition-colors ${
                        isActive || isCompleted ? "text-primary/80" : "text-muted-foreground/70"
                      }`}
                    >
                      {step.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-2 relative">
                  <div className="absolute inset-0 bg-muted-foreground/20" />
                  <div
                    className={`absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out ${
                      isCompleted ? "right-0" : "right-full"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingStepIndicator;
