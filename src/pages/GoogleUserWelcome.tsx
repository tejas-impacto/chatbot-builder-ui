import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Info, Check } from "lucide-react";

interface LocationState {
  email?: string;
}

const GoogleUserWelcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const email = state.email || "";

  // Redirect to login if no email provided (direct URL access)
  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    const currentPath = window.location.pathname;
    window.location.href = `/api/v1/auth/google/login?redirect_path=${encodeURIComponent(currentPath)}`;
  };

  const handleSetupPassword = () => {
    navigate("/setup-password", { state: { email } });
  };

  const handleUseDifferentEmail = () => {
    navigate("/login");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Header */}
        <h1 className="text-4xl font-extrabold text-foreground leading-tight mb-2">
          Welcome Back!
        </h1>
        <p className="text-muted-foreground mb-6">{email}</p>

        {/* Info Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Info className="w-5 h-5 text-primary mt-0.5" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">
                You signed up with Google
              </p>
              <p className="text-sm text-muted-foreground">
                Use the Google button below to continue, or set up a password for email login.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Primary: Continue with Google */}
          <button
            onClick={handleGoogleLogin}
            className="auth-button-social w-full flex items-center justify-center gap-3 py-3.5 border-2 border-primary/20 hover:border-primary/40"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium">Continue with Google</span>
            <Check className="w-5 h-5 text-primary ml-1" />
          </button>

          {/* Secondary: Set up password */}
          <button
            onClick={handleSetupPassword}
            className="w-full text-center"
          >
            <span className="auth-link text-sm font-semibold">
              Set up password login instead
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              We'll send you an email to set up your password
            </p>
          </button>

          {/* Tertiary: Use different email */}
          <div className="pt-4 text-center">
            <span className="text-sm text-muted-foreground">Not you? </span>
            <button
              onClick={handleUseDifferentEmail}
              className="auth-link text-sm"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleUserWelcome;
