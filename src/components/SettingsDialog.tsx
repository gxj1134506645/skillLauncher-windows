import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Text,
  Checkbox,
} from "@fluentui/react-components";
import { Settings24Regular } from "@fluentui/react-icons";
import type { ShortcutConfig } from "../types/settings";
import { shortcutToString, keyEventToShortcut } from "../types/settings";

interface SettingsDialogProps {
  shortcut: ShortcutConfig;
  onShortcutChange: (shortcut: ShortcutConfig) => void;
}

/**
 * Settings dialog component for customizing shortcut
 * 设置对话框组件，用于自定义快捷键
 */
export function SettingsDialog({
  shortcut,
  onShortcutChange,
}: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [tempShortcut, setTempShortcut] = useState<ShortcutConfig>(shortcut);
  const [recording, setRecording] = useState(false);

  // Reset temp shortcut when dialog opens / 对话框打开时重置临时快捷键
  useEffect(() => {
    if (open) {
      setTempShortcut(shortcut);
      setRecording(false);
    }
  }, [open, shortcut]);

  // Handle key recording / 处理按键录制
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!recording) return;

      e.preventDefault();
      e.stopPropagation();

      const newShortcut = keyEventToShortcut(e.nativeEvent);
      if (newShortcut) {
        setTempShortcut(newShortcut);
        setRecording(false);
      }
    },
    [recording]
  );

  // Save shortcut / 保存快捷键
  const handleSave = () => {
    onShortcutChange(tempShortcut);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          icon={<Settings24Regular />}
          title="Settings"
          style={{ flexShrink: 0 }}
        >
          设置
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Settings / 设置</DialogTitle>
          <DialogContent>
            <div style={{ marginBottom: 16 }}>
              <Text weight="semibold" block style={{ marginBottom: 8 }}>
                Global Shortcut / 全局快捷键
              </Text>
              <Text size={200} style={{ marginBottom: 8, display: "block" }}>
                Click "Record" and press your desired key combination.
                <br />
                点击"录制"然后按下你想要的快捷键组合。
              </Text>

              {/* Current shortcut display / 当前快捷键显示 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <Input
                  value={shortcutToString(tempShortcut)}
                  readOnly
                  style={{ flex: 1 }}
                  onKeyDown={handleKeyDown}
                  placeholder={recording ? "Press keys..." : ""}
                />
                <Button
                  appearance={recording ? "primary" : "secondary"}
                  onClick={() => setRecording(!recording)}
                >
                  {recording ? "Recording... / 录制中..." : "Record / 录制"}
                </Button>
              </div>

              {/* Modifier checkboxes / 修饰键复选框 */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Checkbox
                  label="Ctrl"
                  checked={tempShortcut.ctrl}
                  onChange={(_, data) =>
                    setTempShortcut({ ...tempShortcut, ctrl: !!data.checked })
                  }
                />
                <Checkbox
                  label="Alt"
                  checked={tempShortcut.alt}
                  onChange={(_, data) =>
                    setTempShortcut({ ...tempShortcut, alt: !!data.checked })
                  }
                />
                <Checkbox
                  label="Shift"
                  checked={tempShortcut.shift}
                  onChange={(_, data) =>
                    setTempShortcut({ ...tempShortcut, shift: !!data.checked })
                  }
                />
                <Checkbox
                  label="Win"
                  checked={tempShortcut.win}
                  onChange={(_, data) =>
                    setTempShortcut({ ...tempShortcut, win: !!data.checked })
                  }
                />
              </div>
            </div>

            <Text size={200} style={{ color: "#666" }}>
              Note: After changing the shortcut, you need to restart the app.
              <br />
              注意：更改快捷键后需要重启应用才能生效。
            </Text>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cancel / 取消</Button>
            </DialogTrigger>
            <Button appearance="primary" onClick={handleSave}>
              Save / 保存
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
