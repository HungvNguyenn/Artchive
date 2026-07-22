"use client";

import { isPaletteColor, joinPaletteColors, PaletteEntry, parsePaletteValue } from "@/lib/palette";

const PALETTE_SLOT_COUNT = 12;

type PaletteEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PaletteEditor({ value, onChange }: PaletteEditorProps) {
  const { entries } = parsePaletteValue(value);
  const slots: PaletteEntry[] = Array.from({ length: PALETTE_SLOT_COUNT }, (_, index) =>
    entries[index] ?? { label: "", color: "" }
  );

  function handleSlotChange(index: number, updates: Partial<PaletteEntry>) {
    const nextColors = [...slots];
    nextColors[index] = {
      ...nextColors[index],
      ...updates
    };
    onChange(joinPaletteColors(nextColors));
  }

  return (
    <div className="palette-editor-shell">
      <div className="palette-editor">
      {slots.map((entry, index) => {
          const trimmedColor = entry.color.trim();
          const canPreview = isPaletteColor(trimmedColor);

          return (
            <label className="palette-slot" key={index}>
              <span
                className={`palette-slot-preview ${canPreview ? "filled" : ""}`}
                style={canPreview ? { background: trimmedColor } : undefined}
            />
              <input
                value={entry.label}
                onChange={(event) => handleSlotChange(index, { label: event.target.value })}
                placeholder="Color name"
                spellCheck={false}
              />
              <input
                value={entry.color}
                onChange={(event) => handleSlotChange(index, { color: event.target.value })}
                placeholder="#hex or rgb()"
                spellCheck={false}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
