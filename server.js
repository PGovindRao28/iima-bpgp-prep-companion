import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import ics from 'ics';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static assets from Vite build in production
app.use(express.static(path.join(__dirname, 'dist')));

const SYSTEM_INSTRUCTION = `You are the IIMA BPGP 2027 Study Companion, an AI tutor and preparation assistant dedicated to helping the user gain admission to the Blended Post Graduate Programme (BPGP) at IIM Ahmedabad for the 2027 cohort.

Here is the user's customized study plan:
- Goal: Admission to BPGP IIM Ahmedabad (2027 cohort).
- Profile: IIT graduate, 3+ years work experience.
- Exams to prepare: GMAT Focus Edition, CAT 2026, and IIMA Admission Test (IAT) 2027.
- Current Date: June 17, 2026. Preparation starts today!

Timeline:
- Phase 0: Diagnostic (June 17 – June 21, 2026) -> Take CAT mock + GMAT official mock. Set up error log.
- Phase 1: Foundations (June 22 – August 16, 2026) -> Cover all math, reading, and logical concepts.
- Phase 2: Application (August 17 – October 11, 2026) -> Speed, accuracy, GMAT drills. Take GMAT in early October.
- Phase 3: Mock Intensive (October 12 – November 15, 2026) -> 2-3 CAT mocks/week.
- Phase 4: Final Taper (November 16 – November 29, 2026) -> Revision, formula sheets. CAT exam on Nov 29, 2026.
- Phase 5: Application & IAT (November 30, 2026 – May 2027) -> Draft SOPs, resume prep, secure recommendations. Submit application (by early April). Revise core concepts for IAT (held in May).
- Phase 6: Interview Prep (May – June 2027) -> Work experience mapping, case studies, personal interviews (June).

Weekly Schedule (Working Professional, ~22 hrs/week):
- Monday: Quant concept + 10 problems (2.5 hrs, e.g., 7:00 PM - 9:30 PM)
- Tuesday: RC passage + reading + CR set (2.5 hrs)
- Wednesday: Data Insights / DILR (2 sets) (2.5 hrs)
- Thursday: Quant concept + 10 problems (2.5 hrs)
- Friday: Verbal: CAT VA + GMAT CR (2.5 hrs)
- Saturday: Data/Logic sets + quant topic test + weak areas (4-5 hrs)
- Sunday: Verbal topic test + weekly mock + error-log update (4-5 hrs)

Syllabus Focus:
- Quant: Numbers, Arithmetic (percentages, ratios, average, mixtures, TSD, work), Algebra (equations, functions, logs), Geometry (for CAT, light on GMAT), Modern Math (probability, sets).
- Verbal: Reading Comprehension, Critical Reasoning (assumptions, strengthen/weaken, inference). CAT verbal logic (para jumbles, summary).
- Data/Logic: Graphs, tables, multi-source reasoning, data sufficiency, logical arrangement, games.

Your role:
- Answer user queries about their study plan, schedules, and deadlines.
- Provide expert guidance and solve concepts/problems for CAT, GMAT, and IAT (Quant, Verbal, LR, DI).
- Help the user draft and refine their SOP, resume points, and prepare for interviews.
- Give motivational advice and help them analyze mock scores and update their error log.
- Keep responses concise, clear, and formatted in Markdown.
`;

