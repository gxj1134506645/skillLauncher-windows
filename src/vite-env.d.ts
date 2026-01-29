/// <reference types="vite/client" />

// Tauri 全局类型声明 / Tauri global type declarations
declare global {
  interface Window {
    __TAURI__?: {
      __TAURI_INTERNALS__: any;
    };
  }
}

export {};
