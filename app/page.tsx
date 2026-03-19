"use client";

import dynamic from "next/dynamic";

const DashboardPage = dynamic(
  () => import("@/components/dashboard-page").then((module) => module.DashboardPage),
  {
    ssr: false,
    loading: () => null
  }
);

export default function Home() {
  return <DashboardPage />;
}
