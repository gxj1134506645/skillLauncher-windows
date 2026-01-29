import { useState, useEffect, useCallback } from "react";
import { Input, Spinner, Text } from "@fluentui/react-components";
import { Search24Regular } from "@fluentui/react-icons";
import { SkillList } from "./components/SkillList";
import { SettingsDialog } from "./components/SettingsDialog";
import { useSkills } from "./hooks/useSkills";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { useSettings } from "./hooks/useSettings";
import type { Skill } from "./types/skill";

/**
 * Main application component
 * 主应用组件
 */
function App() {
  // Search query state / 搜索关键词状态
  const [searchQuery, setSearchQuery] = useState("");

  // Load skills / 加载 Skills
  const { skills, loading, error } = useSkills();

  // Load settings / 加载设置
  const { settings, updateShortcut } = useSettings();

  // Filter skills based on search query / 根据搜索关键词过滤 Skills
  const filteredSkills = skills.filter((skill) => {
    const query = searchQuery.toLowerCase();
    return (
      skill.name.toLowerCase().includes(query) ||
      skill.displayName?.toLowerCase().includes(query) ||
      skill.description?.toLowerCase().includes(query)
    );
  });

  // Keyboard navigation / 键盘导航
  const { selectedIndex, setSelectedIndex } = useKeyboardNavigation(
    filteredSkills.length,
    handleExecuteSkill
  );

  // Execute selected skill / 执行选中的 Skill
  async function handleExecuteSkill(index: number) {
    const skill = filteredSkills[index];
    if (skill) {
      await executeSkill(skill);
    }
  }

  // Execute skill command / 执行 Skill 命令
  async function executeSkill(skill: Skill) {
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

      console.log(`Skill ${skill.name} executed:`, output);
    } catch (err) {
      console.error(`Failed to execute skill ${skill.name}:`, err);
    }
  }

  // Handle skill click / 处理 Skill 点击
  const handleSkillClick = useCallback((skill: Skill, index: number) => {
    setSelectedIndex(index);
    executeSkill(skill);
  }, [setSelectedIndex]);

  // Reset selection when search changes / 搜索变化时重置选择
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, setSelectedIndex]);

  return (
    <div className="container">
      {/* Header with search and settings / 顶部栏：搜索和设置 */}
      <div className="search-container" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <Input
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e, data) => setSearchQuery(data.value)}
          contentBefore={<Search24Regular />}
          appearance="outline"
          style={{ flex: 1 }}
          autoFocus
        />
        <SettingsDialog
          shortcut={settings.shortcut}
          onShortcutChange={updateShortcut}
        />
      </div>

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
