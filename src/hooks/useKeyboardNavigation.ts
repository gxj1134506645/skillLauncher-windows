import { useState, useEffect, useCallback } from "react";

/**
 * Hook for keyboard navigation in skill list
 * 用于 Skill 列表键盘导航的 Hook
 */
export function useKeyboardNavigation(
  itemCount: number,
  onExecute: (index: number) => void
) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handle keyboard events / 处理键盘事件
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1));
          break;
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0));
          break;
        case "Enter":
          event.preventDefault();
          if (itemCount > 0) {
            onExecute(selectedIndex);
          }
          break;
        case "Escape":
          // Close window on Escape / 按 Escape 关闭窗口
          event.preventDefault();
          hideWindow();
          break;
      }
    },
    [itemCount, selectedIndex, onExecute]
  );

  // Add keyboard event listener / 添加键盘事件监听器
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Ensure selected index is within bounds / 确保选中索引在范围内
  useEffect(() => {
    if (selectedIndex >= itemCount && itemCount > 0) {
      setSelectedIndex(itemCount - 1);
    }
  }, [itemCount, selectedIndex]);

  return { selectedIndex, setSelectedIndex };
}

/**
 * Hide the launcher window
 * 隐藏启动器窗口
 */
async function hideWindow() {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const window = getCurrentWindow();
    await window.hide();
  } catch (err) {
    console.error("Failed to hide window:", err);
  }
}
