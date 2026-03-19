"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { ContainerList } from "@/components/container-list";
import { SearchToolbar } from "@/components/search-toolbar";
import { Sidebar } from "@/components/sidebar";
import { artchiveStore } from "@/lib/storage";
import { ArtContainer, Session } from "@/lib/types";

export function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [containers, setContainers] = useState<ArtContainer[]>([]);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("All");

  useEffect(() => {
    const currentSession = artchiveStore.getSession();
    if (!currentSession) {
      return;
    }
    setSession(currentSession);
    setContainers(artchiveStore.listContainers(currentSession.user.id));
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    containers.forEach((container) => {
      container.tags.forEach((tag) => tags.add(tag));
    });
    return ["All", ...Array.from(tags).sort()];
  }, [containers]);

  const filteredContainers = useMemo(() => {
    return containers.filter((container) => {
      const matchesQuery =
        container.name.toLowerCase().includes(query.toLowerCase()) ||
        container.description.toLowerCase().includes(query.toLowerCase());
      const matchesTag = tagFilter === "All" || container.tags.includes(tagFilter);
      return matchesQuery && matchesTag;
    });
  }, [containers, query, tagFilter]);

  function handleSignIn(email: string, name?: string) {
    const nextSession = artchiveStore.signIn(email, name);
    setSession(nextSession);
    setContainers(artchiveStore.listContainers(nextSession.user.id));
  }

  function handleSignOut() {
    artchiveStore.signOut();
    setSession(null);
    setContainers([]);
    setQuery("");
    setTagFilter("All");
  }

  if (!session) {
    return (
      <div className="auth-shell">
        <AuthPanel onSubmit={handleSignIn} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-grid">
        <Sidebar
          activeView="dashboard"
          containers={containers}
          session={session}
          onSignOut={handleSignOut}
        />
        <main className="main">
          <SearchToolbar
            query={query}
            tagFilter={tagFilter}
            tags={allTags}
            onQueryChange={setQuery}
            onTagChange={setTagFilter}
            actionLabel="Create container"
            onAction={() => router.push("/containers/new")}
          />
          <ContainerList
            containers={filteredContainers}
            selectedContainerId={null}
            onSelect={(containerId) => router.push(`/containers/${containerId}`)}
          />
        </main>
      </div>
    </div>
  );
}
