import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Eye, EyeOff, Mail, Shield, Lock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Step = "email" | "verify" | "password" | "success";

interface LocationState {
  email?: string;
}

const SetupPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = (location.state as LocationState) || {};

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(state.email || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // If email was passed from previous page, skip to verify step
  useEffect(() => {
    if (state.email) {
      handleSendCode(state.email);
    }
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleBack = () => {
    if (step === "email") {
      navigate(-1);
    } else if (step === "verify") {
      setStep("email");
      setVerificationCode("");
    } else if (step === "password") {
      setStep("verify");
      setPassword("");
      setConfirmPassword("");
    }
  };

  // Password validation function
  const validatePassword = (pwd: string): { valid: boolean; message: string } => {
    if (pwd.length < 8) {
      return { valid: false, message: "Password must be at least 8 characters" };
    }
    if (!/[A-Z]/.test(pwd)) {
      return { valid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!/[a-z]/.test(pwd)) {
      return { valid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!/[0-9]/.test(pwd)) {
      return { valid: false, message: "Password must contain at least one digit" };
    }
    if (!/[@#$%^&+=!]/.test(pwd)) {
      return { valid: false, message: "Password must contain at least one special character (@#$%^&+=!)" };
    }
    return { valid: true, message: "" };
  };

  const handleSendCode = async (emailToUse?: string) => {
    const targetEmail = emailToUse || email;
    if (!targetEmail) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/password/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.responseStructure?.toastMessage || 'Failed to send verification code');
      }

      toast({
        title: "Code Sent",
        description: data.responseStructure?.toastMessage || `Verification code sent to ${targetEmail}`,
      });

      setEmail(targetEmail);
      setStep("verify");
      setResendCooldown(60);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/password/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify({
          email,
          otp: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.responseStructure?.toastMessage || 'Invalid verification code');
      }

      toast({
        title: "Verified",
        description: data.responseStructure?.toastMessage || "Email verified successfully",
      });

      setStep("password");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    const validation = validatePassword(password);
    if (!validation.valid) {
      toast({
        title: "Error",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/password/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify({
          email,
          otp: verificationCode,
          newPassword: password,
          confirmPassword: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.responseStructure?.toastMessage || 'Failed to set password');
      }

      toast({
        title: "Success",
        description: data.responseStructure?.toastMessage || "Password set successfully! You can now login with your email and password.",
      });

      setStep("success");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    handleSendCode(email);
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: "email", icon: Mail, label: "Email" },
      { key: "verify", icon: Shield, label: "Verify" },
      { key: "password", icon: Lock, label: "Password" },
    ];

    const currentIndex = steps.findIndex(s => s.key === step);

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex || step === "success";

          return (
            <div key={s.key} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-1 mx-2 rounded-full transition-all ${
                    isCompleted ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Enter your email</h2>
        <p className="text-muted-foreground">
          We'll send you a verification code to set up your password
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="auth-input"
          disabled={isLoading}
        />
      </div>

      <button
        onClick={() => handleSendCode()}
        disabled={!email || isLoading}
        className="auth-button-primary"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
            Sending...
          </>
        ) : (
          "Continue"
        )}
      </button>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Verify your email</h2>
        <p className="text-muted-foreground">
          Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={verificationCode}
          onChange={setVerificationCode}
          disabled={isLoading}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <button
        onClick={handleVerifyCode}
        disabled={verificationCode.length !== 6 || isLoading}
        className="auth-button-primary"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
            Verifying...
          </>
        ) : (
          "Verify Code"
        )}
      </button>

      <div className="text-center">
        <span className="text-sm text-muted-foreground">Didn't receive the code? </span>
        <button
          onClick={handleResendCode}
          disabled={resendCooldown > 0}
          className={`text-sm ${resendCooldown > 0 ? "text-muted-foreground" : "auth-link"}`}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Set your password</h2>
        <p className="text-muted-foreground">
          Create a secure password for your account
        </p>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
          New Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="auth-input pr-12"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Min 8 chars, uppercase, lowercase, digit, and special char (@#$%^&+=!)
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="auth-input pr-12"
            disabled={isLoading}
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

      <button
        onClick={handleSetPassword}
        disabled={!password || !confirmPassword || isLoading}
        className="auth-button-primary"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
            Setting password...
          </>
        ) : (
          "Set Password"
        )}
      </button>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">Password Set Successfully!</h2>
      <p className="text-muted-foreground">
        You can now login with your email and password.
      </p>
      <button onClick={handleGoToLogin} className="auth-button-primary">
        Go to Login
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Back Button (not shown on success) */}
        {step !== "success" && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        )}

        {/* Step Indicator (not shown on success) */}
        {step !== "success" && renderStepIndicator()}

        {/* Step Content */}
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          {step === "email" && renderEmailStep()}
          {step === "verify" && renderVerifyStep()}
          {step === "password" && renderPasswordStep()}
          {step === "success" && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};

export default SetupPassword;
