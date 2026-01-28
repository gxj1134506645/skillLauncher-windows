import { useState, useEffect } from "react";
import type { Skill, SkillConfig } from "../types/skill";

/**
 * Hook for loading and managing skills
 * 用于加载和管理 Skills 的 Hook
 */
export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSkills();
  }, []);

  /**
   * Load skills from configuration file
   * 从配置文件加载 Skills
   */
  async function loadSkills() {
    try {
      setLoading(true);
      setError(null);

      // Try to load skills from local config / 尝试从本地配置加载 Skills
      const loadedSkills = await loadSkillsFromConfig();
      setSkills(loadedSkills);
    } catch (err) {
      console.error("Failed to load skills:", err);
      setError("Failed to load skills configuration");
      // Use default skills as fallback / 使用默认 Skills 作为后备
      setSkills(getDefaultSkills());
    } finally {
      setLoading(false);
    }
  }

  return { skills, loading, error, reload: loadSkills };
}

/**
 * Load skills from YAML configuration file
 * 从 YAML 配置文件加载 Skills
 */
async function loadSkillsFromConfig(): Promise<Skill[]> {
  try {
    // Import Tauri fs plugin / 导入 Tauri fs 插件
    const { readTextFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
    const yaml = await import("yaml");

    // Read config file from app config directory / 从应用配置目录读取配置文件
    const configContent = await readTextFile("skills.yaml", {
      baseDir: BaseDirectory.AppConfig,
    });

    // Parse YAML content / 解析 YAML 内容
    const config = yaml.parse(configContent) as SkillConfig;
    return config.skills || [];
  } catch (err) {
    console.warn("Could not load skills.yaml, using defaults:", err);
    return getDefaultSkills();
  }
}

/**
 * Get default skills for demonstration
 * 获取默认的演示 Skills
 */
function getDefaultSkills(): Skill[] {
  return [
    {
      name: "commit",
      displayName: "Git Commit",
      description: "Create a well-formatted commit with conventional commit messages",
      command: "claude /commit",
      category: "git",
    },
    {
      name: "review-pr",
      displayName: "Review PR",
      description: "Review a pull request and provide feedback",
      command: "claude /review-pr",
      category: "git",
    },
    {
      name: "explain",
      displayName: "Explain Code",
      description: "Explain the selected code or file",
      command: "claude explain",
      category: "code",
    },
    {
      name: "refactor",
      displayName: "Refactor Code",
      description: "Refactor the selected code for better quality",
      command: "claude refactor",
      category: "code",
    },
    {
      name: "test",
      displayName: "Generate Tests",
      description: "Generate unit tests for the selected code",
      command: "claude test",
      category: "testing",
    },
    {
      name: "fix",
      displayName: "Fix Bug",
      description: "Analyze and fix bugs in the code",
      command: "claude fix",
      category: "debugging",
    },
  ];
}
