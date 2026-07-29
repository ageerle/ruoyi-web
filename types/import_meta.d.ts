/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEB_TITLE: string;
  readonly VITE_WEB_TITLE_EN: string;
  readonly VITE_WEB_ENV: string;
  readonly VITE_WEB_BASE_API: string;
  readonly VITE_BUILD_COMPRESS: string;
  readonly VITE_API_URL: string;
  readonly VITE_CLIENT_ID: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
