"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container section">
      <h1>Die Seite ist momentan nicht verfügbar.</h1>
      <p>Bitte versuchen Sie es erneut.</p>
      <button className="button" onClick={reset}>
        Erneut versuchen
      </button>
    </div>
  );
}
