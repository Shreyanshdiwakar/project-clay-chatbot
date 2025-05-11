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

**September**
   - {{adjustToHighSchool}}
   - Establish strong study habits from the beginning
   - Learn to navigate your new school environment
   - Start documenting your high school activities for future college applications
   - {{studySkillsStrategy}}

**October**
   - Explore and join 2-3 clubs/activities that interest you
   - Attend homecoming events to build school spirit
   - {{freshmanFallEvents}}
   - Begin thinking about how to develop your interests through extracurriculars
   - Meet with your school counselor to introduce yourself and discuss goals

**November**
   - Prepare for first major exams
   - Connect with teachers during office hours
   - Begin volunteer work (10+ hours recommended) 
   - {{academicSupport}}
   - Research what career paths align with your favorite subjects

**December**
   - Review first semester performance
   - {{midYearReflection}}
   - Participate in winter extracurricular activities
   - Create a portfolio or journal to track your high school achievements
   - {{holidaySkillDevelopment}}

**January**
   - Set academic goals for spring semester
   - Check in with counselor about course progress
   - {{freshmanWinterGoals}}
   - Begin researching early college preparation resources
   - Start exploring career options based on your interests and strengths

**February**
   - {{freshmanSpringActivities}}
   - Start thinking about sophomore year course selection
   - Attend school events to explore new interests
   - Look into academic competitions related to your interests
   - Begin reading about college requirements for potential career paths

**March**
   - Meet with your counselor to create a four-year high school plan
   - Research honors/advanced courses for next year
   - Begin looking at extracurricular leadership opportunities
   - {{courseSelectionStrategy}}
   - Start building relationships with teachers in your areas of interest

**April**
   - Research summer opportunities: {{summerOpportunities}}
   - Register for sophomore year courses
   - {{springAcademicFocus}}
   - Consider academic summer programs to explore potential majors
   - Research skill-building workshops or classes to take over summer

**May**
   - Prepare for final exams
   - Finalize summer plans
   - Set learning goals for summer break
   - {{examPreparationTips}}
   - Create a reading list of books related to potential careers or majors

**June**
   - {{summerDevelopment}}
   - Begin summer reading assignments
   - Start volunteer or community service work
   - Begin a passion project related to a potential college major
   - {{personalGrowthGoals}}

**July**
   - Continue summer activities or part-time job
   - Begin exploring potential career interests
   - {{summerSkillBuilding}}
   - Visit a local college campus to get familiar with college environments
   - Start developing computer literacy and research skills

**August**
   - Prepare for sophomore year
   - Reflect on freshman year accomplishments
   - {{prepForSophomore}}
   - Organize your achievements and activities from freshman year
   - Set specific academic and extracurricular goals for sophomore year`,
    variables: [
      'adjustToHighSchool',
      'freshmanSpringActivities',
      'summerOpportunities',
      'summerDevelopment',
      'freshmanFallEvents',
      'midYearReflection',
      'freshmanWinterGoals',
      'springAcademicFocus',
      'summerSkillBuilding',
      'prepForSophomore',
      'studySkillsStrategy',
      'academicSupport',
      'holidaySkillDevelopment',
      'courseSelectionStrategy',
      'examPreparationTips',
      'personalGrowthGoals'
    ]
  },
  
  'sophomore': {
    id: 'timeline-sophomore',
    name: 'Sophomore Year Timeline',
    description: 'Standard timeline for 10th grade students',
    template: `**Sophomore Year (10th Grade) Timeline**

**September**
   - {{deepenInvolvement}}
   - Take on more active roles in your clubs and activities
   - Establish relationships with teachers in your field of interest
   - Begin building a targeted extracurricular profile based on your interests
   - {{academicStrengthening}}

**October**
   - Prepare for and take the PSAT for practice
   - {{fallAcademicFocus}}
   - Start building your academic resume
   - Research the GPA and test score requirements for colleges you're interested in
   - Attend a career day or exploration event at your school

**November**
   - Research potential AP/IB/honors courses for junior year
   - Continue strong academic performance
   - {{sophomoreCollegeAwareness}}
   - Begin keeping track of achievements and activities for college applications
   - {{earlyCollegeResearch}}

**December**
   - Review semester performance
   - Set goals for improvement in specific subjects
   - Begin thinking about college requirements
   - Research college costs and create a financial planning timeline
   - {{winterBreakEnrichment}}

**January**
   - Meet with counselor to discuss junior year course selection
   - {{midYearCourseAdjustments}}
   - Review PSAT results and identify areas for improvement
   - Create a target list of safety, match, and reach colleges
   - Begin researching scholarship opportunities for your specific interests

**February**
   - Begin researching college majors related to your interests
   - Consider taking SAT Subject Tests in courses you excel in
   - Attend college fairs or information sessions
   - {{careerExploration}}
   - Start developing specific talents in your areas of interest

**March**
   - Plan challenging junior year schedule
   - {{springCollegePrep}}
   - Research summer programs related to your interests
   - Explore dual enrollment or community college courses for the summer
   - Research volunteer opportunities aligned with your career interests

**April**
   - Register for SAT/ACT prep courses or materials
   - Consider job shadowing opportunities
   - {{springTestPreparation}}
   - Develop a standardized test preparation strategy and timeline
   - Research summer internships or research programs in your field

**May**
   - Prepare for final exams and AP tests if applicable
   - Finalize summer plans
   - Focus on building specific skills related to your interests
   - {{apExamStrategies}}
   - Begin drafting a resume with all your activities and achievements

**June**
   - {{summerPrograms}}
   - Begin SAT/ACT preparation
   - Start meaningful summer activities (internship, volunteer work, etc.)
   - Visit college campuses to get a feel for different environments
   - {{summerCollegeExploration}}

