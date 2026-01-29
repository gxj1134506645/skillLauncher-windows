import { readDir, readTextFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import type { Skill } from "../types/skill";

/**
 * Skill 扫描器 - 从 ~/.claude/skills/ 目录加载 skills
 * Skill Scanner - Load skills from ~/.claude/skills/ directory
 */
export class SkillScanner {
  private readonly SKILLS_DIR = ".claude/skills";

  /**
   * 扫描 skills 目录并解析所有 SKILL.md 文件
   * Scan skills directory and parse all SKILL.md files
   */
  async scanSkills(): Promise<Skill[]> {
    try {
      // 1. 读取 skills 目录下的所有子目录 / Read all subdirectories in skills directory
      // 直接使用 BaseDirectory.Home，避免调用 homeDir()
      const entries = await readDir(this.SKILLS_DIR, {
        dir: BaseDirectory.Home,
        recursive: false,
      });

      // 2. 过滤出目录（每个目录代表一个 skill） / Filter directories (each directory represents a skill)
      const skillDirs = entries.filter(
        (entry) => entry.isDirectory && !entry.name.startsWith(".")
      );

      // 3. 并行解析所有 skills / Parse all skills in parallel
      const skills = await Promise.all(
        skillDirs.map((dir) => this.parseSkillDir(dir.name))
      );

      // 4. 过滤掉解析失败的项 / Filter out failed parses
      return skills.filter((skill): skill is Skill => skill !== null);
    } catch (error) {
      console.error("扫描 skills 目录失败 / Failed to scan skills directory:", error);
      return []; // 返回空数组而不是抛出异常 / Return empty array instead of throwing
    }
  }

  /**
   * 解析单个 skill 目录
   * Parse a single skill directory
   */
  private async parseSkillDir(skillName: string): Promise<Skill | null> {
    try {
      // 构建 skill 路径，使用 join 和 BaseDirectory.Home
      const skillPath = await join(this.SKILLS_DIR, skillName);
      const readmePath = await join(skillPath, "SKILL.md");

      // 读取 SKILL.md 内容 / Read SKILL.md content
      const content = await readTextFile(readmePath, {
        dir: BaseDirectory.Home,
      });

      // 解析 Front Matter 和描述 / Parse Front Matter and description
      const { frontMatter, description } = this.parseSkillMd(content);

      return {
        name: skillName,
        displayName: frontMatter.name || skillName,
        description:
          frontMatter.description || this.extractFirstParagraph(description),
        category: frontMatter.category || "general",
        path: skillPath,
      };
    } catch (error) {
      console.warn(`解析 skill ${skillName} 失败 / Failed to parse skill ${skillName}:`, error);
      return null;
    }
  }

  /**
   * 解析 SKILL.md 的 Front Matter
   * Parse Front Matter from SKILL.md
   * 格式 / Format:
   *   ---
   *   name: skill-name
   *   description: ...
   *   ---
   */
  private parseSkillMd(content: string): {
    frontMatter: Record<string, any>;
    description: string;
  } {
    const frontMatterRegex = /^---\n([\s\S]+?)\n---/;
    const match = content.match(frontMatterRegex);

    if (!match) {
      return { frontMatter: {}, description: content };
    }

    // 简单的 YAML 解析（仅支持 key: value 格式） / Simple YAML parser (only key: value format)
    const frontMatter: Record<string, any> = {};
    match[1].split("\n").forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        if (key && value) {
          frontMatter[key] = value;
        }
      }
    });

    const description = content.replace(frontMatterRegex, "").trim();

    return { frontMatter, description };
  }

  /**
   * 提取第一段作为简短描述
   * Extract first paragraph as short description
   */
  private extractFirstParagraph(content: string): string {
    const firstParagraph = content.split("\n\n")[0];
    return firstParagraph.replace(/\n/g, " ").trim().slice(0, 100);
  }
}
