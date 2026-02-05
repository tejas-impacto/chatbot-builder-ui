import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { useToast } from "@/hooks/use-toast";
import { startTokenRefreshTimer, storeTokenTimestamp } from "@/lib/auth";

type LoginStep = "email" | "password";

interface UserAuthInfo {
  exists: boolean;
  authMethod: "email" | "google" | "both";
  hasPassword: boolean;
}

const Login = () => {
  const [step, setStep] = useState<LoginStep>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle Google OAuth callback (when backend redirects with tokens in URL hash fragment)
  useEffect(() => {
    // Parse hash fragment (backend returns tokens after # not ?)
    const hash = window.location.hash.substring(1); // Remove the '#'
    const hashParams = new URLSearchParams(hash);

    // Debug: log all hash params
    console.log('OAuth callback - Hash params:', Object.fromEntries(hashParams.entries()));

    // Backend uses snake_case, so map to our expected names
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const expiresIn = hashParams.get('expires_in');
    const onboardingCompleted = hashParams.get('onboarding_completed');
    const documentUploaded = hashParams.get('document_uploaded');
    const tenantId = hashParams.get('tenant_id');
    const userId = hashParams.get('user_id');

    if (accessToken && refreshToken) {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      if (expiresIn) localStorage.setItem('accessExpiresIn', expiresIn);
      localStorage.setItem('isOnboarded', onboardingCompleted || 'false');
      localStorage.setItem('documentUploaded', documentUploaded || 'false');
      if (userId) localStorage.setItem('userId', userId);
      // Store tenantId if available (will be present for existing users with completed onboarding)
      if (tenantId) {
        localStorage.setItem('tenantId', tenantId);
      } else {
        localStorage.removeItem('tenantId');
      }

      // Store token creation timestamp and start refresh timer
      storeTokenTimestamp();
      startTokenRefreshTimer();

      // Clear hash from URL (security: don't leave tokens in browser history)
      window.history.replaceState(null, '', window.location.pathname);

      toast({
        title: "Success",
        description: "Login successful",
      });

      // Redirect based on onboarding status from URL params
      const isOnboardingComplete = onboardingCompleted === 'true';
      const isDocumentUploaded = documentUploaded === 'true';

      // Clear any previous skip flag for fresh login
      localStorage.removeItem('onboardingSkipped');

      if (!isOnboardingComplete && !isDocumentUploaded) {
        // Both false → redirect to onboarding
        navigate('/onboarding');
      } else if (!isOnboardingComplete || !isDocumentUploaded) {
        // Any one is false → redirect to dashboard with onboardingSkipped flag (will show popup)
        localStorage.setItem('onboardingSkipped', 'true');
        navigate('/dashboard');
      } else {
        // Both true → redirect to dashboard normally
        navigate('/dashboard');
      }
    }
  }, [navigate, toast]);

  // Check user's email status when continue is clicked
  const checkEmailStatus = async (): Promise<UserAuthInfo | null> => {
    if (!email) return null;

    setIsCheckingEmail(true);
    try {
      const response = await fetch('/api/v1/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // API error - check message for user not found
        const message = data.message || data.responseStructure?.toastMessage || '';
        if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('not exist')) {
          return { exists: false, authMethod: "email", hasPassword: false };
        }
        throw new Error(message || 'Failed to check email');
      }

      const userData = data.responseStructure?.data || data;
      return {
        exists: userData.emailExists ?? false,
        authMethod: userData.primaryAuthMethod || "email",
        hasPassword: userData.hasPassword ?? false,
      };
    } catch (error) {
      console.error('Error checking email:', error);
      // Show error to user
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check email. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    const userInfo = await checkEmailStatus();

    if (!userInfo) {
      // Error occurred, already shown toast
      return;
    }

    // Email doesn't exist → redirect to signup
    if (!userInfo.exists) {
      toast({
        title: "Account Not Found",
        description: "No account found with this email. Please sign up.",
      });
      navigate("/signup", { state: { email } });
      return;
    }

    // Email exists but no password (Google user) → redirect to Google welcome page
    if (userInfo.exists && !userInfo.hasPassword) {
      navigate("/google-user-welcome", { state: { email } });
      return;
    }

    // Email exists and has password → proceed to password step
    setStep("password");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.responseStructure?.toastMessage || 'Login failed');
      }

      // Store tokens in localStorage
      const { accessToken, refreshToken, accessExpiresIn, refreshExpiresIn, onboardingCompleted, documentUploaded, tenantId } = data.responseStructure.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('accessExpiresIn', String(accessExpiresIn));
      localStorage.setItem('refreshExpiresIn', String(refreshExpiresIn));
      localStorage.setItem('isOnboarded', String(onboardingCompleted));
      localStorage.setItem('documentUploaded', String(documentUploaded));
      // Store tenantId if available (will be present for existing users with completed onboarding)
      if (tenantId) {
        localStorage.setItem('tenantId', tenantId);
      } else {
        localStorage.removeItem('tenantId');
      }

      // Store token creation timestamp and start refresh timer
      storeTokenTimestamp();
      startTokenRefreshTimer();

      toast({
        title: "Success",
        description: data.responseStructure.toastMessage || "Login successful",
      });

      // Redirect based on onboarding status
      const isOnboardingCompleted = onboardingCompleted === true || onboardingCompleted === 'true';

      // If onboarding is not completed, clear any previous skip flag (could be from different user)
      if (!isOnboardingCompleted) {
        localStorage.removeItem('onboardingSkipped');
      }

      const previouslySkipped = localStorage.getItem('onboardingSkipped') === 'true';

      if (isOnboardingCompleted || previouslySkipped) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setPassword("");
  };

  return (
    <AuthLayout variant="login">
      <div>
        <h1 className="text-4xl font-extrabold text-foreground leading-tight">
          Hey,
          <br />
          Welcome Back!
        </h1>
        <p className="mt-2 text-muted-foreground">
          We are very happy to see you back!
        </p>

        {step === "email" ? (
          // Email Step
          <form onSubmit={handleEmailContinue} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: snappy@gmail.com"
                className="auth-input"
                required
                disabled={isCheckingEmail}
              />
            </div>

            <button
              type="submit"
              className="auth-button-primary flex items-center justify-center gap-2"
              disabled={isCheckingEmail}
            >
              {isCheckingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          // Password Step
          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="email-display" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-sm auth-link"
                >
                  Change
                </button>
              </div>
              <input
                id="email-display"
                type="email"
                value={email}
                className="auth-input bg-muted/50"
                disabled
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="auth-input pr-12"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Link to="/forgot-password" className="inline-block mt-2 text-sm auth-link">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="auth-button-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        )}

        <div className="mt-6">
          <SocialLoginButtons />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have account?{" "}
          <Link to="/signup" className="auth-link">
            Sign Up here!
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
