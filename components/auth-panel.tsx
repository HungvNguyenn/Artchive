"use client";

import { FormEvent, useState } from "react";

type AuthMode = "signin" | "signup";

type AuthPanelProps = {
  onSubmit: (input: {
    mode: AuthMode;
    email: string;
    password: string;
    name?: string;
  }) => Promise<{ message?: string } | void>;
};

export function AuthPanel({ onSubmit }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      const result = await onSubmit({
        mode,
        email: email.trim(),
        password,
        name: name.trim()
      });

      if (result?.message) {
        setFeedback(result.message);
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="panel auth-card">
      <div className="section">
        <h1 className="title">Artchive</h1>
      </div>
      <div className="section auth-toggle-row">
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
        <label className="form-grid">
          <span className="section-title">Password</span>
          <input
            className="input"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
        </label>
        <button className="button" type="submit">
          {isSubmitting ? "Working..." : mode === "signup" ? "Create account" : "Log in"}
        </button>
        {feedback ? <p className="helper">{feedback}</p> : null}
      </form>
    </div>
  );
}
