// app/sign-up/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp
        routing="hash"
        afterSignUpUrl="/dashboard"   // 注册成功后跳去 /dashboard
      />
    </div>
  );
}