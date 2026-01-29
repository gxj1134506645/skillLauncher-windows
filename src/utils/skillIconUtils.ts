import {
  // 代码相关 / Code related
  Code24Regular,
  BracesVariable24Regular,
  Document24Regular,
  FileJs24Regular,
  FileTs24Regular,
  FilePython24Regular,
  FileHtml24Regular,
  FileCss24Regular,

  // Git 相关 / Git related
  BranchFork24Regular,
  GitPullRequest24Regular,
  SourceCommit24Regular,

  // 工具相关 / Tools related
  Wrench24Regular,
  Settings24Regular,
  Toolbox24Regular,

  // 测试相关 / Testing related
  Bug24Regular,
  TestBeaker24Regular,
  ClipboardCheck24Regular,

  // 文档相关 / Documentation related
  Book24Regular,
  DocumentText24Regular,
  Read24Regular,

  // 数据库相关 / Database related
  Database24Regular,
  Table24Regular,

  // 构建相关 / Build related
  Build24Regular,
  Package24Regular,

  // AI/智能相关 / AI related
  Sparkle24Regular,
  Brain24Regular,

  // 通用图标 / General icons
  App24Regular,
  Lightbulb24Regular,
  Rocket24Regular,
  Star24Regular,
  Checkmark24Regular,
  ArrowDownload24Regular,
  ArrowUpload24Regular,
  Image24Regular,
  Video24Regular,
  Chat24Regular,
  Mail24Regular,
  Folder24Regular,
  ZipFolder24Regular,
} from "@fluentui/react-icons";

/**
 * 图标组件类型 / Icon component type
 */
export type SkillIconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

/**
 * Skill 图标映射表
 * 根据 skill name 自动匹配合适的图标
 */
const SKILL_ICON_MAP: Record<string, SkillIconComponent> = {
  // Git 相关 / Git related
  "commit": SourceCommit24Regular,
  "git-commit": SourceCommit24Regular,
  "review-pr": GitPullRequest24Regular,
  "pr": GitPullRequest24Regular,
  "git-pr": GitPullRequest24Regular,
  "branch": BranchFork24Regular,

  // 代码相关 / Code related
  "explain": Code24Regular,
  "code": Code24Regular,
  "refactor": BracesVariable24Regular,
  "format": Document24Regular,
  "lint": Document24Regular,

  // 测试相关 / Testing related
  "test": TestBeaker24Regular,
  "fix": Bug24Regular,
  "debug": Bug24Regular,

  // 文档相关 / Documentation related
  "docs": Book24Regular,
  "readme": DocumentText24Regular,
  "markdown": DocumentText24Regular,

  // 构建相关 / Build related
  "build": Build24Regular,
  "deploy": Rocket24Regular,
  "install": Package24Regular,
  "package": Package24Regular,

  // 文件处理 / File processing
  "pdf": Document24Regular,
  "image": Image24Regular,
  "video": Video24Regular,
  "file": Document24Regular,

  // 数据库 / Database
  "database": Database24Regular,
  "sql": Database24Regular,
  "schema": Table24Regular,

  // AI 相关 / AI related
  "ai": Sparkle24Regular,
  "claude": Brain24Regular,
  "gpt": Brain24Regular,

  // 工具相关 / Tools
  "tool": Wrench24Regular,
  "settings": Settings24Regular,
  "config": Settings24Regular,
};

/**
 * 默认图标（当没有匹配时使用）
 * Default icon (used when no match found)
 */
const DEFAULT_ICON: SkillIconComponent = App24Regular;

/**
 * 根据 skill name 获取对应的图标组件
 * Get icon component by skill name
 *
 * @param skillName - Skill 名称 / Skill name
 * @returns 图标组件 / Icon component
 */
export function getSkillIcon(skillName: string): SkillIconComponent {
  if (!skillName) {
    return DEFAULT_ICON;
  }

  // 转换为小写进行匹配 / Convert to lowercase for matching
  const normalized = skillName.toLowerCase().trim();

  // 精确匹配 / Exact match
  if (SKILL_ICON_MAP[normalized]) {
    return SKILL_ICON_MAP[normalized];
  }

  // 前缀匹配 / Prefix match (例如: "git-commit" -> "commit")
  for (const [key, icon] of Object.entries(SKILL_ICON_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return icon;
    }
  }

  // 根据关键词匹配 / Keyword matching
  if (normalized.includes("git")) return SourceCommit24Regular;
  if (normalized.includes("test")) return TestBeaker24Regular;
  if (normalized.includes("bug") || normalized.includes("fix")) return Bug24Regular;
  if (normalized.includes("code") || normalized.includes("dev")) return Code24Regular;
  if (normalized.includes("doc") || normalized.includes("read")) return DocumentText24Regular;
  if (normalized.includes("build") || normalized.includes("compile")) return Build24Regular;
  if (normalized.includes("deploy") || normalized.includes("ship")) return Rocket24Regular;
  if (normalized.includes("ai") || normalized.includes("smart")) return Sparkle24Regular;
  if (normalized.includes("setting") || normalized.includes("config")) return Settings24Regular;

  return DEFAULT_ICON;
}

/**
 * 根据 skill category 获取对应的图标组件
 * Get icon component by skill category
 *
 * @param category - Skill 分类 / Skill category
 * @returns 图标组件 / Icon component
 */
export function getCategoryIcon(category?: string): SkillIconComponent {
  if (!category) {
    return DEFAULT_ICON;
  }

  const normalized = category.toLowerCase();

  switch (normalized) {
    case "git":
      return SourceCommit24Regular;
    case "code":
      return Code24Regular;
    case "testing":
      return TestBeaker24Regular;
    case "debugging":
      return Bug24Regular;
    case "documentation":
      return Book24Regular;
    case "database":
      return Database24Regular;
    case "build":
      return Build24Regular;
    case "ai":
      return Brain24Regular;
    case "tools":
      return Wrench24Regular;
    default:
      return DEFAULT_ICON;
  }
}
