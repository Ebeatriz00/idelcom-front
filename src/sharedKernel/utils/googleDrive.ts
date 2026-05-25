// utils/googleDrive.ts
const CLIENT_ID = import.meta.env.VITE_GDRIVE_CLIENT_ID!;

export function getDriveAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (resp: any) =>
        resp?.access_token ? resolve(resp.access_token) : reject("Sin token"),
    });
    client.requestAccessToken();
  });
}

// Busca o crea una carpeta por nombre bajo "parentId"
async function ensureFolder(
  token: string,
  name: string,
  parentId?: string
): Promise<string> {
  const q = encodeURIComponent(
    `'${
      parentId ?? "root"
    }' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const search = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await search.json();
  if (data.files?.length) return data.files[0].id;

  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files?fields=id,name",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentId ? [parentId] : undefined,
      }),
    }
  );
  const created = await res.json();
  return created.id as string;
}

// ✅ Asegura TODA la ruta: ["IDELCOM_FOTOS","USERS","123"]
export async function ensureFolderPath(
  token: string,
  segments: string[]
): Promise<string> {
  let parentId: string | undefined = undefined;
  for (const seg of segments) {
    parentId = await ensureFolder(token, seg, parentId);
  }
  return parentId!; // id de la carpeta final
}

export async function uploadToDrive(
  token: string,
  file: File,
  folderId: string
) {
  const meta = { name: file.name, parents: [folderId] };
  const boundary = "b_" + Date.now();
  const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    meta
  )}\r\n--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`;
  const tail = `\r\n--${boundary}--`;

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: new Blob([head, file, tail]),
    }
  );
  if (!res.ok) throw new Error(`Error upload ${res.status}`);
  return res.json() as Promise<{ id: string }>;
}

export async function makePublic(token: string, fileId: string) {
  const r = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  );
  if (!r.ok) throw new Error(`Permisos ${r.status}`);
}

// URL directa usable en <img>
export const driveImageUrl = (id: string) =>
  `https://lh3.googleusercontent.com/d/${id}`;
