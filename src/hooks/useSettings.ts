import { useState, useEffect, useCallback } from "react";
import type { AppSettings, ShortcutConfig } from "../types/settings";
import { DEFAULT_SETTINGS } from "../types/settings";

// Settings file path / 设置文件路径
const SETTINGS_KEY = "skill-launcher-settings";

/**
 * Hook for managing application settings
 * 管理应用设置的 Hook
 */
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings from localStorage / 从 localStorage 加载设置
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppSettings;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save settings to localStorage / 保存设置到 localStorage
  const saveSettings = useCallback((newSettings: AppSettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  }, []);

  // Update shortcut / 更新快捷键
  const updateShortcut = useCallback(
    (shortcut: ShortcutConfig) => {
      const newSettings = { ...settings, shortcut };
      saveSettings(newSettings);
      // Notify Rust backend to update shortcut / 通知 Rust 后端更新快捷键
      notifyShortcutChange(shortcut);
    },
    [settings, saveSettings]
  );

  return {
    settings,
    loading,
    saveSettings,
    updateShortcut,
  };
}

// Notify Rust backend about shortcut change / 通知 Rust 后端快捷键变更
async function notifyShortcutChange(shortcut: ShortcutConfig) {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("update_shortcut", { shortcut });
  } catch (err) {
    console.error("Failed to update shortcut in backend:", err);
  }
}
