import { Asset, AssetType } from "@/lib/types";

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function assetLabel(type: AssetType) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function sortAssets(assets: Asset[]) {
  return [...assets].sort((left, right) => {
    const leftPrimary = left.isPrimary ? 0 : 1;
    const rightPrimary = right.isPrimary ? 0 : 1;
    if (leftPrimary !== rightPrimary) {
      return leftPrimary - rightPrimary;
    }
    const leftWeight = left.type === "note" ? 1 : 0;
    const rightWeight = right.type === "note" ? 1 : 0;
    if (leftWeight !== rightWeight) {
      return leftWeight - rightWeight;
    }
    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
  });
}

export function normalizeTags(raw: string) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}
