use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::collections::HashSet;

/// Plugin marketplace configuration
/// Plugin marketplace 配置
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)] // 预留功能 / Reserved for future use
struct MarketplaceConfig {
    #[serde(default)]
    source: Option<SourceInfo>,
    install_location: String,
    #[serde(default)]
    last_updated: Option<String>,
    #[serde(default)]
    auto_update: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(dead_code)] // 预留功能 / Reserved for future use
struct SourceInfo {
    source: String,
    repo: String,
}

/// Installed plugins configuration
/// 已安装的 plugins 配置
#[derive(Debug, Clone, Serialize, Deserialize)]
struct InstalledPluginsConfig {
    plugins: std::collections::HashMap<String, Vec<PluginVersion>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PluginVersion {
    scope: String,
    #[serde(rename = "installPath")]
    install_path: String,
    version: String,
    #[serde(rename = "installedAt")]
    installed_at: String,
    #[serde(rename = "lastUpdated")]
    last_updated: String,
    #[serde(rename = "gitCommitSha")]
    git_commit_sha: String,
}

/// Get marketplace name from marketplace ID
/// 从 marketplace ID 获取 marketplace 名称
fn get_marketplace_name(marketplace_id: &str) -> String {
    match marketplace_id {
        "happy-claude-skills-gxj" => "Happy Claude".to_string(),
        "superpowers-marketplace" => "Superpowers".to_string(),
        "obsidian-skills" => "Obsidian".to_string(),
        _ => {
            // 从 ID 中提取友好名称 / Extract friendly name from ID
            marketplace_id
                .replace("-", " ")
                .split_whitespace()
                .map(|word| {
                    let mut chars = word.chars();
                    match chars.next() {
                        None => String::new(),
                        Some(first) => first.to_uppercase().chain(chars).collect(),
                    }
                })
                .collect::<Vec<_>>()
                .join(" ")
        }
    }
}

/// Get plugins directory path
/// 获取 plugins 目录路径
fn get_plugins_dir() -> PathBuf {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    home.join(".claude").join("plugins")
}

/// Read marketplace configuration
/// 读取 marketplace 配置
#[allow(dead_code)] // 预留功能 / Reserved for future use
fn read_marketplaces_config() -> std::collections::HashMap<String, MarketplaceConfig> {
    let plugins_dir = get_plugins_dir();
    let config_path = plugins_dir.join("known_marketplaces.json");

    if !config_path.exists() {
        return std::collections::HashMap::new();
    }

    fs::read_to_string(&config_path)
        .ok()
        .and_then(|content| serde_json::from_str(&content).ok())
        .unwrap_or_default()
}

/// Read installed plugins configuration
/// 读取已安装的 plugins 配置
fn read_installed_plugins() -> InstalledPluginsConfig {
    let plugins_dir = get_plugins_dir();
    let config_path = plugins_dir.join("installed_plugins.json");

    if !config_path.exists() {
        return InstalledPluginsConfig {
            plugins: std::collections::HashMap::new(),
        };
    }

    fs::read_to_string(&config_path)
        .ok()
        .and_then(|content| serde_json::from_str(&content).ok())
        .unwrap_or_else(|| InstalledPluginsConfig {
            plugins: std::collections::HashMap::new(),
        })
}

/// Skill 别名映射表 / Skill alias mapping
/// 处理 skills 目录名称与插件名称不一致的情况
/// Handle cases where skill directory name differs from plugin name
fn get_skill_aliases(skill_name: &str) -> Vec<String> {
    let mut aliases = vec![skill_name.to_string()];

    // 添加别名映射 / Add alias mappings
    match skill_name {
        // obsidian-markdown -> obsidian
        "obsidian-markdown" => {
            aliases.push("obsidian".to_string());
        }
        // 如果 skill 名称包含连字符，尝试去掉部分后缀
        _ => {
            // 例如：docx-format-replicator -> docx-format
            if let Some(last_dash) = skill_name.rfind('-') {
                aliases.push(skill_name[..last_dash].to_string());
            }
            // 例如：markdown-helper -> markdown
            if let Some(first_dash) = skill_name.find('-') {
                aliases.push(skill_name[..first_dash].to_string());
            }
        }
    }

    aliases
}

/// Get marketplace for a skill
/// 获取 skill 的 marketplace
fn get_skill_marketplace(skill_name: &str, skill_path: &PathBuf) -> String {
    // 1. 首先检查是否为官方 Anthropic skill / First check if it's an official Anthropic skill
    if is_official_skill(skill_path) {
        return "Anthropic".to_string();
    }

    // 2. 然后检查是否从 marketplace 安装 / Then check if installed from marketplace
    let installed_plugins = read_installed_plugins();

    // 获取 skill 的所有可能名称（包括别名）/ Get all possible names for skill (including aliases)
    let skill_aliases = get_skill_aliases(skill_name);

    // 遍历所有已安装的 plugins，查找匹配的 skill / Iterate through all installed plugins to find matching skill
    for (plugin_full_name, _versions) in installed_plugins.plugins.iter() {
        // plugin_full_name 格式: "skill-name@marketplace-id"
        // plugin_full_name format: "skill-name@marketplace-id"
        if let Some(at_pos) = plugin_full_name.find('@') {
            let plugin_skill_name = &plugin_full_name[..at_pos];
            let marketplace_id = &plugin_full_name[at_pos + 1..];

            // 检查是否匹配任何一个别名 / Check if matches any alias
            for alias in skill_aliases.iter() {
                if plugin_skill_name == alias {
                    return get_marketplace_name(marketplace_id);
                }
            }
        }
    }

    // 默认为 Local / Default to Local (表示本地的 skill，不是从 marketplace 安装的)
    "Local".to_string()
}

/// Skill representation for frontend
/// 前端的 Skill 表示
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrontendSkill {
    pub name: String,
    pub display_name: String,
    pub description: String,
    pub category: String,
    pub marketplace: String, // 添加 marketplace 字段 / Add marketplace field
    pub path: String,
    pub command: String,
}

/// Get skills directory path
/// 获取 skills 目录路径
fn get_skills_dir() -> PathBuf {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    home.join(".claude").join("skills")
}

/// Get project root for skill scanning
/// 获取用于扫描 skills 的项目根目录
fn get_project_root() -> Option<PathBuf> {
    if let Ok(root) = std::env::var("SKILL_LAUNCHER_PROJECT_ROOT") {
        let path = PathBuf::from(root);
        if path.exists() {
            return Some(path);
        }
    }

    std::env::current_dir().ok()
}

/// Get ordered skill directories
/// 获取按优先级排序的 skills 目录列表
fn get_skill_directories() -> Vec<PathBuf> {
    let mut dirs = Vec::new();

    if let Some(project_root) = get_project_root() {
        dirs.push(project_root.join("skills"));
        dirs.push(project_root.join(".codex").join("skills"));
        dirs.push(project_root.join(".claude").join("skills"));
    }

    dirs.push(get_skills_dir());

    dirs
}

/// Scan a single directory and append skills with de-duplication
/// 扫描单个目录并去重追加 skills
fn scan_directory(dir: &PathBuf, skills: &mut Vec<FrontendSkill>, seen: &mut HashSet<String>) -> Result<(), String> {
    if !dir.exists() {
        return Ok(());
    }

    let entries = fs::read_dir(dir)
        .map_err(|e| format!("无法读取 skills 目录: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;

        if !entry.path().is_dir() {
            continue;
        }

        let skill_name = entry.file_name();
        if let Some(name_str) = skill_name.to_str() {
            if name_str.starts_with('.') {
                continue;
            }
        }

        if let Some(skill) = parse_skill(&entry.path()) {
            if seen.insert(skill.name.clone()) {
                skills.push(skill);
            }
        }
    }

    Ok(())
}

/// Scan skills directory and return all skills
/// 扫描 skills 目录并返回所有 skills
#[tauri::command]
pub fn scan_skills_directory() -> Result<Vec<FrontendSkill>, String> {
    let mut skills = vec![];
    let mut seen: HashSet<String> = HashSet::new();

    for dir in get_skill_directories().iter() {
        scan_directory(dir, &mut skills, &mut seen)?;
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

    // Get marketplace from plugins configuration / 从 plugins 配置获取 marketplace
    let marketplace = get_skill_marketplace(&skill_name, skill_path);

    Some(FrontendSkill {
        name: skill_name.clone(),
        display_name: name.unwrap_or(skill_name.clone()),
        description,
        category,
        marketplace,
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
                    "description" => {
                        // Remove surrounding quotes if present / 移除外围引号
                        let cleaned = value.trim_matches('"');
                        description = Some(cleaned.to_string());
                    }
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

/// Check if a skill is an official Anthropic skill by reading its SKILL.md
/// 通过读取 SKILL.md 检查是否为 Anthropic 官方 skill
fn is_official_skill(skill_path: &PathBuf) -> bool {
    let readme_path = skill_path.join("SKILL.md");

    if let Ok(content) = fs::read_to_string(&readme_path) {
        // Check for license in front matter / 检查 front matter 中的 license
        let front_matter_regex = regex::Regex::new(r"^---\n([\s\S]+?)\n---").unwrap();

        if let Some(caps) = front_matter_regex.captures(&content) {
            for line in caps[1].split('\n') {
                if let Some((key, value)) = line.split_once(':') {
                    if key.trim() == "license" {
                        let license = value.trim().to_lowercase();
                        // Official skills have proprietary licenses / 官方 skills 使用专有许可证
                        return license.contains("proprietary") ||
                               license.contains("license.txt") ||
                               license.contains("complete terms");
                    }
                }
            }
        }
    }

    false
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
