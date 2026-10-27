import { publicError } from "@/lib/shopware/client";
export function CommerceState({ error }: { error: unknown }) {
  return (
    <div className="notice" role="status">
      <h2>Katalog momentan nicht verfügbar</h2>
      <p>{publicError(error).message}</p>
    </div>
  );
}
