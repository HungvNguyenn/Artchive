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

  async function loadContainersForUser(userId: string) {
    try {
      setContainers(await artchiveStore.listContainers(userId));
    } catch (error) {
      console.error("Failed to load containers", error);
      setContainers([]);
    }
  }

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const currentSession = await artchiveStore.getSession();
      if (!active || !currentSession) {
        return;
      }
      setSession(currentSession);
      await loadContainersForUser(currentSession.user.id);
    }

    void bootstrap();

    const subscription = artchiveStore.subscribeToSession((nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession);
      if (!nextSession) {
        setContainers([]);
        return;
      }

      void loadContainersForUser(nextSession.user.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
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

  async function handleAuthSubmit(input: {
    mode: "signin" | "signup";
    email: string;
    password: string;
    name?: string;
  }) {
    try {
      if (input.mode === "signup") {
        const result = await artchiveStore.signUp(input.email, input.password, input.name || "");
        if (result.session) {
          setSession(result.session);
          setContainers([]);
          void loadContainersForUser(result.session.user.id);
        }
        return { message: result.message };
      }

      const nextSession = await artchiveStore.signIn(input.email, input.password);
      if (nextSession) {
        setSession(nextSession);
        setContainers([]);
        void loadContainersForUser(nextSession.user.id);
      }
      return;
    } catch (error) {
      return { message: artchiveStore.normalizeError(error) };
    }
  }

  async function handleSignOut() {
    await artchiveStore.signOut();
    setSession(null);
    setContainers([]);
    setQuery("");
    setTagFilter("All");
  }

  if (!session) {
    return (
      <div className="auth-shell">
        <AuthPanel onSubmit={handleAuthSubmit} />
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
