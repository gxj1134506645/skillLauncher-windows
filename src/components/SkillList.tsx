import type { Skill } from "../types/skill";

/**
 * Emoji 图标映射表
 * 为每个 skill 匹配最合适的 Emoji
 */
const SKILL_EMOJI_MAP: Record<string, string> = {
  // Git 相关 / Git related
  "commit": "📝",
  "git-commit": "📝",
  "git": "🔀",
  "pr": "🔀",
  "pull-request": "🔀",
  "review-pr": "👀",
  "branch": "🌿",
  "merge": "🔀",
  "push": "⬆️",
  "clone": "📥",

  // 代码相关 / Code related
  "code": "💻",
  "explain": "💡",
  "refactor": "♻️",
  "format": "✨",
  "lint": "🔍",
  "dev": "👨‍💻",
  "develop": "👨‍💻",

  // 测试相关 / Testing related
  "test": "🧪",
  "testing": "🧪",
  "spec": "📋",
  "coverage": "📊",

  // Bug 修复 / Bug fixing
  "bug": "🐛",
  "fix": "🔧",
  "debug": "🔍",
  "hotfix": "🔥",

  // 文档相关 / Documentation related
  "docs": "📚",
  "readme": "📖",
  "markdown": "📝",
  "wiki": "📖",
  "document": "📄",

  // 构建相关 / Build related
  "build": "🔨",
  "compile": "⚙️",
  "deploy": "🚀",
  "release": "🎉",
  "package": "📦",
  "install": "⬇️",
  "publish": "📤",

  // AI & 智能 / AI & Smart
  "ai": "🤖",
  "claude": "🧠",
  "gpt": "🧠",
  "chatgpt": "🧠",
  "smart": "✨",
  "auto": "🤖",

  // 工具相关 / Tools
  "tool": "🛠️",
  "tools": "🛠️",
  "setting": "⚙️",
  "settings": "⚙️",
  "config": "⚙️",
  "setup": "⚙️",

  // 数据库 / Database
  "database": "🗄️",
  "db": "🗄️",
  "sql": "💾",
  "mysql": "🐬",
  "mongo": "🍃",
  "redis": "🔴",

  // 文件类型 / File types
  "pdf": "📕",
  "image": "🖼️",
  "video": "🎬",
  "audio": "🎵",
  "file": "📄",
  "folder": "📁",

  // Web 相关 / Web related
  "web": "🌐",
  "http": "🌐",
  "api": "🔌",
  "rest": "🔌",
  "graphql": "🔷",

  // 安全相关 / Security
  "security": "🔒",
  "auth": "🔐",
  "login": "🔑",
  "password": "🔑",

  // 性能相关 / Performance
  "performance": "⚡",
  "speed": "⚡",
  "optimize": "⚡",
  "cache": "💾",

  // CI/CD
  "ci": "🔄",
  "cd": "🚀",
  "pipeline": "🔄",
  "workflow": "📊",

  // 其他 / Others
  "clean": "🧹",
  "help": "❓",
  "info": "ℹ️",
  "warning": "⚠️",
  "error": "❌",
  "success": "✅",
  "star": "⭐",
  "favorite": "⭐",
  "archive": "🗜️",
  "backup": "💾",
  "restore": "♻️",
  "sync": "🔄",
};

/**
 * 根据 skill name 获取对应的 Emoji
 * Get emoji by skill name
 */
function getSkillEmoji(skillName: string): string {
  const name = skillName.toLowerCase().trim();

  // 精确匹配 / Exact match
  if (SKILL_EMOJI_MAP[name]) {
    return SKILL_EMOJI_MAP[name];
  }

  // 关键词匹配 / Keyword match
  for (const [key, emoji] of Object.entries(SKILL_EMOJI_MAP)) {
    if (name.includes(key) || key.includes(name)) {
      return emoji;
    }
  }

  // 根据类别推断 Emoji / Infer emoji by category
  if (name.includes("git") || name.includes("commit") || name.includes("pr")) return "🔀";
  if (name.includes("test") || name.includes("spec")) return "🧪";
  if (name.includes("bug") || name.includes("fix") || name.includes("debug")) return "🐛";
  if (name.includes("doc") || name.includes("read")) return "📚";
  if (name.includes("build") || name.includes("compile")) return "🔨";
  if (name.includes("deploy") || name.includes("ship")) return "🚀";
  if (name.includes("ai") || name.includes("claude") || name.includes("gpt")) return "🤖";
  if (name.includes("setting") || name.includes("config")) return "⚙️";
  if (name.includes("database") || name.includes("db")) return "🗄️";
  if (name.includes("image") || name.includes("img")) return "🖼️";
  if (name.includes("video")) return "🎬";
  if (name.includes("pdf") || name.includes("file")) return "📄";

  // 默认 Emoji / Default emoji
  return "✨";
}

