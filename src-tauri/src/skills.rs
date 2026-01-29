use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// Skill representation for frontend
/// 前端的 Skill 表示
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrontendSkill {
    pub name: String,
    pub display_name: String,
    pub description: String,
    pub category: String,
    pub path: String,
    pub command: String,
}

/// Get skills directory path
/// 获取 skills 目录路径
fn get_skills_dir() -> PathBuf {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    home.join(".claude").join("skills")
}

/// Scan skills directory and return all skills
/// 扫描 skills 目录并返回所有 skills
#[tauri::command]
pub fn scan_skills_directory() -> Result<Vec<FrontendSkill>, String> {
    let skills_dir = get_skills_dir();

    // Check if directory exists / 检查目录是否存在
    if !skills_dir.exists() {
        return Ok(vec![]);
    }

    let mut skills = vec![];

    // Read all subdirectories / 读取所有子目录
    let entries = fs::read_dir(&skills_dir)
        .map_err(|e| format!("无法读取 skills 目录: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;

        // Only process directories / 只处理目录
        if !entry.path().is_dir() {
            continue;
        }

        let skill_name = entry.file_name();

        // Skip hidden directories / 跳过隐藏目录
        // Convert OsString to string for checking / 转换 OsString 为字符串进行检查
        if let Some(name_str) = skill_name.to_str() {
            if name_str.starts_with('.') {
                continue;
            }
        }

        // Parse skill / 解析 skill
        if let Some(skill) = parse_skill(&entry.path()) {
            skills.push(skill);
        }
    }

    Ok(skills)
}

/// Parse a single skill from its directory
/// 从目录解析单个 skill
fn parse_skill(skill_path: &PathBuf) -> Option<FrontendSkill> {
    // Convert OsStr to String / 转换 OsStr 为 String
    let skill_name = skill_path.file_name()?.to_str()?.to_string();
    let readme_path = skill_path.join("SKILL.md");

    // Read SKILL.md / 读取 SKILL.md
    let content = fs::read_to_string(&readme_path).ok()?;

    // Parse Front Matter / 解析 Front Matter
    let (name, description, category) = parse_skill_md(&content);

    Some(FrontendSkill {
        name: skill_name.clone(),
        display_name: name.unwrap_or(skill_name.clone()),
        description,
        category,
        // Convert Cow<str> to String / 转换 Cow<str> 为 String
        path: skill_path.to_string_lossy().to_string(),
        command: format!("claude /{}", skill_name),
    })
}

/// Parse SKILL.md Front Matter
/// 解析 SKILL.md 的 Front Matter
fn parse_skill_md(content: &str) -> (Option<String>, String, String) {
    let front_matter_regex = regex::Regex::new(r"^---\n([\s\S]+?)\n---").unwrap();

    // Initialize category variable / 初始化 category 变量
    let category = "general".to_string();

    let (name, description) = if let Some(caps) = front_matter_regex.captures(content) {
        // Parse key: value pairs / 解析 key: value 对
        let mut name = None;
        let mut description = None;

        for line in caps[1].split('\n') {
            if let Some((key, value)) = line.split_once(':') {
                let key = key.trim();
                let value = value.trim();

                match key {
                    "name" => name = Some(value.to_string()),
                    "description" => description = Some(value.to_string()),
                    _ => {}
                }
            }
        }

        (name, description)
    } else {
        (None, Some(content.to_string()))
    };

    // Extract first paragraph as description if not set / 如果未设置，提取第一段作为描述
    let description = description.unwrap_or_else(|| {
        extract_first_paragraph(&content)
    });

    (name, description, category)
}

/// Extract first paragraph
/// 提取第一段
fn extract_first_paragraph(content: &str) -> String {
    content
        .split("\n\n")
        .next()
        .unwrap_or("")
        .replace('\n', " ")
        .trim()
        .chars().take(100)
        .collect()
}
