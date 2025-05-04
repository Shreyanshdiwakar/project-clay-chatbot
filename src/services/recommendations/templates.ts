/**
 * Recommendation Templates
 * 
 * This module provides standardized templates for various aspects of 
 * college counseling recommendations. These templates are designed to be
 * consistent while allowing for AI personalization in specific areas.
 */

export interface RecommendationTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];  // Variables that will be replaced with AI-generated content
}

interface TemplateMap {
  [key: string]: RecommendationTemplate
}

// Timeline templates based on grade level
export const TIMELINE_TEMPLATES: TemplateMap = {
  'freshman': {
    id: 'timeline-freshman',
    name: 'Freshman Year Timeline',
    description: 'Standard timeline for 9th grade students',
    template: `**Freshman Year (9th Grade) Timeline**

1. **Fall Semester**
   - {{adjustToHighSchool}}
   - Join 2-3 clubs/activities that interest you
   - Establish strong study habits and academic foundation

2. **Spring Semester**
   - {{freshmanSpringActivities}}
   - Create a four-year high school plan with your counselor
   - Research summer opportunities: {{summerOpportunities}}

3. **Summer Before Sophomore Year**
   - {{summerDevelopment}}
   - Begin exploring potential career interests
   - Volunteer or participate in enrichment programs`,
    variables: [
      'adjustToHighSchool',
      'freshmanSpringActivities',
      'summerOpportunities',
      'summerDevelopment'
    ]
  },
  
  'sophomore': {
    id: 'timeline-sophomore',
    name: 'Sophomore Year Timeline',
    description: 'Standard timeline for 10th grade students',
    template: `**Sophomore Year (10th Grade) Timeline**

1. **Fall Semester**
   - {{deepenInvolvement}}
   - Take the PSAT for practice
   - {{fallAcademicFocus}}

2. **Spring Semester**
   - Consider taking SAT Subject Tests in courses you excel in
   - Begin researching college majors related to your interests
   - {{springCollegePrep}}

3. **Summer Before Junior Year**
   - {{summerPrograms}}
   - Consider job shadowing in fields of interest
   - {{leadershipOpportunities}}`,
    variables: [
      'deepenInvolvement',
      'fallAcademicFocus',
      'springCollegePrep',
      'summerPrograms',
      'leadershipOpportunities'
    ]
  },
  
  'junior': {
    id: 'timeline-junior',
    name: 'Junior Year Timeline',
    description: 'Standard timeline for 11th grade students',
    template: `**Junior Year (11th Grade) Timeline**

1. **Fall Semester**
   - {{academicRigor}}
   - Take the PSAT/NMSQT (potential scholarship qualification)
   - {{extracurricularLeadership}}

2. **Winter/Spring Semester**
   - Take SAT/ACT (first attempt)
   - {{collegeResearch}}
   - Visit college campuses during spring break
   - {{apAdvancedCourses}}

3. **Summer Before Senior Year**
   - {{summerBeforeSenior}}
   - Begin drafting college essays
   - Finalize college list (6-10 schools)
   - {{specificSummerActivities}}`,
    variables: [
      'academicRigor',
      'extracurricularLeadership',
      'collegeResearch',
      'apAdvancedCourses',
      'summerBeforeSenior',
      'specificSummerActivities'
    ]
  },
  
  'senior': {
    id: 'timeline-senior',
    name: 'Senior Year Timeline',
    description: 'Standard timeline for 12th grade students',
    template: `**Senior Year (12th Grade) Timeline**

1. **Fall Semester**
   - Finalize college applications (Early Decision/Action by Nov, Regular by Jan)
   - {{applicationStrategy}}
   - Retake SAT/ACT if needed
   - {{fallSeniorAdvice}}

2. **Winter/Spring Semester**
   - Complete FAFSA and financial aid applications
   - Review college acceptances and financial aid packages
   - {{finalDecision}}
   - Maintain grades (avoid senioritis!)

3. **Summer Before College**
   - {{summerBeforeCollege}}
   - Attend college orientation
   - {{transitionPreparation}}`,
    variables: [
      'applicationStrategy',
      'fallSeniorAdvice',
      'finalDecision',
      'summerBeforeCollege',
      'transitionPreparation'
    ]
  }
};

