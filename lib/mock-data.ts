import { ArtContainer, Session } from "@/lib/types";

const now = new Date().toISOString();

export const demoSession: Session = {
  user: {
    id: "user-demo",
    email: "artist@artchive.app",
    name: "Mira Sol"
  }
};

export const seededContainers: ArtContainer[] = [
  {
    id: "container-ember",
    userId: demoSession.user.id,
    name: "Ember Portrait",
    description: "A warm cinematic portrait study with layered lighting references.",
    status: "Unfinished",
    medium: "Digital painting",
    tags: ["Portrait", "Color", "WIP"],
    createdAt: now,
    updatedAt: now,
    preview: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0 },
    assets: [
      {
        id: "asset-ref-1",
        containerId: "container-ember",
        title: "Lighting Reference",
        type: "reference",
        imageUrl:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
        createdAt: now,
        updatedAt: now,
        position: { x: 36, y: 48, rotation: -4 }
      },
      {
        id: "asset-sketch-1",
        containerId: "container-ember",
        title: "Gesture Sketch",
        type: "sketch",
        isPrimary: true,
        imageUrl:
          "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80",
        createdAt: now,
        updatedAt: now,
        position: { x: 250, y: 54, rotation: 2 }
      },
      {
        id: "asset-note-1",
        containerId: "container-ember",
        title: "Intent Note",
        type: "note",
        note: "Push the rim light warmer than reality and keep the eye line soft so the mood stays reflective.",
        createdAt: now,
        updatedAt: now,
        position: { x: 142, y: 302, rotation: -2 }
      }
    ]
  },
  {
    id: "container-bloom",
    userId: demoSession.user.id,
    name: "Bloom Environment",
    description: "Botanical concept art exploration for a greenhouse scene.",
    status: "Finished",
    medium: "Concept art",
    tags: ["Environment", "Finished", "Concept Art"],
    createdAt: now,
    updatedAt: now,
    preview: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0 },
    assets: [
      {
        id: "asset-final-1",
        containerId: "container-bloom",
        title: "Final Render",
        type: "final",
        isPrimary: true,
        imageUrl:
          "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80",
        createdAt: now,
        updatedAt: now,
        position: { x: 224, y: 56, rotation: -1 }
      },
      {
        id: "asset-note-2",
        containerId: "container-bloom",
        title: "Palette Note",
        type: "note",
        note: "Keep the focal flower cluster high-saturation. Desaturate the glass and frame elements to support depth.",
        createdAt: now,
        updatedAt: now,
        position: { x: 372, y: 188, rotation: 3 }
      }
    ]
  }
];
