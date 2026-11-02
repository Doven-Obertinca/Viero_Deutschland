"use client";
export default function AccountError({ reset }: { reset: () => void }) {
  return (
    <div className="container section">
      <h1>Kundenkonto momentan nicht erreichbar.</h1>
      <p>Bitte versuchen Sie es erneut.</p>
      <button className="button" onClick={reset}>
        Erneut versuchen
      </button>
    </div>
  );
}