**July**
   - Continue SAT/ACT preparation
   - {{leadershipOpportunities}}
   - Research colleges that match your interests and goals
   - Develop leadership skills through summer activities
   - Create a reading list of books related to your intended major

**August**
   - Prepare for increased rigor of junior year
   - Organize your college research
   - {{prepForJunior}}
   - Create a junior year action plan with specific college prep goals
   - Schedule fall meetings with your guidance counselor`,
    variables: [
      'deepenInvolvement',
      'fallAcademicFocus',
      'springCollegePrep',
      'summerPrograms',
      'leadershipOpportunities',
      'sophomoreCollegeAwareness',
      'midYearCourseAdjustments',
      'springTestPreparation',
      'prepForJunior',
      'academicStrengthening',
      'earlyCollegeResearch',
      'winterBreakEnrichment',
      'careerExploration',
      'apExamStrategies',
      'summerCollegeExploration'
    ]
  },
  
  'junior': {
    id: 'timeline-junior',
    name: 'Junior Year Timeline',
    description: 'Standard timeline for 11th grade students',
    template: `**Junior Year (11th Grade) Timeline**

**September**
   - {{academicRigor}}
   - Focus on achieving your best GPA this year
   - Continue deepening commitment to key extracurriculars

**October**
   - Take the PSAT/NMSQT (potential scholarship qualification)
   - {{extracurricularLeadership}}
   - Begin serious college research

**November**
   - Meet with your counselor to discuss college planning
   - Start preparing for SAT/ACT
   - {{juniorCollegeList}}

**December**
   - Review semester performance
   - Create study schedule for standardized tests
   - Begin researching scholarship opportunities

**January**
   - Register for spring SAT/ACT dates
   - {{midYearCollegePrep}}
   - Consider taking SAT Subject Tests if needed by your target schools

**February**
   - Intensify SAT/ACT preparation
   - Research potential college majors
   - {{collegeResearch}}

**March**
   - Take SAT/ACT (first attempt)
   - Visit college campuses during spring break
   - {{apAdvancedCourses}}

**April**
   - Continue college visits if possible
   - Prepare for AP/IB exams
   - Request recommendation letters from teachers

**May**
   - Take AP/IB exams
   - Consider retaking SAT/ACT if needed
   - {{springStandardizedTests}}

**June**
   - {{summerBeforeSenior}}
   - Begin drafting college essays
   - Plan meaningful summer activities

**July**
   - Work on college application essays
   - {{specificSummerActivities}}
   - Visit additional colleges if possible

**August**
   - Finalize college list (6-10 schools)
   - Complete first drafts of college essays
   - {{prepForSeniorApplications}}`,
    variables: [
      'academicRigor',
      'extracurricularLeadership',
      'collegeResearch',
      'apAdvancedCourses',
      'summerBeforeSenior',
      'specificSummerActivities',
      'juniorCollegeList',
      'midYearCollegePrep',
      'springStandardizedTests',
      'prepForSeniorApplications'
    ]
  },
  
  'senior': {
    id: 'timeline-senior',
    name: 'Senior Year Timeline',
    description: 'Standard timeline for 12th grade students',
    template: `**Senior Year (12th Grade) Timeline**

**September**
   - Finalize your college list with safety, match, and reach schools
   - {{applicationStrategy}}
   - Complete your Common Application profile
   - Work on college essays

**October**
   - Submit Early Decision/Early Action applications (deadlines typically Nov 1-15)
   - Complete FAFSA (opens October 1)
   - Retake SAT/ACT if needed (last chance for most early applications)
   - {{earlyApplications}}

**November**
   - Submit remaining early applications
   - Begin working on regular decision applications
   - {{fallSeniorAdvice}}
   - Continue scholarship search and applications

**December**
   - Receive early application results
   - Complete and submit regular decision applications
   - Maintain strong grades for mid-year reports
   - {{regularApplications}}

**January**
   - Submit remaining applications (most regular deadlines are January 1-15)
   - Request mid-year reports be sent to colleges
   - {{midYearSeniorAdvice}}
   - Continue scholarship applications

**February**
   - Follow up with colleges to confirm all materials were received
   - Focus on maintaining grades
   - Complete additional scholarship applications
   - {{waitingPeriodAdvice}}

**March**
   - Receive admission decisions from regular decision schools
   - Compare financial aid offers
   - Visit or revisit top choice schools
   - {{financialAidAdvice}}

**April**
   - Make your final college decision (most deposits due May 1)
   - Accept financial aid package
   - Send deposit to chosen college
   - {{finalDecisionAdvice}}

**May**
   - Complete AP/IB exams
   - Send final transcripts to your chosen college
   - {{seniorYearCompletion}}
   - Thank teachers and counselors who wrote recommendations

**June**
   - Attend graduation and celebrate your achievements
   - Prepare for college orientation
   - {{summerBeforeCollege}}

**July**
   - Complete required summer tasks from your college
   - {{preparationForCollege}}
   - Connect with future roommates

**August**
   - Finalize packing and travel arrangements
   - Attend college orientation
   - {{collegeTransition}}`,
    variables: [
      'applicationStrategy',
      'earlyApplications',
      'fallSeniorAdvice',
      'regularApplications',
      'midYearSeniorAdvice',
      'waitingPeriodAdvice',
      'financialAidAdvice',
      'finalDecisionAdvice',
      'seniorYearCompletion',
      'summerBeforeCollege',
      'preparationForCollege',
      'collegeTransition'
    ]
  }
};

// Skill development templates based on interests
export const SKILL_TEMPLATES: TemplateMap = {
  'stem': {
    id: 'skills-stem',
    name: 'STEM Skills Development',
    description: 'Core skills for science, technology, engineering, and mathematics',
    template: `**Core Science, Technology, Engineering and Math Skills to Develop**

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