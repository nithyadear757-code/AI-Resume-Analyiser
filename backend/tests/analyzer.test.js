const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeResume, findSkills } = require('../utils/analyzer');

test('findSkills recognizes common skills and aliases without matching partial words', () => {
  assert.deepEqual(findSkills('Built a JavaScript app with React and Node.js.'), [
    'JavaScript',
    'React',
    'Node.js',
  ]);
  assert.deepEqual(findSkills('I enjoy reacting to user feedback.'), []);
});

test('analyzer reports matched skills and actionable missing skill suggestions', () => {
  const result = analyzeResume({
    fileName: 'resume.txt',
    resumeText: [
      'Experience',
      'Developed a React app used by 2,000 customers.',
      'Skills',
      'React, JavaScript, Git',
      'Projects',
      'Built a portfolio website.',
      'Education',
      'Bachelor of Science',
    ].join('\n'),
    jobDescription: 'We need a React and JavaScript developer with experience in AWS, Docker, and PostgreSQL.',
  });

  assert.equal(result.fileName, 'resume.txt');
  assert.equal(result.score, 61);
  assert.deepEqual(result.matchedSkills, ['JavaScript', 'React']);
  assert.deepEqual(result.missingSkills, ['PostgreSQL', 'AWS', 'Docker']);
  assert.equal(result.sections.length, 4);
  assert.ok(result.suggestions[0].includes('PostgreSQL, AWS, Docker'));
  assert.match(result.methodNote, /not a generative AI model/);
});

test('analyzer explains when the job description has no recognized skills', () => {
  const result = analyzeResume({
    fileName: 'resume.txt',
    resumeText: 'Experience\nManaged a small team and improved delivery times by 15 percent.',
    jobDescription: 'Looking for a friendly person who enjoys solving interesting problems every day.',
  });

  assert.equal(result.score, 0);
  assert.deepEqual(result.matchedSkills, []);
  assert.match(result.summary, /could not identify common skills/i);
});
