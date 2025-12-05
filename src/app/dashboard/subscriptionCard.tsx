"use client";

import { useState } from "react";

/**
 * Simple interactive subscription card.
 * In a real product this would trigger Stripe checkout or a billing portal.
 * Here we simulate an upgrade to Pro on the client side only.
 */
export default function SubscriptionCard() {
  const [plan, setPlan] = useState<"Free" | "Pro">("Free");
  const [upgraded, setUpgraded] = useState(false);

  const handleUpgradeClick = () => {
    if (upgraded) return;
    setPlan("Pro");
    setUpgraded(true);
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-gray-900/70 to-black p-5">
      <h2 className="text-lg font-semibold mb-2">Subscription</h2>

      <p className="text-sm text-gray-400 mb-3">
        Current plan:{" "}
        <span className="font-medium text-white">
          {plan === "Free" ? "Free" : "Pro (demo)"}
        </span>
      </p>

      <p className="text-xs text-gray-500 mb-4">
        Upgrade to unlock advanced analytics and personalized job
        recommendations. In this demo, upgrading is simulated on the client
        only.
      </p>

      <button
        type="button"
        onClick={handleUpgradeClick}
        disabled={upgraded}
        className={
          "w-full px-4 py-2 rounded-md text-sm font-medium transition " +
          (upgraded
            ? "bg-gray-700 text-gray-300 cursor-default"
            : "bg-blue-600 hover:bg-blue-700 text-white")
        }
      >
        {upgraded ? "You are on Pro (demo)" : "Upgrade to Pro"}
      </button>

      {upgraded && (
        <p className="mt-3 text-[11px] text-gray-500">
          Thanks for upgrading! In a real product this would connect to a
          billing system (e.g. Stripe) and unlock Pro-only features.
        </p>
      )}
    </div>
  );
}