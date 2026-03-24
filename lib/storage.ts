"use client";

import { AuthChangeEvent, Session as SupabaseSession, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ArtContainer, Asset, CreateAssetInput, CreateContainerInput, Session } from "@/lib/types";

const BUCKET_NAME = "art-assets";

type ContainerRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: ArtContainer["status"];
  medium: string;
  preview_scale?: number | null;
  preview_offset_x?: number | null;
  preview_offset_y?: number | null;
  preview_rotation?: number | null;
  created_at: string;
  updated_at: string;
};

type AssetRow = {
  id: string;
  container_id: string;
  user_id: string;
  title: string;
  type: Asset["type"];
  image_path: string | null;
  note: string | null;
  is_primary: boolean;
  x: number;
  y: number;
  rotation: number;
  created_at: string;
  updated_at: string;
};

type ContainerTagRow = {
  container_id: string;
  tags: {
    name: string;
  } | null;
};

function getClient(): any {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error("Supabase is not configured. Add your project URL and publishable key to .env.local.");
  }
  return client;
}

function makeUuid() {
  return crypto.randomUUID();
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

function dataUrlToBlob(dataUrl: string) {
  const [meta, content] = dataUrl.split(",");
  if (!meta || !content) {
    throw new Error("Invalid image data.");
  }

  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] ?? "image/png";
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return {
    blob: new Blob([bytes], { type: mime }),
    mime
  };
}

function extensionFromMime(mime: string) {
  if (mime === "image/jpeg") {
    return "jpg";
  }
  if (mime === "image/webp") {
    return "webp";
  }
  if (mime === "image/gif") {
    return "gif";
  }
  return "png";
}

async function uploadImage(userId: string, containerId: string, assetId: string, dataUrl: string) {
  const client = getClient();
  const { blob, mime } = dataUrlToBlob(dataUrl);
  const extension = extensionFromMime(mime);
  const path = `${userId}/${containerId}/${assetId}.${extension}`;

  const { error } = await client.storage.from(BUCKET_NAME).upload(path, blob, {
    contentType: mime,
    upsert: true
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

async function createSignedUrlMap(paths: string[]) {
  if (paths.length === 0) {
    return new Map<string, string>();
  }

  const client = getClient();
  const { data, error } = await client.storage.from(BUCKET_NAME).createSignedUrls(paths, 60 * 60);
  if (error) {
    throw new Error(error.message);
  }

  const map = new Map<string, string>();
  for (const item of data) {
    if (item.path && item.signedUrl) {
      map.set(item.path, item.signedUrl);
    }
  }
  return map;
}

function toSession(user: User, displayName?: string | null): Session {
  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      name:
        displayName ||
        (typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null) ||
        user.email?.split("@")[0] ||
        "Artist"
    }
  };
}

function buildSessionFromSupabase(session: SupabaseSession | null) {
  if (!session?.user) {
    return null;
  }
  return toSession(session.user, null);
}

function buildPreviewSettings(row: ContainerRow) {
  return {
    scale: row.preview_scale ?? 1,
    offsetX: row.preview_offset_x ?? 0,
    offsetY: row.preview_offset_y ?? 0,
    rotation: row.preview_rotation ?? 0
  };
}

async function attachAssetsAndTags(containers: ContainerRow[]) {
  const client = getClient();
  if (containers.length === 0) {
    return [];
  }

  const containerIds = containers.map((container) => container.id);
  const [{ data: assets, error: assetsError }, { data: tagLinks, error: tagsError }] = await Promise.all([
    client
      .from("assets")
      .select("*")
      .in("container_id", containerIds)
      .order("created_at", { ascending: true }),
    client.from("container_tags").select("container_id, tags(name)").in("container_id", containerIds)
  ]);

  if (assetsError) {
    throw new Error(assetsError.message);
  }
  if (tagsError) {
    throw new Error(tagsError.message);
  }

  const imagePaths = (assets ?? [])
    .map((asset: AssetRow) => asset.image_path)
    .filter((path: string | null): path is string => Boolean(path));
  const signedUrlMap = await createSignedUrlMap(imagePaths);

  const assetsByContainer = new Map<string, Asset[]>();
  for (const row of (assets ?? []) as AssetRow[]) {
    const asset: Asset = {
      id: row.id,
      containerId: row.container_id,
      title: row.title,
      type: row.type,
      isPrimary: row.is_primary,
      imageUrl: row.image_path ? signedUrlMap.get(row.image_path) : undefined,
      note: row.note ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      position: {
        x: row.x,
        y: row.y,
        rotation: row.rotation
      }
    };

    const current = assetsByContainer.get(row.container_id) ?? [];
    current.push(asset);
    assetsByContainer.set(row.container_id, current);
  }

  const tagsByContainer = new Map<string, string[]>();
  for (const row of (tagLinks ?? []) as ContainerTagRow[]) {
    const current = tagsByContainer.get(row.container_id) ?? [];
    if (row.tags?.name) {
      current.push(row.tags.name);
    }
    tagsByContainer.set(row.container_id, current);
  }

  return containers.map((container) => ({
    id: container.id,
    userId: container.user_id,
    name: container.name,
    description: container.description,
    status: container.status,
    medium: container.medium,
    tags: Array.from(new Set(tagsByContainer.get(container.id) ?? [])),
    createdAt: container.created_at,
    updatedAt: container.updated_at,
    assets: assetsByContainer.get(container.id) ?? [],
    preview: buildPreviewSettings(container)
  }));
}

async function syncContainerTags(userId: string, containerId: string, tags: string[]) {
  const client = getClient();
  const normalizedTags = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));

  const { error: deleteError } = await client.from("container_tags").delete().eq("container_id", containerId);
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (normalizedTags.length === 0) {
    return;
  }

  const { error: upsertError } = await client
    .from("tags")
    .upsert(
      normalizedTags.map((name) => ({
        user_id: userId,
        name
      })),
      { onConflict: "user_id,name" }
    );

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  const { data: tagRows, error: tagsError } = await client
    .from("tags")
    .select("id, name")
    .eq("user_id", userId)
    .in("name", normalizedTags);

  if (tagsError) {
    throw new Error(tagsError.message);
  }

  if (!tagRows || tagRows.length === 0) {
    return;
  }

    const { error: linkError } = await client.from("container_tags").insert(
    tagRows.map((tag: { id: string }) => ({
      container_id: containerId,
      tag_id: tag.id
    }))
  );

  if (linkError) {
    throw new Error(linkError.message);
  }
}

