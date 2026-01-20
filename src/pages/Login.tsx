import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { useToast } from "@/hooks/use-toast";
import { startTokenRefreshTimer, storeTokenTimestamp } from "@/lib/auth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle Google OAuth callback
  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const accessExpiresIn = searchParams.get('accessExpiresIn');
    const refreshExpiresIn = searchParams.get('refreshExpiresIn');
    const isOnboarded = searchParams.get('isOnboarded');

    if (accessToken && refreshToken) {
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      if (accessExpiresIn) localStorage.setItem('accessExpiresIn', accessExpiresIn);
      if (refreshExpiresIn) localStorage.setItem('refreshExpiresIn', refreshExpiresIn);
      localStorage.setItem('isOnboarded', isOnboarded || 'false');

      // Store token creation timestamp and start refresh timer
      storeTokenTimestamp();
      startTokenRefreshTimer();

      toast({
        title: "Success",
        description: "Login successful",
      });

      // Redirect based on onboarding status
      if (isOnboarded === 'true') {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
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
        throw new Error(data.message || 'Login failed');
      }

      // Store tokens in localStorage
      const { accessToken, refreshToken, accessExpiresIn, refreshExpiresIn, isOnboarded } = data.responseStructure.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('accessExpiresIn', String(accessExpiresIn));
      localStorage.setItem('refreshExpiresIn', String(refreshExpiresIn));
      localStorage.setItem('isOnboarded', String(isOnboarded));

      // Store token creation timestamp and start refresh timer
      storeTokenTimestamp();
      startTokenRefreshTimer();

      toast({
        title: "Success",
        description: data.responseStructure.toastMessage || "Login successful",
      });

      // Redirect based on onboarding status
      if (isOnboarded) {
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

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
