const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_COLOR_PATTERN =
  /^rgba?\(\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i;

export type PaletteEntry = {
  color: string;
  label: string;
};

export function isPaletteColor(value: string) {
  const color = value.trim();
  return HEX_COLOR_PATTERN.test(color) || RGB_COLOR_PATTERN.test(color);
}

export function parsePaletteColors(value?: string) {
  return parsePaletteValue(value)
    .entries.map((entry) => entry.color)
    .filter(isPaletteColor);
}

export function parsePaletteValue(value?: string): { entries: PaletteEntry[] } {
  const entries = splitPaletteInput(value);

  return {
    entries: entries.filter((entry) => !entry.startsWith("layout:")).map(parsePaletteEntry)
  };
}

export function normalizePaletteInput(value: string) {
  return joinPaletteColors(splitPaletteInput(value));
}

export function splitPaletteInput(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n|;/)
    .map((color) => color.trim())
    .filter(Boolean);
}

export function parsePaletteEntry(value: string): PaletteEntry {
  const [firstPart, ...restParts] = value.split("|");
  if (restParts.length === 0) {
    const color = firstPart.trim();
    return {
      color,
      label: color
    };
  }

  const label = firstPart.trim();
  const color = restParts.join("|").trim();
  return {
    color,
    label: label || color
  };
}

export function joinPaletteColors(colors: Array<string | PaletteEntry>) {
  const normalizedColors = colors
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      const color = item.color.trim();
      const label = item.label.trim();
      if (label || color) {
        return `${label}|${color}`;
      }
      return "";
    })
    .filter(Boolean);

  return normalizedColors.join("\n");
}
