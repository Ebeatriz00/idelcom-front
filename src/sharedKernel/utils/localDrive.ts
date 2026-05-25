import { SUB_BY_ARCHIVE_TYPE } from "./Upload/options";
import type {
  CommonUploadOpts,
  EnsureResponse,
  LatestResponse,
  ListResponse,
  UploadResponse,
} from "./Upload/response";

const API_BASE = import.meta.env.VITE_DRIVE_API_BASE as string;
const TOKEN = import.meta.env.VITE_DRIVE_API_TOKEN as string;
const PUBLIC_BASE = import.meta.env.VITE_PUBLIC_BASE_URL as string;

// --- Destinos ---
type UploadTargetBySegments = { segments: string[] };
type UploadTargetByPath = { path: string };

type UploadTarget = UploadTargetBySegments | UploadTargetByPath;

function authHeaders() {
  if (!TOKEN) {
    throw new Error(
      "DriveApi no configurado: falta VITE_DRIVE_API_TOKEN. Usa un backend seguro para firmar estas operaciones.",
    );
  }
  return { Authorization: `Bearer ${TOKEN}` };
}

type UploadWithProgressOpts = CommonUploadOpts & {
  onProgress?: (percent: number, loaded: number, total: number) => void;
};

export async function ensureFolderLocalPath(segments: string[]) {
  const res = await fetch(`${API_BASE}/storage/ensure`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ segments }),
  });
  if (!res.ok) throw new Error(`ensure ${res.status}`);
  return (await res.json()) as EnsureResponse;
}

/**
 * Sube archivo:
 *  - { segments: [...] }
 *  - { path: "2025/OPORTUNIDADES/..." }
 *  - { id, code|tipo|number, baseSegments?: ["2025","OPORTUNIDADES"] }
 */
export function parseUploadError(xhr: XMLHttpRequest): Error {
  const status = xhr.status;
  const raw = xhr.responseText || "";
  let msg = `Error al subir archivo (${status})`;

  try {
    const j = JSON.parse(raw) as any;
    msg = j?.message || j?.error || msg;
  } catch {
    // si no es JSON, intenta algo mínimo
    if (raw.trim()) msg = raw;
  }

  // Mensajes friendly por status
  if (status === 401) msg = "Tu sesión venció. Vuelve a iniciar sesión.";
  if (status === 403) msg = "No tienes permisos para subir archivos.";
  if (status === 413) msg = "El archivo es demasiado grande.";
  if (status >= 500 && msg.includes("Segmento inválido"))
    msg =
      "Nombre de archivo inválido. Evita usar '..' (doble punto) en el nombre.";

  return new Error(msg);
}

export function uploadToLocalDrives(
  file: File,
  target: UploadTarget,
  opts?: UploadWithProgressOpts,
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);

    if ("segments" in target) {
      target.segments.forEach((s) => fd.append("segments[]", s));
    } else if ("path" in target) {
      fd.append("path", target.path);
    } else {
      reject(new Error("upload: target inválido"));
      return;
    }

    if (opts?.prefix) fd.append("prefix", opts.prefix);
    if (opts?.strategy) fd.append("strategy", opts.strategy);
    if (opts?.name) fd.append("name", opts.name);
    if (opts?.dedup) fd.append("dedup", opts.dedup);
    if (opts?.onDuplicate) fd.append("onDuplicate", opts.onDuplicate);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/storage/upload`);

    const headers = authHeaders();
    Object.entries(headers).forEach(([k, v]) =>
      xhr.setRequestHeader(k, String(v)),
    );

    xhr.upload.onprogress = (evt) => {
      if (!opts?.onProgress) return;
      if (evt.lengthComputable) {
        const percent = (evt.loaded / evt.total) * 100;
        opts.onProgress(Math.round(percent), evt.loaded, evt.total);
      }
    };

    xhr.onerror = () => {
      reject(new Error("upload failed"));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText) as UploadResponse;
          resolve(json);
        } catch {
          reject(new Error("Respuesta del servidor inválida."));
        }
      } else {
        reject(parseUploadError(xhr));
      }
    };

    xhr.send(fd);
  });
}
export function uploadToLocalDrive(
  file: File,
  target: UploadTarget,
  opts?: UploadWithProgressOpts,
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);

    if ("segments" in target) {
      target.segments.forEach((s) => fd.append("segments[]", s));
    } else if ("path" in target) {
      fd.append("path", target.path);
    } else {
      reject(new Error("upload: target inválido"));
      return;
    }

    if (opts?.prefix) fd.append("prefix", opts.prefix);
    if (opts?.strategy) fd.append("strategy", opts.strategy);
    if (opts?.name) fd.append("name", opts.name);
    if (opts?.dedup) fd.append("dedup", opts.dedup);
    if (opts?.onDuplicate) fd.append("onDuplicate", opts.onDuplicate);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/storage/upload`);

    const headers = authHeaders();
    Object.entries(headers).forEach(([k, v]) =>
      xhr.setRequestHeader(k, String(v)),
    );

    xhr.upload.onprogress = (evt) => {
      if (!opts?.onProgress) return;
      if (evt.lengthComputable) {
        const percent = (evt.loaded / evt.total) * 100;
        opts.onProgress(Math.round(percent), evt.loaded, evt.total);
      }
    };

    xhr.onerror = () => reject(new Error("upload failed"));

    xhr.onload = () => {
      const status = xhr.status;
      const ct = xhr.getResponseHeader("content-type") ?? "";
      const raw = xhr.responseText ?? "";

      const debug = () => {
        console.error("[DriveApi upload] status:", status);
        console.error("[DriveApi upload] content-type:", ct);
        console.error(
          "[DriveApi upload] response (first 1200):",
          raw.slice(0, 1200),
        );
      };

      if (status < 200 || status >= 300) {
        reject(parseUploadError(xhr));
        return;
      }

      if (!raw.trim()) {
        debug();
        reject(new Error("Respuesta del servidor inválida (vacía)."));
        return;
      }

      if (raw.trim().startsWith("<")) {
        debug();
        reject(
          new Error("El servidor devolvió HTML, no JSON (revisa PHP/Apache)."),
        );
        return;
      }

      try {
        resolve(JSON.parse(raw) as UploadResponse);
        return;
      } catch {
        const idxObj = raw.indexOf("{");
        const idxArr = raw.indexOf("[");
        const idx =
          idxObj === -1
            ? idxArr
            : idxArr === -1
              ? idxObj
              : Math.min(idxObj, idxArr);

        if (idx > 0) {
          const trimmed = raw.slice(idx);
          try {
            resolve(JSON.parse(trimmed) as UploadResponse);
            return;
          } catch {
            debug();
            reject(
              new Error("Respuesta del servidor inválida (JSON corrupto)."),
            );
            return;
          }
        }

        debug();
        reject(new Error("Respuesta del servidor inválida (no es JSON)."));
      }
    };

    xhr.send(fd);
  });
}

