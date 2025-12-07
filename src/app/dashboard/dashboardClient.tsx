"use client";

import { useState } from "react";
import ResumeSection from "./resumeSection";
import SubscriptionCard from "./subscriptionCard";

type DashboardClientProps = {
  name: string;
};

export default function DashboardClient({ name }: DashboardClientProps) {
  const [hasUploadedResume, setHasUploadedResume] = useState(false);
  const [hasUpgraded, setHasUpgraded] = useState(false);

  // Profile 完成度：40 → 70 → 100
  let profileCompletion = 40;
  if (hasUploadedResume) profileCompletion = 70;
  if (hasUploadedResume && hasUpgraded) profileCompletion = 100;

  // step 状态：谁是 done，谁是 active
  const getStepStatus = (step: number) => {
    if (step === 1) return "done"; // profile 假装已完成

    if (step === 2) {
      if (hasUploadedResume) return "done";
      return "active"; // 还没上传时，第二步是当前步骤
    }

    if (step === 3) {
      if (!hasUploadedResume) return "idle"; // 简历没上传时，还不能做这一步
      if (hasUpgraded) return "done";        // 已经点过 Upgrade
      return "active";                       // 可以去点 Upgrade 了
    }

    return "idle";
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
        {/* 顶部欢迎区 */}
        <section className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-400">Welcome back</p>
            <h1 className="text-3xl font-bold">Hi, {name}</h1>
          </div>

          {/* Profile 完成度 */}
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

        {/* 中间两列 */}
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
                  const status = getStepStatus(step);
                  const isDone = status === "done";
                  const isActive = status === "active";

                  return (
                    <div key={label} className="flex items-center gap-3">
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

            {/* 简历上传区：上传成功后，标记第二步完成 */}
            <ResumeSection
              onResumeUploaded={() => setHasUploadedResume(true)}
            />
          </div>

          {/* 右侧：订阅 + 预览 */}
          <div className="flex flex-col gap-6">
            {/* Subscription 卡片：点击 Upgrade 后，标记第三步完成 */}
            <SubscriptionCard onUpgrade={() => setHasUpgraded(true)} />

            {/* Insights 占位 */}
            <div className="rounded-xl border border-gray-800 bg-[#050505] p-5">
              <h2 className="text-lg font-semibold mb-3">Insights (preview)</h2>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  • {hasUploadedResume ? "Some" : "0"} skills parsed from resume
                </li>
                <li>• 0 work experiences detected</li>
                <li>
                  • Subscription: {hasUpgraded ? "Pro (demo)" : "Free plan"}
                </li>
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