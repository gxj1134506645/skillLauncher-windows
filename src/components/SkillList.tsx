import type { Skill } from "../types/skill";
import {
  // Git & 版本控制 / Git & Version control
  GitCommit,
  GitPullRequest,
  GitBranch,
  GitMerge,

  // 代码相关 / Code related
  Code2,
  FileCode,
  Braces,
  FileJson,

  // 测试相关 / Testing related
  TestTube,
  TestTube2,
  FlaskConical,

  // Bug 修复 / Bug fixing
  Bug,
  Wrench,
  Hammer,
  Settings2,

  // 文档相关 / Documentation related
  FileText,
  BookOpen,
  File,
  FileType,

  // 构建相关 / Build related
  Package,
  Rocket,
  Loader,

  // AI & 智能 / AI & Smart
  BrainCircuit,
  Sparkles,
  Cpu,
  Bot,

  // 工具相关 / Tools
  Settings,

  // 数据库 / Database
  Database,
  Server,

  // 文件类型 / File types
  FileImage,
  Video,
  FileType2,

  // 默认图标 / Default icons
  CheckCircle,
  ChevronRight,
  Star,
  Zap,
} from "lucide-react";

interface SkillListProps {
  /** List of skills to display / 要显示的 Skill 列表 */
  skills: Skill[];
  /** Currently selected index / 当前选中的索引 */
  selectedIndex: number;
  /** Callback when skill is clicked / Skill 被点击时的回调 */
  onSkillClick: (skill: Skill, index: number) => void;
}

/**
 * 图标组件类型 / Icon component type
 */
type IconComponent = React.FC<{ className?: string; size?: number }>;

/**
 * 根据 skill name 获取对应的图标组件
 * Get icon component by skill name
 */
function getSkillIcon(skillName: string): IconComponent {
  const name = skillName.toLowerCase();

  // Git 相关 / Git related
  if (name.includes("commit")) return GitCommit;
  if (name.includes("pr") || name.includes("pull") || name.includes("review")) return GitPullRequest;
  if (name.includes("branch")) return GitBranch;
  if (name.includes("merge")) return GitMerge;

  // 代码相关 / Code related
  if (name.includes("code") || name.includes("dev")) return Code2;
  if (name.includes("explain") || name.includes("read")) return FileCode;
  if (name.includes("refactor") || name.includes("varia")) return Braces;
  if (name.includes("json") || name.includes("config")) return FileJson;

  // 测试相关 / Testing related
  if (name.includes("test")) return TestTube;
  if (name.includes("spec")) return TestTube2;
  if (name.includes("flask") || name.includes("lab")) return FlaskConical;

  // Bug & 修复 / Bug & fixing
  if (name.includes("bug") || name.includes("debug")) return Bug;
  if (name.includes("fix") || name.includes("repair")) return Wrench;
  if (name.includes("build")) return Hammer;
  if (name.includes("setting") || name.includes("config")) return Settings2;

  // 文档相关 / Documentation related
  if (name.includes("docu") || name.includes("readme") || name.includes("markdown")) return FileText;
  if (name.includes("book") || name.includes("wiki")) return BookOpen;
  if (name.includes("file") || name.includes("pdf")) return File;
  if (name.includes("type")) return FileType;

  // 构建相关 / Build related
  if (name.includes("package") || name.includes("install")) return Package;
  if (name.includes("deploy") || name.includes("ship") || name.includes("release")) return Rocket;
  if (name.includes("load") || name.includes("spin")) return Loader;

  // AI & 智能 / AI & Smart
  if (name.includes("ai") || name.includes("claude") || name.includes("gpt")) return BrainCircuit;
  if (name.includes("smart") || name.includes("magic")) return Sparkles;
  if (name.includes("cpu") || name.includes("process")) return Cpu;
  if (name.includes("bot") || name.includes("robot")) return Bot;

  // 工具相关 / Tools
  if (name.includes("wrench")) return Wrench;

  // 数据库 / Database
  if (name.includes("database") || name.includes("db")) return Database;
  if (name.includes("server") || name.includes("sql")) return Server;

  // 文件类型 / File types
  if (name.includes("image") || name.includes("img") || name.includes("pic")) return FileImage;
  if (name.includes("video")) return Video;
  if (name.includes("format")) return FileType2;

  // 特殊图标 / Special icons
  if (name.includes("star") || name.includes("favorite")) return Star;
  if (name.includes("zap") || name.includes("fast")) return Zap;

  // 默认图标 / Default icon
  return CheckCircle;
}

/**
 * Skill list component
 * Skill 列表组件
 */
export function SkillList({ skills, selectedIndex, onSkillClick }: SkillListProps) {
  return (
    <div className="skill-list">
      {skills.map((skill, index) => {
        // 获取 skill 对应的图标组件 / Get icon component for skill
        const IconComponent = getSkillIcon(skill.name);

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
            {/* Skill 图标 / Skill icon */}
            <div className="skill-item-icon">
              <IconComponent size={20} className="lucide-icon" />
            </div>

            {/* Skill 信息 / Skill info */}
            <div className="skill-item-content">
              <div className="skill-item-name">
                {skill.displayName || skill.name}
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
