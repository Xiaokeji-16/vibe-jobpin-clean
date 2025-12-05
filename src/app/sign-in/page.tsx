// app/sign-in/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn
        routing="hash"
        afterSignInUrl="/dashboard"   // 登录成功后跳去 /dashboard
      />
    </div>
  );
}