// Skill development templates based on interests
export const SKILL_TEMPLATES: TemplateMap = {
  'stem': {
    id: 'skills-stem',
    name: 'STEM Skills Development',
    description: 'Core skills for science, technology, engineering, and mathematics',
    template: `**Core STEM Skills to Develop**

1. **Technical Skills**
   - {{technicalSkills}}
   - Learn a programming language (Python recommended for beginners)
   - Develop quantitative analysis capabilities

2. **Research & Analysis**
   - {{researchMethods}}
   - Practice the scientific method
   - Develop skills in data visualization

3. **Communication & Collaboration**
   - {{stemCommunication}}
   - Learn to explain complex concepts in simple terms
   - Practice documenting your work thoroughly`,
    variables: [
      'technicalSkills',
      'researchMethods',
      'stemCommunication'
    ]
  },
  
  'humanities': {
    id: 'skills-humanities',
    name: 'Humanities & Social Sciences Skills',
    description: 'Core skills for humanities and social sciences',
    template: `**Core Humanities & Social Sciences Skills**

1. **Critical Analysis**
   - {{criticalThinking}}
   - Develop strong argumentative writing
   - Learn to evaluate sources and evidence

2. **Research & Writing**
   - {{humanitiesResearch}}
   - Practice various writing styles
   - Develop interviewing techniques

3. **Communication & Presentation**
   - {{presentationSkills}}
   - Practice public speaking and debate
   - Learn to receive and incorporate feedback`,
    variables: [
      'criticalThinking',
      'humanitiesResearch',
      'presentationSkills'
    ]
  },
  
  'business': {
    id: 'skills-business',
    name: 'Business & Entrepreneurship Skills',
    description: 'Core skills for business, finance, and entrepreneurship',
    template: `**Core Business & Entrepreneurship Skills**

1. **Financial Literacy**
   - {{financialSkills}}
   - Understand basic accounting principles
   - Learn investment and budgeting basics

2. **Leadership & Management**
   - {{leadershipSkills}}
   - Develop project management capabilities
   - Learn effective teamwork and delegation

3. **Marketing & Communication**
   - {{businessCommunication}}
   - Practice professional presentation skills
   - Develop networking abilities`,
    variables: [
      'financialSkills',
      'leadershipSkills',
      'businessCommunication'
    ]
  },
  
  'arts': {
    id: 'skills-arts',
    name: 'Arts & Creative Skills',
    description: 'Core skills for visual, performing, and creative arts',
    template: `**Core Arts & Creative Skills**

1. **Technical Proficiency**
   - {{technicalArtSkills}}
   - Develop consistent practice routines
   - Learn to take constructive criticism

2. **Portfolio Development**
   - {{portfolioAdvice}}
   - Document your creative process
   - Learn curation and presentation

3. **Business of Arts**
   - {{artsBusiness}}
   - Develop self-promotion skills
   - Learn about intellectual property rights`,
    variables: [
      'technicalArtSkills',
      'portfolioAdvice',
      'artsBusiness'
    ]
  }
};

// Project templates based on interests and goals
export const PROJECT_TEMPLATES: TemplateMap = {
  'research': {
    id: 'project-research',
    name: 'Independent Research Project',
    description: 'Template for developing independent research',
    template: `**Independent Research Project Framework**

1. **Project Development**
   - {{researchTopic}}
   - Identify a mentor (teacher, professor, professional)
   - Develop a clear research question and methodology

2. **Implementation**
   - {{researchImplementation}}
   - Set a realistic timeline with milestones
   - Document your process meticulously

3. **Presentation & Publication**
   - {{researchPresentation}}
   - Prepare for science fairs or competitions
   - Consider submitting to student journals`,
    variables: [
      'researchTopic',
      'researchImplementation',
      'researchPresentation'
    ]
  },
  
  'community': {
    id: 'project-community',
    name: 'Community Service Project',
    description: 'Template for developing community service initiatives',
    template: `**Community Service Project Framework**

1. **Needs Assessment**
   - {{communityNeed}}
   - Research existing initiatives in your community
   - Identify key stakeholders and potential partners

2. **Project Planning**
   - {{serviceProjectPlan}}
   - Create measurable goals and impact metrics
   - Develop a resource and volunteer management plan

3. **Implementation & Sustainability**
   - {{serviceImplementation}}
   - Document your impact (photos, testimonials, data)
   - Create a transition plan for project continuity`,
    variables: [
      'communityNeed',
      'serviceProjectPlan',
      'serviceImplementation'
    ]
  },
  
  'entrepreneurship': {
    id: 'project-entrepreneurship',
    name: 'Entrepreneurial Venture',
    description: 'Template for developing small business or social enterprise',
    template: `**Entrepreneurial Project Framework**

1. **Concept Development**
   - {{businessConcept}}
   - Research market needs and competition
   - Develop a unique value proposition

2. **Business Planning**
   - {{businessPlan}}
   - Create a basic business model
   - Plan for minimal viable product (MVP)

3. **Launch & Learning**
   - {{businessLaunch}}
   - Document challenges and pivots
   - Measure results and gather feedback`,
    variables: [
      'businessConcept',
      'businessPlan',
      'businessLaunch'
    ]
  },
  
  'creative': {
    id: 'project-creative',
    name: 'Creative Portfolio Project',
    description: 'Template for developing artistic or creative works',
    template: `**Creative Portfolio Project Framework**

1. **Concept Development**
   - {{creativeConceptIdeas}}
   - Research artists/creators in your field
   - Develop a theme or central question

2. **Production Process**
   - {{creativeProcess}}
   - Set milestones and deadlines
   - Seek regular feedback from mentors

3. **Exhibition & Sharing**
   - {{creativeExhibition}}
   - Document and present your work professionally
   - Develop an artist statement or project narrative`,
    variables: [
      'creativeConceptIdeas',
      'creativeProcess',
      'creativeExhibition'
    ]
  }
};

