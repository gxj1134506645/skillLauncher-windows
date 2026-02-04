/**
 * Skill 使用记录管理 Hook
 * Hook for managing skill usage records
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { SkillUsageData, SkillUsageRecord } from "../types/skillUsage";
import type { Skill } from "../types/skill";

const USAGE_FILE = "skill-usage.json";

// 最近使用的时间阈值（2天）/ Recent usage threshold (2 days)
const RECENT_THRESHOLD = 2 * 24 * 60 * 60 * 1000;

/**
 * 解析 Skill 使用记录权重分数
 * Parse skill usage record weight score
 * @param record - 使用记录 / Usage record
 * @returns 权重分数 / Weight score
 */
function calculateScore(record: SkillUsageRecord): number {
  // 防御性检查：确保记录有必要的字段 / Defensive check: ensure record has required fields
  if (!record || typeof record.lastUsed !== 'number' || typeof record.count !== 'number') {
    console.warn('⚠️ 无效的使用记录 / Invalid usage record:', record);
    return 0; // 返回最低分 / Return lowest score
  }

  // 权重公式：最后使用时间 + (使用次数 × 1小时的毫秒数)
  // Weight formula: last used time + (count × 1 hour in milliseconds)
  const HOUR_IN_MS = 3600000;
  return record.lastUsed + record.count * HOUR_IN_MS;
}

/**
 * 管理 Skill 使用记录的 Hook
 * Hook for managing skill usage records
 */
