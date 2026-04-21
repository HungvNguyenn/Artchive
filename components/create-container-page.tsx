"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { trackAnalyticsEvent } from "@/components/google-analytics";
import { ContainerForm } from "@/components/container-form";
import { Sidebar } from "@/components/sidebar";
import { artchiveStore } from "@/lib/storage";
import { ArtContainer, CreateContainerInput, Session } from "@/lib/types";

export function CreateContainerPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [containers, setContainers] = useState<ArtContainer[]>([]);

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
          trackAnalyticsEvent("sign_up", { method: "email" });
          setSession(result.session);
          setContainers([]);
          void loadContainersForUser(result.session.user.id);
          router.push("/");
        }
        return { message: result.message };
      }

      const nextSession = await artchiveStore.signIn(input.email, input.password);
      if (nextSession) {
        setSession(nextSession);
        setContainers([]);
        void loadContainersForUser(nextSession.user.id);
        router.push("/");
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
  }

  async function handleCreateContainer(input: CreateContainerInput) {
    if (!session) {
      return;
    }
    const created = await artchiveStore.createContainer(session.user.id, input);
    router.push(`/containers/${created.id}`);
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
          activeView="create"
          containers={containers}
          session={session}
          onSignOut={handleSignOut}
        />
        <main className="main">
          <section className="panel hero-card">
            <div className="row-between">
              <div className="hero-copy">
                <p className="eyebrow">Create container</p>
                <h2 className="title">Start one artwork at a time.</h2>
                <p className="subtitle">
                  Set up the basic project info here, then drop into the corkboard to pin notes,
                  references, sketches, and finals.
                </p>
              </div>
              <div className="inline-actions">
                <Link className="ghost-button" href="/">
                  Back to dashboard
                </Link>
              </div>
            </div>
          </section>
          <ContainerForm onCreate={handleCreateContainer} />
        </main>
      </div>
    </div>
  );
}