export function safeFileName(original: string) {
  let name = original.split(/[/\\]/).pop() ?? "file";

  while (name.includes("..")) name = name.replace("..", ".");

  name = name.replace(/[<>:"|?*\x00-\x1F]/g, "_");

  if (!name.trim()) name = "file";

  return name;
}

export function uploadByArchiveType(
  file: File,
  id: string,
  archiveType: string,
  opts?: UploadWithProgressOpts & { baseSegments?: string[] },
) {
  const base = opts?.baseSegments ?? [];
  
  const extraSegments = SUB_BY_ARCHIVE_TYPE[archiveType] ?? archiveType.split("/");
  const segments = [...base, id, ...extraSegments];

  const cleanName = safeFileName(file.name);
  const sanitizedFile = new File([file], cleanName, { type: file.type });

  return uploadToLocalDrive(sanitizedFile, { segments }, opts);
}

export async function listLocalFiles(path: string) {
  const res = await fetch(
    `${API_BASE}/storage/list?path=${encodeURIComponent(path)}`,
    {
      headers: authHeaders(),
    },
  );
  if (!res.ok) throw new Error(`list ${res.status}`);
  return (await res.json()) as ListResponse;
}

export async function getLatestFile(path: string, prefix: string) {
  const url = `${API_BASE}/storage/latest?path=${encodeURIComponent(
    path,
  )}&prefix=${encodeURIComponent(prefix)}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`latest ${res.status}`);
  return (await res.json()) as LatestResponse;
}

export async function deleteLocalFile(path: string) {
  const res = await fetch(
    `${API_BASE}/storage/file?path=${encodeURIComponent(path)}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`delete ${res.status} ${res.statusText} – ${body}`);
  }
  return res.json();
}

export async function downloadLocalFile(path: string, fileName = "archivo") {
  const res = await fetch(
    `${API_BASE}/storage/file?path=${encodeURIComponent(path)}`,
    {
      headers: authHeaders(),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`download ${res.status} ${res.statusText} - ${body}`);
  }

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  const sourceName = fileName.includes(".")
    ? fileName
    : path.split(/[\\/]/).pop() || fileName;

  link.href = blobUrl;
  link.download = safeFileName(sourceName);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  }, 100);
}

export function localFileUrl(relativePath: string) {
  return `${PUBLIC_BASE.replace(/\/$/, "")}/${relativePath.replace(
    /^\/+/,
    "",
  )}`;
}
export function toRelativePathFromPublic(url?: string) {
  if (!url) return null;

  const PUBLIC_BASE = (import.meta.env.VITE_PUBLIC_BASE_URL as string) || "";

  try {
    const u = new URL(url);
    const p = PUBLIC_BASE ? new URL(PUBLIC_BASE) : null;

    if (p && u.origin === p.origin) {
      const basePath = p.pathname.replace(/\/+$/, "");
      let rel = u.pathname;

      if (basePath && rel.startsWith(basePath)) {
        rel = rel.slice(basePath.length);
      }
      return rel.replace(/^\/+/, "");
    }
    return url.replace(PUBLIC_BASE, "").replace(/^\/+/, "");
  } catch {
    return url.replace(PUBLIC_BASE, "").replace(/^\/+/, "");
  }
}
