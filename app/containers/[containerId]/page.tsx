"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const ContainerPage = dynamic(
  () => import("@/components/container-page").then((module) => module.ContainerPage),
  {
    ssr: false,
    loading: () => null
  }
);

export default function ContainerRoute() {
  const params = useParams<{ containerId: string }>();
  return <ContainerPage containerId={params.containerId} />;
}
