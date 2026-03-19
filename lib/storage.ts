"use client";

import { demoSession, seededContainers } from "@/lib/mock-data";
import {
  ArtContainer,
  Asset,
  CreateAssetInput,
  CreateContainerInput,
  Session
} from "@/lib/types";
import { makeId } from "@/lib/utils";

const SESSION_KEY = "artchive-session";
const CONTAINERS_KEY = "artchive-containers";

type StoredUser = {
  id: string;
  email: string;
  name: string;
};

function loadContainers() {
  if (typeof window === "undefined") {
    return seededContainers;
  }

  const raw = window.localStorage.getItem(CONTAINERS_KEY);
  if (!raw) {
    window.localStorage.setItem(CONTAINERS_KEY, JSON.stringify(seededContainers));
    return seededContainers;
  }

  try {
    return JSON.parse(raw) as ArtContainer[];
  } catch {
    window.localStorage.setItem(CONTAINERS_KEY, JSON.stringify(seededContainers));
    return seededContainers;
  }
}

function saveContainers(containers: ArtContainer[]) {
  window.localStorage.setItem(CONTAINERS_KEY, JSON.stringify(containers));
}

export const artchiveStore = {
  getSession(): Session | null {
    if (typeof window === "undefined") {
      return demoSession;
    }

    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      const user = JSON.parse(raw) as StoredUser;
      return { user };
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  signIn(email: string, name?: string) {
    const session = {
      user: {
        id: `user-${email.toLowerCase()}`,
        email,
        name: name?.trim() || email.split("@")[0]
      }
    } satisfies Session;

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session.user));

    const containers = loadContainers();
    const exists = containers.some((item) => item.userId === session.user.id);
    if (!exists) {
      const seeded = seededContainers.map((item) => {
        const containerId = makeId("container");
        return {
          ...item,
          id: containerId,
          userId: session.user.id,
          assets: item.assets.map((asset) => ({
            ...asset,
            id: makeId("asset"),
            containerId
          }))
        };
      });
      saveContainers([...containers, ...seeded]);
    }

    return session;
  },

  signOut() {
    window.localStorage.removeItem(SESSION_KEY);
  },

  listContainers(userId: string) {
    return loadContainers()
      .filter((item) => item.userId === userId)
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
  },

  createContainer(userId: string, input: CreateContainerInput) {
    const containers = loadContainers();
    const timestamp = new Date().toISOString();
    const container: ArtContainer = {
      id: makeId("container"),
      userId,
      name: input.name,
      description: input.description,
      status: input.status,
      medium: input.medium,
      tags: input.tags,
      createdAt: timestamp,
      updatedAt: timestamp,
      assets: []
    };
    saveContainers([container, ...containers]);
    return container;
  },

  updateContainer(containerId: string, updater: (container: ArtContainer) => ArtContainer) {
    const containers = loadContainers();
    const next = containers.map((container) => {
      if (container.id !== containerId) {
        return container;
      }
      return {
        ...updater(container),
        updatedAt: new Date().toISOString()
      };
    });
    saveContainers(next);
    return next.find((container) => container.id === containerId) ?? null;
  },

  deleteContainer(containerId: string) {
    const containers = loadContainers().filter((container) => container.id !== containerId);
    saveContainers(containers);
  },

  addAsset(input: CreateAssetInput) {
    const asset: Asset = {
      id: makeId("asset"),
      containerId: input.containerId,
      title: input.title,
      type: input.type,
      imageUrl: input.imageUrl,
      note: input.note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      position: {
        x: 32 + Math.floor(Math.random() * 300),
        y: 44 + Math.floor(Math.random() * 220),
        rotation: -6 + Math.floor(Math.random() * 12)
      }
    };

    const updated = this.updateContainer(input.containerId, (container) => ({
      ...container,
      assets: [...container.assets, asset]
    }));

    return updated?.assets.find((item) => item.id === asset.id) ?? asset;
  },

  updateAssetPosition(containerId: string, assetId: string, x: number, y: number) {
    return this.updateContainer(containerId, (container) => ({
      ...container,
      assets: container.assets.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              updatedAt: new Date().toISOString(),
              position: {
                ...asset.position,
                x,
                y
              }
            }
          : asset
      )
    }));
  }
};