/**
 * 根据 marketplace 获取对应的颜色
 * Get color by marketplace
 */
function getMarketplaceColor(marketplace?: string): string {
  if (!marketplace) return "#888888"; // 默认灰色 / Default gray

  const normalized = marketplace.toLowerCase();

  // 为不同 marketplace 分配不同的颜色 / Assign different colors for different marketplaces
  const marketplaceColors: Record<string, string> = {
    // Anthropic Official - 紫色系 / Anthropic Official - Purple (官方内置)
    "anthropic": "#8b5cf7",
    "claude-official": "#8b5cf7",
    "official": "#8b5cf7",

    // Local - 灰色系 / Local - Gray (用户本地创建)
    "local": "#6b7280",

    // Happy Claude - 绿色系 / Happy Claude - Green
    "happy claude": "#10b981",

    // Superpowers - 蓝色系 / Superpowers - Blue
    "superpowers": "#0078d4",

    // Obsidian - 青色系 / Obsidian - Cyan
    "obsidian": "#06b6d4",

    // Community - 绿色系 / Community - Green
    "community": "#10b981",

    // Marketplace - 蓝色系 / Marketplace - Blue
    "marketplace": "#0078d4",

    // Custom - 橙色系 / Custom - Orange
    "custom": "#f59e0b",
    "user": "#f59e0b",

    // Verified - 青色系 / Verified - Cyan
    "verified": "#06b6d4",

    // Featured - 粉色系 / Featured - Pink
    "featured": "#ec4899",

    // Default - 灰色系 / Default - Gray
    "default": "#6b7280",
  };

  return marketplaceColors[normalized] || "#6b7280"; // 默认为本地灰色 / Default to local gray
}

interface SkillListProps {
  /** List of skills to display / 要显示的 Skill 列表 */
  skills: Skill[];
  /** Currently selected index / 当前选中的索引 */
  selectedIndex: number;
  /** Callback when skill is clicked / Skill 被点击时的回调 */
  onSkillClick: (skill: Skill, index: number) => void;
}

/**
 * Skill list component
 * Skill 列表组件
 */
export function SkillList({ skills, selectedIndex, onSkillClick }: SkillListProps) {
  return (
    <div className="skill-list">
      {skills.map((skill, index) => {
        // 获取 skill 对应的 Emoji / Get emoji for skill
        const emoji = getSkillEmoji(skill.name);
        // 获取 marketplace 对应的颜色 / Get color for marketplace
        const marketplaceColor = getMarketplaceColor(skill.marketplace);

        return (
          <div
            key={skill.name}
            className={`skill-item ${index === selectedIndex ? "selected" : ""}`}
            onClick={() => onSkillClick(skill, index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSkillClick(skill, index);
              }
            }}
          >
            {/* Skill Emoji 图标 / Skill emoji icon */}
            <div className="skill-item-icon emoji-icon">
              {emoji}
            </div>

            {/* Skill 信息 / Skill info */}
            <div className="skill-item-content">
              <div className="skill-item-header">
                <div className="skill-item-name">
                  {skill.displayName || skill.name}
                </div>
                {/* 显示 marketplace 来源 / Show marketplace source */}
                {skill.marketplace && (
                  <span
                    className="skill-item-category"
                    style={{ color: marketplaceColor }}
                  >
                    {skill.marketplace}
                  </span>
                )}
              </div>
              {skill.description && (
                <div className="skill-item-description">{skill.description}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