export function useSkillUsage() {
  const [usageData, setUsageData] = useState<SkillUsageData>({ usage: [] });
  const [loading, setLoading] = useState(true);
  // 使用 ref 来追踪加载完成状态，避免闭包陷阱
  // Use ref to track load completion, avoiding closure trap
  const loadCompletedRef = useRef(false);

  // 加载使用记录 / Load usage records
  useEffect(() => {
    loadUsageData();
  }, []);

  /**
   * 从文件加载使用记录
   * Load usage records from file
   */
  async function loadUsageData() {
    try {
      // 动态导入 Tauri API / Dynamically import Tauri API
      const { appLocalDataDir, join } = await import("@tauri-apps/api/path");
      const { readFile } = await import("@tauri-apps/plugin-fs");

      // 使用应用本地数据目录（可写）/ Use app local data dir (writable)
      const appDir = await appLocalDataDir();
      const filePath = await join(appDir, USAGE_FILE);
      console.log("📂 尝试从文件加载 / Trying to load from file:", filePath);

      // 读取文件 / Read file（不需要手动创建目录，因为 appLocalDataDir 应该已存在）
      // 不需要手动创建目录，因为 appLocalDataDir 是系统目录，应该已存在
      const contents = await readFile(filePath);
      const decoder = new TextDecoder();
      const jsonStr = decoder.decode(contents);

      // 验证 JSON 数据有效性 / Validate JSON data validity
      const data = JSON.parse(jsonStr) as SkillUsageData;
      if (!data || !Array.isArray(data.usage)) {
        throw new Error("Invalid usage data format");
      }

      setUsageData(data);
      console.log("✅ 使用记录加载成功 / Usage data loaded:", data.usage.length, "records");
      console.log("📋 已记录的技能 / Recorded skills:", data.usage.map(u => `${u.name}(${u.count})`));
    } catch (err) {
      // 文件不存在或读取失败，使用空数据 / File not exists or read failed, use empty data
      console.log("⚠️ 使用记录文件不存在或读取失败 / Usage file not exists or read failed:", err);
      console.log("📝 将使用空数据开始 / Starting with empty data");
      setUsageData({ usage: [] });
    } finally {
      setLoading(false);
      loadCompletedRef.current = true;  // 标记加载完成 / Mark loading as completed
      console.log("✅ 加载完成 / Load completed");
    }
  }

  /**
   * 记录 Skill 使用
   * Record skill usage
   * @param skillName - Skill 名称 / Skill name
   */
  const recordUsage = useCallback(
    async (skillName: string) => {
      // 如果加载还未完成，延迟执行记录 / If loading not completed, defer the recording
      if (!loadCompletedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const now = Date.now();

      // 使用函数式更新确保使用最新状态 / Use functional update to ensure latest state
      setUsageData((currentData) => {
        // 查找现有记录 / Find existing record
        const existingIndex = currentData.usage.findIndex((u) => u.name === skillName);

        let newUsage: SkillUsageRecord[];

        if (existingIndex >= 0) {
          // 更新现有记录 / Update existing record
          newUsage = [...currentData.usage];
          newUsage[existingIndex] = {
            ...newUsage[existingIndex],
            lastUsed: now,
            count: newUsage[existingIndex].count + 1,
          };
        } else {
          // 创建新记录 / Create new record
          newUsage = [
            ...currentData.usage,
            {
              name: skillName,
              lastUsed: now,
              count: 1,
            },
          ];
        }

        const newData = { usage: newUsage };

        // 异步保存到文件 / Asynchronously save to file
        (async () => {
          try {
            const { appLocalDataDir, join } = await import("@tauri-apps/api/path");
            const { writeFile } = await import("@tauri-apps/plugin-fs");

            // 使用应用本地数据目录（可写）/ Use app local data dir (writable)
            const appDir = await appLocalDataDir();
            const filePath = await join(appDir, USAGE_FILE);

            const encoder = new TextEncoder();
            const jsonStr = JSON.stringify(newData, null, 2);

            // 防御性检查：避免用空数据覆盖有效数据
            // Defensive check: don't overwrite with empty data
            if (newData.usage.length === 0) {
              console.warn("警告：试图保存空数据，操作已取消");
              return;
            }

            // 先检查文件是否已存在且有数据，如果有则合并而非覆盖
            // Check if file exists with data, merge rather than overwrite
            try {
              const { readFile } = await import("@tauri-apps/plugin-fs");
              const existingContents = await readFile(filePath);
              const decoder = new TextDecoder();
              const existingJson = decoder.decode(existingContents);
              const existingData = JSON.parse(existingJson) as SkillUsageData;

              if (existingData && existingData.usage && existingData.usage.length > 0) {
                // 合并现有数据和新数据 / Merge existing and new data
                const mergedMap = new Map<string, SkillUsageRecord>();

                // 先添加现有记录 / Add existing records first
                existingData.usage.forEach(record => {
                  if (record && record.name) {
                    mergedMap.set(record.name, record);
                  }
                });

                // 更新/添加新记录 / Update/add new records
                newUsage.forEach(record => {
                  if (record && record.name) {
                    mergedMap.set(record.name, record);
                  }
                });

                const mergedUsage = Array.from(mergedMap.values());
                const mergedData = { usage: mergedUsage };

                await writeFile(filePath, encoder.encode(JSON.stringify(mergedData, null, 2)));
                return;
              }
            } catch (readErr) {
              // 文件不存在或读取失败，继续正常保存流程
              // File doesn't exist or read failed, continue normal save flow
            }

            await writeFile(filePath, encoder.encode(jsonStr));
          } catch (err) {
            console.error("❌ 保存使用记录失败 / Failed to save usage:", err);
            console.error("错误详情 / Error details:", err);
          }
        })();

        return newData;
      });
    },
    [] // 空依赖数组，因为使用函数式更新 / Empty deps, using functional update
  );

  /**
   * 获取排序后的 Skill 列表（带最近使用标记）
   * Get sorted skill list by usage (with recent usage flag)
   * @param skills - 原始 Skill 列表 / Original skill list
   * @returns 排序后的 Skill 列表 / Sorted skill list
   */
  const getSortedSkills = useCallback((skills: Skill[]) => {
    // 创建 Skill 名称到记录的映射 / Create mapping from skill name to record
    const usageMap = new Map<string, SkillUsageRecord>();
    usageData.usage.forEach((record) => {
      // 过滤掉无效记录 / Filter out invalid records
      if (record && record.name) {
        usageMap.set(record.name, record);
      }
    });

    // 排序：有使用记录的排在前面，按分数降序 / Sort: skills with usage come first, by score descending
    const sorted = skills.slice().sort((a, b) => {
      const recordA = usageMap.get(a.name);
      const recordB = usageMap.get(b.name);

      // 都没有使用记录，保持原顺序 / Both no usage, keep original order
      if (!recordA && !recordB) return 0;

      // A 有记录，B 没有，A 排前面 / A has record, B doesn't, A comes first
      if (recordA && !recordB) return -1;

      // A 没有，B 有记录，B 排前面 / A doesn't have, B has record, B comes first
      if (!recordA && recordB) return 1;

      // 都有记录，按分数降序 / Both have records, sort by score descending
      const scoreA = calculateScore(recordA!);
      const scoreB = calculateScore(recordB!);
      return scoreB - scoreA;
    });

    return sorted;
  }, [usageData]);

  /**
   * 获取最近使用的技能名称集合
   * Get set of recently used skill names
   */
  const recentSkillNames = useMemo(() => {
    const now = Date.now();
    const recentSet = new Set<string>();
    usageData.usage.forEach((record) => {
      // 防御性检查：确保记录有效 / Defensive check: ensure record is valid
      if (record && record.name && typeof record.lastUsed === 'number') {
        if (now - record.lastUsed < RECENT_THRESHOLD) {
          recentSet.add(record.name);
        }
      }
    });
    return recentSet;
  }, [usageData]);

  /**
   * 判断技能是否最近使用过
   * Check if a skill was recently used
   */
  const isRecentUsed = useCallback((skillName: string) => {
    return recentSkillNames.has(skillName);
  }, [recentSkillNames]);

  return {
    usageData,
    loading,
    recordUsage,
    getSortedSkills,
    isRecentUsed,
  };
}