export const artchiveStore = {
  async getSession() {
    const client = getClient();
    const { data, error } = await client.auth.getSession();
    if (error) {
      throw new Error(error.message);
    }
    return buildSessionFromSupabase(data.session);
  },

  subscribeToSession(callback: (session: Session | null) => void) {
    const client = getClient();
    const { data } = client.auth.onAuthStateChange(
      (_event: AuthChangeEvent, nextSession: SupabaseSession | null) => {
        callback(buildSessionFromSupabase(nextSession));
      }
    );
    return data.subscription;
  },

  async signUp(email: string, password: string, displayName: string) {
    const client = getClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      session: buildSessionFromSupabase(data.session),
      message: data.session
        ? undefined
        : "Check your email to confirm your account, then log in."
    };
  },

  async signIn(email: string, password: string) {
    const client = getClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return buildSessionFromSupabase(data.session);
  },

  async signOut() {
    const client = getClient();
    const { error } = await client.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async listContainers(userId: string) {
    const client = getClient();
    const { data, error } = await client
      .from("containers")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return attachAssetsAndTags((data ?? []) as ContainerRow[]);
  },

  async createContainer(userId: string, input: CreateContainerInput) {
    const client = getClient();
    const containerId = makeUuid();
    const assetId = makeUuid();
    const imagePath = await uploadImage(userId, containerId, assetId, input.mainSketchUrl);

    const { error: containerError } = await client.from("containers").insert({
      id: containerId,
      user_id: userId,
      name: input.name,
      description: input.description,
      status: input.status,
      medium: input.medium,
      preview_scale: 1,
      preview_offset_x: 0,
      preview_offset_y: 0,
      preview_rotation: 0
    });

    if (containerError) {
      throw new Error(containerError.message);
    }

    const { error: assetError } = await client.from("assets").insert({
      id: assetId,
      container_id: containerId,
      user_id: userId,
      title: input.mainSketchTitle,
      type: "sketch",
      image_path: imagePath,
      is_primary: true,
      x: 220,
      y: 52,
      rotation: 0
    });

    if (assetError) {
      throw new Error(assetError.message);
    }

    await syncContainerTags(userId, containerId, input.tags);
    const containers = await this.listContainers(userId);
    const created = containers.find((container) => container.id === containerId);
    if (!created) {
      throw new Error("Container was created but could not be loaded.");
    }
    return created;
  },

  async updateContainer(containerId: string, updater: (container: ArtContainer) => ArtContainer) {
    const client = getClient();
    const { data: existingRow, error: existingError } = await client
      .from("containers")
      .select("*")
      .eq("id", containerId)
      .single();

    if (existingError) {
      throw new Error(existingError.message);
    }

    const { data: existingAssets, error: assetsError } = await client
      .from("assets")
      .select("*")
      .eq("container_id", containerId)
      .order("created_at", { ascending: true });

    if (assetsError) {
      throw new Error(assetsError.message);
    }

    const [container] = await attachAssetsAndTags([existingRow as ContainerRow]);
    const nextContainer = updater({
      ...container,
      assets: (existingAssets as AssetRow[]).length > 0 ? container.assets : container.assets
    });

    const { error: updateError } = await client
      .from("containers")
      .update({
        name: nextContainer.name,
        description: nextContainer.description,
        status: nextContainer.status,
        medium: nextContainer.medium,
        preview_scale: nextContainer.preview.scale,
        preview_offset_x: nextContainer.preview.offsetX,
        preview_offset_y: nextContainer.preview.offsetY,
        preview_rotation: nextContainer.preview.rotation
      })
      .eq("id", containerId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    await syncContainerTags(nextContainer.userId, containerId, nextContainer.tags);
    const containers = await this.listContainers(nextContainer.userId);
    return containers.find((item) => item.id === containerId) ?? null;
  },

  async deleteContainer(containerId: string) {
    const client = getClient();
    const { data: assets, error: assetsError } = await client
      .from("assets")
      .select("image_path")
      .eq("container_id", containerId);

    if (assetsError) {
      throw new Error(assetsError.message);
    }

    const paths = (assets ?? [])
      .map((asset: { image_path: string | null }) => asset.image_path)
      .filter((path: string | null): path is string => Boolean(path));

    if (paths.length > 0) {
      const { error: removeError } = await client.storage.from(BUCKET_NAME).remove(paths);
      if (removeError) {
        throw new Error(removeError.message);
      }
    }

    const { error } = await client.from("containers").delete().eq("id", containerId);
    if (error) {
      throw new Error(error.message);
    }
  },

  async addAsset(input: CreateAssetInput) {
    const client = getClient();
    const session = await this.getSession();
    if (!session) {
      throw new Error("You must be logged in to add assets.");
    }

    const assetId = makeUuid();
    const imagePath =
      input.imageUrl && input.type !== "note"
        ? await uploadImage(session.user.id, input.containerId, assetId, input.imageUrl)
        : null;

    const { error } = await client.from("assets").insert({
      id: assetId,
      container_id: input.containerId,
      user_id: session.user.id,
      title: input.title,
      type: input.type,
      image_path: imagePath,
      note: input.note ?? null,
      is_primary: false,
      x: 32 + Math.floor(Math.random() * 300),
      y: 44 + Math.floor(Math.random() * 220),
      rotation: -6 + Math.floor(Math.random() * 12)
    });

    if (error) {
      throw new Error(error.message);
    }

    const containers = await this.listContainers(session.user.id);
    const container = containers.find((item) => item.id === input.containerId);
    return container?.assets.find((item) => item.id === assetId) ?? null;
  },

  async updateAssetPosition(containerId: string, assetId: string, x: number, y: number) {
    const client = getClient();
    const { error } = await client
      .from("assets")
      .update({
        x,
        y
      })
      .eq("id", assetId)
      .eq("container_id", containerId);

    if (error) {
      throw new Error(error.message);
    }
  },

  async updateAsset(
    containerId: string,
    assetId: string,
    updates: {
      title: string;
      type: Asset["type"];
      note?: string;
      imageUrl?: string;
    }
  ) {
    const client = getClient();
    const session = await this.getSession();
    if (!session) {
      throw new Error("You must be logged in to update assets.");
    }

    const { data: existingAsset, error: existingError } = await client
      .from("assets")
      .select("image_path")
      .eq("id", assetId)
      .eq("container_id", containerId)
      .single();

    if (existingError) {
      throw new Error(existingError.message);
    }

    let nextImagePath = existingAsset?.image_path ?? null;

    if (updates.type === "note") {
      nextImagePath = null;
    } else if (updates.imageUrl) {
      nextImagePath = await uploadImage(session.user.id, containerId, assetId, updates.imageUrl);
    }

    const payload = {
      title: updates.title,
      type: updates.type,
      note: updates.type === "note" ? updates.note ?? null : updates.note ?? null,
      image_path: nextImagePath
    };

    const { error } = await client
      .from("assets")
      .update(payload)
      .eq("id", assetId)
      .eq("container_id", containerId);

    if (error) {
      throw new Error(error.message);
    }

    if (
      existingAsset?.image_path &&
      existingAsset.image_path !== nextImagePath &&
      (updates.type === "note" || Boolean(updates.imageUrl))
    ) {
      const { error: removeError } = await client.storage
        .from(BUCKET_NAME)
        .remove([existingAsset.image_path]);
      if (removeError) {
        throw new Error(removeError.message);
      }
    }
  },

  async deleteAsset(containerId: string, assetId: string) {
    const client = getClient();
    const { data: asset, error: assetError } = await client
      .from("assets")
      .select("image_path")
      .eq("id", assetId)
      .eq("container_id", containerId)
      .single();

    if (assetError) {
      throw new Error(assetError.message);
    }

    if (asset?.image_path) {
      const { error: removeError } = await client.storage
        .from(BUCKET_NAME)
        .remove([asset.image_path]);
      if (removeError) {
        throw new Error(removeError.message);
      }
    }

    const { error } = await client
      .from("assets")
      .delete()
      .eq("id", assetId)
      .eq("container_id", containerId);

    if (error) {
      throw new Error(error.message);
    }
  },

  normalizeError
};
