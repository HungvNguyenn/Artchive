"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { BoardView } from "@/components/board-view";
import { DetailPanel } from "@/components/detail-panel";
import { Sidebar } from "@/components/sidebar";
import { artchiveStore } from "@/lib/storage";
import { ArtContainer, CreateAssetInput, Session } from "@/lib/types";

type ContainerPageProps = {
  containerId: string;
};

export function ContainerPage({ containerId }: ContainerPageProps) {
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

  const container = containers.find((item) => item.id === containerId) ?? null;

  function refresh(userId: string) {
    setContainers(artchiveStore.listContainers(userId));
  }

  function handleSignIn(email: string, name?: string) {
    const nextSession = artchiveStore.signIn(email, name);
    setSession(nextSession);
    refresh(nextSession.user.id);
  }

  function handleSignOut() {
    artchiveStore.signOut();
    setSession(null);
    setContainers([]);
  }

  function handleSaveDetails(nextContainer: ArtContainer) {
    if (!session) {
      return;
    }
    artchiveStore.updateContainer(nextContainer.id, () => nextContainer);
    refresh(session.user.id);
  }

  function handleDeleteContainer(targetId: string) {
    if (!session) {
      return;
    }
    artchiveStore.deleteContainer(targetId);
    router.push("/");
  }

  function handleAddAsset(input: CreateAssetInput) {
    if (!session) {
      return;
    }
    artchiveStore.addAsset(input);
    refresh(session.user.id);
  }

  function handleMoveAsset(assetId: string, x: number, y: number) {
    if (!session || !container) {
      return;
    }
    artchiveStore.updateAssetPosition(container.id, assetId, x, y);
    refresh(session.user.id);
  }

  if (!session) {
    return (
      <div className="auth-shell">
        <AuthPanel onSubmit={handleSignIn} />
      </div>
    );
  }

  if (!container) {
    return (
      <div className="app-shell">
        <div className="app-grid">
          <Sidebar
            activeView="container"
            containers={containers}
            session={session}
            onSignOut={handleSignOut}
          />
          <main className="main">
            <section className="card empty-state">
              <h2 className="card-title">Container not found</h2>
              <p className="helper">This artwork may have been deleted or belongs to another session.</p>
              <div className="inline-actions" style={{ justifyContent: "center", marginTop: 12 }}>
                <Link className="ghost-button" href="/">
                  Return to dashboard
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-grid">
        <Sidebar
          activeView="container"
          containers={containers}
          session={session}
          onSignOut={handleSignOut}
        />
        <main className="main">
          <section className="panel hero-card">
            <div className="row-between">
              <div className="hero-copy">
                <p className="eyebrow">Container board</p>
                <h2 className="title">{container.name}</h2>
                <p className="subtitle">
                  Keep this page focused on the board itself: arrangement, notes, images, and project details.
                </p>
              </div>
              <div className="inline-actions">
                <Link className="ghost-button" href="/">
                  Back to dashboard
                </Link>
                <Link className="button" href="/containers/new">
                  New container
                </Link>
              </div>
            </div>
          </section>
          <BoardView container={container} onMoveAsset={handleMoveAsset} />
          <DetailPanel
            container={container}
            onSave={handleSaveDetails}
            onDelete={handleDeleteContainer}
            onAddAsset={handleAddAsset}
          />
        </main>
      </div>
    </div>
  );
}
