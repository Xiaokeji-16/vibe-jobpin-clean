// app/dashboard/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ResumeSection from "./resumeSection"; 
import SubscriptionCard from "./subscriptionCard";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const name = user?.firstName || user?.emailAddresses[0]?.emailAddress || "there";

  // 先用假数据：假设 Profile 完成度 40%，当前在 Step 1
  const profileCompletion = 40;
  const currentStep = 1;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        {/* 顶部欢迎区 */}
        <section className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-400">Welcome back</p>
            <h1 className="text-3xl font-bold">Hi, {name}</h1>
          </div>

          {/* Profile 完成度进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Profile completion</span>
              <span>{profileCompletion}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </section>

        {/* 中间两列布局：左边 Onboarding + Resume，右边 Subscription + Stats */}
        <section className="grid md:grid-cols-[2fr,1.2fr] gap-6">
          <div className="flex flex-col gap-6">
            {/* Onboarding 步骤区 */}
            <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900/70 to-black p-5">
              <h2 className="text-lg font-semibold mb-3">Onboarding steps</h2>
              <div className="flex flex-col gap-3 text-sm">
                {[
                  "Complete your profile",
                  "Upload your resume",
                  "Review insights & subscribe",
                ].map((label, index) => {
                  const step = index + 1;
                  const isActive = step === currentStep;
                  const isDone = step < currentStep;
                  return (
                    <div
                      key={label}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={
                          "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium " +
                          (isDone
                            ? "bg-green-500 border-green-500"
                            : isActive
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-600 text-gray-400")
                        }
                      >
                        {step}
                      </div>
                      <div className="flex-1">
                        <p
                          className={
                            "font-medium " +
                            (isDone
                              ? "text-green-400"
                              : isActive
                              ? "text-white"
                              : "text-gray-400")
                          }
                        >
                          {label}
                        </p>
                        {isActive && (
                          <p className="text-xs text-gray-500">
                            Start here · We&apos;ll guide you step by step.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 简历信息区（占位） */}
            <ResumeSection />
          </div>

          {/* 右侧：订阅状态 + 简单 stats 占位 */}
          <div className="flex flex-col gap-6">
            {/* Subscription 区 */}
            <SubscriptionCard />

            {/* 简单统计占位 */}
            <div className="rounded-xl border border-gray-800 bg-[#050505] p-5">
              <h2 className="text-lg font-semibold mb-3">Insights (preview)</h2>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• 0 skills parsed from resume</li>
                <li>• 0 work experiences detected</li>
                <li>• AI match score: coming soon</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                These metrics will update automatically once you upload your
                resume and start using AI analysis.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}