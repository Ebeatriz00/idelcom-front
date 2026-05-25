export type Strategy = "timestamp" | "overwrite" | "uuid" | "same";
export type Dedup = "none" | "name" | "hash";
export type OnDuplicate = "reject" | "overwrite" | "skip" | "return";

export type EnsureResponse = { relativePath: string; url: string };
export type UploadResponse = {
  fileName: string;
  relativePath: string;
  url: string;
  contentType: string;
  size: number;
  uploadedAt: string;
};
export type ListResponse = {
  items: Array<{
    name: string;
    relativePath: string;
    isDirectory: boolean;
    size: number;
    modified: string;
    url: string;
  }>;
};
export type LatestResponse =
  | { exists: false }
  | {
      exists: true;
      fileName: string;
      relativePath: string;
      url: string;
      contentType: string;
      size: number;
      modified: string;
    };

// --- Opciones comunes ---
export type CommonUploadOpts = {
  prefix?: string;
  strategy?: Strategy;
  name?: string;
  dedup?: Dedup;
  onDuplicate?: OnDuplicate;
};
