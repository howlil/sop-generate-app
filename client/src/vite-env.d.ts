/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Mock vs real: hanya di data layer gunakan flag ini untuk swap. Default true. */
  readonly VITE_USE_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
