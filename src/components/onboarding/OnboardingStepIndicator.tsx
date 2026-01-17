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
    <div className="w-full px-8 py-6">
      <div className="flex items-start justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-border" />
        
        {/* Progress line active */}
        <div 
          className="absolute top-3 left-0 h-0.5 bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              {/* Step circle */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isActive
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-background border-2 border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${isActive ? "bg-primary-foreground" : "bg-muted-foreground/30"}`} />
                )}
              </div>

              {/* Step label */}
              <div className="mt-3 text-center max-w-[120px]">
                <p
                  className={`text-xs font-medium leading-tight transition-colors ${
                    isActive || isCompleted ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </p>
                {step.subtitle && (
                  <p
                    className={`text-xs mt-0.5 leading-tight transition-colors ${
                      isActive || isCompleted ? "text-primary/80" : "text-muted-foreground/70"
                    }`}
                  >
                    {step.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingStepIndicator;
