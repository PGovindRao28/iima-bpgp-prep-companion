import React, { useState, useEffect, useRef } from 'react';
import studyMaterial from './data/study_material.json';
import videoLectures from './data/video_lectures.json';

const pdfLibrary = [
  {
    title: "Quant Formula Book",
    filename: "Quant-Formula-Book-by-Quantifiers-CAT-Academy.pdf",
    category: "Math & Quant",
    icon: "📙",
    desc: "Complete booklet containing essential math formulas, rules, equations, and quick-solving methods."
  },
  {
    title: "Geometry Shortcuts",
    filename: "All-Geometery-Shortcuts-by-Quantifiers-CAT-Academy.pdf",
    category: "Math & Quant",
    icon: "📐",
    desc: "Cheat-sheet handbook outlining angles, triangles, polygons, circles, and geometry shortcuts."
  },
  {
    title: "Economic Curves Notes",
    filename: "economic-curves-by-quantifiers-cat-academy.pdf",
    category: "Math & Quant",
    icon: "📈",
    desc: "Visual notes mapping macro and micro economic curves, models, and graphs for reasoning tests."
  },
  {
    title: "The Ultimate DILR Book",
    filename: "The-Ultimate-DILR-Book-Updated.pdf",
    category: "Data & Logic",
    icon: "📊",
    desc: "Comprehensive workbook featuring 400+ advanced Logical Reasoning and Data Interpretation puzzles."
  },
  {
    title: "CAT Free Mocks Book",
    filename: "CAT-Free-Mocks.pdf",
    category: "Practice Papers",
    icon: "📝",
    desc: "A compilation of past mock question papers and detailed keys for self-timed evaluation."
  },
  {
    title: "CAT 2025 Study Plan",
    filename: "CAT-2025-study-plan.pdf",
    category: "Strategy & Timing",
    icon: "📅",
    desc: "Detailed syllabus checklist, weightage distributions, and topic priorities."
  },
  {
    title: "CAT 5-Month Strategy",
    filename: "CAT-Strategy-for-5-months-Download.pdf",
    category: "Strategy & Timing",
    icon: "🎯",
    desc: "Preparation tactics and milestones designed for the final 5 months prior to the exam."
  },
  {
    title: "Weekly Timetable Plan",
    filename: "Weekly-Timetable-By-Quantifiers.pdf",
    category: "Strategy & Timing",
    icon: "⏰",
    desc: "Hour-by-hour prep allocation guidelines for balancing quant worksheets with reading."
  },
  {
    title: "GDPI Preparation Handbook",
    filename: "GDPI-Handbook.pdf",
    category: "Admissions & Interview",
    icon: "💼",
    desc: "Complete guide for Group Discussions, Writing Ability Tests (WAT), and Personal Interviews at IIMA."
  },
  {
    title: "GD & WAT Topics",
    filename: "GD-Topics-WAT-by-Quantifiers.pdf",
    category: "Admissions & Interview",
    icon: "🗣️",
    desc: "A curated list of current affairs, business case studies, and abstract prompts for interview practice."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Chat State
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'bot',
      text: 'Hello! I am your IIMA BPGP 2027 Study Companion. I can help you understand the study guide, answer questions about CAT, GMAT, and IAT, generate practice questions, and guide you with your SOP drafting. Ask me anything!'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState(null);
  
  // Interactive Checklist State (Persisted in localStorage)
  const [checkedTasks, setCheckedTasks] = useState(() => {
    const saved = localStorage.getItem('iima_checked_tasks');
    return saved ? JSON.parse(saved) : {};
  });

  // Watched Video Lectures State (Persisted in localStorage)
  const [watchedVideos, setWatchedVideos] = useState(() => {
    const saved = localStorage.getItem('iima_watched_videos');
    return saved ? JSON.parse(saved) : {};
  });

  // Mock Test Scores State (Persisted in localStorage)
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('iima_mock_scores');
    return saved ? JSON.parse(saved) : [];
  });
  const [mockExamType, setMockExamType] = useState('CAT');
  const [mockScoreVal, setMockScoreVal] = useState('');
  const [mockNotes, setMockNotes] = useState('');

  // Study Material UI States
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedPracticeTab, setSelectedPracticeTab] = useState('guided');
  const [selectedTopicSubTab, setSelectedTopicSubTab] = useState('verbal');
  
  // Search & Pagination States
  const [testSearch, setTestSearch] = useState('');
  const [mockSearch, setMockSearch] = useState('');
  const [pdfSearch, setPdfSearch] = useState('');
  const [lectureSearch, setLectureSearch] = useState('');
  const [selectedLectureSection, setSelectedLectureSection] = useState('All');
  const [verbalLimit, setVerbalLimit] = useState(16);
  const [dilrLimit, setDilrLimit] = useState(16);
  const [quantLimit, setQuantLimit] = useState(16);
  const [mockLimit, setMockLimit] = useState(10);

  const chatEndRef = useRef(null);

  // Sync checklist to localStorage
  useEffect(() => {
    localStorage.setItem('iima_checked_tasks', JSON.stringify(checkedTasks));
  }, [checkedTasks]);

  // Sync watched videos to localStorage
  useEffect(() => {
    localStorage.setItem('iima_watched_videos', JSON.stringify(watchedVideos));
  }, [watchedVideos]);

  // Sync scores to localStorage
  useEffect(() => {
    localStorage.setItem('iima_mock_scores', JSON.stringify(scores));
  }, [scores]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleTaskToggle = (taskKey) => {
    setCheckedTasks(prev => ({
      ...prev,
      [taskKey]: !prev[taskKey]
    }));
  };

  const handleVideoToggle = (videoKey) => {
    setWatchedVideos(prev => ({
      ...prev,
      [videoKey]: !prev[videoKey]
    }));
  };

  const handleAddScore = (e) => {
    e.preventDefault();
    if (!mockScoreVal.trim()) return;
    
    const newScore = {
      id: Date.now(),
      type: mockExamType,
      score: parseFloat(mockScoreVal),
      notes: mockNotes,
      date: new Date().toLocaleDateString()
    };
    
    setScores(prev => [newScore, ...prev]);
    setMockScoreVal('');
    setMockNotes('');
  };

  const handleDeleteScore = (id) => {
    setScores(prev => prev.filter(s => s.id !== id));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setChatError(null);
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: chatHistory.slice(1) // omit the initial welcome message from LLM history
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with the AI agent.');
      }

      setChatHistory(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatError(err.message || 'Unable to connect to the assistant server. Ensure GEMINI_API_KEY is configured in your .env file.');
    } finally {
      setIsSending(false);
    }
  };

  // Helper to calculate preparation progress
  const completedTasksCount = Object.values(checkedTasks).filter(Boolean).length;
  const progressPercent = Math.min(Math.round((completedTasksCount / 100) * 100), 100);

  // Helper to calculate lecture progress
  const totalLecturesCount = videoLectures.reduce((total, sec) => {
    return total + sec.topics.reduce((subTotal, top) => subTotal + top.lectures.length, 0);
  }, 0);
  const watchedLecturesCount = Object.keys(watchedVideos).filter(key => watchedVideos[key]).length;
  const watchedPercentage = totalLecturesCount > 0 ? Math.round((watchedLecturesCount / totalLecturesCount) * 100) : 0;

  // Filtered lectures based on section and search query
  const filteredLecturesData = videoLectures.map(sec => {
    if (selectedLectureSection !== 'All' && sec.section !== selectedLectureSection) {
      return null;
    }
    
    const matchingTopics = sec.topics.map(top => {
      const topicMatches = top.topic.toLowerCase().includes(lectureSearch.toLowerCase());
      const matchingLecs = top.lectures.filter(lec => 
        lec.name.toLowerCase().includes(lectureSearch.toLowerCase())
      );
      
      if (topicMatches || matchingLecs.length > 0) {
        return {
          ...top,
          lectures: matchingLecs.length > 0 ? matchingLecs : top.lectures
        };
      }
      return null;
    }).filter(Boolean);
    
    if (matchingTopics.length > 0) {
      return {
        ...sec,
        topics: matchingTopics
      };
    }
    return null;
  }).filter(Boolean);

  // Formatting Helper for chatbot markdown responses
  const renderFormattedText = (text) => {
    return text.split('\n').map((line, lineIdx) => {
      let content = line;
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/`(.*?)`/g, '<code>$1</code>');
      
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={lineIdx} dangerouslySetInnerHTML={{ __html: content.substring(2) }} />;
      }
      if (line.startsWith('### ')) {
        return <h4 key={lineIdx} style={{ margin: '1rem 0 0.5rem 0', color: 'var(--accent-secondary)' }} dangerouslySetInnerHTML={{ __html: content.substring(4) }} />;
      }
      if (line.startsWith('## ')) {
        return <h3 key={lineIdx} style={{ margin: '1.25rem 0 0.75rem 0', color: 'var(--accent-primary)' }} dangerouslySetInnerHTML={{ __html: content.substring(3) }} />;
      }
      return <p key={lineIdx} style={{ marginBottom: '0.5rem' }} dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  // Filter handlers for Topic Wise Tests
  const filteredVerbalTests = studyMaterial.topicWiseTests.verbal.filter(t => 
    t.name.toLowerCase().includes(testSearch.toLowerCase())
  );
  const filteredDilrTests = studyMaterial.topicWiseTests.dilr.filter(t => 
    t.name.toLowerCase().includes(testSearch.toLowerCase())
  );
  const filteredQuantTests = studyMaterial.topicWiseTests.quant.filter(t => 
    t.name.toLowerCase().includes(testSearch.toLowerCase())
  );

  // Filter handlers for Mini Mocks
  const filteredMocks = studyMaterial.miniMocks.filter(m => 
    m.name.toLowerCase().includes(mockSearch.toLowerCase()) ||
    (m.va && m.va.toLowerCase().includes(mockSearch.toLowerCase())) ||
    (m.qa && m.qa.toLowerCase().includes(mockSearch.toLowerCase())) ||
    (m.lrdi && m.lrdi.text.toLowerCase().includes(mockSearch.toLowerCase()))
  );

  // Filter handlers for PDF library
  const filteredPDFs = pdfLibrary.filter(pdf =>
    pdf.title.toLowerCase().includes(pdfSearch.toLowerCase()) ||
    pdf.category.toLowerCase().includes(pdfSearch.toLowerCase()) ||
    pdf.desc.toLowerCase().includes(pdfSearch.toLowerCase())
  );

  // Get active day object
  const currentDayObj = studyMaterial.days.find(d => 
    parseInt(d.day.replace('Day', '').strip) === selectedDay 
  ) || studyMaterial.days[selectedDay - 1] || studyMaterial.days[0];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-main">IIMA BPGP 2027</div>
          <div className="logo-sub">Study Companion</div>
        </div>

        <nav className="nav-menu">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span>📊</span> Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'practice' ? 'active' : ''}`}
              onClick={() => setActiveTab('practice')}
            >
              <span>📚</span> Study Material
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <span>🤖</span> AI Study Bot
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              <span>📅</span> Calendar Sync
            </button>
          </li>
        </nav>

        <div className="sidebar-footer">
          <p>Target Year: 2027</p>
          <p style={{ marginTop: '0.25rem' }}>Start Date: Jun 17, 2026</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="content-area">
        {activeTab === 'dashboard' && (
          <div>
            <div className="content-header">
              <div>
                <h1>Preparation Dashboard</h1>
                <p className="header-subtitle">Welcome to your integrated academic workspace. Track progress, log mock test results, and stay on schedule.</p>
              </div>
            </div>

            <div className="grid-dashboard">
              {/* Left Column: Progress, Weekly Tasks & Study Resources */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Visual Progress Bar */}
                <section className="card">
                  <h2>Preparation Completion</h2>
                  <div className="progress-container">
                    <div className="progress-header">
                      <span className="text-secondary">Study Tasks Completed</span>
                      <span className="text-accent" style={{ fontWeight: 'bold' }}>{progressPercent}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                </section>

                {/* Important Links & Community channels */}
                <section className="card">
                  <h2>Reference Resources & Handbooks</h2>
                  <p className="text-secondary mb-3">Core guides, shortcut sheets, and community links trimmed of advertisement.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {studyMaterial.communityLinks.map((link, idx) => (
                      <a 
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="checklist-item"
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                      >
                        <span style={{ fontSize: '1.25rem' }}>
                          {link.title.includes('Telegram') ? '💬' : 
                           link.title.includes('WhatsApp') ? '🟢' : 
                           link.title.includes('Formula') ? '📙' : '📘'}
                        </span>
                        <div>
                          <strong className="text-accent" style={{ fontSize: '0.85rem', display: 'block' }}>{link.title}</strong>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Open link ➔</span>
                        </div>
                      </a>
                    ))}
                    {/* PDF local references quick links */}
                    <a 
                      href="file:///d:/IIM A/Study Material/GDPI-Handbook.pdf" 
                      className="checklist-item" 
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>💼</span>
                      <div>
                        <strong className="text-accent" style={{ fontSize: '0.85rem', display: 'block' }}>GDPI Handbook</strong>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Local PDF Handbook ➔</span>
                      </div>
                    </a>
                    <a 
                      href="file:///d:/IIM A/Study Material/All-Geometery-Shortcuts-by-Quantifiers-CAT-Academy.pdf" 
                      className="checklist-item" 
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>📐</span>
                      <div>
                        <strong className="text-accent" style={{ fontSize: '0.85rem', display: 'block' }}>Geometry Shortcuts</strong>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Formula Sheets ➔</span>
                      </div>
                    </a>
                  </div>
                  <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <button className="nav-link" onClick={() => { setActiveTab('practice'); setSelectedPracticeTab('library'); }} style={{ display: 'inline-flex', padding: '0.25rem 0.75rem', width: 'auto', fontSize: '0.85rem' }}>
                      View Full PDF Library ➔
                    </button>
                  </div>
                </section>

                {/* Interactive Weekly Planner */}
                <section className="card">
                  <h2>Weekly Routine Planner</h2>
                  <p className="text-secondary mb-3">Mark off the study slots as you complete them to build consistent momentum.</p>
                  <div className="checklist-container">
                    {[
                      { key: 'mon_verbal', day: 'Monday', text: 'Verbal: Concept Study + RC Passages + Critical Reasoning' },
                      { key: 'tue_di', day: 'Tuesday', text: 'DILR / GMAT Data Insights (2 sets + analysis)' },
                      { key: 'wed_verbal', day: 'Wednesday', text: 'Verbal: GMAT CR & CAT Paragraph Logic' },
                      { key: 'thu_quant', day: 'Thursday', text: 'Quant: Selective Concept Study (weak areas / hard topics only)' },
                      { key: 'fri_verbal', day: 'Friday', text: 'Verbal: Timed Sets (RC passages + CR) speed drills' },
                      { key: 'sat_sets', day: 'Saturday', text: 'DILR timed sets + Verbal topic test + detailed analysis' },
                      { key: 'sun_mock', day: 'Sunday', text: 'Weekly Mock test (GMAT/CAT) + QA section review' }
                    ].map(task => (
                      <div 
                        key={task.key}
                        className={`checklist-item ${checkedTasks[task.key] ? 'checked' : ''}`}
                        onClick={() => handleTaskToggle(task.key)}
                      >
                        <div className="checkbox-custom"></div>
                        <div>
                          <strong className="text-accent" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.15rem' }}>{task.day}</strong>
                          <span className="checklist-text">{task.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column: Active Phase & Mock Score Tracker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Current Study Phase Indicator */}
                <section className="card">
                  <h2>Current Study Phase</h2>
                  <div className="timeline-list">
                    <div className="timeline-item active">
                      <div className="timeline-date">Jun 17 - Jun 21, 2026</div>
                      <div className="timeline-title">Phase 0: Diagnostic Mocks</div>
                      <div className="timeline-desc">Take baseline CAT & GMAT official mock tests. Map strengths and establish your error spreadsheet.</div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-date">Jun 22 - Aug 16, 2026</div>
                      <div className="timeline-title">Phase 1: Foundations</div>
                      <div className="timeline-desc">Master core quant formulas, analytical reading habits, and logical patterns.</div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-date">Aug 17 - Oct 11, 2026</div>
                      <div className="timeline-title">Phase 2: Speed & GMAT</div>
                      <div className="timeline-desc">Perform timed drills. Book and take the GMAT Focus test in early October.</div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-date">Oct 12 - Nov 29, 2026</div>
                      <div className="timeline-title">Phase 3 & 4: Mock Intensive & CAT</div>
                      <div className="timeline-desc">Take CAT mocks 2-3 times/week. Revise error logs. Sitting for CAT on Nov 29.</div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-date">Dec 2026 - Jun 2027</div>
                      <div className="timeline-title">Phase 5 & 6: Application & Interview</div>
                      <div className="timeline-desc">Submit application documents by April. Prepare for the IAT (May) and Interviews (June).</div>
                    </div>
                  </div>
                </section>

                {/* Score Tracker */}
                <section className="card">
                  <h2>Mock Score Tracker</h2>
                  <form onSubmit={handleAddScore} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="flex gap-2">
                      <div className="flex flex-col gap-1" style={{ flex: 1 }}>
                        <label className="text-secondary" style={{ fontSize: '0.8rem' }}>Exam</label>
                        <select 
                          value={mockExamType} 
                          onChange={(e) => setMockExamType(e.target.value)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-light)',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        >
                          <option value="CAT">CAT (Raw)</option>
                          <option value="GMAT">GMAT Focus</option>
                          <option value="IAT">IAT</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1" style={{ flex: 1 }}>
                        <label className="text-secondary" style={{ fontSize: '0.8rem' }}>Score</label>
                        <input 
                          type="number"
                          placeholder="e.g., 650"
                          value={mockScoreVal}
                          onChange={(e) => setMockScoreVal(e.target.value)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-light)',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-secondary" style={{ fontSize: '0.8rem' }}>Notes / Attempt</label>
                      <input 
                        type="text"
                        placeholder="e.g., Mock #1 (Diagnostic)"
                        value={mockNotes}
                        onChange={(e) => setMockNotes(e.target.value)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-light)',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                    </div>
                    <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Log Score</button>
                  </form>

                  {/* List ofLogged Scores */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {scores.length === 0 ? (
                      <p className="text-muted" style={{ fontSize: '0.9rem', textAlign: 'center' }}>No mock scores logged yet.</p>
                    ) : (
                      scores.map(s => (
                        <div 
                          key={s.id}
                          className="flex justify-between align-center"
                          style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          <div>
                            <strong className="text-accent" style={{ marginRight: '0.5rem' }}>{s.type}</strong>
                            <span style={{ fontWeight: 'bold' }}>{s.score}</span>
                            <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.1rem' }}>{s.notes} ({s.date})</div>
                          </div>
                          <button 
                            onClick={() => handleDeleteScore(s.id)}
                            style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.9rem' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div>
            <div className="content-header">
              <div>
                <h1>Study Material & Lecture Hub</h1>
                <p className="header-subtitle">Access structured lessons, practice sets, topic tests, and mini mocks extracted from your course documents.</p>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="sub-nav">
              <button 
                className={`sub-nav-btn ${selectedPracticeTab === 'guided' ? 'active' : ''}`}
                onClick={() => setSelectedPracticeTab('guided')}
              >
                📅 50-Day Prep Plan
              </button>
              <button 
                className={`sub-nav-btn ${selectedPracticeTab === 'topicwise' ? 'active' : ''}`}
                onClick={() => setSelectedPracticeTab('topicwise')}
              >
                🔬 Topic-Wise Tests
              </button>
              <button 
                className={`sub-nav-btn ${selectedPracticeTab === 'mocks' ? 'active' : ''}`}
                onClick={() => setSelectedPracticeTab('mocks')}
              >
                🏆 Mini Mocks & Sectionals
              </button>
              <button 
                className={`sub-nav-btn ${selectedPracticeTab === 'library' ? 'active' : ''}`}
                onClick={() => setSelectedPracticeTab('library')}
              >
                📂 Reference Library (PDFs)
              </button>
              <button 
                className={`sub-nav-btn ${selectedPracticeTab === 'lectures' ? 'active' : ''}`}
                onClick={() => setSelectedPracticeTab('lectures')}
              >
                🎥 Lecture Index
              </button>
            </div>

            {/* TAB 1: 50-Day Prep Plan */}
            {selectedPracticeTab === 'guided' && (
              <div>
                <p className="text-secondary mb-3">Select a day from the 50-day structured roadmap to access videos, worksheets, and online tests.</p>
                
                {/* Day Selection Grid */}
                <div className="day-grid">
                  {studyMaterial.days.map((d, index) => {
                    const dNum = index + 1;
                    return (
                      <button 
                        key={d.day}
                        onClick={() => setSelectedDay(dNum)}
                        className={`day-btn ${selectedDay === dNum ? 'active' : ''}`}
                      >
                        {dNum}
                      </button>
                    );
                  })}
                </div>

                {/* Day Tasks Display */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
                    <div>
                      <h2 style={{ marginBottom: '0.25rem' }}>{currentDayObj.day} — {currentDayObj.topic || 'General Revision'}</h2>
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>Structured syllabus targets for this study block</span>
                    </div>
                  </div>

                  <div className="resource-section">
                    {/* VA Plan A & B (Verbal First Priority) */}
                    {((currentDayObj.vaPlanA && currentDayObj.vaPlanA.length > 0) || (currentDayObj.vaPlanB && currentDayObj.vaPlanB.length > 0)) && (
                      <div className="resource-category-card">
                        <div className="section-title-bar">
                          <span className="section-tag-name">Verbal Ability (VA)</span>
                        </div>
                        <div className="resource-item-list">
                          {currentDayObj.vaPlanA && currentDayObj.vaPlanA.map((task, idx) => {
                            const taskKey = `day_${selectedDay}_va_a_${idx}`;
                            return (
                              <div key={idx} className="resource-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => handleTaskToggle(taskKey)}>
                                  <div className={`checkbox-custom ${checkedTasks[taskKey] ? 'checked' : ''}`} style={{ flexShrink: 0 }}></div>
                                  <span style={{ textDecoration: checkedTasks[taskKey] ? 'line-through' : 'none', opacity: checkedTasks[taskKey] ? 0.6 : 1 }}>{task.text}</span>
                                </div>
                                {task.url && (
                                  <a href={task.url} target="_blank" rel="noopener noreferrer" className="link-icon-btn">
                                    📝 Sectional
                                  </a>
                                )}
                              </div>
                            );
                          })}
                          {currentDayObj.vaPlanB && currentDayObj.vaPlanB.map((task, idx) => {
                            const taskKey = `day_${selectedDay}_va_b_${idx}`;
                            return (
                              <div key={idx} className="resource-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => handleTaskToggle(taskKey)}>
                                  <div className={`checkbox-custom ${checkedTasks[taskKey] ? 'checked' : ''}`} style={{ flexShrink: 0 }}></div>
                                  <span style={{ textDecoration: checkedTasks[taskKey] ? 'line-through' : 'none', opacity: checkedTasks[taskKey] ? 0.6 : 1 }}>{task.text}</span>
                                </div>
                                {task.url && (
                                  <a href={task.url} target="_blank" rel="noopener noreferrer" className="link-icon-btn">
                                    🔗 Link
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* DILR Plan A */}
                    {currentDayObj.dilrPlanA && currentDayObj.dilrPlanA.length > 0 && (
                      <div className="resource-category-card">
                        <div className="section-title-bar">
                          <span className="section-tag-name">DILR Plan A</span>
                        </div>
                        <div className="resource-item-list">
                          {currentDayObj.dilrPlanA.map((task, idx) => {
                            const taskKey = `day_${selectedDay}_dilr_a_${idx}`;
                            return (
                              <div key={idx} className="resource-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => handleTaskToggle(taskKey)}>
                                  <div className={`checkbox-custom ${checkedTasks[taskKey] ? 'checked' : ''}`} style={{ flexShrink: 0 }}></div>
                                  <span style={{ textDecoration: checkedTasks[taskKey] ? 'line-through' : 'none', opacity: checkedTasks[taskKey] ? 0.6 : 1 }}>{task.text}</span>
                                </div>
                                {task.url && (
                                  <a href={task.url} target="_blank" rel="noopener noreferrer" className="link-icon-btn">
                                    📝 Solve Test
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* DILR Plan B */}
                    {currentDayObj.dilrPlanB && currentDayObj.dilrPlanB.length > 0 && (
                      <div className="resource-category-card">
                        <div className="section-title-bar">
                          <span className="section-tag-name">DILR Plan B</span>
                        </div>
                        <div className="resource-item-list">
                          {currentDayObj.dilrPlanB.map((task, idx) => {
                            const taskKey = `day_${selectedDay}_dilr_b_${idx}`;
                            return (
                              <div key={idx} className="resource-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => handleTaskToggle(taskKey)}>
                                  <div className={`checkbox-custom ${checkedTasks[taskKey] ? 'checked' : ''}`} style={{ flexShrink: 0 }}></div>
                                  <span style={{ textDecoration: checkedTasks[taskKey] ? 'line-through' : 'none', opacity: checkedTasks[taskKey] ? 0.6 : 1 }}>{task.text}</span>
                                </div>
                                {task.url && (
                                  <a href={task.url} target="_blank" rel="noopener noreferrer" className="link-icon-btn">
                                    🎥 Playlists
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* QA Tasks (Math Last Priority) */}
                    {currentDayObj.quant && currentDayObj.quant.length > 0 && (
                      <div className="resource-category-card">
                        <div className="section-title-bar">
                          <span className="section-tag-name">Quantitative Ability (QA)</span>
                        </div>
                        <div className="resource-item-list">
                          {currentDayObj.quant.map((task, idx) => {
                            const taskKey = `day_${selectedDay}_qa_${idx}`;
                            return (
                              <div key={idx} className="resource-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => handleTaskToggle(taskKey)}>
                                  <div className={`checkbox-custom ${checkedTasks[taskKey] ? 'checked' : ''}`} style={{ flexShrink: 0 }}></div>
                                  <span style={{ textDecoration: checkedTasks[taskKey] ? 'line-through' : 'none', opacity: checkedTasks[taskKey] ? 0.6 : 1 }}>{task.text}</span>
                                </div>
                                {task.url && (
                                  <a href={task.url} target="_blank" rel="noopener noreferrer" className="link-icon-btn">
                                    🎥 Lecture URL
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Additional Practice */}
                    {currentDayObj.additional && currentDayObj.additional.length > 0 && (
                      <div className="resource-category-card">
                        <div className="section-title-bar">
                          <span className="section-tag-name">Additional Practice</span>
                        </div>
                        <div className="resource-item-list">
                          {currentDayObj.additional.map((task, idx) => {
                            const taskKey = `day_${selectedDay}_add_${idx}`;
                            return (
                              <div key={idx} className="resource-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => handleTaskToggle(taskKey)}>
                                  <div className={`checkbox-custom ${checkedTasks[taskKey] ? 'checked' : ''}`} style={{ flexShrink: 0 }}></div>
                                  <span style={{ textDecoration: checkedTasks[taskKey] ? 'line-through' : 'none', opacity: checkedTasks[taskKey] ? 0.6 : 1 }}>{task.text}</span>
                                </div>
                                {task.url && (
                                  <a href={task.url} target="_blank" rel="noopener noreferrer" className="link-icon-btn">
                                    🔗 Quiz Link
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Topic Wise Tests */}
            {selectedPracticeTab === 'topicwise' && (
              <div>
                <p className="text-secondary mb-3">Targeted conceptual testing covering English, Logic, and Mathematics topics.</p>
                
                {/* Search & Sub-tabs bar */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <div className="flex gap-1" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '0.25rem' }}>
                    <button 
                      className={`sub-nav-btn ${selectedTopicSubTab === 'verbal' ? 'active' : ''}`}
                      onClick={() => { setSelectedTopicSubTab('verbal'); setVerbalLimit(16); }}
                      style={{ fontSize: '0.9rem', borderBottom: 'none', padding: '0.5rem 1rem', borderRadius: '8px' }}
                    >
                      Verbal ({filteredVerbalTests.length})
                    </button>
                    <button 
                      className={`sub-nav-btn ${selectedTopicSubTab === 'dilr' ? 'active' : ''}`}
                      onClick={() => { setSelectedTopicSubTab('dilr'); setDilrLimit(16); }}
                      style={{ fontSize: '0.9rem', borderBottom: 'none', padding: '0.5rem 1rem', borderRadius: '8px' }}
                    >
                      DILR ({filteredDilrTests.length})
                    </button>
                    <button 
                      className={`sub-nav-btn ${selectedTopicSubTab === 'quant' ? 'active' : ''}`}
                      onClick={() => { setSelectedTopicSubTab('quant'); setQuantLimit(16); }}
                      style={{ fontSize: '0.9rem', borderBottom: 'none', padding: '0.5rem 1rem', borderRadius: '8px' }}
                    >
                      Quant ({filteredQuantTests.length})
                    </button>
                  </div>
                  
                  <input 
                    type="text" 
                    placeholder={`Search ${selectedTopicSubTab} tests...`}
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                    className="search-input"
                    style={{ margin: 0, padding: '0.6rem 1rem', fontSize: '0.9rem', maxWidth: '300px' }}
                  />
                </div>

                {/* Tests Display List */}
                <div className="test-grid">
                  {selectedTopicSubTab === 'verbal' && (
                    filteredVerbalTests.slice(0, verbalLimit).map((test, idx) => (
                      <div key={idx} className="test-card-simple">
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.95rem' }}>{test.name}</strong>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Topic: Vocabulary & Verbal Logic</span>
                        </div>
                        {test.url && (
                          <a href={test.url} target="_blank" rel="noopener noreferrer" className="link-icon-btn">
                            Solve Test
                          </a>
                        )}
                      </div>
                    ))
                  )}
                  
                  {selectedTopicSubTab === 'dilr' && (
                    filteredDilrTests.slice(0, dilrLimit).map((test, idx) => (
                      <div key={idx} className="test-card-simple">
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.95rem' }}>{test.name}</strong>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Topic: Data Interpretation & Logic</span>
                        </div>
                        {test.url && (
                          <a href={test.url} target="_blank" rel="noopener noreferrer" className="link-icon-btn">
                            Solve Test
                          </a>
                        )}
                      </div>
                    ))
                  )}

                  {selectedTopicSubTab === 'quant' && (
                    filteredQuantTests.slice(0, quantLimit).map((test, idx) => (
                      <div key={idx} className="test-card-simple">
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.95rem' }}>{test.name}</strong>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Topic: Math & Quantitative Aptitude</span>
                        </div>
                        {test.url && (
                          <a href={test.url} target="_blank" rel="noopener noreferrer" className="link-icon-btn">
                            Solve Test
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Show More Pagination Button */}
                {selectedTopicSubTab === 'verbal' && filteredVerbalTests.length > verbalLimit && (
                  <button className="btn btn-secondary" onClick={() => setVerbalLimit(prev => prev + 16)} style={{ margin: '2rem auto 0 auto', display: 'block' }}>
                    Show More Verbal Tests
                  </button>
                )}
                {selectedTopicSubTab === 'dilr' && filteredDilrTests.length > dilrLimit && (
                  <button className="btn btn-secondary" onClick={() => setDilrLimit(prev => prev + 16)} style={{ margin: '2rem auto 0 auto', display: 'block' }}>
                    Show More DILR Tests
                  </button>
                )}
                {selectedTopicSubTab === 'quant' && filteredQuantTests.length > quantLimit && (
                  <button className="btn btn-secondary" onClick={() => setQuantLimit(prev => prev + 16)} style={{ margin: '2rem auto 0 auto', display: 'block' }}>
                    Show More Quant Tests
                  </button>
                )}

                {/* Empty State */}
                {((selectedTopicSubTab === 'verbal' && filteredVerbalTests.length === 0) ||
                  (selectedTopicSubTab === 'dilr' && filteredDilrTests.length === 0) ||
                  (selectedTopicSubTab === 'quant' && filteredQuantTests.length === 0)) && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No topic tests found matching "{testSearch}".
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Mini Mocks */}
            {selectedPracticeTab === 'mocks' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <p className="text-secondary" style={{ margin: 0 }}>Full sectional and mock sets with granular breakdowns.</p>
                  <input 
                    type="text" 
                    placeholder="Search mocks by section or name..."
                    value={mockSearch}
                    onChange={(e) => setMockSearch(e.target.value)}
                    className="search-input"
                    style={{ margin: 0, padding: '0.6rem 1rem', fontSize: '0.9rem', maxWidth: '300px' }}
                  />
                </div>

                <div className="test-grid">
                  {filteredMocks.slice(0, mockLimit).map((mock, idx) => (
                    <div key={idx} className="test-card-detailed">
                      <div className="flex justify-between align-center">
                        <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>{mock.name}</h3>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>{mock.overall}</span>
                      </div>
                      
                      <div className="mock-specs-grid">
                        <div className="spec-item">
                          <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Verbal</strong>
                          {mock.va || 'NA'}
                        </div>
                        <div className="spec-item">
                          <strong style={{ display: 'block', color: 'var(--text-primary)' }}>LRDI</strong>
                          {mock.lrdi ? (
                            mock.lrdi.url ? (
                              <a href={mock.lrdi.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-secondary)', textDecoration: 'none' }}>
                                {mock.lrdi.text}
                              </a>
                            ) : mock.lrdi.text
                          ) : 'NA'}
                        </div>
                        <div className="spec-item">
                          <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Quant</strong>
                          {mock.qa || 'NA'}
                        </div>
                      </div>

                      {mock.url && (
                        <a href={mock.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', padding: '0.5rem' }}>
                          📝 Start Practice Mock
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                {filteredMocks.length > mockLimit && (
                  <button className="btn btn-secondary" onClick={() => setMockLimit(prev => prev + 12)} style={{ margin: '2rem auto 0 auto', display: 'block' }}>
                    Show More Mini Mocks
                  </button>
                )}

                {filteredMocks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No mini mocks found matching "{mockSearch}".
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Reference Library (PDFs) */}
            {selectedPracticeTab === 'library' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <p className="text-secondary" style={{ margin: 0 }}>Access locally stored reference handbooks, shortcut sheets, and formulas.</p>
                  <input 
                    type="text" 
                    placeholder="Search PDFs by title or category..."
                    value={pdfSearch}
                    onChange={(e) => setPdfSearch(e.target.value)}
                    className="search-input"
                    style={{ margin: 0, padding: '0.6rem 1rem', fontSize: '0.9rem', maxWidth: '300px' }}
                  />
                </div>

                <div className="test-grid">
                  {filteredPDFs.map((pdf, idx) => (
                    <div key={idx} className="test-card-detailed">
                      <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                        <div className="flex align-center gap-1">
                          <span style={{ fontSize: '1.5rem' }}>{pdf.icon}</span>
                          <div>
                            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{pdf.title}</h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{pdf.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
                        {pdf.desc}
                      </p>

                      <a 
                        href={`file:///d:/IIM A/Study Material/${pdf.filename}`}
                        className="btn btn-secondary" 
                        style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', padding: '0.5rem', fontSize: '0.9rem' }}
                      >
                        📂 Open Local PDF
                      </a>
                    </div>
                  ))}
                </div>

                {filteredPDFs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No reference PDFs found matching "{pdfSearch}".
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: Lecture Index */}
            {selectedPracticeTab === 'lectures' && (
              <div>
                {/* Stats & Progress Card */}
                <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>🎥 Lecture Completion Tracker</h2>
                      <p className="text-secondary" style={{ fontSize: '0.9rem', margin: 0 }}>Watch video lectures, tick them off, and track your syllabus coverage.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{watchedLecturesCount} / {totalLecturesCount}</span>
                      <span className="text-muted" style={{ fontSize: '0.85rem', marginLeft: '0.35rem' }}>({watchedPercentage}% Done)</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ width: `${watchedPercentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', borderRadius: '999px', transition: 'width 0.4s ease-out', boxShadow: '0 0 8px var(--accent-primary)' }}></div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  {/* Search Box */}
                  <input 
                    type="text" 
                    placeholder="Search lectures or topics..."
                    value={lectureSearch}
                    onChange={(e) => setLectureSearch(e.target.value)}
                    className="search-input"
                    style={{ margin: 0, padding: '0.65rem 1.25rem', fontSize: '0.95rem', maxWidth: '320px' }}
                  />

                  {/* Horizontal Scrollable Pills */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flexGrow: 1 }}>
                    {['All', ...videoLectures.map(s => s.section)].map((sectionName) => (
                      <button
                        key={sectionName}
                        onClick={() => setSelectedLectureSection(sectionName)}
                        className={`sub-nav-btn ${selectedLectureSection === sectionName ? 'active' : ''}`}
                        style={{
                          fontSize: '0.85rem',
                          padding: '0.4rem 0.9rem',
                          borderRadius: '20px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: selectedLectureSection === sectionName ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          borderBottom: selectedLectureSection === sectionName ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: selectedLectureSection === sectionName ? 'var(--accent-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        {sectionName.replace('VARC - ', '').replace('DILR - ', '').replace('Quants - ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lecture Sections Listing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {filteredLecturesData.map((section, sIdx) => (
                    <div key={sIdx} className="resource-category-card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                      <div className="section-title-bar" style={{ borderLeft: 'none', paddingLeft: 0, marginBottom: '1.25rem' }}>
                        <div>
                          <span className="section-tag-name" style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{section.section}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '1rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {section.category}
                          </span>
                        </div>
                      </div>

                      {/* Grid of Topics inside this section */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                        {section.topics.map((topic, tIdx) => (
                          <div key={tIdx} style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.5rem' }}>
                              {topic.topic}
                            </h3>
                            
                            <div className="resource-item-list" style={{ gap: '0.5rem' }}>
                              {topic.lectures.map((lecture, lIdx) => {
                                const videoKey = `${section.section}-${topic.topic}-${lecture.name}`;
                                const isWatched = !!watchedVideos[videoKey];
                                return (
                                  <div key={lIdx} className="resource-item" style={{ padding: '0.5rem 0.75rem', background: isWatched ? 'rgba(99, 102, 241, 0.05)' : 'rgba(0, 0, 0, 0.15)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => handleVideoToggle(videoKey)}>
                                      <div className={`checkbox-custom ${isWatched ? 'checked' : ''}`} style={{ width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0 }}></div>
                                      <span style={{ fontSize: '0.85rem', textDecoration: isWatched ? 'line-through' : 'none', opacity: isWatched ? 0.6 : 1, color: isWatched ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                        {lecture.name}
                                      </span>
                                    </div>
                                    <a href={lecture.url} target="_blank" rel="noopener noreferrer" className="link-icon-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}>
                                      ▶️ Watch
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {filteredLecturesData.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed var(--border-light)' }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>🔍</span>
                      <h3>No lectures found matching your criteria</h3>
                      <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Try clearing your search query or selecting a different section filter.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="chat-container">
            <div style={{ marginBottom: '1.5rem' }}>
              <h1>AI Study Bot</h1>
              <p className="header-subtitle">Interactive tutor preloaded with details of your BPGP 2027 study plan. Clear up concept doubts or plan logistics.</p>
            </div>

            <div className="chat-history">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.role}`}>
                  <span className="chat-sender">{msg.role === 'user' ? 'You' : 'Companion'}</span>
                  <div className="chat-bubble">
                    {msg.role === 'bot' ? renderFormattedText(msg.text) : <p>{msg.text}</p>}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="chat-message bot">
                  <span className="chat-sender">Companion</span>
                  <div className="chat-bubble" style={{ opacity: 0.7 }}>
                    <p>Typing response...</p>
                  </div>
                </div>
              )}
              {chatError && (
                <div className="chat-message bot">
                  <span className="chat-sender" style={{ color: '#f43f5e' }}>System Error</span>
                  <div className="chat-bubble" style={{ border: '1px solid #f43f5e', background: 'rgba(244, 63, 94, 0.1)' }}>
                    <p style={{ color: '#f43f5e' }}>{chatError}</p>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-bar">
              <input
                type="text"
                placeholder="Ask about formulas, schedules, or SOP draft outlines..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="chat-input"
                disabled={isSending}
              />
              <button type="submit" className="btn" disabled={isSending || !inputMessage.trim()}>
                Send <span>➔</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div>
            <div className="content-header">
              <div>
                <h1>Google Calendar Sync</h1>
                <p className="header-subtitle">Keep your schedules in sync. Choose the configuration that best suits your flow.</p>
              </div>
            </div>

            <div className="sync-options">
              {/* Option 1: ICS Export */}
              <section className="card flex flex-col justify-between">
                <div>
                  <strong className="text-accent" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Option 1 (Recommended)</strong>
                  <h2 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Instant Calendar Export</h2>
                  <p className="text-secondary mb-3" style={{ lineHeight: 1.5 }}>
                    Generate and download a standard calendar invitation file (`.ics`) containing all preparation phases, exams, and weekly study session blocks. You can import this directly into Google Calendar, Outlook, or Apple Calendar in just a couple of clicks.
                  </p>
                  <ol className="instructions-list">
                    <li>Click the <strong>Download ICS File</strong> button below.</li>
                    <li>Open <strong>Google Calendar</strong> in your browser.</li>
                    <li>Go to <strong>Settings</strong> &gt; <strong>Import & Export</strong>.</li>
                    <li>Select the downloaded `.ics` file and choose which calendar to import into.</li>
                  </ol>
                </div>
                <a href="/api/calendar/export" download className="btn" style={{ textDecoration: 'none', display: 'inline-flex', justifyContent: 'center' }}>
                  📥 Download ICS File
                </a>
              </section>

              {/* Option 2: Automated Direct Sync Script */}
              <section className="card flex flex-col justify-between">
                <div>
                  <strong className="text-accent" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Option 2 (Advanced)</strong>
                  <h2 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Direct Google Calendar Sync</h2>
                  <p className="text-secondary mb-3" style={{ lineHeight: 1.5 }}>
                    Run a local Node.js script that connects directly to the Google Calendar API using your Google Cloud developer credentials, creating the events dynamically.
                  </p>
                  <ol className="instructions-list">
                    <li>Go to the Google Cloud Console and enable the <strong>Google Calendar API</strong>.</li>
                    <li>Create OAuth 2.0 Credentials (Desktop Application) and download the credentials JSON file.</li>
                    <li>Rename it to <strong>credentials.json</strong> and place it in the project root directory.</li>
                    <li>Open a terminal in the project directory and run the command below:</li>
                  </ol>
                  <div className="code-block">
                    <span>npm run sync-cal</span>
                    <button 
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText('npm run sync-cal');
                        alert('Copied command!');
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem' }}>
                  Ensure you configure client ID and secret variables inside your `.env` file first.
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
