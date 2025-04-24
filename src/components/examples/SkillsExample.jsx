import React, { useState } from 'react';
import SkillBadge from '../ui/SkillBadge';
import SkillGroup from '../ui/SkillGroup';

const SkillsExample = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
    // In a real app, you might show more details about the skill here
    console.log(`Selected skill: ${skill}`);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Skills Component Examples</h2>
      
      {/* Individual SkillBadge examples */}
      <div className="mb-8">
        <h3 className="text-xl font-medium text-white/90 mb-4">Individual Skill Badges</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium text-white/80 mb-2">Size Variants</h4>
            <div className="flex flex-wrap items-center gap-2">
              <SkillBadge skill="React" size="sm" />
              <SkillBadge skill="JavaScript" size="md" />
              <SkillBadge skill="TypeScript" size="lg" />
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-white/80 mb-2">Learning Status</h4>
            <div className="flex flex-wrap items-center gap-2">
              <SkillBadge skill="React" />
              <SkillBadge skill="Vue" isLearning={true} />
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-white/80 mb-2">Different Categories</h4>
            <div className="flex flex-wrap items-center gap-2">
              <SkillBadge skill="React" /> {/* Frontend */}
              <SkillBadge skill="Node.js" /> {/* Backend */}
              <SkillBadge skill="MongoDB" /> {/* Database */}
              <SkillBadge skill="Docker" /> {/* DevOps */}
              <SkillBadge skill="Figma" /> {/* Design */}
              <SkillBadge skill="TensorFlow" /> {/* AI/ML */}
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-white/80 mb-2">Clickable Badges</h4>
            <div className="flex flex-wrap items-center gap-2">
              <SkillBadge 
                skill="React" 
                onClick={() => handleSkillClick("React")}
              />
              <SkillBadge 
                skill="Node.js" 
                onClick={() => handleSkillClick("Node.js")}
              />
            </div>
            {selectedSkill && (
              <div className="mt-2 text-white/70">
                Selected: <span className="font-semibold">{selectedSkill}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* SkillGroup examples */}
      <div>
        <h3 className="text-xl font-medium text-white/90 mb-4">Skill Groups</h3>
        
        <SkillGroup
          title="Frontend Development"
          skills={["React", "Angular", "Vue", "HTML", "CSS", "JavaScript", "TypeScript"]}
          learningSkills={["Svelte"]}
          onSkillClick={handleSkillClick}
        />
        
        <SkillGroup
          title="Backend Development"
          skills={["Node.js", "Express", "Django", "Flask"]}
          learningSkills={["FastAPI", "Rust"]}
          onSkillClick={handleSkillClick}
        />
        
        <SkillGroup
          title="Databases"
          skills={["MongoDB", "PostgreSQL", "MySQL"]}
          onSkillClick={handleSkillClick}
        />
        
        <SkillGroup
          title="DevOps & Tools"
          skills={["Docker", "Kubernetes", "AWS", "Git", "GitHub"]}
          learningSkills={["Terraform"]}
          badgeSize="sm"
          onSkillClick={handleSkillClick}
        />
      </div>
    </div>
  );
};

export default SkillsExample; 