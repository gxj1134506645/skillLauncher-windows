import type { Skill } from "../types/skill";

/**
 * Skill 扫描器 - 从 Rust 后端获取 skills
 * Skill Scanner - Get skills from Rust backend
 */
export class SkillScanner {
  /**
   * 扫描 skills 目录并解析所有 SKILL.md 文件
   * Scan skills directory and parse all SKILL.md files
   */
  async scanSkills(): Promise<Skill[]> {
    try {
      // 调用 Rust 后端命令扫描 skills / Call Rust backend command to scan skills
      const { invoke } = await import("@tauri-apps/api/core");
      const frontendSkills = await invoke<
        Array<{
          name: string;
          display_name: string;
          description: string;
          category: string;
          path: string;
          command: string;
        }>
      >("scan_skills_directory");

      // 转换为前端的 Skill 类型 / Convert to frontend Skill type
      return frontendSkills.map((fs) => ({
        name: fs.name,
        displayName: fs.display_name,
        description: fs.description,
        category: fs.category,
        marketplace: undefined, // Rust 后端暂不支持 marketplace 字段
        path: fs.path,
        command: fs.command,
      }));
    } catch (error) {
      console.error("扫描 skills 目录失败 / Failed to scan skills directory:", error);
      return []; // 返回空数组 / Return empty array
    }
  }
}
