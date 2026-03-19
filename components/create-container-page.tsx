"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { ContainerForm } from "@/components/container-form";
import { Sidebar } from "@/components/sidebar";
import { artchiveStore } from "@/lib/storage";
import { ArtContainer, CreateContainerInput, Session } from "@/lib/types";

export function CreateContainerPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [containers, setContainers] = useState<ArtContainer[]>([]);

  useEffect(() => {
    const currentSession = artchiveStore.getSession();
    if (!currentSession) {
      return;
    }
    setSession(currentSession);
    setContainers(artchiveStore.listContainers(currentSession.user.id));
  }, []);

  function handleSignIn(email: string, name?: string) {
    const nextSession = artchiveStore.signIn(email, name);
    setSession(nextSession);
    setContainers(artchiveStore.listContainers(nextSession.user.id));
  }

  function handleSignOut() {
    artchiveStore.signOut();
    setSession(null);
    setContainers([]);
  }

  function handleCreateContainer(input: CreateContainerInput) {
    if (!session) {
      return;
    }
    const created = artchiveStore.createContainer(session.user.id, input);
    router.push(`/containers/${created.id}`);
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
