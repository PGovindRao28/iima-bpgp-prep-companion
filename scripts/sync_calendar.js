import fs from 'fs';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    if (!fs.existsSync(TOKEN_PATH)) return null;
    const content = fs.readFileSync(TOKEN_PATH, 'utf8');
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    console.error('Error loading saved credentials:', err);
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const keysPath = CREDENTIALS_PATH;
  let keys = {};
  if (fs.existsSync(keysPath)) {
    const content = fs.readFileSync(keysPath, 'utf8');
    keys = JSON.parse(content);
  }
  
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key ? key.client_id : process.env.GOOGLE_CLIENT_ID,
    client_secret: key ? key.client_secret : process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: client.credentials.refresh_token,
  });
  fs.writeFileSync(TOKEN_PATH, payload);
  console.log('Authorization token saved to', TOKEN_PATH);
}

/**
 * Load or request authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  // If credentials.json doesn't exist, check if we have .env client details
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      // Create temporary credentials.json from environment variables
      const tempCreds = {
        installed: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uris: ['http://localhost:3000/oauth2callback', 'http://localhost:8080/oauth2callback']
        }
      };
      fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(tempCreds, null, 2));
      console.log('Created temporary credentials.json using .env variables.');
    } else {
      console.error('\n❌ ERROR: Google Credentials not found!');
      console.error('To sync directly with Google Calendar, you must either:');
      console.error('1. Download credentials.json from Google Cloud Console and place it in the project root.');
      console.error('2. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.');
      console.error('\nAlternative: Use the "Download ICS File" button in the web dashboard UI to import manually.');
      process.exit(1);
    }
  }

  try {
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    return client;
  } catch (authError) {
    console.error('Authentication error:', authError);
    // Cleanup temporary credentials if created
    if (process.env.GOOGLE_CLIENT_ID && fs.existsSync(CREDENTIALS_PATH)) {
      try { fs.unlinkSync(CREDENTIALS_PATH); } catch (e) {}
    }
    process.exit(1);
  }
}

/**
 * Setup and sync the events.
 */
async function syncCalendar(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  
  console.log('Retrieving calendar list...');
  const calendarList = await calendar.calendarList.list();
  
  // Find or create a dedicated secondary calendar to avoid cluttering primary
  const targetCalendarName = 'IIMA BPGP 2027 Prep';
  let targetCalendarId = null;
  
  const existingCalendar = calendarList.data.items.find(
    cal => cal.summary === targetCalendarName
  );
  
  if (existingCalendar) {
    targetCalendarId = existingCalendar.id;
    console.log(`Found existing calendar "${targetCalendarName}" (ID: ${targetCalendarId}). Reusing it.`);
  } else {
    console.log(`Creating new secondary calendar: "${targetCalendarName}"...`);
    const newCal = await calendar.calendars.insert({
      requestBody: {
        summary: targetCalendarName,
        timeZone: 'Asia/Kolkata',
        description: 'Study plan, milestones, and daily study blocks for IIM Ahmedabad BPGP 2027 preparation.'
      }
    });
    targetCalendarId = newCal.data.id;
    console.log(`Successfully created calendar (ID: ${targetCalendarId})`);
  }

  console.log('Clearing existing study events from this calendar to avoid duplicates...');
  // List all events
  const eventsResponse = await calendar.events.list({
    calendarId: targetCalendarId,
    maxResults: 2500,
  });
  
  const events = eventsResponse.data.items || [];
  for (const event of events) {
    await calendar.events.delete({
      calendarId: targetCalendarId,
      eventId: event.id
    });
  }
  console.log(`Cleared ${events.length} old events.`);

  console.log('Generating new study plan events...');
  const newEvents = getCalendarEventsList();

  console.log(`Syncing ${newEvents.length} new items to Google Calendar...`);
  let count = 0;
  for (const ev of newEvents) {
    try {
      await calendar.events.insert({
        calendarId: targetCalendarId,
        requestBody: ev
      });
      count++;
      console.log(`[${count}/${newEvents.length}] Synced: ${ev.summary}`);
    } catch (insertErr) {
      console.error(`Failed to sync event "${ev.summary}":`, insertErr.message);
    }
  }

  console.log('\n========================================================');
  console.log('🎉 SYNC COMPLETE!');
  console.log(`Successfully synced ${count} events to your "${targetCalendarName}" calendar.`);
  console.log('Open your Google Calendar app or page to see your updated schedule!');
  console.log('========================================================');
  process.exit(0);
}

