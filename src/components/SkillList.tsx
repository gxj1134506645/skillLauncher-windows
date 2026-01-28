import type { Skill } from "../types/skill";

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
      {skills.map((skill, index) => (
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
          <div className="skill-item-name">
            {skill.displayName || skill.name}
          </div>
          {skill.description && (
            <div className="skill-item-description">{skill.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}
