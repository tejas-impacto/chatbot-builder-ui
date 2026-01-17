import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
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

          <button type="submit" className="auth-button-primary">
            Login
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
