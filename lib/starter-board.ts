"use client";

import { artchiveStore } from "@/lib/storage";
import { readFileAsDataUrl } from "@/lib/utils";

async function fetchSampleAsDataUrl() {
  const response = await fetch("/sample.png");
  if (!response.ok) {
    throw new Error("Could not load the starter board image.");
  }

  const blob = await response.blob();
  const file = new File([blob], "sample.png", { type: blob.type || "image/png" });
  return readFileAsDataUrl(file);
}

export async function createStarterBoardForUser(userId: string) {
  const existingBoards = await artchiveStore.listContainers(userId);
  if (existingBoards.length > 0) {
    return existingBoards[0];
  }

  const mainSketchUrl = await fetchSampleAsDataUrl();
  const board = await artchiveStore.createContainer(userId, {
    name: "Sample board",
    description: "A starter board so new users can immediately see how a finished layout can look.",
    status: "Unfinished",
    medium: "Interior sketch",
    tags: ["Sample"],
    mainSketchTitle: "Sample sketch",
    mainSketchUrl
  });

  await artchiveStore.addAsset({
    containerId: board.id,
    title: "note",
    type: "note",
    note: "this is a note"
  });

  const refreshedBoards = await artchiveStore.listContainers(userId);
  return refreshedBoards.find((item) => item.id === board.id) ?? board;
}
