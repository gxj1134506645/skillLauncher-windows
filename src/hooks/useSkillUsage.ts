/**
 * Skill 使用记录管理 Hook
 * Hook for managing skill usage records
 */
import { useState, useEffect, useCallback } from "react";
import type { SkillUsageData, SkillUsageRecord } from "../types/skillUsage";
import type { Skill } from "../types/skill";

const USAGE_FILE = "skill-usage.json";

/**
 * 解析 Skill 使用记录权重分数
 * Parse skill usage record weight score
 * @param record - 使用记录 / Usage record
 * @returns 权重分数 / Weight score
 */
function calculateScore(record: SkillUsageRecord): number {
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
      const { appDataDir } = await import("@tauri-apps/api/path");
      const { readFile } = await import("@tauri-apps/plugin-fs");

      // 获取应用数据目录 / Get app data directory
      const appDataDirPath = await appDataDir();
      const filePath = `${appDataDirPath}${USAGE_FILE}`;

      // 读取文件 / Read file
      const contents = await readFile(filePath);
      const decoder = new TextDecoder();
      const jsonStr = decoder.decode(contents);
      const data = JSON.parse(jsonStr) as SkillUsageData;

      setUsageData(data);
    } catch (err) {
      // 文件不存在或读取失败，使用空数据 / File not exists or read failed, use empty data
      console.log("使用记录文件不存在，将创建新文件 / Usage file not exists, will create new file");
      setUsageData({ usage: [] });
    } finally {
      setLoading(false);
    }
  }

  /**
   * 保存使用记录到文件
   * Save usage records to file
   */
  async function saveUsageData(data: SkillUsageData) {
    try {
      const { appDataDir } = await import("@tauri-apps/api/path");
      const { writeFile } = await import("@tauri-apps/plugin-fs");

      // 获取应用数据目录 / Get app data directory
      const appDataDirPath = await appDataDir();
      const filePath = `${appDataDirPath}${USAGE_FILE}`;

      // 写入文件 / Write file
      const encoder = new TextEncoder();
      const jsonStr = JSON.stringify(data, null, 2);
      await writeFile(filePath, encoder.encode(jsonStr));

      setUsageData(data);
    } catch (err) {
      console.error("保存使用记录失败 / Failed to save usage:", err);
    }
  }

  /**
   * 记录 Skill 使用
   * Record skill usage
   * @param skillName - Skill 名称 / Skill name
   */
  const recordUsage = useCallback(async (skillName: string) => {
    const now = Date.now();

    // 查找现有记录 / Find existing record
    const existingIndex = usageData.usage.findIndex((u) => u.name === skillName);

    let newUsage: SkillUsageRecord[];

    if (existingIndex >= 0) {
      // 更新现有记录 / Update existing record
      newUsage = [...usageData.usage];
      newUsage[existingIndex] = {
        ...newUsage[existingIndex],
        lastUsed: now,
        count: newUsage[existingIndex].count + 1,
      };
    } else {
      // 创建新记录 / Create new record
      newUsage = [
        ...usageData.usage,
        {
          name: skillName,
          lastUsed: now,
          count: 1,
        },
      ];
    }

    // 保存到文件 / Save to file
    await saveUsageData({ usage: newUsage });
  }, [usageData]);

  /**
   * 获取排序后的 Skill 列表
   * Get sorted skill list by usage
   * @param skills - 原始 Skill 列表 / Original skill list
   * @returns 排序后的 Skill 列表 / Sorted skill list
   */
  const getSortedSkills = useCallback((skills: Skill[]) => {
    // 创建 Skill 名称到记录的映射 / Create mapping from skill name to record
    const usageMap = new Map<string, SkillUsageRecord>();
    usageData.usage.forEach((record) => {
      usageMap.set(record.name, record);
    });

    // 排序：有使用记录的排在前面，按分数降序 / Sort: skills with usage come first, by score descending
    return skills.slice().sort((a, b) => {
      const recordA = usageMap.get(a.name);
      const recordB = usageMap.get(b.name);

      // 都没有使用记录，保持原顺序 / Both no usage, keep original order
      if (!recordA && !recordB) return 0;

      // A 有记录，B 没有，A 排前面 / A has record, B doesn't, A comes first
      if (recordA && !recordB) return -1;

      // B 有记录，A 没有，B 排前面 / B has record, A doesn't, B comes first
      if (!recordB && recordA) return 1;

      // 都有记录，按分数降序 / Both have records, sort by score descending
      const scoreA = calculateScore(recordA!);
      const scoreB = calculateScore(recordB!);
      return scoreB - scoreA;
    });
  }, [usageData]);

  return {
    usageData,
    loading,
    recordUsage,
    getSortedSkills,
  };
}
