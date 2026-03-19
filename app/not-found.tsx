import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth-shell">
      <section className="card auth-card">
        <div className="section">
          <p className="eyebrow">Artchive</p>
          <h1 className="title">That page isn’t on the board.</h1>
          <p className="subtitle">
            The route may have moved, or the container you were looking for no longer exists.
          </p>
        </div>
        <div className="inline-actions">
          <Link className="button" href="/">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
