import { Info } from "lucide-react";

interface AuthMethodInfoProps {
  hasPassword: boolean;
  linkedProviders: string[];
  primaryAuthMethod: string | null;
}

const AuthMethodInfo = ({ hasPassword, linkedProviders, primaryAuthMethod }: AuthMethodInfoProps) => {
  const hasGoogle = linkedProviders.includes('GOOGLE');

  // User signed up with Google only (no password)
  if (!hasPassword && hasGoogle) {
    return (
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium">You signed up with Google</p>
          <p className="mt-1 text-blue-600 dark:text-blue-300">
            Use the Google button below to continue, or set up a password for email login.
          </p>
        </div>
      </div>
    );
  }

  // User has password only (no Google linked)
  if (hasPassword && !hasGoogle) {
    return (
      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
        <Info className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <p>Enter your password to sign in, or link your Google account for faster access.</p>
        </div>
      </div>
    );
  }

  // User has both password and Google linked
  if (hasPassword && hasGoogle) {
    return (
      <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg mb-4">
        <Info className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-green-800 dark:text-green-200">
          <p>You can sign in with your password or Google.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthMethodInfo;
