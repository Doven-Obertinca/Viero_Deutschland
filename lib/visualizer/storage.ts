import type { Project } from "./model";

// The active project survives storefront navigation in this browser tab.
// IndexedDB is only written by the explicit save control.
let active: Project | undefined;
export function activeProject() {
  return active;
}
export function rememberProject(project: Project | undefined) {
  active = project;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("viero-studio", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("projects");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function access(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest,
) {
  const db = await openDatabase();
  try {
    return await new Promise<unknown>((resolve, reject) => {
      const transaction = db.transaction("projects", mode);
      const request = operation(transaction.objectStore("projects"));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export async function restoreProject() {
  const project = (await access("readonly", (store) => store.get("room"))) as
    Project | undefined;
  return project?.version === 1 ? project : undefined;
}
export async function saveProject(project: Project) {
  await access("readwrite", (store) => store.put(project, "room"));
}
export async function deleteProject() {
  await access("readwrite", (store) => store.delete("room"));
}
