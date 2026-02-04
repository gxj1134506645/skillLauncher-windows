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

      return filtered;
    }

    // Skill 模式：精确或前缀匹配 / Skill mode: exact or prefix match
    const filtered = skills.filter(
      (skill) =>
        skill.name === parsedInput.skillName ||
        skill.name.startsWith(parsedInput.skillName)
    );

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

      // 调试日志：输出完整 skill 信息
      console.log("🎯 执行 skill / Execute skill:", {
        name: skill.name,
        displayName: skill.displayName,
        command: skill.command,
        tag: skill.tag,
        marketplace: skill.marketplace,
        path: skill.path,
      });

      // 准备复制到剪贴板 / Prepare clipboard content
      const skillName = skill.name.startsWith("/") ? skill.name.slice(1) : skill.name;
      const task = parsedInput?.mode === "task" ? parsedInput.task : undefined;

      const content = task ? `/${skillName} ${task}` : `/${skillName}`;

      console.log("📋 准备复制的内容 / Content to copy:", {
        originalName: skill.name,
        extractedName: skillName,
        task,
        finalContent: content,
      });

      // 优先使用 navigator.clipboard / Prefer navigator.clipboard
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(content);
          copied = true;
        } catch {
          copied = false;
        }
      }

      // 回退方案：临时 textarea + execCommand / Fallback: textarea + execCommand
      if (!copied) {
        const textarea = document.createElement("textarea");
        textarea.value = content;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          copied = document.execCommand("copy");
        } catch {
          copied = false;
        } finally {
          document.body.removeChild(textarea);
        }
      }

      if (!copied) {
        throw new Error("复制到剪贴板失败 / Failed to copy to clipboard");
      }

      console.log(`✅ Skill 已复制到剪贴板: ${content}`);

      // 记录使用情况 / Record usage
      onSkillExecuted?.(skillName);
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
