import fs from 'fs';
import ics from 'ics';

const events = [];

// Key Milestones & Exams
events.push(
  {
    title: 'BPGP Prep Starts: Take CAT & GMAT Diagnostic Mocks',
    start: [2026, 6, 17, 9, 0],
    duration: { hours: 3 },
    description: 'Phase 0 begins. Take official diagnostic mocks to evaluate strengths & weaknesses.',
    location: 'Study Desk'
  },
  {
    title: 'Target GMAT Focus Exam (First Attempt)',
    start: [2026, 10, 5, 10, 0],
    duration: { hours: 3 },
    description: 'Scheduled attempt for GMAT Focus Edition. Focus on Quant, Verbal, and Data Insights.',
    location: 'Pearson Test Center'
  },
  {
    title: 'CAT 2026 Exam Day',
    start: [2026, 11, 29, 9, 0],
    duration: { hours: 2 },
    description: 'Common Admission Test (CAT) 2026. Arrive early at exam center.',
    location: 'CAT Exam Center'
  },
  {
    title: 'IIMA BPGP Application Portal Opens',
    start: [2026, 12, 15, 10, 0],
    duration: { hours: 1 },
    description: 'Start drafting SOP, preparing resume, and contacting references for Letters of Recommendation.',
    location: 'iima.ac.in'
  },
  {
    title: 'BPGP Application Submission Deadline',
    start: [2027, 4, 5, 23, 59],
    duration: { minutes: 1 },
    description: 'Submit your completed application including SOP, work details, reference letters, and scores (GMAT/CAT).',
    location: 'iima.ac.in'
  },
  {
    title: 'IIMA Admission Test (IAT) Exam',
    start: [2027, 5, 9, 10, 0],
    duration: { hours: 2, minutes: 30 },
    description: 'Admissions test for BPGP (for those without GMAT/CAT or wanting another attempt).',
    location: 'Assigned Center'
  },
  {
    title: 'BPGP Personal Interview (PI) Window Starts',
    start: [2027, 6, 15, 9, 0],
    duration: { hours: 8 },
    description: 'Interviews held by IIM Ahmedabad panel. Review resume, case studies, and business news.',
    location: 'IIM Ahmedabad / Online'
  },
  {
    title: 'BPGP Cohort Admission Results Announced',
    start: [2027, 7, 1, 12, 0],
    duration: { hours: 1 },
    description: 'Admissions selection list published by IIM Ahmedabad.',
    location: 'iima.ac.in'
  }
);

// Phase Blocks (All-Day Events)
const phases = [
  { title: 'PHASE 0: Diagnostic Mocks & Setup', start: [2026, 6, 17], end: [2026, 6, 22] },
  { title: 'PHASE 1: Core Foundation Building', start: [2026, 6, 22], end: [2026, 8, 17] },
  { title: 'PHASE 2: Speed, Accuracy & GMAT Take', start: [2026, 8, 17], end: [2026, 10, 12] },
  { title: 'PHASE 3: CAT Mock Intensive', start: [2026, 10, 12], end: [2026, 11, 16] },
  { title: 'PHASE 4: Final Taper & Revision', start: [2026, 11, 16], end: [2026, 11, 30] },
  { title: 'PHASE 5: Application Submission & IAT Prep', start: [2026, 11, 30], end: [2027, 5, 10] },
  { title: 'PHASE 6: Interview Preparation & PI Rounds', start: [2027, 5, 10], end: [2027, 7, 2] }
];

phases.forEach(p => {
  events.push({
    title: p.title,
    start: p.start,
    end: p.end,
    description: 'Study Plan Phase Block'
  });
});

// Weekly Study Slots (Recurring until Nov 29, 2026)
const recurrenceRule = 'FREQ=WEEKLY;UNTIL=20261129T235959Z';

events.push(
  {
    title: 'Study: Quant Concept & Exercises',
    start: [2026, 6, 22, 19, 0],
    duration: { hours: 2, minutes: 30 },
    description: 'Quant Concept + 10 problems.',
    recurrenceRule
  },
  {
    title: 'Study: Verbal RC & Critical Reasoning',
    start: [2026, 6, 23, 19, 0],
    duration: { hours: 2, minutes: 30 },
    description: 'RC passage + reading + CR set.',
    recurrenceRule
  },
  {
    title: 'Study: DILR / GMAT Data Insights',
    start: [2026, 6, 17, 19, 0],
    duration: { hours: 2, minutes: 30 },
    description: 'Data Insights / DILR (2 sets).',
    recurrenceRule
  },
  {
    title: 'Study: Quant Concept & Exercises',
    start: [2026, 6, 18, 19, 0],
    duration: { hours: 2, minutes: 30 },
    description: 'Quant Concept + 10 problems.',
    recurrenceRule
  },
  {
    title: 'Study: Verbal: CAT VA & GMAT CR',
    start: [2026, 6, 19, 19, 0],
    duration: { hours: 2, minutes: 30 },
    description: 'Verbal: CAT VA + GMAT CR.',
    recurrenceRule
  },
  {
    title: 'Study: Data/Logic Sets & Quant Test',
    start: [2026, 6, 20, 14, 0],
    duration: { hours: 4, minutes: 30 },
    description: 'Data/Logic sets + quant topic test + weak areas.',
    recurrenceRule
  },
  {
    title: 'Study: Verbal Test, Mock & Error Log',
    start: [2026, 6, 21, 10, 0],
    duration: { hours: 4, minutes: 30 },
    description: 'Verbal topic test + weekly mock + error-log update.',
    recurrenceRule
  }
);

ics.createEvents(events, (error, value) => {
  if (error) {
    console.error('Failed to create ICS events:', error);
    process.exit(1);
  }
  fs.writeFileSync('iima_bpgp_2027_study_plan.ics', value);
  console.log('Successfully generated iima_bpgp_2027_study_plan.ics at the workspace root!');
  process.exit(0);
});
