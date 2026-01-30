import { useState, useMemo, useCallback } from "react";
import type { Skill } from "../types/skill";

/**
 * 输入模式类型 / Input mode types
 */
export type InputMode = "search" | "direct" | "task";

/**
 * 解析后的输入结果
 * Parsed input result
 */
export interface ParsedInput {
  mode: InputMode;
  skillName: string;
  task?: string;
}

/**
 * 输入解析器 Hook
 * Input parser hook - supports search, direct, and task modes
 *
 * @param skills - 可用的 skills 列表 / Available skills list
 * @param onSkillExecuted - Skill 执行后的回调函数 / Callback after skill execution
 */
export function useInputParser(
  skills: Skill[],
  onSkillExecuted?: (skillName: string) => void
) {
  // 原始输入 / Raw input
  const [rawInput, setRawInput] = useState("");

  /**
   * 解析输入内容
   * Parse input content
   *
   * 支持格式 / Supported formats:
   * - "commit" -> 搜索模式 / Search mode
   * - "/commit" -> 直接模式 / Direct mode
   * - "/commit fix bug" -> 任务模式 / Task mode
   */
  const parsedInput: ParsedInput | null = useMemo(() => {
    const trimmed = rawInput.trim();

    // 空输入 / Empty input
    if (!trimmed) {
      return { mode: "search", skillName: "" };
    }

    // 检测是否以 / 开头（skill 调用） / Check if starts with / (skill invocation)
    if (!trimmed.startsWith("/")) {
      // 搜索模式 / Search mode
      return { mode: "search", skillName: "" };
    }

    // 提取 skill name 和任务 / Extract skill name and task
    const parts = trimmed.slice(1).split(/\s+/); // 移除 / 并按空格分割 / Remove / and split by space
    const skillName = parts[0];
    const task = parts.slice(1).join(" ");

    return {
      mode: task ? "task" : ("direct" as InputMode),
      skillName,
      task: task || undefined,
    };
  }, [rawInput]);

  /**
   * 根据输入模式过滤 skills
   * Filter skills based on input mode
   */
  const filteredSkills = useMemo(() => {
    if (!parsedInput) {
      return skills;
    }

    // 搜索模式：模糊匹配 / Search mode: fuzzy match
    if (parsedInput.mode === "search") {
      const query = rawInput.toLowerCase().trim();
      console.log("🔍 搜索模式 / Search mode:", { query, rawInput, totalSkills: skills.length });

      if (!query) {
        return skills;
      }

      // 只搜索 name 和 displayName，不搜索 description（避免噪音结果）
      // Only search name and displayName, not description (to avoid noise)
      const filtered = skills.filter(
        (skill) =>
          skill.name.toLowerCase().includes(query) ||
          skill.displayName?.toLowerCase().includes(query)
      );

      console.log("✅ 搜索结果 / Search results:", filtered.length, "skills");
      return filtered;
    }

    // Skill 模式：精确或前缀匹配 / Skill mode: exact or prefix match
    console.log("🎯 Skill 模式 / Skill mode:", { skillName: parsedInput.skillName, mode: parsedInput.mode });

    const filtered = skills.filter(
      (skill) =>
        skill.name === parsedInput.skillName ||
        skill.name.startsWith(parsedInput.skillName)
    );

    console.log("✅ Skill 模式结果 / Skill mode results:", filtered.length, "skills");
    return filtered;
  }, [skills, rawInput, parsedInput]);

  /**
   * 获取当前选中的 skill（第一个匹配项）
   * Get currently selected skill (first match)
   */
  const selectedSkill = useMemo(() => {
    return filteredSkills.length > 0 ? filteredSkills[0] : null;
  }, [filteredSkills]);

  /**
   * 执行选中的 skill
   * Execute selected skill
   */
  const executeSkill = useCallback(
    async (skillIndex?: number) => {
      const index = skillIndex ?? 0;
      const skill = filteredSkills[index];

      if (!skill) {
        console.warn("没有选中的 skill / No skill selected");
        return;
      }

      // 准备执行参数 / Prepare execution parameters
      const skillName = skill.name.startsWith("/") ? skill.name.slice(1) : skill.name;
      const task = parsedInput?.mode === "task" ? parsedInput.task : undefined;

      console.log(`发送 skill 到 CLI / Send skill to CLI: /${skillName}`, task ? `任务 / Task: ${task}` : "");

      try {
        // 构建完整命令 / Build full command
        let fullCommand = `/${skillName}`;
        if (task) {
          fullCommand = `/${skillName} ${task}`;
        }

        // 导入 Tauri API / Import Tauri API
        const { invoke } = await import("@tauri-apps/api/core");

        // 发送命令到 Claude Code CLI / Send command to Claude Code CLI
        await invoke("send_to_claude_cli", { command: fullCommand });

        console.log(`✅ Skill ${skillName} 已发送到 CLI`);

        // 记录使用情况 / Record usage
        onSkillExecuted?.(skillName);
      } catch (err) {
        console.error(`❌ 发送 skill ${skillName} 失败 / Failed to send skill:`, err);
        // 如果新命令失败，回退到旧的执行方式
        // If new command fails, fallback to old execution method
        console.log("尝试回退到直接执行模式 / Try fallback to direct execution");
        try {
          const { Command } = await import("@tauri-apps/plugin-shell");
          let commandStr = skill.command || `claude /${skillName}`;
          if (task) {
            commandStr = `${skill.command || `claude /${skillName}`} "${task}"`;
          }
          const command = Command.create("cmd", ["/c", commandStr]);
          await command.execute();
          console.log(`✅ Skill ${skillName} 直接执行成功`);
          onSkillExecuted?.(skillName);
        } catch (fallbackErr) {
          console.error(`❌ 回退执行也失败 / Fallback execution also failed:`, fallbackErr);
        }
      }
    },
    [filteredSkills, parsedInput, onSkillExecuted]
  );

  /**
   * 清空输入
   * Clear input
   */
  const clearInput = useCallback(() => {
    setRawInput("");
  }, []);

  return {
    // 状态 / State
    rawInput,
    setRawInput,
    parsedInput,
    filteredSkills,
    selectedSkill,

    // 操作 / Actions
    executeSkill,
    clearInput,
  };
}
