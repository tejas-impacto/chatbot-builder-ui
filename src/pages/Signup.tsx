import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import StepIndicator from "@/components/auth/StepIndicator";

interface FormData {
  fullName: string;
  email: string;
  mobile: string;
  organisation: string;
  designation: string;
  password: string;
  confirmPassword: string;
}

const Signup = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    mobile: "",
    organisation: "",
    designation: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup attempt:", formData);
  };

  return (
    <AuthLayout variant="signup">
      <div>
        <h1 className="text-4xl font-extrabold text-foreground">
          Create your account
        </h1>
        <p className="mt-2 text-muted-foreground">
          Get started with a free trial
        </p>

        <div className="mt-6">
          <StepIndicator currentStep={step} totalSteps={2} />
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-4 animate-slide-in">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="ex: Karthikeya"
                className="auth-input"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ex: snappy@gmail.com"
                className="auth-input"
                required
              />
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-foreground mb-2">
                Mobile Number
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter Mobile Number"
                className="auth-input"
                required
              />
            </div>

            <div>
              <label htmlFor="organisation" className="block text-sm font-medium text-foreground mb-2">
                Organisation name
              </label>
              <input
                id="organisation"
                name="organisation"
                type="text"
                value={formData.organisation}
                onChange={handleChange}
                placeholder="ex: Finpro"
                className="auth-input"
                required
              />
            </div>

            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-foreground mb-2">
                Designation
              </label>
              <input
                id="designation"
                name="designation"
                type="text"
                value={formData.designation}
                onChange={handleChange}
                placeholder="ex: UI UX"
                className="auth-input"
                required
              />
            </div>

            <button type="submit" className="auth-button-primary mt-6">
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 animate-slide-in">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create Password"
                  className="auth-input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="auth-input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 px-6 rounded-full border border-input text-foreground font-semibold hover:bg-muted transition-all duration-200"
              >
                Back
              </button>
              <button type="submit" className="auth-button-primary flex-1">
                Create Account
              </button>
            </div>
          </form>
        )}

        <div className="mt-6">
          <SocialLoginButtons />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign In here!
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;
