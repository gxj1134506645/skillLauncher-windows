/**
 * Skill 使用记录类型定义
 * Skill usage record type definitions
 */

/**
 * 单个 Skill 的使用记录
 * Usage record for a single skill
 */
export interface SkillUsageRecord {
  /** Skill 名称 / Skill name */
  name: string;
  /** 最后使用时间戳（毫秒）/ Last used timestamp (milliseconds) */
  lastUsed: number;
  /** 使用次数 / Usage count */
  count: number;
}

/**
 * 使用记录存储结构
 * Usage record storage structure
 */
export interface SkillUsageData {
  /** 使用记录列表 / Usage record list */
  usage: SkillUsageRecord[];
}
