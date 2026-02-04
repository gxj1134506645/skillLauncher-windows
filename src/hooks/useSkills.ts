import { useState, useEffect } from "react";
import type { Skill } from "../types/skill";
import { SkillScanner } from "../services/skillScanner";

/**
 * Hook for loading and managing skills
 * 用于加载和管理 Skills 的 Hook
 */
export function useSkills() {
  // 初始化时就使用默认技能，避免空状态 / Initialize with default skills to avoid empty state
  const [skills, setSkills] = useState<Skill[]>(getDefaultSkills);
  // 初始加载状态设为 false，因为已有默认技能可显示 / Initialize loading as false since we have default skills
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSkills = async () => {
      try {
        console.log("🔄 loadSkills 开始 / loadSkills started");

        // 等待 Tauri 完全初始化 / Wait for Tauri to fully initialize
        let retries = 0;
        const maxRetries = 30;

        while (retries < maxRetries && mounted) {
          await new Promise((resolve) => setTimeout(resolve, 100));

          try {
            const { invoke } = await import("@tauri-apps/api/core");
            await invoke("health_check");
            console.log("✅ Tauri API 已就绪 / Tauri API is ready");
            break;
          } catch (e) {
            retries++;
            if (retries >= maxRetries) {
              console.warn("⚠️ Tauri API 超时，保持默认 skills / Tauri API timeout, keeping defaults");
            }
          }
        }

        if (!mounted) return;

        // 尝试扫描真实 skills / Try to scan real skills
        console.log("🔍 开始扫描真实 skills / Scanning real skills...");

        const scanner = new SkillScanner();
        const scannedSkills = await scanner.scanSkills();

        if (mounted && scannedSkills.length > 0) {
          console.log(`✅ 成功加载 ${scannedSkills.length} 个 skills / Successfully loaded ${scannedSkills.length} skills`);
          setSkills(scannedSkills);
        } else {
          console.warn("⚠️ 未找到 skills，保持默认 skills / No skills found, keeping defaults");
        }
      } catch (err) {
        console.error("❌ Failed to load skills:", err);
        if (mounted) {
          setError("加载 skills 失败");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSkills();

    return () => {
      mounted = false;
    };
  }, []);

  return { skills, loading, error, reload: () => {} };
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
