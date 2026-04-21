"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AssetEditor } from "@/components/asset-editor";
import { AuthPanel } from "@/components/auth-panel";
import { BoardView } from "@/components/board-view";
import { trackAnalyticsEvent } from "@/components/google-analytics";
import { DetailPanel } from "@/components/detail-panel";
import { Sidebar } from "@/components/sidebar";
import { artchiveStore } from "@/lib/storage";
import { ArtContainer, Asset, CreateAssetInput, Session } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type ContainerPageProps = {
  containerId: string;
};

export function ContainerPage({ containerId }: ContainerPageProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [containers, setContainers] = useState<ArtContainer[]>([]);
  const [toolMode, setToolMode] = useState<"details" | "asset" | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

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
  const selectedAsset =
    container?.assets.find((asset) => asset.id === selectedAssetId) ?? null;

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
          void refresh(result.session.user.id);
          router.push("/");
        }
        return { message: result.message };
      }

      const nextSession = await artchiveStore.signIn(input.email, input.password);
      if (nextSession) {
        setSession(nextSession);
        setContainers([]);
        void refresh(nextSession.user.id);
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
    setToolMode(null);
    router.push("/");
  }

  async function handleAddAsset(input: CreateAssetInput) {
    if (!session) {
      return;
    }
    await artchiveStore.addAsset(input);
    await refresh(session.user.id);
  }

  async function handleSaveAsset(updates: {
    title: string;
    type: Asset["type"];
    note?: string;
    imageUrl?: string;
  }) {
    if (!session || !container || !selectedAsset) {
      return;
    }
    await artchiveStore.updateAsset(container.id, selectedAsset.id, updates);
    await refresh(session.user.id);
  }

  async function handleDeleteAsset() {
    if (!session || !container || !selectedAsset || selectedAsset.isPrimary) {
      return;
    }
    await artchiveStore.deleteAsset(container.id, selectedAsset.id);
    await refresh(session.user.id);
    setSelectedAssetId(null);
  }

  async function handleMoveAsset(assetId: string, x: number, y: number) {
    if (!session || !container) {
      return;
    }

    setContainers((current) =>
      current.map((item) =>
        item.id !== container.id
          ? item
          : {
            ...item,
            assets: item.assets.map((asset) =>
              asset.id !== assetId
                ? asset
                : {
                  ...asset,
                  position: {
                    ...asset.position,
                    x,
                    y
                  }
                }
            )
          }
      )
    );

    try {
      await artchiveStore.updateAssetLayout(container.id, assetId, { x, y });
    } catch (error) {
      console.error("Failed to save asset position", error);
      await refresh(session.user.id);
    }
  }

  async function handleResizeAsset(assetId: string, displayWidth: number) {
    if (!session || !container) {
      return;
    }

    setContainers((current) =>
      current.map((item) =>
        item.id !== container.id
          ? item
          : {
            ...item,
            assets: item.assets.map((asset) =>
              asset.id !== assetId
                ? asset
                : {
                  ...asset,
                  displayWidth
                }
            )
          }
      )
    );

    try {
      await artchiveStore.updateAssetLayout(container.id, assetId, { displayWidth });
    } catch (error) {
      console.error("Failed to save asset size", error);
      await refresh(session.user.id);
    }
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
            <div className="row-between board-hero-row">
              <div className="hero-copy">
                <p className="eyebrow">Board</p>
                <h2 className="title">{container.name}</h2>
                <p className="subtitle">
                  {container.description || "Add a summary to give this board some context."}
                </p>
                <p className="meta board-dates">
                  Updated {formatDate(container.updatedAt)} {"•"} Created {formatDate(container.createdAt)}
                </p>
              </div>
              <div className="inline-actions board-actions">
                <Link className="ghost-button" href="/">
                  Back to dashboard
                </Link>
                <button className="ghost-button" type="button" onClick={() => setToolMode("details")}>
                  Edit details
                </button>
                <button className="button" type="button" onClick={() => setToolMode("asset")}>
                  Add asset
                </button>
              </div>
            </div>
          </section>
          <BoardView
            container={container}
            onMoveAsset={handleMoveAsset}
            onResizeAsset={handleResizeAsset}
            onSelectAsset={(assetId) => setSelectedAssetId(assetId)}
          />
        </main>
      </div>
      {toolMode ? (
        <div className="modal-overlay" onClick={() => setToolMode(null)}>
          <div className="modal-shell" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">{toolMode === "details" ? "Container details" : "Add asset"}</p>
                <h3 className="card-title">
                  {toolMode === "details" ? "Update this container" : "Pin something new"}
                </h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setToolMode(null)}>
                Close
              </button>
            </div>
            <DetailPanel
              container={container}
              onSave={handleSaveDetails}
              onDelete={handleDeleteContainer}
              onAddAsset={handleAddAsset}
              mode={toolMode}
            />
          </div>
        </div>
      ) : null}
      {selectedAsset ? (
        <div className="modal-overlay" onClick={() => setSelectedAssetId(null)}>
          <div className="modal-shell" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Asset settings</p>
                <h3 className="card-title">{selectedAsset.title}</h3>
              </div>
              <button className="ghost-button" type="button" onClick={() => setSelectedAssetId(null)}>
                Close
              </button>
            </div>
            <AssetEditor asset={selectedAsset} onSave={handleSaveAsset} onDelete={handleDeleteAsset} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
