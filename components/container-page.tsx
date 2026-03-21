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

  async function refresh(userId: string) {
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
      await refresh(currentSession.user.id);
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

      void refresh(nextSession.user.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const container = containers.find((item) => item.id === containerId) ?? null;

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
          void refresh(result.session.user.id);
        }
        return { message: result.message };
      }

      const nextSession = await artchiveStore.signIn(input.email, input.password);
      if (nextSession) {
        setSession(nextSession);
        setContainers([]);
        void refresh(nextSession.user.id);
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

  async function handleSaveDetails(nextContainer: ArtContainer) {
    if (!session) {
      return;
    }
    await artchiveStore.updateContainer(nextContainer.id, () => nextContainer);
    await refresh(session.user.id);
  }

  async function handleDeleteContainer(targetId: string) {
    if (!session) {
      return;
    }
    await artchiveStore.deleteContainer(targetId);
    router.push("/");
  }

  async function handleAddAsset(input: CreateAssetInput) {
    if (!session) {
      return;
    }
    await artchiveStore.addAsset(input);
    await refresh(session.user.id);
  }

  async function handleMoveAsset(assetId: string, x: number, y: number) {
    if (!session || !container) {
      return;
    }
    await artchiveStore.updateAssetPosition(container.id, assetId, x, y);
    await refresh(session.user.id);
  }

  if (!session) {
    return (
      <div className="auth-shell">
        <AuthPanel onSubmit={handleAuthSubmit} />
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
                  Keep this page focused on the board itself: arrangement, notes, images, and
                  project details.
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
