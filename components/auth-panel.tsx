"use client";

import { FormEvent, useState } from "react";

type AuthPanelProps = {
  onSubmit: (email: string, name?: string) => void;
};

export function AuthPanel({ onSubmit }: AuthPanelProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    onSubmit(email.trim(), name.trim());
  }

  return (
    <div className="panel auth-card">
      <div className="section">
        <p className="eyebrow">Artchive</p>
        <h1 className="title">Build your creative board, not your clutter.</h1>
        <p className="subtitle">
          Create artwork containers for your references, sketches, final images, and notes in one
          corkboard-style workspace.
        </p>
      </div>
      <div className="section">
        <div className="pill-switch" role="tablist" aria-label="Authentication mode">
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign up
          </button>
          <button
            className={mode === "signin" ? "active" : ""}
            onClick={() => setMode("signin")}
            type="button"
          >
            Log in
          </button>
        </div>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <label className="form-grid">
            <span className="section-title">Display name</span>
            <input
              className="input"
              placeholder="Mira Sol"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        ) : null}
        <label className="form-grid">
          <span className="section-title">Email</span>
          <input
            className="input"
            type="email"
            placeholder="artist@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <button className="button" type="submit">
          {mode === "signup" ? "Create demo workspace" : "Open workspace"}
        </button>
        <p className="helper">
          This MVP uses local persistence in the browser today and is already shaped for Supabase
          auth and storage next.
        </p>
      </form>
    </div>
  );
}