// Helper: Convert JS array of events to ICS string
function generateICSData() {
  const events = [];

  // Key Milestones & Exams
  events.push(
    {
      title: 'BPGP Prep Starts: Take CAT & GMAT Diagnostic Mocks',
      start: [2026, 6, 17, 9, 0],
      duration: { hours: 3 },
      description: 'Phase 0 begins. Take official diagnostic mocks to evaluate strengths & weaknesses.',
      location: 'Study Desk',
      categories: ['Milestone', 'Exam']
    },
    {
      title: 'Target GMAT Focus Exam (First Attempt)',
      start: [2026, 10, 5, 10, 0],
      duration: { hours: 3 },
      description: 'Scheduled attempt for GMAT Focus Edition. Focus on Quant, Verbal, and Data Insights.',
      location: 'Pearson Test Center',
      categories: ['Exam']
    },
    {
      title: 'CAT 2026 Exam Day',
      start: [2026, 11, 29, 9, 0],
      duration: { hours: 2 },
      description: 'Common Admission Test (CAT) 2026. Arrive early at exam center.',
      location: 'CAT Exam Center',
      categories: ['Exam']
    },
    {
      title: 'IIMA BPGP Application Portal Opens',
      start: [2026, 12, 15, 10, 0],
      duration: { hours: 1 },
      description: 'Start drafting SOP, preparing resume, and contacting references for Letters of Recommendation.',
      location: 'iima.ac.in',
      categories: ['Milestone']
    },
    {
      title: 'BPGP Application Submission Deadline',
      start: [2027, 4, 5, 23, 59],
      duration: { minutes: 1 },
      description: 'Submit your completed application including SOP, work details, reference letters, and scores (GMAT/CAT).',
      location: 'iima.ac.in',
      categories: ['Milestone']
    },
    {
      title: 'IIMA Admission Test (IAT) Exam',
      start: [2027, 5, 9, 10, 0],
      duration: { hours: 2, minutes: 30 },
      description: 'Admissions test for BPGP (for those without GMAT/CAT or wanting another attempt).',
      location: 'Assigned Center',
      categories: ['Exam']
    },
    {
      title: 'BPGP Personal Interview (PI) Window Starts',
      start: [2027, 6, 15, 9, 0],
      duration: { hours: 8 },
      description: 'Interviews held by IIM Ahmedabad panel. Review resume, case studies, and business news.',
      location: 'IIM Ahmedabad / Online',
      categories: ['Milestone']
    },
    {
      title: 'BPGP Cohort Admission Results Announced',
      start: [2027, 7, 1, 12, 0],
      duration: { hours: 1 },
      description: 'Admissions selection list published by IIM Ahmedabad.',
      location: 'iima.ac.in',
      categories: ['Milestone']
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
      description: 'Study Plan Phase Block',
      categories: ['Phase']
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
      recurrenceRule,
      categories: ['Study Session']
    },
    {
      title: 'Study: Verbal RC & Critical Reasoning',
      start: [2026, 6, 23, 19, 0],
      duration: { hours: 2, minutes: 30 },
      description: 'RC passage + reading + CR set.',
      recurrenceRule,
      categories: ['Study Session']
    },
    {
      title: 'Study: DILR / GMAT Data Insights',
      start: [2026, 6, 17, 19, 0], // Starts on June 17!
      duration: { hours: 2, minutes: 30 },
      description: 'Data Insights / DILR (2 sets).',
      recurrenceRule,
      categories: ['Study Session']
    },
    {
      title: 'Study: Quant Concept & Exercises',
      start: [2026, 6, 18, 19, 0],
      duration: { hours: 2, minutes: 30 },
      description: 'Quant Concept + 10 problems.',
      recurrenceRule,
      categories: ['Study Session']
    },
    {
      title: 'Study: Verbal: CAT VA & GMAT CR',
      start: [2026, 6, 19, 19, 0],
      duration: { hours: 2, minutes: 30 },
      description: 'Verbal: CAT VA + GMAT CR.',
      recurrenceRule,
      categories: ['Study Session']
    },
    {
      title: 'Study: Data/Logic Sets & Quant Test',
      start: [2026, 6, 20, 14, 0],
      duration: { hours: 4, minutes: 30 },
      description: 'Data/Logic sets + quant topic test + weak areas.',
      recurrenceRule,
      categories: ['Study Session']
    },
    {
      title: 'Study: Verbal Test, Mock & Error Log',
      start: [2026, 6, 21, 10, 0],
      duration: { hours: 4, minutes: 30 },
      description: 'Verbal topic test + weekly mock + error-log update.',
      recurrenceRule,
      categories: ['Study Session']
    }
  );

  return new Promise((resolve, reject) => {
    ics.createEvents(events, (error, value) => {
      if (error) reject(error);
      else resolve(value);
    });
  });
}

// ICS Calendar Export Endpoint
app.get('/api/calendar/export', async (req, res) => {
  try {
    const icsContent = await generateICSData();
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename=iima_bpgp_2027_study_plan.ics');
    res.send(icsContent);
  } catch (error) {
    console.error('Failed to generate ICS file:', error);
    res.status(500).json({ error: 'Failed to generate calendar events.' });
  }
});

// AI Chatbot Proxy Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return res.status(400).json({
      error: 'GEMINI_API_KEY is not set. Please set it in your environment variables or .env file.'
    });
  }

  try {
    // Construct prompt with system instruction and history
    const contents = [];

    // Format chat history
    if (history && history.length > 0) {
      history.forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }

    // Append the new message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Failed to call Gemini API');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that.";
    res.json({ reply });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during chat reasoning.' });
  }
});

// Fallback to React Router in frontend (Vite build)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
