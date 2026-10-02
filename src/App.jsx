import React, { useState, useEffect } from 'react';
import { questionPool } from './data/questions';
import { db } from './firebase'; 
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('rel_current_view') || 'landing';
  });
  const [activeProfile, setActiveProfile] = useState(() => {
    return localStorage.getItem('rel_active_profile') || 'Madhav';
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('rel_active_tab') || 'quiz';
  });

  // Quiz State
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({ Madhav: {}, Shristi: {} });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(() => {
    return localStorage.getItem('rel_quiz_submitted') === 'true';
  });

  // Love Notes State
  const [notes, setNotes] = useState([
    { id: 1, sender: 'Madhav', text: 'Hey gorgeous, just wanted to remind you how much I love sleeping and waking up on calls with you! ❤', date: '2026-10-01' }
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  // Photo Album State
  const [photos, setPhotos] = useState(() => {
    const saved = localStorage.getItem('rel_photos');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80', caption: 'Our cozy moments together 💕', date: '2025-06-04', sender: 'Madhav' }
    ];
  });
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoDate, setNewPhotoDate] = useState('');

  // Anniversary Wishes State
  const [anniversaryWishes, setAnniversaryWishes] = useState(() => {
    const saved = localStorage.getItem('rel_anniversary_wishes');
    if (saved) return JSON.parse(saved);
    return {};
  });
  const [activeWishInput, setActiveWishInput] = useState({ eventId: null, text: '' });
  const [openWishDropdowns, setOpenWishDropdowns] = useState({});

  // Timeline State (Now includes optional imageUrl for events)
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('rel_events_v6');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, date: '2024-09-07', title: 'Entering Her Life', category: 'Milestone', description: 'Madhav came into Shristi’s life 💖', imageUrl: '' },
      { id: 2, date: '2024-11-01', title: 'First Hotel Together', category: 'Milestone', description: 'Our first time getting a hotel together.', imageUrl: '' },
      { id: 3, date: '2024-12-14', title: 'Confession Day 💌', category: 'Milestone', description: 'The magical day we confessed our feelings to each other.', imageUrl: '' },
      { id: 4, date: '2024-12-23', title: 'Officially Dating 🎉', category: 'Anniversary', description: 'The official beginning of our forever relationship!', imageUrl: '' },
      { id: 5, date: '2024-12-14', title: 'Sleeping & Waking on Calls Era', category: 'Routine', description: 'From Dec 14 until NEET day (May 4, 2025), sleeping and waking up on calls every single day.', imageUrl: '' },
      
      // Monthly Anniversaries on the 23rd starting Jan 23, 2025 onwards
      { id: 6, date: '2025-01-23', title: '1st Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 1 month of us.', imageUrl: '' },
      { id: 7, date: '2025-02-23', title: '2nd Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 2 months of us.', imageUrl: '' },
      { id: 8, date: '2025-03-23', title: '3rd Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 3 months of us.', imageUrl: '' },
      { id: 9, date: '2025-04-23', title: '4th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 4 months of us.', imageUrl: '' },
      { id: 10, date: '2025-05-23', title: '5th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 5 months of us.', imageUrl: '' },
      { id: 11, date: '2025-06-23', title: '6th Monthly Anniversary (Half Year!) 💖', category: 'Anniversary', description: 'Celebrating 6 amazing months together.', imageUrl: '' },
      { id: 12, date: '2025-07-23', title: '7th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 7 months of us.', imageUrl: '' },
      { id: 13, date: '2025-08-23', title: '8th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 8 months of us.', imageUrl: '' },
      { id: 14, date: '2025-09-23', title: '9th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 9 months of us.', imageUrl: '' },
      { id: 15, date: '2025-10-23', title: '10th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 10 months of us.', imageUrl: '' },
      { id: 16, date: '2025-11-23', title: '11th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 11 months of us.', imageUrl: '' },
      { id: 17, date: '2025-12-23', title: '1st Yearly Anniversary 🎉', category: 'Anniversary', description: 'Celebrating 1 full year of us!', imageUrl: '' },
      { id: 18, date: '2026-01-23', title: '13th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 13 months together.', imageUrl: '' },
      { id: 19, date: '2026-02-23', title: '14th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 14 months together.', imageUrl: '' },
      { id: 20, date: '2026-03-23', title: '15th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 15 months together.', imageUrl: '' },
      { id: 21, date: '2026-04-23', title: '16th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 16 months together.', imageUrl: '' },
      { id: 22, date: '2026-05-23', title: '17th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 17 months together.', imageUrl: '' },
      { id: 23, date: '2026-06-23', title: '18th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 18 months together.', imageUrl: '' },
      { id: 24, date: '2026-07-23', title: '19th Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 19 months together.', imageUrl: '' },
      { id: 25, date: '2026-08-23', title: '20th Monthly Anniversary 💕', category: 'Anniversary', description: 'Celebrating 20 months together.', imageUrl: '' },
      { id: 26, date: '2026-09-23', title: '21st Monthly Anniversary 🥂', category: 'Anniversary', description: 'Celebrating 21 months together.', imageUrl: '' },

      // Other Milestones
      { id: 27, date: '2025-05-31', title: 'First Actual Date 💕', category: 'Date', description: 'Going on our very first actual date.', imageUrl: '' },
      { id: 28, date: '2025-06-04', title: 'Our First Kiss 💋', category: 'Milestone', description: 'A magical unforgettable moment.', imageUrl: '' },
      { id: 29, date: '2025-06-06', title: 'First Time at Her House', category: 'Milestone', description: 'Visiting Shristi’s house for the first time.', imageUrl: '' },
      { id: 30, date: '2025-06-10', title: 'First Hickey ✨', category: 'Milestone', description: 'A playful mark of affection.', imageUrl: '' },
      { id: 31, date: '2025-07-30', title: 'Madhav to College', category: 'Milestone', description: 'Madhav heading off to college.', imageUrl: '' },
      { id: 32, date: '2026-01-11', title: 'Back to College', category: 'Milestone', description: 'Madhav heading back to college.', imageUrl: '' },
      { id: 33, date: '2026-02-04', title: 'The Accident', category: 'Milestone', description: 'Madhav met with an accident.', imageUrl: '' },
      { id: 34, date: '2026-02-05', title: 'Vein & Nerve Surgery', category: 'Milestone', description: 'First operation for vein and nerve reconstruction.', imageUrl: '' },
      { id: 35, date: '2026-04-16', title: 'ACL Surgery', category: 'Milestone', description: 'Second operation for ACL reconstruction.', imageUrl: '' },
      { id: 36, date: '2026-04-25', title: 'Shristi’s Birthday 🎂', category: 'Birthday', description: 'Celebrating Shristi’s special day!', imageUrl: '' },
      { id: 37, date: '2026-09-21', title: 'Madhav’s Birthday 🎂', category: 'Birthday', description: 'Celebrating Madhav’s birthday!', imageUrl: '' },
      { id: 38, date: '2026-09-28', title: 'MUA Surgery', category: 'Milestone', description: 'Operation for MUA.', imageUrl: '' }
    ];
  });

  const [newEvent, setNewEvent] = useState({ date: '', title: '', category: 'Milestone', description: '', imageUrl: '' });
  const [editingEventId, setEditingEventId] = useState(null);

  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // Persistence hooks
  useEffect(() => { localStorage.setItem('rel_current_view', currentView); }, [currentView]);
  useEffect(() => { localStorage.setItem('rel_active_profile', activeProfile); }, [activeProfile]);
  useEffect(() => { localStorage.setItem('rel_active_tab', activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem('rel_quiz_submitted', isQuizSubmitted); }, [isQuizSubmitted]);
  useEffect(() => { localStorage.setItem('rel_events_v6', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('rel_photos', JSON.stringify(photos)); }, [photos]);
  useEffect(() => { localStorage.setItem('rel_anniversary_wishes', JSON.stringify(anniversaryWishes)); }, [anniversaryWishes]);

  // Real-time Cloud Sync
  useEffect(() => {
    if (!db) {
      const savedAnswers = localStorage.getItem('rel_quiz_answers');
      if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
      
      const savedNotes = localStorage.getItem('rel_notes');
      if (savedNotes) setNotes(JSON.parse(savedNotes));

      const savedPhotos = localStorage.getItem('rel_photos');
      if (savedPhotos) setPhotos(JSON.parse(savedPhotos));

      const savedWishes = localStorage.getItem('rel_anniversary_wishes');
      if (savedWishes) setAnniversaryWishes(JSON.parse(savedWishes));

      const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
      setCurrentQuizQuestions(shuffled.slice(0, 5));
      return;
    }

    const unsubAnswers = onSnapshot(doc(db, "relationship", "quizAnswers"), (docSnap) => {
      if (docSnap.exists()) { setAnswers(docSnap.data()); setIsCloudSynced(true); }
    });

    const unsubNotes = onSnapshot(doc(db, "relationship", "loveNotes"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) { setNotes(docSnap.data().items); }
    });

    const unsubPhotos = onSnapshot(doc(db, "relationship", "photoAlbum"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) { setPhotos(docSnap.data().items); }
    });

    const unsubWishes = onSnapshot(doc(db, "relationship", "anniversaryWishes"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().wishes) { setAnniversaryWishes(docSnap.data().wishes); }
    });

    const unsubEvents = onSnapshot(doc(db, "relationship", "timelineEvents"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().items) { setEvents(docSnap.data().items); }
    });

    const initQuestions = async () => {
      const qDocRef = doc(db, "relationship", "currentQuestions");
      const qSnap = await getDoc(qDocRef);
      if (qSnap.exists()) {
        setCurrentQuizQuestions(qSnap.data().questions);
      } else {
        const shuffled = [...questionPool].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        await setDoc(qDocRef, { questions: selected });
        setCurrentQuizQuestions(selected);
      }
      setIsCloudSynced(true);
    };

    initQuestions();

    return () => {
      unsubAnswers();
      unsubNotes();
      unsubPhotos();
      unsubWishes();
      unsubEvents();
    };
  }, []);

  const handleAnswerChange = async (questionId, text) => {
    const updatedAnswers = {
      ...answers,
      [activeProfile]: { ...answers[activeProfile], [questionId]: text }
    };
    setAnswers(updatedAnswers);
    localStorage.setItem('rel_quiz_answers', JSON.stringify(updatedAnswers));

    if (db) {
      try { await setDoc(doc(db, "relationship", "quizAnswers"), updatedAnswers); } catch (e) { console.error(e); }
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.date || !newEvent.title) return;

    let updatedEvents = [];
    if (editingEventId) {
      updatedEvents = events.map(ev => ev.id === editingEventId ? { ...ev, ...newEvent } : ev);
      setEditingEventId(null);
    } else {
      updatedEvents = [{ id: Date.now(), ...newEvent }, ...events];
    }
    setEvents(updatedEvents);
    localStorage.setItem('rel_events_v6', JSON.stringify(updatedEvents));
    setNewEvent({ date: '', title: '', category: 'Milestone', description: '', imageUrl: '' });

    if (db) {
      try { await setDoc(doc(db, "relationship", "timelineEvents"), { items: updatedEvents }); } catch (e) { console.error(e); }
    }
  };

  const handleEditEvent = (evt) => {
    setEditingEventId(evt.id);
    setNewEvent({ date: evt.date, title: evt.title, category: evt.category, description: evt.description, imageUrl: evt.imageUrl || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEvent = async (id) => {
    if (confirm("Are you sure you want to delete this memory?")) {
      const updatedEvents = events.filter(ev => ev.id !== id);
      setEvents(updatedEvents);
      localStorage.setItem('rel_events_v6', JSON.stringify(updatedEvents));

      if (db) {
        try { await setDoc(doc(db, "relationship", "timelineEvents"), { items: updatedEvents }); } catch (e) { console.error(e); }
      }
    }
  };

  const handleDeleteNote = async (id) => {
    if (confirm("Are you sure you want to delete this love note?")) {
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      localStorage.setItem('rel_notes', JSON.stringify(updatedNotes));

      if (db) {
        try { await setDoc(doc(db, "relationship", "loveNotes"), { items: updatedNotes }); } catch (e) { console.error(e); }
      }
    }
  };

  const handleSendNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const note = {
      id: Date.now(),
      sender: activeProfile,
      text: newNoteText,
      date: new Date().toISOString().split('T')[0]
    };
    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('rel_notes', JSON.stringify(updatedNotes));
    setNewNoteText('');

    if (db) {
      try { await setDoc(doc(db, "relationship", "loveNotes"), { items: updatedNotes }); } catch (e) { console.error(e); }
    }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    const photo = {
      id: Date.now(),
      url: newPhotoUrl,
      caption: newPhotoCaption || 'Our special moment 💕',
      date: newPhotoDate || new Date().toISOString().split('T')[0],
      sender: activeProfile
    };
    const updatedPhotos = [photo, ...photos];
    setPhotos(updatedPhotos);
    localStorage.setItem('rel_photos', JSON.stringify(updatedPhotos));
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setNewPhotoDate('');

    if (db) {
      try { await setDoc(doc(db, "relationship", "photoAlbum"), { items: updatedPhotos }); } catch (e) { console.error(e); }
    }
  };

  const handleDeletePhoto = async (id) => {
    if (confirm("Remove this photo from the album?")) {
      const updatedPhotos = photos.filter(p => p.id !== id);
      setPhotos(updatedPhotos);
      localStorage.setItem('rel_photos', JSON.stringify(updatedPhotos));

      if (db) {
        try { await setDoc(doc(db, "relationship", "photoAlbum"), { items: updatedPhotos }); } catch (e) { console.error(e); }
      }
    }
  };

  const handleSaveWish = async (eventId) => {
    if (!activeWishInput.text.trim()) return;
    const existingForEvent = anniversaryWishes[eventId] || {};
    const updatedForEvent = {
      ...existingForEvent,
      [activeProfile]: activeWishInput.text
    };
    const updatedAllWishes = {
      ...anniversaryWishes,
      [eventId]: updatedForEvent
    };

    setAnniversaryWishes(updatedAllWishes);
    localStorage.setItem('rel_anniversary_wishes', JSON.stringify(updatedAllWishes));
    setActiveWishInput({ eventId: null, text: '' });

    if (db) {
      try { await setDoc(doc(db, "relationship", "anniversaryWishes"), { wishes: updatedAllWishes }); } catch (e) { console.error(e); }
    }
  };

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
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-red-100 text-slate-800 font-sans pb-20 relative overflow-hidden selection:bg-rose-500 selection:text-white">
      
      <div className="absolute top-10 left-10 w-96 h-96 bg-rose-300/60 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-[30rem] h-[30rem] bg-pink-300/60 rounded-full mix-blend-multiply filter blur-[90px] animate-pulse pointer-events-none" style={{ animationDuration: '4s' }}></div>

      {currentView === 'landing' ? (
        <div className="min-h-screen flex items-center justify-center px-4 relative z-20">
          <div className="max-w-xl w-full bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-rose-200/80 p-8 sm:p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-3xl flex items-center justify-center text-5xl shadow-xl shadow-rose-500/30 animate-pulse">
              💖
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200 shadow-sm">
              ✨ Welcome To Our Sanctuary ✨
            </span>
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 bg-clip-text text-transparent mt-4 mb-3">
              Madhav & Shristi
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed mb-8">
              A private digital universe dedicated to our endless love story, daily couple quiz harmonization, shared memories timeline, photo album, and secret love notes.
            </p>
            <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200 mb-8 shadow-inner">
              <p className="text-xs font-bold text-rose-800 mb-3">Select who is opening this today:</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setActiveProfile('Madhav')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeProfile === 'Madhav' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg scale-105 ring-2 ring-rose-400' : 'bg-white text-slate-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  Madhav 👦🏻
                </button>
                <button
                  onClick={() => setActiveProfile('Shristi')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeProfile === 'Shristi' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg scale-105 ring-2 ring-rose-400' : 'bg-white text-slate-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  Shristi 👧🏻
                </button>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('app')}
              className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white font-extrabold py-4 px-8 rounded-2xl shadow-xl shadow-rose-500/40 hover:shadow-2xl hover:scale-[1.02] active:scale-98 transition-all text-base flex items-center justify-center gap-3"
            >
              <span>Enter Our World</span>
              <span className="text-xl animate-bounce">❤️</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <header className="bg-white/70 backdrop-blur-xl shadow-lg border-b border-rose-200/60 sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentView('landing')} 
                  title="Back to Home"
                  className="text-2xl hover:scale-110 transition-transform bg-rose-50 p-2 rounded-2xl border border-rose-200 shadow-sm"
                >
                  🏠
                </button>
                <div>
                  <h1 className="text-2xl font-extrabold bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                    Madhav & Shristi
                  </h1>
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <span>✨ Our Forever Love Story</span>
                    {isCloudSynced && <span className="text-emerald-600 ml-2">• Cloud Synced ☁️</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-rose-200/50 p-1.5 rounded-full border border-rose-300 shadow-inner backdrop-blur-md">
                <span className="text-xs font-bold px-2 text-rose-800">Profile:</span>
                <button
                  onClick={() => setActiveProfile('Madhav')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    activeProfile === 'Madhav' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg scale-105' : 'text-slate-700 hover:text-rose-600'
                  }`}
                >
                  Madhav 👦🏻
                </button>
                <button
                  onClick={() => setActiveProfile('Shristi')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    activeProfile === 'Shristi' ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg scale-105' : 'text-slate-700 hover:text-rose-600'
                  }`}
                >
                  Shristi 👧🏻
                </button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center border-t border-rose-200/40 bg-white/40 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-5 sm:px-6 py-3.5 font-bold text-xs sm:text-sm border-b-4 transition-all ${
                  activeTab === 'quiz' ? 'border-rose-600 text-rose-700 bg-white/80' : 'border-transparent text-slate-600 hover:text-rose-600'
                }`}
              >
                🎯 Quiz
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-5 sm:px-6 py-3.5 font-bold text-xs sm:text-sm border-b-4 transition-all ${
                  activeTab === 'timeline' ? 'border-rose-600 text-rose-700 bg-white/80' : 'border-transparent text-slate-600 hover:text-rose-600'
                }`}
              >
                📅 Timeline
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`px-5 sm:px-6 py-3.5 font-bold text-xs sm:text-sm border-b-4 transition-all ${
                  activeTab === 'photos' ? 'border-rose-600 text-rose-700 bg-white/80' : 'border-transparent text-slate-600 hover:text-rose-600'
                }`}
              >
                📸 Photo Album ({photos.length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-5 sm:px-6 py-3.5 font-bold text-xs sm:text-sm border-b-4 transition-all ${
                  activeTab === 'notes' ? 'border-rose-600 text-rose-700 bg-white/80' : 'border-transparent text-slate-600 hover:text-rose-600'
                }`}
              >
                💌 Love Notes ({notes.length})
              </button>
            </div>
          </header>

          <main className="max-w-3xl mx-auto px-4 mt-8 relative z-10">
            {activeTab === 'quiz' ? (
              <div className="space-y-6">
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

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200/80 p-6 sm:p-10">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                        <span>💖</span> Daily 5-Question Quiz
                      </h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Answering as <span className="font-extrabold text-rose-600 underline">{activeProfile}</span>
                      </p>
                    </div>
                    {isQuizSubmitted && (
                      <button
                        onClick={() => setIsQuizSubmitted(false)}
                        className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs shadow-sm transition-all"
                      >
                        ✏️ Edit Answers
                      </button>
                    )}
                  </div>

                  {currentQuizQuestions.length > 0 && (
                    isQuizSubmitted ? (
                      <div className="space-y-6">
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center text-emerald-800 font-bold text-sm">
                          🎉 Quiz completed & submitted! Review your answers below together.
                        </div>
                        {currentQuizQuestions.map((q, idx) => (
                          <div key={q.id} className="bg-gradient-to-br from-rose-50/80 to-pink-50/60 p-6 rounded-2xl border border-rose-200">
                            <p className="text-xs font-extrabold text-rose-600 uppercase tracking-widest mb-1">Question {idx + 1}</p>
                            <p className="text-base font-bold text-slate-800 mb-4">{q.text}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm">
                                <span className="text-xs font-bold text-rose-600">Madhav's Answer:</span>
                                <p className="text-sm text-slate-700 mt-1 italic">{answers.Madhav?.[q.id] || '(No answer yet)'}</p>
                              </div>
                              <div className="bg-white p-3.5 rounded-xl border border-pink-200 shadow-sm">
                                <span className="text-xs font-bold text-pink-600">Shristi's Answer:</span>
                                <p className="text-sm text-slate-700 mt-1 italic">{answers.Shristi?.[q.id] || '(No answer yet)'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-2 mb-8">
                          {currentQuizQuestions.map((_, idx) => (
                            <div
                              key={idx}
                              onClick={() => setCurrentQuestionIndex(idx)}
                              className={`h-3 flex-1 rounded-full cursor-pointer transition-all ${
                                currentQuestionIndex === idx ? 'bg-gradient-to-r from-rose-600 to-pink-600 scale-105 shadow-md' : 'bg-rose-200/60 hover:bg-rose-300'
                              }`}
                            />
                          ))}
                        </div>

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
                            className="w-full p-4 rounded-2xl border border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-400/40 bg-white/95 text-base shadow-sm"
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="px-6 py-3 rounded-2xl text-sm font-bold border border-rose-300 text-slate-700 disabled:opacity-30 hover:bg-rose-50"
                          >
                            ← Previous
                          </button>

                          {currentQuestionIndex === currentQuizQuestions.length - 1 ? (
                            <button
                              onClick={() => setIsQuizSubmitted(true)}
                              className="px-8 py-3 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all"
                            >
                              Submit Quiz ✅
                            </button>
                          ) : (
                            <button
                              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                              className="px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg"
                            >
                              Next →
                            </button>
                          )}
                        </div>

                        <div className="mt-10 border-t border-rose-200/80 pt-8">
                          <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                            <span>💌</span> Live Side-by-Side Comparison
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-5 rounded-3xl bg-white/90 border border-rose-200 shadow-lg">
                              <span className="text-xs font-extrabold text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border">
                                Madhav's Answer 👦🏻
                              </span>
                              <p className="text-sm font-medium text-slate-700 mt-3 italic bg-rose-50/40 p-4 rounded-2xl border border-rose-100 min-h-[4rem]">
                                {answers.Madhav?.[currentQuizQuestions[currentQuestionIndex].id] || 'Waiting for Madhav... 💭'}
                              </p>
                            </div>

                            <div className="p-5 rounded-3xl bg-white/90 border border-rose-200 shadow-lg">
                              <span className="text-xs font-extrabold text-pink-600 uppercase tracking-wider bg-pink-50 px-3 py-1 rounded-full border">
                                Shristi's Answer 👧🏻
                              </span>
                              <p className="text-sm font-medium text-slate-700 mt-3 italic bg-pink-50/40 p-4 rounded-2xl border border-pink-100 min-h-[4rem]">
                                {answers.Shristi?.[currentQuizQuestions[currentQuestionIndex].id] || 'Waiting for Shristi... 💭'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : activeTab === 'timeline' ? (
              <div className="space-y-6">
                
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200/80 p-6 sm:p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-extrabold text-slate-800">
                      📅 {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long' })} {calendarYear}
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
                          else { setCalendarMonth(calendarMonth - 1); }
                        }}
                        className="px-3 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-sm"
                      >
                        ←
                      </button>
                      <button 
                        onClick={() => {
                          if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
                          else { setCalendarMonth(calendarMonth + 1); }
                        }}
                        className="px-3 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-sm"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 mb-2">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: getFirstDayOfMonth(calendarMonth, calendarYear) }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}

                    {Array.from({ length: getDaysInMonth(calendarMonth, calendarYear) }).map((_, i) => {
                      const day = i + 1;
                      const monthStr = String(calendarMonth + 1).padStart(2, '0');
                      const dayStr = String(day).padStart(2, '0');
                      const dateString = `${calendarYear}-${monthStr}-${dayStr}`;

                      const hasEvent = events.some(ev => ev.date === dateString);
                      const isSelected = selectedCalendarDate === dateString;

                      return (
                        <button
                          key={dateString}
                          onClick={() => setSelectedCalendarDate(isSelected ? null : dateString)}
                          className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all relative ${
                            isSelected 
                              ? 'bg-rose-600 text-white shadow-md scale-105' 
                              : hasEvent 
                                ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-sm ring-2 ring-rose-200 animate-pulse' 
                                : 'bg-rose-50 text-slate-700 hover:bg-rose-100'
                          }`}
                        >
                          {day}
                          {hasEvent && <span className="absolute bottom-0.5 w-1 h-1 bg-white rounded-full"></span>}
                        </button>
                      );
                    })}
                  </div>
                  {selectedCalendarDate && (
                    <div className="mt-4 p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs flex justify-between items-center">
                      <span>Showing events for: <strong>{selectedCalendarDate}</strong></span>
                      <button onClick={() => setSelectedCalendarDate(null)} className="text-rose-600 font-bold underline">Clear Filter</button>
                    </div>
                  )}
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200/80 p-6 sm:p-8">
                  <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                    <span>{editingEventId ? '✏️ Edit Memory' : '➕ Add a New Memory'}</span>
                  </h3>
                  <form onSubmit={handleSaveEvent} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      type="url"
                      placeholder="Optional Photo URL (e.g. Unsplash, Imgur link)..."
                      value={newEvent.imageUrl}
                      onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
                      className="p-3.5 rounded-2xl border border-rose-300 text-sm focus:outline-none focus:ring-4 focus:ring-rose-400/40 bg-white shadow-inner font-medium"
                    />
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Short romantic note / description..."
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        className="w-full p-3.5 rounded-2xl border border-rose-300 text-sm focus:outline-none focus:ring-4 focus:ring-rose-400/40 bg-white shadow-inner font-medium"
                      />
                    </div>
                    <div className="sm:col-span-2 flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:shadow-xl text-white font-extrabold py-3.5 rounded-2xl text-sm transition-all"
                      >
                        {editingEventId ? 'Save Changes ✨' : 'Add to Our Timeline 🗓️💖'}
                      </button>
                      {editingEventId && (
                        <button
                          type="button"
                          onClick={() => { setEditingEventId(null); setNewEvent({ date: '', title: '', category: 'Milestone', description: '', imageUrl: '' }); }}
                          className="px-6 bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm hover:bg-slate-300 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200/80 p-6 sm:p-10">
                  <h3 className="text-2xl font-extrabold text-slate-800 mb-8 flex items-center gap-3">
                    <span className="animate-pulse">🌹</span> Our Complete Relationship Journey
                  </h3>
                  <div className="relative border-l-4 border-rose-300 ml-4 space-y-8">
                    {events
                      .filter(evt => selectedCalendarDate ? evt.date === selectedCalendarDate : true)
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((evt) => {
                        const isAnniversary = evt.category === 'Anniversary';
                        const isOpen = openWishDropdowns[evt.id];
                        const eventWishes = anniversaryWishes[evt.id] || {};

                        return (
                          <div key={evt.id} className="relative pl-8 group">
                            <div className="absolute -left-[11px] top-2 w-5 h-5 rounded-full bg-rose-600 border-4 border-white shadow-lg group-hover:scale-150 transition-transform duration-300" />
                            
                            <div className="bg-white/90 hover:bg-white p-6 rounded-3xl border border-rose-200 shadow-md hover:shadow-xl transition-all overflow-hidden">
                              {evt.imageUrl && (
                                <div className="mb-4 rounded-2xl overflow-hidden h-48 bg-rose-50 border border-rose-100 shadow-inner">
                                  <img 
                                    src={evt.imageUrl} 
                                    alt={evt.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                </div>
                              )}

                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 shadow-sm">
                                  {evt.date}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-pink-100 text-pink-800 shadow-sm">
                                    {evt.category}
                                  </span>
                                  <button 
                                    onClick={() => handleEditEvent(evt)} 
                                    className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-lg border border-rose-200"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteEvent(evt.id)} 
                                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded-lg border border-red-200"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <h4 className="text-lg font-extrabold text-slate-800 mt-2">{evt.title}</h4>
                              <p className="text-sm font-medium text-slate-600 mt-1 leading-relaxed">{evt.description}</p>

                              {isAnniversary && (
                                <div className="mt-4 pt-4 border-t border-rose-100">
                                  <button
                                    onClick={() => setOpenWishDropdowns({ ...openWishDropdowns, [evt.id]: !isOpen })}
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 text-xs font-extrabold text-rose-700 flex justify-between items-center shadow-sm hover:bg-rose-100/50 transition-all"
                                  >
                                    <span>💌 Anniversary Wishes & Notes ({Object.keys(eventWishes).length})</span>
                                    <span>{isOpen ? '▲ Hide' : '▼ View / Add Wish'}</span>
                                  </button>

                                  {isOpen && (
                                    <div className="mt-3 p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
                                      {Object.keys(eventWishes).length === 0 ? (
                                        <p className="text-xs text-slate-500 italic text-center py-2">No wishes added for this month yet. Be the first!</p>
                                      ) : (
                                        Object.entries(eventWishes).map(([sender, wishText]) => (
                                          <div key={sender} className="bg-white p-3 rounded-xl border border-rose-100 shadow-sm">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Wish from {sender} 💖</span>
                                            <p className="text-xs font-medium text-slate-700 mt-1 italic">"{wishText}"</p>
                                          </div>
                                        ))
                                      )}

                                      <div className="pt-2">
                                        <textarea
                                          rows="2"
                                          placeholder={`Write your wish for this anniversary as ${activeProfile}...`}
                                          value={activeWishInput.eventId === evt.id ? activeWishInput.text : ''}
                                          onChange={(e) => setActiveWishInput({ eventId: evt.id, text: e.target.value })}
                                          className="w-full p-3 rounded-xl border border-rose-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                                        />
                                        <button
                                          onClick={() => handleSaveWish(evt.id)}
                                          className="mt-2 w-full py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                                        >
                                          Post Wish as {activeProfile} ✨
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : activeTab === 'photos' ? (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200/80 p-6 sm:p-8">
                  <h3 className="text-xl font-extrabold text-slate-800 mb-2 flex items-center gap-2">
                    <span>📸</span> Add Photo to Our Album
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Upload or paste an image link to share a precious memory as <strong className="text-rose-600">{activeProfile}</strong>.</p>
                  
                  <form onSubmit={handleAddPhoto} className="space-y-4">
                    <input
                      type="url"
                      placeholder="Paste Image URL (e.g. Imgur, Unsplash, Google Photos link)..."
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-rose-300 text-sm focus:outline-none focus:ring-4 focus:ring-rose-400/40 bg-white shadow-inner font-medium"
                      required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Caption / Memory note..."
                        value={newPhotoCaption}
                        onChange={(e) => setNewPhotoCaption(e.target.value)}
                        className="p-3.5 rounded-2xl border border-rose-300 text-sm focus:outline-none focus:ring-4 focus:ring-rose-400/40 bg-white shadow-inner font-medium"
                      />
                      <input
                        type="date"
                        value={newPhotoDate}
                        onChange={(e) => setNewPhotoDate(e.target.value)}
                        className="p-3.5 rounded-2xl border border-rose-300 text-sm focus:outline-none focus:ring-4 focus:ring-rose-400/40 bg-white shadow-inner font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:shadow-xl text-white font-extrabold py-3.5 rounded-2xl text-sm transition-all"
                    >
                      Upload to Album 📷✨
                    </button>
                  </form>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-200/80 p-6 sm:p-10">
                  <h3 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                    <span>💖</span> Our Memories Album
                  </h3>
                  {photos.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-10 italic">No photos added yet. Add your first memory above!</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {photos.map((photo) => (
                        <div key={photo.id} className="bg-white rounded-3xl border border-rose-200 shadow-lg overflow-hidden flex flex-col justify-between group">
                          <div className="relative overflow-hidden h-64 bg-rose-50">
                            <img 
                              src={photo.url} 
                              alt={photo.caption} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80'; }}
                            />
                            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-rose-700 shadow-sm border border-rose-200">
                              {photo.date}
                            </span>
                          </div>
                          <div className="p-5 flex flex-col justify-between flex-1">
                            <p className="text-sm font-bold text-slate-800">{photo.caption}</p>
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-rose-100 text-xs font-bold text-rose-600">
                              <span>Added by {photo.sender}</span>
                              <button
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg border border-red-200 transition-all"
                              >
                                Delete 🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
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
                      className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:shadow-xl text-white font-extrabold py-3.5 rounded-2xl text-sm transition-all"
                    >
                      Send Love Note 💕
                    </button>
                  </form>
                </div>

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
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-normal">{note.date}</span>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-500 hover:text-red-700 font-bold bg-white px-2 py-0.5 rounded-md border border-red-200 shadow-sm"
                              title="Delete Note"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}