/**
 * Select the most appropriate templates based on student profile
 */
export function selectTemplates(profile: any) {
  const templates: {
    timeline: RecommendationTemplate | null;
    skills: RecommendationTemplate[];
    projects: RecommendationTemplate[];
  } = {
    timeline: null,
    skills: [],
    projects: []
  };
  
  // Select timeline based on grade level
  const grade = profile.gradeLevel.toLowerCase();
  if (grade.includes('9') || grade.includes('fresh')) {
    templates.timeline = TIMELINE_TEMPLATES['freshman'];
  } else if (grade.includes('10') || grade.includes('soph')) {
    templates.timeline = TIMELINE_TEMPLATES['sophomore'];
  } else if (grade.includes('11') || grade.includes('jun')) {
    templates.timeline = TIMELINE_TEMPLATES['junior'];
  } else if (grade.includes('12') || grade.includes('sen')) {
    templates.timeline = TIMELINE_TEMPLATES['senior'];
  }
  
  // Select skills and projects based on interests and major
  const major = profile.intendedMajor.toLowerCase();
  const activities = (profile.currentActivities + ' ' + profile.interestedActivities).toLowerCase();
  
  if (major.includes('comput') || major.includes('engineer') || major.includes('math') || 
      major.includes('physics') || major.includes('science') || major.includes('biology') || 
      major.includes('chemistry')) {
    templates.skills.push(SKILL_TEMPLATES['stem']);
    templates.projects.push(PROJECT_TEMPLATES['research']);
  }
  
  if (major.includes('english') || major.includes('history') || major.includes('philosophy') || 
      major.includes('psychology') || major.includes('sociology') || major.includes('political') || 
      major.includes('language')) {
    templates.skills.push(SKILL_TEMPLATES['humanities']);
  }
  
  if (major.includes('business') || major.includes('economics') || major.includes('finance') || 
      major.includes('marketing') || major.includes('account')) {
    templates.skills.push(SKILL_TEMPLATES['business']);
    templates.projects.push(PROJECT_TEMPLATES['entrepreneurship']);
  }
  
  if (major.includes('art') || major.includes('music') || major.includes('theater') || 
      major.includes('film') || major.includes('design') || major.includes('creative') || 
      major.includes('writing')) {
    templates.skills.push(SKILL_TEMPLATES['arts']);
    templates.projects.push(PROJECT_TEMPLATES['creative']);
  }
  
  // Add community service project template if relevant
  if (activities.includes('volunteer') || activities.includes('community') || activities.includes('service') || 
      activities.includes('non-profit') || activities.includes('nonprofit')) {
    templates.projects.push(PROJECT_TEMPLATES['community']);
  }
  
  // Ensure at least one skill and project template is selected
  if (templates.skills.length === 0) {
    templates.skills.push(SKILL_TEMPLATES['stem']); // Default to STEM
  }
  
  if (templates.projects.length === 0) {
    templates.projects.push(PROJECT_TEMPLATES['research']); // Default to research
  }
  
  return templates;
} 