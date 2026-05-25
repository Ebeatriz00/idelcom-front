/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_APIPERU_CLIENT: string;
  readonly VITE_APIPERU_TOKEN?: string;
  readonly VITE_PUBLIC_BASE_URL: string;
  readonly VITE_DRIVE_API_BASE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
