import { useState, useEffect, useCallback } from "react";
import { Input, Spinner, Text, Button } from "@fluentui/react-components";
import { Search24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import { SkillList } from "./components/SkillList";
import { SettingsDialog } from "./components/SettingsDialog";
import { useSkills } from "./hooks/useSkills";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { useInputParser } from "./hooks/useInputParser";
import { useSettings } from "./hooks/useSettings";
import type { Skill } from "./types/skill";

/**
 * Main application component
 * 主应用组件
 */
function App() {
  // Load skills / 加载 Skills
  const { skills, loading, error } = useSkills();

  // Load settings / 加载设置
  const { settings, updateShortcut } = useSettings();

  // Input parser / 输入解析器
  const {
    rawInput,
    setRawInput,
    parsedInput,
    filteredSkills,
    selectedSkill,
    executeSkill,
    clearInput,
  } = useInputParser(skills);

  // Tab 自动补全功能 / Tab auto-complete feature
  // 注意：必须在 useKeyboardNavigation 之前定义 / Must be defined before useKeyboardNavigation
  const handleTabComplete = useCallback(() => {
    if (filteredSkills.length > 0) {
      const skill = filteredSkills[0]; // 始终使用第一个匹配项 / Always use first match
      if (skill) {
        // 自动补全为 /skill-name 格式 / Auto-complete to /skill-name format
        setRawInput(`/${skill.name}`);
      }
    }
  }, [filteredSkills, setRawInput]);

  // Keyboard navigation / 键盘导航
  const { selectedIndex, setSelectedIndex } = useKeyboardNavigation(
    filteredSkills.length,
    handleExecuteSkill,
    handleTabComplete // Tab 自动补全 / Tab auto-complete
  );

  // Ensure Tauri API is ready before executing / 确保 Tauri API 就绪后再执行
  async function ensureTauriReady(): Promise<void> {
    let retries = 0;
    const maxRetries = 50; // 增加到 5 秒 / Increase to 5 seconds

    while (retries < maxRetries) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("health_check");
        console.log("✅ Tauri API 已就绪 / Tauri API ready");
        return; // 成功则返回 / Success, return
      } catch (e) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries++;
      }
    }

    throw new Error("Tauri API 未就绪 / Tauri API not ready");
  }

  // Execute selected skill / 执行选中的 Skill
  async function handleExecuteSkill(index: number) {
    const skill = filteredSkills[index];
    if (skill) {
      try {
        // 等待 Tauri API 就绪 / Wait for Tauri API to be ready
        await ensureTauriReady();

        // 如果是任务模式，传递任务参数 / If task mode, pass task parameter
        if (parsedInput?.mode === "task" && parsedInput.task) {
          await executeSkillWithTask(skill, parsedInput.task);
        } else {
          await executeSkillDirectly(skill);
        }
        // 执行后清空输入 / Clear input after execution
        clearInput();
      } catch (err) {
        console.error(`执行 skill 失败 / Failed to execute skill:`, err);
        // 显示错误提示给用户 / Show error to user
        alert(`执行失败: ${err}\n请稍后重试 / Please try again later`);
      }
    }
  }

  // Execute skill with task / 执行 Skill 并传递任务
  async function executeSkillWithTask(skill: Skill, task: string) {
    if (!skill.command) {
      console.warn(`Skill ${skill.name} has no command defined`);
      return;
    }

    try {
      // Import shell plugin dynamically / 动态导入 shell 插件
      const { Command } = await import("@tauri-apps/plugin-shell");

      // 构建完整命令：将任务作为参数传递 / Build full command: pass task as parameter
      const fullCommand = `${skill.command} "${task}"`;

      // Execute the command / 执行命令
      const command = Command.create("cmd", ["/c", fullCommand]);
      const output = await command.execute();

      console.log(`✅ Skill ${skill.name} executed with task:`, output);
    } catch (err) {
      console.error(`❌ Failed to execute skill ${skill.name}:`, err);
      throw err;
    }
  }

  // Execute skill directly (without task) / 直接执行 Skill（无任务）
  async function executeSkillDirectly(skill: Skill) {
    if (!skill.command) {
      console.warn(`Skill ${skill.name} has no command defined`);
      return;
    }

    try {
      // Import shell plugin dynamically / 动态导入 shell 插件
      const { Command } = await import("@tauri-apps/plugin-shell");

      // Execute the command / 执行命令
      const command = Command.create("cmd", ["/c", skill.command]);
      const output = await command.execute();

      console.log(`✅ Skill ${skill.name} executed:`, output);
    } catch (err) {
      console.error(`❌ Failed to execute skill ${skill.name}:`, err);
      throw err;
    }
  }

  // Handle skill click / 处理 Skill 点击
  const handleSkillClick = useCallback((skill: Skill, index: number) => {
    setSelectedIndex(index);
    handleExecuteSkill(index);
  }, [setSelectedIndex, handleExecuteSkill]);

  // Reset selection when search changes / 搜索变化时重置选择
  useEffect(() => {
    setSelectedIndex(0);
  }, [rawInput, setSelectedIndex]);

  // Get input placeholder based on mode / 根据模式获取输入框提示
  const getInputPlaceholder = () => {
    if (!parsedInput) {
      return "搜索 skills... / Search skills...";
    }
    switch (parsedInput.mode) {
      case "search":
        return "搜索 skills... / Search skills...";
      case "direct":
        return `执行 /${parsedInput.skillName}`;
      case "task":
        return `任务: ${parsedInput.task}`;
    }
  };

  return (
    <div className="container">
      {/* Header with search and settings / 顶部栏：搜索和设置 */}
      <div className="search-container" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <Input
          placeholder={getInputPlaceholder()}
          value={rawInput}
          onChange={(e, data) => setRawInput(data.value)}
          contentBefore={<Search24Regular />}
          contentAfter={
            rawInput ? (
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                onClick={() => clearInput()}
                size="small"
                style={{ minWidth: "24px", padding: "0 4px" }}
              />
            ) : undefined
          }
          appearance="outline"
          style={{ flex: 1 }}
          autoFocus
        />
        <SettingsDialog
          shortcut={settings.shortcut}
          onShortcutChange={updateShortcut}
        />
      </div>

      {/* Current mode indicator / 当前模式指示器 */}
      {parsedInput && parsedInput.mode !== "search" && (
        <div style={{ padding: "8px 12px", background: "#f0f0f0", borderRadius: "4px", fontSize: "12px" }}>
          <Text size={200}>
            {parsedInput.mode === "direct" ? "🎯 直接模式 / Direct Mode" : "📝 任务模式 / Task Mode"}
            {parsedInput.task && `: "${parsedInput.task}"`}
          </Text>
        </div>
      )}

      {/* Skill list / Skill 列表 */}
      {loading ? (
        <div className="loading">
          <Spinner size="medium" label="Loading skills..." />
        </div>
      ) : error ? (
        <div className="empty-state">
          <Text>{error}</Text>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="empty-state">
          <Text>No skills found</Text>
        </div>
      ) : (
        <SkillList
          skills={filteredSkills}
          selectedIndex={selectedIndex}
          onSkillClick={handleSkillClick}
        />
      )}
    </div>
  );
}

export default App;
