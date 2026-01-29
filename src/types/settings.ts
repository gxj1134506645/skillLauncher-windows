/**
 * Application settings types
 * 应用设置类型定义
 */

// Shortcut key configuration / 快捷键配置
export interface ShortcutConfig {
  // Modifier keys / 修饰键
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  win?: boolean;
  // Main key / 主键
  key: string;
}

// Application settings / 应用设置
export interface AppSettings {
  // Global shortcut to toggle window / 切换窗口的全局快捷键
  shortcut: ShortcutConfig;
  // Theme (light/dark/system) / 主题
  theme?: "light" | "dark" | "system";
}

// Default settings / 默认设置
export const DEFAULT_SETTINGS: AppSettings = {
  shortcut: {
    ctrl: true,
    alt: false,
    shift: false,
    win: false,
    key: "Space",
  },
  theme: "system",
};

// Convert shortcut config to display string / 将快捷键配置转换为显示字符串
export function shortcutToString(shortcut: ShortcutConfig): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.alt) parts.push("Alt");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.win) parts.push("Win");
  parts.push(shortcut.key);
  return parts.join("+");
}

// Parse key event to shortcut config / 将键盘事件解析为快捷键配置
export function keyEventToShortcut(e: KeyboardEvent): ShortcutConfig | null {
  // Ignore modifier-only key presses / 忽略仅修饰键的按键
  if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
    return null;
  }

  return {
    ctrl: e.ctrlKey,
    alt: e.altKey,
    shift: e.shiftKey,
    win: e.metaKey,
    key: e.code,
  };
}
