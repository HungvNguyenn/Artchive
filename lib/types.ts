export type AssetType = "reference" | "sketch" | "final" | "note";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
};

export type Position = {
  x: number;
  y: number;
  rotation: number;
};

export type Asset = {
  id: string;
  containerId: string;
  title: string;
  type: AssetType;
  isPrimary?: boolean;
  imageUrl?: string;
  note?: string;
  displayWidth: number;
  createdAt: string;
  updatedAt: string;
  position: Position;
};

export type PreviewSettings = {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
};

export type ArtContainer = {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: "Finished" | "Unfinished" | "Archived";
  medium: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  assets: Asset[];
  preview: PreviewSettings;
};

export type Session = {
  user: UserProfile;
};

export type CreateContainerInput = {
  name: string;
  description: string;
  status: ArtContainer["status"];
  medium: string;
  tags: string[];
  mainSketchTitle: string;
  mainSketchUrl: string;
};

export type CreateAssetInput = {
  containerId: string;
  title: string;
  type: AssetType;
  imageUrl?: string;
  note?: string;
};
