import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startTokenRefreshTimer, storeTokenTimestamp } from "@/lib/auth";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');

      if (!code) {
        setError('No authorization code received from Google');
        return;
      }

      try {
        const response = await fetch(`/api/v1/auth/google/callback?code=${encodeURIComponent(code)}`, {
          method: 'GET',
          headers: {
            'accept': '*/*',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Google authentication failed');
        }

        const {
          accessToken,
          refreshToken,
          expiresIn,
          onboardingCompleted,
          documentUploaded,
        } = data.responseStructure.data;

        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('accessExpiresIn', String(expiresIn));
        localStorage.setItem('isOnboarded', String(onboardingCompleted));
        localStorage.setItem('documentUploaded', String(documentUploaded));

        // Store token creation timestamp and start refresh timer
        storeTokenTimestamp();
        startTokenRefreshTimer();

        toast({
          title: "Success",
          description: "Google login successful",
        });

        // Redirect based on onboarding and document status
        if (onboardingCompleted && documentUploaded) {
          navigate('/dashboard', { replace: true });
        } else if (onboardingCompleted && !documentUploaded) {
          // Onboarding done but documents not uploaded - go to step 3
          navigate('/onboarding?step=3', { replace: true });
        } else {
          // Onboarding not completed - start from beginning
          navigate('/onboarding', { replace: true });
        }
      } catch (err) {
        console.error('Google callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        toast({
          title: "Login Failed",
          description: err instanceof Error ? err.message : "Google authentication failed",
          variant: "destructive",
        });
        // Redirect to login after error
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Completing Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
