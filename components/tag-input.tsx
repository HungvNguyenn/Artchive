"use client";

import { KeyboardEvent, useState } from "react";

type TagInputProps = {
  tags: string[];
  placeholder?: string;
  onChange: (tags: string[]) => void;
};

export function TagInput({ tags, placeholder = "Type a tag and press Enter", onChange }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(value: string) {
    const next = value.trim();
    if (!next) {
      return;
    }
    if (tags.some((tag) => tag.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...tags, next]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag(draft);
    }

    if (event.key === "Backspace" && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(tagToRemove: string) {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  }

  return (
    <div className="tag-input-shell">
      <div className="tag-row">
        {tags.map((tag) => (
          <button
            key={tag}
            className="tag-chip"
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove ${tag}`}
          >
            <span>{tag}</span>
            <span className="tag-chip-x">x</span>
          </button>
        ))}
      </div>
      <input
        className="input"
        placeholder={placeholder}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
