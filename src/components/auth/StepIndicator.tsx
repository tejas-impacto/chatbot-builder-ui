interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex gap-2 flex-1 mr-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`step-indicator flex-1 ${
              index < currentStep
                ? "step-indicator-active"
                : "step-indicator-inactive"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        Step <span className="font-semibold text-foreground">0{currentStep}</span> / 0{totalSteps}
      </span>
    </div>
  );
};

export default StepIndicator;
