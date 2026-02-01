import { useEffect, useCallback, useMemo } from "react";
import { Input, Spinner, Text, Button } from "@fluentui/react-components";
import { Search24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import { SkillList } from "./components/SkillList";
import { SettingsDialog } from "./components/SettingsDialog";
import { useSkills } from "./hooks/useSkills";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { useInputParser } from "./hooks/useInputParser";
import { useSettings } from "./hooks/useSettings";
import { useSkillUsage } from "./hooks/useSkillUsage";
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

  // Load skill usage / 加载 Skill 使用记录
  const { recordUsage, getSortedSkills } = useSkillUsage();

  // 应用使用记录排序 / Apply usage-based sorting
  const sortedSkills = useMemo(() => getSortedSkills(skills), [skills, getSortedSkills]);

  // Input parser / 输入解析器
  const {
    rawInput,
    setRawInput,
    parsedInput,
    filteredSkills,
    executeSkill,
    clearInput,
  } = useInputParser(sortedSkills, recordUsage);

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

  // Execute selected skill / 复制选中的 Skill
  async function handleExecuteSkill(index: number) {
    try {
      // 使用 useInputParser 的 executeSkill 方法
      // 它会复制 skill 名称到剪贴板
      await executeSkill(index);

      // 复制后保持窗口 / Keep window visible after copy
    } catch (err) {
      console.error(`执行 skill 失败 / Failed to execute skill:`, err);
      // 显示错误提示给用户 / Show error to user
      alert(`执行失败: ${err}\n请稍后重试 / Please try again later`);
    }
  }

  // Handle skill click / 处理 Skill 点击
  const handleSkillClick = useCallback((_skill: Skill, index: number) => {
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
        return `复制 ${parsedInput.skillName}`;
      case "task":
        return `复制: ${parsedInput.task}`;
    }
  };

  return (
    <div className="container">
      {/* Header with search and settings / 顶部栏：搜索和设置 */}
      <div className="search-container" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <Input
          placeholder={getInputPlaceholder()}
          value={rawInput}
          onChange={(_e, data) => setRawInput(data.value)}
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
