/**
 * Skill type definition
 * Skill 类型定义
 */
export interface Skill {
  /** Skill unique identifier / Skill 唯一标识符 */
  name: string;
  /** Skill display name / Skill 显示名称 */
  displayName?: string;
  /** Skill description / Skill 描述 */
  description?: string;
  /** Skill command to execute / 要执行的命令 */
  command?: string;
  /** Skill category / Skill 分类 */
  category?: string;
  /** Skill marketplace source / Skill 来源市场 */
  marketplace?: string;
  /** Tag: "project" 项目技能, "user" 用户技能 */
  tag?: string;
  /** Skill icon / Skill 图标 */
  icon?: string;
  /** Skill shortcut key / Skill 快捷键 */
  shortcut?: string;
}

/**
 * Skill configuration file structure
 * Skill 配置文件结构
 */
export interface SkillConfig {
  /** Configuration version / 配置版本 */
  version?: string;
  /** List of skills / Skill 列表 */
  skills: Skill[];
}
