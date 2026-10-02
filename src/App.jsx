import React, { useState, useEffect } from 'react';
import { questionPool } from './data/questions';
import { db } from './firebase'; // Optional: remove if not using cloud yet
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [activeProfile, setActiveProfile] = useState('Madhav');
  const [activeTab, setActiveTab] = useState('quiz');

  // Quiz State (Fixed 5 questions per session, no refresh/shuffle button)
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({ Madhav: {}, Shristi: {} });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Love Notes State
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('rel_notes');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, sender: 'Madhav', text: 'Hey gorgeous, just wanted to remind you how much I love sleeping and waking up on calls with you! ❤️️', date: '2026-10-01' }
    ];
  });
  const [newNoteText, setNewNoteText] = useState('');

  // Timeline State with all milestones + automated 23rd monthly anniversaries
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('rel_events_v3');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, date: '2024-09-07', title: 'Entering Her Life', category: 'Milestone', description: 'Madhav came into Shristi’s life 💖' },
      { id: 2, date: '2024-11-01', title: 'First Hotel Together', category: 'Milestone', description: 'Our first time getting a hotel together.' },
      { id: 3, date: '2024-12-14', title: 'Deciding to be Together', category: 'Milestone', description: 'The day we decided we want to be in a relationship.' },
      { id: 4, date: '2024-12-14', title: 'Sleeping & Waking on Calls Era', category: 'Routine', description: 'From Dec 14 until NEET day (May 4, 2025), sleeping and waking up on calls every single day.' },
      
      // Monthly Anniversaries on the 23rd starting Jan 23, 2025 onwards
      { id: 5, date: '2025-01-23', title: '1st Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 1 month of us.' },
      { id: 6, date: '2025-02-23', title: '2nd Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 2 months of us.' },
      { id: 7, date: '2025-03-23', title: '3rd Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 3 months of us.' },
      { id: 8, date: '2025-04-23', title: '4th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 4 months of us.' },
      { id: 9, date: '2025-05-23', title: '5th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 5 months of us.' },
      { id: 10, date: '2025-06-23', title: '6th Monthly Anniversary (Half Year!) 💖', category: 'Anniversary', description: 'Celebrating 6 amazing months together.' },
      { id: 11, date: '2025-07-23', title: '7th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 7 months of us.' },
      { id: 12, date: '2025-08-23', title: '8th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 8 months of us.' },
      { id: 13, date: '2025-09-23', title: '9th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 9 months of us.' },
      { id: 14, date: '2025-10-23', title: '10th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 10 months of us.' },
      { id: 15, date: '2025-11-23', title: '11th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 11 months of us.' },
      { id: 16, date: '2025-12-23', title: '1st Yearly Anniversary 🎉', category: 'Anniversary', description: 'Celebrating 1 full year of us!' },
      { id: 17, date: '2026-01-23', title: '13th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 13 months together.' },
      { id: 18, date: '2026-02-23', title: '14th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 14 months together.' },
      { id: 19, date: '2026-03-23', title: '15th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 15 months together.' },
      { id: 20, date: '2026-04-23', title: '16th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 16 months together.' },
      { id: 21, date: '2026-05-23', title: '17th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 17 months together.' },
      { id: 22, date: '2026-06-23', title: '18th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 18 months together.' },
      { id: 23, date: '2026-07-23', title: '19th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 19 months together.' },
      { id: 24, date: '2026-08-23', title: '20th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 20 months together.' },
      { id: 25, date: '2026-09-23', title: '21st Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 21 months together.' },

      // Other Relationship Milestones & Events
      { id: 26, date: '2025-05-31', title: 'First Actual Date 💕', category: 'Date', description: 'Going on our very first actual date.' },
      { id: 27, date: '2025-06-04', title: 'Our First Kiss 💋', category: 'Milestone', description: 'A magical unforgettable moment.' },
      { id: 28, date: '2025-06-06', title: 'First Time at Her House', category: 'Milestone', description: 'Visiting Shristi’s house for the first time.' },
      { id: 29, date: '2025-06-10', title: 'First Hickey ✨', category: 'Milestone', description: 'A playful mark of affection.' },
      { id: 30, date: '2025-07-30', title: 'Madhav to College', category: 'Milestone', description: 'Madhav heading off to college.' },
      { id: 31, date: '2026-01-11', title: 'Back to College', category: 'Milestone', description: 'Madhav heading back to college.' },
      { id: 32, date: '2026-02-04', title: 'The Accident', category: 'Milestone', description: 'Madhav met with an accident.' },
      { id: 33, date: '2026-02-05', title: 'Vein & Nerve Surgery', category: 'Milestone', description: 'First operation for vein and nerve reconstruction.' },
      { id: 34, date: '2026-04-16', title: 'ACL Surgery', category: 'Milestone', description: 'Second operation for ACL reconstruction.' },
      { id: 35, date: '2026-04-25', title: 'Shristi’s Birthday 🎂', category: 'Birthday', description: 'Celebrating Shristi’s special day!' },
      { id: 36, date: '2026-09-21', title: 'Madhav’s Birthday 🎂', category: 'Birthday', description: 'Celebrating Madhav’s birthday!' },
      { id: 37, date: '2026-09-28', title: 'MUA Surgery', category: 'Milestone', description: 'Operation for MUA.' }
    ];
  });

  const [newEvent, setNewEvent] = useState({ date: '', title: '', category: 'Milestone', description: '' });

  // Initialize 5 Quiz Questions once on load
  useEffect(() => {
    const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
    setCurrentQuizQuestions(shuffled.slice(0, 5));
  }, []);

  // Real-time Cloud Sync with Firestore
  useEffect(() => {
    if (!db) {
      const saved = localStorage.getItem('rel_quiz_answers');
      if (saved) setAnswers(JSON.parse(saved));
      return;
    }

    const unsub = onSnapshot(doc(db, "relationship", "quizAnswers"), (docSnap) => {
      if (docSnap.exists()) {
        setAnswers(docSnap.data());
        setIsCloudSynced(true);
      }
    }, (error) => {
      console.log("Cloud sync offline, using local storage", error);
      const saved = localStorage.getItem('rel_quiz_answers');
      if (saved) setAnswers(JSON.parse(saved));
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('rel_events_v3', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('rel_notes', JSON.stringify(notes));
  }, [notes]);

  const handleAnswerChange = async (questionId, text) => {
    const updatedAnswers = {
      ...answers,
      [activeProfile]: {
        ...answers[activeProfile],
        [questionId]: text
      }
    };
    setAnswers(updatedAnswers);
    localStorage.setItem('rel_quiz_answers', JSON.stringify(updatedAnswers));

    if (db) {
      try {
        await setDoc(doc(db, "relationship", "quizAnswers"), updatedAnswers);
      } catch (e) {
        console.error("Error saving to cloud:", e);
      }
    }
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.date || !newEvent.title) return;
    setEvents([...events, { id: Date.now(), ...newEvent }]);
    setNewEvent({ date: '', title: '', category: 'Milestone', description: '' });
  };

  const handleSendNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const note = {
      id: Date.now(),
      sender: activeProfile,
      text: newNoteText,
      date: new Date().toISOString().split('T')[0]
    };
    setNotes([note, ...notes]);
    setNewNoteText('');
  };

  // Calculate Compatibility Match Score
  const calculateMatchScore = () => {
    if (currentQuizQuestions.length === 0) return 100;
    let answeredCount = 0;
    let matchPoints = 0;
    currentQuizQuestions.forEach(q => {
      const mAns = answers.Madhav?.[q.id]?.trim().toLowerCase();
      const sAns = answers.Shristi?.[q.id]?.trim().toLowerCase();
      if (mAns && sAns) {
        answeredCount++;
        if (mAns === sAns || mAns.includes(sAns) || sAns.includes(mAns)) {
          matchPoints += 100;
        } else {
          matchPoints += 85;
        }
      }
    });
    if (answeredCount === 0) return 98;
    return Math.round(matchPoints / answeredCount);
  };

  const matchScore = calculateMatchScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-red-100 text-slate-800 font-sans pb-20 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      
      {/* Background Animated Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-rose-300/60 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-[30rem] h-[30rem] bg-pink-300/60 rounded-full mix-blend-multiply filter blur-[90px] animate-pulse pointer-events-none" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-red-200/50 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse pointer-events-none" style={{ animationDuration: '6s' }}></div>

      {/* Floating Pulsating Hearts */}
      <div className="absolute top-16 right-1/4 text-rose-500 text-4xl animate-bounce pointer-events-none drop-shadow-md" style={{ animationDuration: '3s' }}>❤️️</div>
      <div className="absolute bottom-32 left-12 text-pink-500 text-5xl animate-bounce pointer-events-none drop-shadow-md" style={{ animationDuration: '4.5s' }}>💖</div>
      <div className="absolute top-1/3 left-10 text-rose-400 text-3xl animate-bounce pointer-events-none drop-shadow-md" style={{ animationDuration: '2.5s' }}>💕</div>
      <div className="absolute bottom-1/4 right-16 text-red-400 text-4xl animate-bounce pointer-events-none drop-shadow-md" style={{ animationDuration: '3.8s' }}>💓</div>

      {/* Header & Profile Switcher */}
      <header className="bg-white/70 backdrop-blur-xl shadow-lg border-b border-rose-200/60 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">💓</span>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 bg-clip-text text-transparent drop-shadow-sm">
                Madhav & Shristi
              </h1>
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                <span>✨ Our Forever Love Story</span>
                {isCloudSynced && <span className="text-emerald-600 ml-2">• Cloud Synced ☁️</span>}
              </p>
            </div>
          </div>

          {/* Profile Switcher */}
          <div className="flex items-center gap-2 bg-rose-200/50 p-1.5 rounded-full border border-rose-300 shadow-inner backdrop-blur-md">
            <span className="text-xs font-bold px-2 text-rose-800">Profile:</span>
            <button
              onClick={() => setActiveProfile('Madhav')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 transform active:scale-90 ${
                activeProfile === 'Madhav' 
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg scale-105 ring-2 ring-rose-400/50' 
                  : 'text-slate-700 hover:text-rose-600 hover:bg-white/40'
              }`}
            >
              Madhav 👦🏻
            </button>
            <button
              onClick={() => setActiveProfile('Shristi')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 transform active:scale-90 ${
                activeProfile === 'Shristi' 
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg scale-105 ring-2 ring-rose-400/50' 
                  : 'text-slate-700 hover:text-rose-600 hover:bg-white/40'
              }`}
            >
              Shristi 👧🏻
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center border-t border-rose-200/40 bg-white/40 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-6 sm:px-8 py-3.5 font-bold text-sm border-b-4 transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'quiz' ? 'border-rose-600 text-rose-700 bg-white/80 shadow-sm' : 'border-transparent text-slate-600 hover:text-rose-600'
            }`}
          >
            🎯 Couple's Quiz
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-6 sm:px-8 py-3.5 font-bold text-sm border-b-4 transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'timeline' ? 'border-rose-600 text-rose-700 bg-white/80 shadow-sm' : 'border-transparent text-slate-600 hover:text-rose-600'
            }`}
          >
            📅 Timeline
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 sm:px-8 py-3.5 font-bold text-sm border-b-4 transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'notes' ? 'border-rose-600 text-rose-700 bg-white/80 shadow-sm' : 'border-transparent text-slate-600 hover:text-rose-600'
            }`}
          >
            💌 Love Notes ({notes.length})
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 mt-8 relative z-10">
        {activeTab === 'quiz' ? (
          <div className="space-y-6">
            {/* Compatibility Score Banner */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest font-extrabold bg-white/20 px-3 py-1 rounded-full">
                  Compatibility Harmony ✨
                </span>
                <h3 className="text-2xl font-black mt-2">Soulmate Match Score</h3>
                <p className="text-xs text-rose-100 mt-0.5">Calculated live based on your shared answers!</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 shadow-inner">
                <span className="text-3xl font-black animate-pulse">{matchScore}%</span>
                <p className="text-[10px] font-bold uppercase tracking-wider">Perfect Match</p>
              </div>
            </div>

            {/* Quiz Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200/80 p-6 sm:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  <span className="animate-pulse">💖</span> Daily 5-Question Quiz
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Currently answering as <span className="font-extrabold text-rose-600 text-base underline">{activeProfile}</span>
                </p>
              </div>

              {currentQuizQuestions.length > 0 && (
                <div>
                  {/* Question Progress Indicator */}
                  <div className="flex gap-2 mb-8">
                    {currentQuizQuestions.map((_, idx) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-3 flex-1 rounded-full cursor-pointer transition-all duration-500 ${
                          currentQuestionIndex === idx ? 'bg-gradient-to-r from-rose-600 to-pink-600 scale-105 shadow-md' : 'bg-rose-200/60 hover:bg-rose-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Active Question Card */}
                  <div className="bg-gradient-to-br from-rose-50/90 to-pink-50/70 rounded-3xl p-6 sm:p-8 border border-rose-200/80 mb-8 shadow-inner">
                    <span className="text-xs font-extrabold text-rose-600 uppercase tracking-widest bg-white/80 px-3 py-1 rounded-full shadow-sm">
                      Question {currentQuestionIndex + 1} of 5
                    </span>
                    <p className="text-xl font-bold text-slate-800 mt-4 mb-6 leading-relaxed">
                      {currentQuizQuestions[currentQuestionIndex].text}
                    </p>

                    <textarea
                      rows="3"
                      value={answers[activeProfile]?.[currentQuizQuestions[currentQuestionIndex].id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuizQuestions[currentQuestionIndex].id, e.target.value)}
                      placeholder={`Type ${activeProfile}'s answer here with love... ✍️`}
                      className="w-full p-4 rounded-2xl border border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-400/40 bg-white/95 text-base shadow-sm transition-all"
                    />
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center">
                    <button
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      className="px-6 py-3 rounded-2xl text-sm font-bold border border-rose-300 text-slate-700 disabled:opacity-30 hover:bg-rose-50 transition-all transform active:scale-95"
                    >
                      ← Previous
                    </button>

                    <span className="text-xs sm:text-sm text-slate-600 font-semibold">
                      Writer: <strong className="text-rose-600 text-base">{activeProfile}</strong>
                    </span>

                    <button
                      disabled={currentQuestionIndex === currentQuizQuestions.length - 1}
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-rose-600 to-pink-600 text-white disabled:opacity-30 shadow-lg hover:shadow-rose-400/50 transition-all transform active:scale-95"
                    >
                      Next →
                    </button>
                  </div>

                  {/* Side-by-Side Comparison Box */}
                  <div className="mt-10 border-t border-rose-200/80 pt-8">
                    <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                      <span className="animate-bounce">💌</span> Live Side-by-Side Comparison
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-5 rounded-3xl bg-white/90 border border-rose-200 shadow-lg transition-transform hover:-translate-y-1 duration-300">
                        <span className="text-xs font-extrabold text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                          Madhav's Answer 👦🏻
                        </span>
                        <p className="text-sm font-medium text-slate-700 mt-3 italic bg-rose-50/40 p-4 rounded-2xl border border-rose-100 shadow-inner min-h-[4rem]">
                          {answers.Madhav?.[currentQuizQuestions[currentQuestionIndex].id] || 'Waiting for Madhav to write... 💭'}
                        </p>
                      </div>

                      <div className="p-5 rounded-3xl bg-white/90 border border-rose-200 shadow-lg transition-transform hover:-translate-y-1 duration-300">
                        <span className="text-xs font-extrabold text-pink-600 uppercase tracking-wider bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                          Shristi's Answer 👧🏻
                        </span>
                        <p className="text-sm font-medium text-slate-700 mt-3 italic bg-pink-50/40 p-4 rounded-2xl border border-pink-100 shadow-inner min-h-[4rem]">
                          {answers.Shristi?.[currentQuizQuestions[currentQuestionIndex].id] || 'Waiting for Shristi to write... 💭'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'timeline' ? (
          <div className="space-y-6">
            {/* Add Custom Event Form */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200/80 p-6 sm:p-8">
              <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                <span>➕</span> Add a New Memory
              </h3>
              <form onSubmit={handleAddEvent} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="p-3.5 rounded-2xl border border-rose-300 text-sm focus:outline-none focus:ring-4 focus:ring-rose-400/40 bg-white shadow-inner font-medium"
                  required
                />
                <input
                  type="text"
                  placeholder="Memory Title (e.g., Special Date)"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="p-3.5 rounded-2xl border border-rose-300 text-sm focus:outline-none focus:ring-4 focus:ring-rose-400/40 bg-white shadow-inner font-medium"
                  required
                />
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="p-3.5 rounded-2xl border border-rose-300 text-sm focus:outline-none focus:ring-4 focus:ring-rose-400/40 bg-white shadow-inner font-bold text-rose-700"
                >
                  <option value="Milestone">Milestone</option>
                  <option value="Date">Date</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Routine">Routine / Habit</option>
                </select>
                <input
                  type="text"
                  placeholder="Short romantic note..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="p-3.5 rounded-2xl border border-rose-300 text-sm focus:outline-none focus:ring-4 focus:ring-rose-400/40 bg-white shadow-inner font-medium"
                />
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:shadow-xl text-white font-extrabold py-3.5 rounded-2xl text-sm transition-all transform active:scale-98"
                  >
                    Add to Our Timeline 🗓️💖
                  </button>
                </div>
              </form>
            </div>

            {/* Timeline Feed */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200/80 p-6 sm:p-10">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-8 flex items-center gap-3">
                <span className="animate-pulse">🌹</span> Our Complete Relationship Journey
              </h3>
              <div className="relative border-l-4 border-rose-300 ml-4 space-y-8">
                {events
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((evt) => (
                    <div key={evt.id} className="relative pl-8 group">
                      <div className="absolute -left-[11px] top-2 w-5 h-5 rounded-full bg-rose-600 border-4 border-white shadow-lg group-hover:scale-150 transition-transform duration-300" />
                      
                      <div className="bg-white/90 hover:bg-white p-6 rounded-3xl border border-rose-200 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 shadow-sm">
                            {evt.date}
                          </span>
                          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-pink-100 text-pink-800 shadow-sm">
                            {evt.category}
                          </span>
                        </div>
                        <h4 className="text-lg font-extrabold text-slate-800 mt-2">{evt.title}</h4>
                        <p className="text-sm font-medium text-slate-600 mt-1 leading-relaxed">{evt.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Send Secret Love Note */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200/80 p-6 sm:p-8">
              <h3 className="text-xl font-extrabold text-slate-800 mb-2 flex items-center gap-2">
                <span>💌</span> Drop a Secret Love Note
              </h3>
              <p className="text-xs text-slate-500 mb-4">Leave a sweet note as <strong className="text-rose-600">{activeProfile}</strong> for each other to read anytime!</p>
              
              <form onSubmit={handleSendNote} className="space-y-4">
                <textarea
                  rows="3"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={`Write something sweet as ${activeProfile}...`}
                  className="w-full p-4 rounded-2xl border border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-400/40 bg-white shadow-inner text-sm font-medium"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:shadow-xl text-white font-extrabold py-3.5 rounded-2xl text-sm transition-all transform active:scale-98"
                >
                  Send Love Note 💕
                </button>
              </form>
            </div>

            {/* Notes Wall */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200/80 p-6 sm:p-10">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                <span>💖</span> Love Notes Box
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <div key={note.id} className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-3xl border border-rose-200 shadow-md flex flex-col justify-between">
                    <p className="text-sm font-medium text-slate-700 italic mb-4">"{note.text}"</p>
                    <div className="flex justify-between items-center text-xs font-bold text-rose-600 border-t border-rose-200/60 pt-3">
                      <span>— From {note.sender}</span>
                      <span className="text-slate-400 font-normal">{note.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}