// Helper to generate events list in Google Calendar API structure
function getCalendarEventsList() {
  const events = [];
  const timeZone = 'Asia/Kolkata';

  // Key Milestones & Exams (UTC/IST dates formatted)
  const milestones = [
    {
      summary: 'BPGP Prep Starts: Take CAT & GMAT Diagnostic Mocks',
      description: 'Phase 0 begins. Take official diagnostic mocks to evaluate strengths & weaknesses.',
      location: 'Study Desk',
      start: { dateTime: '2026-06-17T09:00:00', timeZone },
      end: { dateTime: '2026-06-17T12:00:00', timeZone }
    },
    {
      summary: 'Target GMAT Focus Exam (First Attempt)',
      description: 'Scheduled attempt for GMAT Focus Edition. Focus on Quant, Verbal, and Data Insights.',
      location: 'Pearson Test Center',
      start: { dateTime: '2026-10-05T10:00:00', timeZone },
      end: { dateTime: '2026-10-05T13:00:00', timeZone }
    },
    {
      summary: 'CAT 2026 Exam Day',
      description: 'Common Admission Test (CAT) 2026. Arrive early at exam center.',
      location: 'CAT Exam Center',
      start: { dateTime: '2026-11-29T09:00:00', timeZone },
      end: { dateTime: '2026-11-29T11:00:00', timeZone }
    },
    {
      summary: 'IIMA BPGP Application Portal Opens',
      description: 'Start drafting SOP, preparing resume, and contacting references for Letters of Recommendation.',
      location: 'iima.ac.in',
      start: { dateTime: '2026-12-15T10:00:00', timeZone },
      end: { dateTime: '2026-12-15T11:00:00', timeZone }
    },
    {
      summary: 'BPGP Application Submission Deadline',
      description: 'Submit your completed application including SOP, work details, reference letters, and scores (GMAT/CAT).',
      location: 'iima.ac.in',
      start: { dateTime: '2027-04-05T23:59:00', timeZone },
      end: { dateTime: '2027-04-05T23:59:59', timeZone }
    },
    {
      summary: 'IIMA Admission Test (IAT) Exam',
      description: 'Admissions test for BPGP (for those without GMAT/CAT or wanting another attempt).',
      location: 'Assigned Center',
      start: { dateTime: '2027-05-09T10:00:00', timeZone },
      end: { dateTime: '2027-05-09T12:30:00', timeZone }
    },
    {
      summary: 'BPGP Personal Interview (PI) Window Starts',
      description: 'Interviews held by IIM Ahmedabad panel. Review resume, case studies, and business news.',
      location: 'IIM Ahmedabad / Online',
      start: { dateTime: '2027-06-15T09:00:00', timeZone },
      end: { dateTime: '2027-06-15T17:00:00', timeZone }
    },
    {
      summary: 'BPGP Cohort Admission Results Announced',
      description: 'Admissions selection list published by IIM Ahmedabad.',
      location: 'iima.ac.in',
      start: { dateTime: '2027-07-01T12:00:00', timeZone },
      end: { dateTime: '2027-07-01T13:00:00', timeZone }
    }
  ];

  milestones.forEach(ev => events.push(ev));

  // Study Plan Phase Blocks (All-Day Events)
  const phases = [
    { summary: 'PHASE 0: Diagnostic Mocks & Setup', start: '2026-06-17', end: '2026-06-22' },
    { summary: 'PHASE 1: Core Foundation Building', start: '2026-06-22', end: '2026-08-17' },
    { summary: 'PHASE 2: Speed, Accuracy & GMAT Take', start: '2026-08-17', end: '2026-10-12' },
    { summary: 'PHASE 3: CAT Mock Intensive', start: '2026-10-12', end: '2026-11-16' },
    { summary: 'PHASE 4: Final Taper & Revision', start: '2026-11-16', end: '2026-11-30' },
    { summary: 'PHASE 5: Application Submission & IAT Prep', start: '2026-11-30', end: '2027-05-10' },
    { summary: 'PHASE 6: Interview Preparation & PI Rounds', start: '2027-05-10', end: '2027-07-02' }
  ];

  phases.forEach(p => {
    events.push({
      summary: p.summary,
      start: { date: p.start },
      end: { date: p.end },
      description: 'Study Plan Phase Block'
    });
  });

  // Weekly Study Slots (Recurring)
  const recurrence = ['RRULE:FREQ=WEEKLY;UNTIL=20261129T235959Z'];

  const weeklySchedule = [
    {
      summary: 'Study: Quant Concept & Exercises',
      description: 'Quant Concept + 10 problems.',
      start: '2026-06-22T19:00:00',
      end: '2026-06-22T21:30:00'
    },
    {
      summary: 'Study: Verbal RC & Critical Reasoning',
      description: 'RC passage + reading + CR set.',
      start: '2026-06-23T19:00:00',
      end: '2026-06-23T21:30:00'
    },
    {
      summary: 'Study: DILR / GMAT Data Insights',
      description: 'Data Insights / DILR (2 sets).',
      start: '2026-06-17T19:00:00',
      end: '2026-06-17T21:30:00'
    },
    {
      summary: 'Study: Quant Concept & Exercises',
      description: 'Quant Concept + 10 problems.',
      start: '2026-06-18T19:00:00',
      end: '2026-06-18T21:30:00'
    },
    {
      summary: 'Study: Verbal: CAT VA & GMAT CR',
      description: 'Verbal: CAT VA + GMAT CR.',
      start: '2026-06-19T19:00:00',
      end: '2026-06-19T21:30:00'
    },
    {
      summary: 'Study: Data/Logic Sets & Quant Test',
      description: 'Data/Logic sets + quant topic test + weak areas.',
      start: '2026-06-20T14:00:00',
      end: '2026-06-20T18:30:00'
    },
    {
      summary: 'Study: Verbal Test, Mock & Error Log',
      description: 'Verbal topic test + weekly mock + error-log update.',
      start: '2026-06-21T10:00:00',
      end: '2026-06-21T14:30:00'
    }
  ];

  weeklySchedule.forEach(slot => {
    events.push({
      summary: slot.summary,
      description: slot.description,
      start: { dateTime: slot.start, timeZone },
      end: { dateTime: slot.end, timeZone },
      recurrence
    });
  });

  return events;
}

authorize().then(syncCalendar).catch(console.error);
