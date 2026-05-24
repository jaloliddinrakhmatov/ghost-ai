import { SignIn } from "@clerk/nextjs";
import { AuthLeftPanel } from "@/components/auth/auth-left-panel";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex font-sans">
      <AuthLeftPanel />
      <div className="flex-1 lg:w-1/2 flex items-center justify-center bg-bg-base px-6">
        <SignIn />
      </div>
    </div>
  );
}
