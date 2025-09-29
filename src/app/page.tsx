"use client";

import { useState } from "react";
import { WalletConnectionProvider } from "@/components/WalletConnectionProvider";
import { LandingPage } from "@/components/LandingPage";
import { Dashboard } from "@/components/Dashboard";

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <WalletConnectionProvider>
      {showDashboard ? (
        <Dashboard onBackToLanding={() => setShowDashboard(false)} />
      ) : (
        <LandingPage onGetStarted={() => setShowDashboard(true)} />
      )}
    </WalletConnectionProvider>
  );
}
