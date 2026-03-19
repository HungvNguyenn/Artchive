"use client";

import dynamic from "next/dynamic";

const CreateContainerPage = dynamic(
  () => import("@/components/create-container-page").then((module) => module.CreateContainerPage),
  {
    ssr: false,
    loading: () => null
  }
);

export default function NewContainerRoute() {
  return <CreateContainerPage />;
}
