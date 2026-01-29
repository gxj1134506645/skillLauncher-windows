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
    let isMounted = true;

    const loadSkills = async () => {
      try {
        // 先立即显示默认 skills / Show default skills immediately
        const defaultSkills = getDefaultSkills();
        if (isMounted) {
          console.log("⏳ 先加载默认 skills / Loading default skills first");
          setSkills(defaultSkills);
          setLoading(false); // 立即完成加载状态 / Complete loading immediately
        }

        // 等待 Tauri 完全初始化 / Wait for Tauri to fully initialize
        // 使用重试策略 / Use retry strategy
        let retries = 0;
        const maxRetries = 30; // 最多等待 3 秒 / Max wait 3 seconds

        while (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 100));

          try {
            // 尝试调用 Tauri API 来测试是否就绪 / Try Tauri API to test if ready
            const { invoke } = await import("@tauri-apps/api/core");
            await invoke("health_check");
            console.log("✅ Tauri API 已就绪 / Tauri API is ready");
            break;
          } catch (e) {
            retries++;
            if (retries >= maxRetries) {
              console.warn("⚠️ Tauri API 超时，保持默认 skills / Tauri API timeout, keeping defaults");
              return;
            }
          }
        }

        // 现在尝试扫描真实 skills / Now try to scan real skills
        console.log("🔍 开始扫描真实 skills / Scanning real skills...");

        const scanner = new SkillScanner();
        const scannedSkills = await scanner.scanSkills();

        if (isMounted && scannedSkills.length > 0) {
          console.log(`✅ 成功加载 ${scannedSkills.length} 个 skills / Successfully loaded ${scannedSkills.length} skills`);
          setSkills(scannedSkills);
        } else {
          console.warn("⚠️ 未找到 skills，保持默认 skills / No skills found, keeping defaults");
        }
      } catch (err) {
        console.error("❌ Failed to load skills:", err);
        if (isMounted) {
          setError("加载 skills 失败");
          // 确保有默认 skills / Ensure default skills exist
          setSkills(getDefaultSkills());
        }
      }
    };

    loadSkills();

    return () => {
      isMounted = false;
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
