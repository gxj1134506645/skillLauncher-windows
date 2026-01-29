import { useState, useEffect } from "react";
import type { Skill } from "../types/skill";
import { SkillScanner } from "../services/skillScanner";

/**
 * Hook for loading and managing skills
 * 用于加载和管理 Skills 的 Hook
 */
export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        setLoading(true);
        setError(null);

        // 等待 Tauri API 准备好 / Wait for Tauri API to be ready
        let retries = 0;
        const maxRetries = 50; // 增加到 5 秒 / Increase to 5 seconds

        while (retries < maxRetries) {
          try {
            // 尝试调用 Tauri API / Try to call Tauri API
            const { invoke } = await import("@tauri-apps/api/core");
            await invoke("health_check");
            break; // 成功则跳出 / Success, break
          } catch (e) {
            // 失败则继续等待 / Fail, continue waiting
            await new Promise((resolve) => setTimeout(resolve, 100));
            retries++;
          }
        }

        if (retries >= maxRetries) {
          console.warn("Tauri API 超时，使用默认 skills / Tauri API timeout, using default skills");
          setSkills(getDefaultSkills());
          setLoading(false);
          return;
        }

        // 使用 SkillScanner 扫描 skills 目录 / Use SkillScanner to scan skills directory
        const scanner = new SkillScanner();
        const scannedSkills = await scanner.scanSkills();

        // 如果扫描成功且有结果，使用扫描的 skills / If scan succeeds and has results, use scanned skills
        if (scannedSkills.length > 0) {
          console.log(`✅ 成功加载 ${scannedSkills.length} 个 skills`);
          setSkills(scannedSkills);
        } else {
          // 如果扫描结果为空，使用默认 skills / If scan result is empty, use default skills
          console.warn("⚠️ 未找到 skills，使用默认 skills");
          setSkills(getDefaultSkills());
        }
      } catch (err) {
        console.error("❌ Failed to load skills:", err);
        setError("加载 skills 失败");
        // 使用默认 skills 作为回退 / Use default skills as fallback
        setSkills(getDefaultSkills());
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
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
