const skillCatalog = [
  ['JavaScript', ['javascript', 'js']],
  ['TypeScript', ['typescript', 'ts']],
  ['Python', ['python']],
  ['Java', ['java']],
  ['C++', ['c++']],
  ['C#', ['c#', 'c sharp']],
  ['React', ['react', 'react.js', 'reactjs']],
  ['Angular', ['angular']],
  ['Vue.js', ['vue', 'vue.js', 'vuejs']],
  ['Node.js', ['node.js', 'nodejs']],
  ['Express', ['express', 'express.js']],
  ['HTML', ['html', 'html5']],
  ['CSS', ['css', 'css3']],
  ['.NET', ['.net', 'dotnet']],
  ['Spring Boot', ['spring boot']],
  ['Django', ['django']],
  ['Flask', ['flask']],
  ['SQL', ['sql']],
  ['PostgreSQL', ['postgresql', 'postgres']],
  ['MySQL', ['mysql']],
  ['MongoDB', ['mongodb', 'mongo db']],
  ['Redis', ['redis']],
  ['REST APIs', ['rest api', 'restful api', 'rest apis']],
  ['GraphQL', ['graphql']],
  ['AWS', ['aws', 'amazon web services']],
  ['Azure', ['azure']],
  ['Google Cloud', ['google cloud', 'gcp']],
  ['Docker', ['docker', 'containerization']],
  ['Kubernetes', ['kubernetes', 'k8s']],
  ['CI/CD', ['ci/cd', 'continuous integration', 'continuous delivery']],
  ['Git', ['git', 'github', 'gitlab']],
  ['Jenkins', ['jenkins']],
  ['Linux', ['linux']],
  ['Unit testing', ['unit testing', 'unit tests', 'jest', 'mocha']],
  ['Agile', ['agile', 'scrum']],
  ['Machine learning', ['machine learning', ' ml ', 'ml model']],
  ['Data analysis', ['data analysis', 'data analytics']],
  ['TensorFlow', ['tensorflow']],
  ['PyTorch', ['pytorch']],
  ['Power BI', ['power bi', 'powerbi']],
  ['Tableau', ['tableau']],
  ['Excel', ['excel', 'microsoft excel']],
  ['Figma', ['figma']],
  ['Salesforce', ['salesforce']],
  ['Communication', ['communication', 'communicate']],
  ['Project management', ['project management', 'project manager']],
  ['Leadership', ['leadership', 'led a team', 'team lead']],
];

const sectionRules = [
  ['Experience', /(?:^|\n)\s*(?:professional\s+experience|work\s+experience|employment\s+history|experience)\s*(?:\n|$)/i],
  ['Education', /(?:^|\n)\s*(?:education|academic\s+background)\s*(?:\n|$)/i],
  ['Skills', /(?:^|\n)\s*(?:technical\s+)?skills\s*(?:\n|$)/i],
  ['Projects', /(?:^|\n)\s*(?:selected\s+)?projects\s*(?:\n|$)/i],
];

function includesTerm(text, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i').test(text);
}

function findSkills(text) {
  const normalizedText = ` ${text.toLowerCase().replace(/\s+/g, ' ')} `;
  return skillCatalog
    .filter(([, aliases]) => aliases.some((alias) => includesTerm(normalizedText, alias)))
    .map(([skill]) => skill);
}

function buildStrengths(matchedSkills, sections, hasMetrics) {
  const strengths = [];
  if (matchedSkills.length) {
    strengths.push(`Your resume mentions ${matchedSkills.slice(0, 4).join(', ')} from the role’s requirements.`);
  }
  if (sections.includes('Experience')) strengths.push('A dedicated experience section makes your work history easier to review.');
  if (sections.includes('Projects')) strengths.push('A projects section gives you a place to show how you applied your skills.');
  if (hasMetrics) strengths.push('Numbers or measurable outcomes add useful context to your achievements.');
  return strengths;
}

function buildSuggestions(missingSkills, sections, hasMetrics) {
  const suggestions = [];
  if (missingSkills.length) {
    suggestions.push(`If accurate, add examples of ${missingSkills.slice(0, 5).join(', ')} to your skills or experience sections.`);
  }
  if (!sections.includes('Experience')) suggestions.push('Add a clearly labeled Experience section with role names, dates, and outcomes.');
  if (!sections.includes('Skills')) suggestions.push('Add a concise Skills section using terms that genuinely reflect your experience.');
  if (!sections.includes('Projects')) suggestions.push('Include relevant projects that demonstrate the requirements you have used.');
  if (!hasMetrics) suggestions.push('Where possible, quantify impact with specific results, scope, or time saved.');
  if (!suggestions.length) suggestions.push('Tailor your opening summary to the role and keep your strongest relevant achievements near the top.');
  return suggestions.slice(0, 5);
}

function analyzeResume({ resumeText, jobDescription, fileName }) {
  const requiredSkills = findSkills(jobDescription);
  const resumeSkills = findSkills(resumeText);
  const matchedSkills = requiredSkills.filter((skill) => resumeSkills.includes(skill));
  const missingSkills = requiredSkills.filter((skill) => !resumeSkills.includes(skill));
  const sections = sectionRules
    .filter(([, rule]) => rule.test(resumeText))
    .map(([name]) => name);
  const hasMetrics = /\b\d+(?:\.\d+)?\s*(?:%|percent|users|customers|clients|hours|days|weeks|months|years|projects|people|teams|revenue|requests)?\b/i.test(resumeText);
  const hasActionVerbs = /\b(?:built|created|delivered|developed|improved|increased|launched|led|managed|optimized|reduced|resolved|designed|automated)\b/i.test(resumeText);

  const skillPoints = requiredSkills.length ? (matchedSkills.length / requiredSkills.length) * 65 : 0;
  const sectionPoints = (sections.length / sectionRules.length) * 20;
  const evidencePoints = (Number(hasMetrics) + Number(hasActionVerbs)) * 7.5;
  const score = requiredSkills.length
    ? Math.round(Math.min(100, skillPoints + sectionPoints + evidencePoints))
    : 0;

  let summary;
  if (!requiredSkills.length) {
    summary = 'We could not identify common skills in this job description. Add detailed responsibilities and requirements for a more useful comparison.';
  } else if (score >= 75) {
    summary = `Your resume shows a strong starting match, with ${matchedSkills.length} of ${requiredSkills.length} identified role skills. Highlight these examples clearly when you apply.`;
  } else if (score >= 45) {
    summary = `There is a promising foundation: ${matchedSkills.length} of ${requiredSkills.length} identified role skills appear in your resume. A few targeted edits could make your fit clearer.`;
  } else {
    summary = `We found ${matchedSkills.length} of ${requiredSkills.length} identified role skills in your resume. Review the role requirements and highlight relevant experience you already have.`;
  }

  return {
    fileName,
    score,
    summary,
    matchedSkills,
    missingSkills,
    sections,
    strengths: buildStrengths(matchedSkills, sections, hasMetrics),
    suggestions: buildSuggestions(missingSkills, sections, hasMetrics),
    methodNote: 'This private, local analyzer uses keyword matching and resume structure checks—not a generative AI model. The score combines required-skill overlap, common resume sections, and evidence of measurable outcomes. It is guidance, not hiring advice; verify suggestions before editing your resume.',
  };
}

module.exports = { analyzeResume, findSkills };
