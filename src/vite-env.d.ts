/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USE_HTTPONLY_COOKIE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
