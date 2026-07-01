import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  Trash2Icon, 
  SearchIcon,
  BookOpenIcon,
  PinIcon,
  PaletteIcon,
  TagIcon,
  ShieldCheckIcon,
  CloudIcon,
  CloudOffIcon,
  Loader2Icon,
  SparklesIcon
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  getDocFromServer
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../services/gdriveAuthService';
import { onAuthStateChanged, User } from 'firebase/auth';

interface GoogleKeepManagerProps {
  token: string | null;
}

interface KeepNote {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  color?: string;
  labels?: string[];
  createdAt?: any;
  updatedAt?: any;
}

const PRESET_COLORS = [
  { name: 'Default', bg: 'bg-[#040406]/55 border-slate-900' },
  { name: 'Nebula Blue', bg: 'bg-[#0f1d3a]/65 border-cyan-500/35 shadow-[0_0_15px_rgba(6,182,212,0.05)]' },
  { name: 'Pulsar Purple', bg: 'bg-[#1b1230]/65 border-fuchsia-500/35 shadow-[0_0_15px_rgba(217,70,239,0.05)]' },
  { name: 'Nova Yellow', bg: 'bg-[#2b210a]/65 border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.05)]' },
  { name: 'Forest Core', bg: 'bg-[#0a1e12]/65 border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.05)]' },
  { name: 'Cosmos Rust', bg: 'bg-[#220d0f]/65 border-rose-500/35 shadow-[0_0_15px_rgba(244,63,94,0.05)]' }
];

export const GoogleKeepManager: React.FC<GoogleKeepManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  // Auth and Firestore Sync state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  
  // Notes collections (Local fallback vs Cloud)
  const [firestoreNotes, setFirestoreNotes] = useState<KeepNote[]>([]);
  const [localNotes, setLocalNotes] = useState<KeepNote[]>(() => {
    const saved = localStorage.getItem('sovereign_keep_backup');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: '1',
        title: 'ARCHANGEL CORE PARAMETERS',
        body: 'Resonance filters: Set frequency to Open G rhythm.\nSICO protocols verified. Secure port mapping active.',
        isPinned: true,
        color: 'bg-[#0f1d3a]/65 border-cyan-500/35 shadow-[0_0_15px_rgba(6,182,212,0.05)]',
        labels: ['TELEMETRY']
      },
      {
        id: '2',
        title: 'SOVEREIGN LAUNCH LIST',
        body: 'Validate OAuth scopes on brand endpoints.\nDeploy Firebase security blueprints.\nInitiate hyper-temporal scales simulation.',
        isPinned: false,
        color: 'bg-[#1b1230]/65 border-fuchsia-500/35 shadow-[0_0_15px_rgba(217,70,239,0.05)]',
        labels: ['MILESTONE']
      }
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  // Creator form state
  const [isExpanding, setIsExpanding] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [noteColor, setNoteColor] = useState(PRESET_COLORS[0].bg);
  const [noteLabels, setNoteLabels] = useState<string>('');
  
  const [showColorPicker, setShowColorPicker] = useState(false);

  // 1. Connection testing mandate inside useEffect init hook
  useEffect(() => {
    async function verifyConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'verification_ping'));
        setDbConnected(true);
      } catch (error) {
        setDbConnected(false);
      }
    }
    verifyConnection();
  }, []);

  // 2. Track Firebase Auth changes to switch notes storage engine
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // 3. Realtime Firestore Synchronization stream mapping
  useEffect(() => {
    if (!currentUser) {
      setFirestoreNotes([]);
      return;
    }

    setIsSyncing(true);
    const path = `users/${currentUser.uid}/notes`;
    const notesColl = collection(db, 'users', currentUser.uid, 'notes');
    
    const unsubscribeSnapshot = onSnapshot(notesColl, (snapshot) => {
      const list: KeepNote[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || '',
          body: data.body || '',
          isPinned: !!data.isPinned,
          color: data.color,
          labels: data.labels,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });
      // Sort: pinned first, then by creation date decreasing or index
      setFirestoreNotes(list);
      setIsSyncing(false);
    }, (error) => {
      setIsSyncing(false);
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribeSnapshot();
  }, [currentUser]);

  // Write local state to localStorage if we are in local sandbox mode
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('sovereign_keep_backup', JSON.stringify(localNotes));
    }
  }, [localNotes, currentUser]);

  // Save / create note handler
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteBody.trim()) return;

    const labelsArray = noteLabels
      .split(',')
      .map(l => l.trim().toUpperCase())
      .filter(l => l !== '');

    const generatedTitle = noteTitle.toUpperCase() || 'UNTITLED SECURE MEMO';
    const cleanColor = noteColor || PRESET_COLORS[0].bg;

    if (currentUser) {
      // CLOUD PERSISTENCE MODE (Firestore Server-Side Validated Write)
      const newId = Date.now().toString();
      const path = `users/${currentUser.uid}/notes/${newId}`;
      try {
        const payload: any = {
          title: generatedTitle,
          body: noteBody,
          isPinned: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        if (cleanColor) {
          payload.color = cleanColor;
        }
        if (labelsArray.length > 0) {
          payload.labels = labelsArray;
        }

        // Exact schema verified setDoc triggers allow create
        await setDoc(doc(db, 'users', currentUser.uid, 'notes', newId), payload);
        addLog('SYSTEM', `Cloud synchronized Keep note payload to Firestore path: ${generatedTitle}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    } else {
      // LOCAL FALLBACK SANDBOX MODE
      const newNote: KeepNote = {
        id: Date.now().toString(),
        title: generatedTitle,
        body: noteBody,
        isPinned: false,
        color: cleanColor,
        labels: labelsArray.length > 0 ? labelsArray : undefined
      };
      setLocalNotes(prev => [newNote, ...prev]);
      addLog('SYSTEM', `Compiled note block to offline storage node: ${newNote.title}`);
    }
    
    // Reset inputs
    setNoteTitle('');
    setNoteBody('');
    setNoteLabels('');
    setNoteColor(PRESET_COLORS[0].bg);
    setIsExpanding(false);
  };

  // Delete note handler
  const handleDeleteNote = async (id: string, noteTitleStr: string) => {
    // Standard workspace security mandate checklist - verify action
    const confirmed = window.confirm(`CONFIRM: Purge memory element "${noteTitleStr}"? This action cannot be reverted.`);
    if (!confirmed) return;

    if (currentUser) {
      // CLOUD PERSISTENCE DELETE
      const path = `users/${currentUser.uid}/notes/${id}`;
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'notes', id));
        addLog('SYSTEM', `Purged secure collection note node from cloud: ${noteTitleStr}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else {
      // LOCAL FALLBACK DELETE
      setLocalNotes(prev => prev.filter(n => n.id !== id));
      addLog('SYSTEM', `Purged offline storage note element: ${noteTitleStr}`);
    }
  };

  // Toggle Pinned status
  const togglePin = async (note: KeepNote) => {
    if (currentUser) {
      // CLOUD PIN RE-WRITE
      const path = `users/${currentUser.uid}/notes/${note.id}`;
      try {
        const payload: any = {
          title: note.title,
          body: note.body,
          isPinned: !note.isPinned,
          createdAt: note.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        if (note.color) payload.color = note.color;
        if (note.labels && note.labels.length > 0) payload.labels = note.labels;

        await setDoc(doc(db, 'users', currentUser.uid, 'notes', note.id), payload);
        addLog('SYSTEM', `Metadata modified (Pin toggled) for note node: ${note.title}`);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      // LOCAL PIN TOGGLE
      setLocalNotes(prev => prev.map(n => n.id === note.id ? { ...n, isPinned: !n.isPinned } : n));
    }
  };

  // Get active notes ledger driving UI
  const activeNotesLedger = currentUser ? firestoreNotes : localNotes;

  // Apply search filtering
  const filteredNotes = activeNotesLedger.filter(n => 
    (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (n.body || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.labels?.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const regularNotes = filteredNotes.filter(n => !n.isPinned);

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0 animate-fadeIn font-mono">
      
      {/* Synchronization Status Bar overlay indicator */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#030304]/60 border border-slate-900 p-3 rounded-lg leading-relaxed text-[10px]/normal text-slate-400 select-none">
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center justify-center p-1.5 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded">
              <ShieldCheckIcon className="w-4 h-4 animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center justify-center p-1.5 bg-cyan-950/25 border border-cyan-500/25 text-cyan-400 rounded">
              <SparklesIcon className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="font-bold flex items-center gap-1.5 uppercase tracking-wide">
              <span>STORAGE LEDGER SYSTEM STATUS:</span>
              {currentUser ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">CLOUD SYNCED (FIRESTORE)</span>
              ) : (
                <span className="text-cyan-400 font-bold">LOCAL FALLBACK SANDBOX</span>
              )}
            </div>
            <span className="text-[9px] text-slate-500 block uppercase font-sans mt-0.5">
              {currentUser 
                ? `Secured and synced under cloud ID: ${currentUser.uid.slice(0, 8)}... via private user collections.` 
                : "Active offline sandbox. Sign in via workspace panel to stream notes with full real-time database synchronization."}
            </span>
          </div>
        </div>

        {/* Syncing loader indicator */}
        <div className="flex items-center justify-end gap-2.5">
          {isSyncing ? (
            <div className="flex items-center gap-1.5 text-cyan-400 text-[9px] uppercase font-bold">
              <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
              <span>SYNCING CLOUD...</span>
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-1 text-emerald-500 text-[9px] uppercase font-bold">
              <CloudIcon className="w-3.5 h-3.5" />
              <span>CONNECTED ONLINE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-500 text-[9px] uppercase font-bold">
              <CloudOffIcon className="w-3.5 h-3.5" />
              <span>STANDALONE ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Note Creator Input Form Box */}
      <div className="max-w-xl mx-auto w-full">
        <form 
          onSubmit={handleSaveNote}
          className={`bg-[#050508]/85 border rounded-lg p-3 transition-all duration-200 outline-none flex flex-col gap-2 relative ${isExpanding ? noteColor : 'border-slate-800'}`}
        >
          {isExpanding && (
            <div className="flex justify-between items-center bg-transparent">
              <input 
                type="text"
                placeholder="TITLE..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold uppercase text-slate-100 outline-none placeholder:text-slate-700"
              />
            </div>
          )}

          <textarea
            placeholder={isExpanding ? "TAKE A SECURE SECURE MEMO MEMO..." : "Take a secure memo..."}
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            onFocus={() => setIsExpanding(true)}
            rows={isExpanding ? 3 : 1}
            className="w-full bg-transparent text-xs text-slate-300 font-sans outline-none resize-none placeholder:text-slate-600"
          />

          {isExpanding && (
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center pt-2 border-t border-slate-900/30">
              
              {/* Optional tags creation */}
              <div className="flex items-center gap-1.5 bg-black/40 border border-slate-900 rounded px-2 py-1 flex-1">
                <TagIcon className="w-3 h-3 text-slate-600" />
                <input 
                  type="text"
                  placeholder="LABELS (E.G. KEY, INTEL)..."
                  value={noteLabels}
                  onChange={(e) => setNoteLabels(e.target.value)}
                  className="w-full bg-transparent text-[8px] outline-none text-slate-400 font-mono uppercase"
                />
              </div>

              {/* Hues selector and submit */}
              <div className="flex items-center justify-end gap-1.5 flex-shrink-0">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    style={{ cursor: 'pointer' }}
                    className="p-1.5 hover:bg-black/30 border border-transparent hover:border-slate-800 rounded transition-colors text-slate-500 hover:text-cyan-400 cursor-pointer"
                    title="Change palette"
                  >
                    <PaletteIcon className="w-3.5 h-3.5" />
                  </button>

                  {showColorPicker && (
                    <div className="absolute bottom-full mb-1 right-0 bg-[#030304]/90 border border-slate-800 rounded p-1.5 flex gap-1 z-50">
                      {PRESET_COLORS.map((col) => (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => { setNoteColor(col.bg); setShowColorPicker(false); }}
                          style={{ cursor: 'pointer' }}
                          className={`w-4 h-4 rounded-full border border-slate-950 focus:outline-none focus:scale-115 ${col.bg.split(' ')[0]}`}
                          title={col.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  style={{ cursor: 'pointer' }}
                  className="px-3.5 py-1.5 bg-cyan-950/20 hover:bg-cyan-900/40 border border-cyan-500/40 hover:border-cyan-500 text-[10px] uppercase font-bold text-cyan-300 rounded cursor-pointer transition-colors"
                >
                  SAVE
                </button>
              </div>

            </div>
          )}
        </form>
      </div>

      {/* List Search Filter */}
      <div className="max-w-xl mx-auto w-full relative flex items-center bg-[#050508] border border-slate-900 focus-within:border-cyan-500/50 rounded-lg">
        <SearchIcon className="w-3.5 h-3.5 text-slate-600 absolute left-3" />
        <input 
          type="text"
          placeholder="SEARCH MEMOS OR LABELS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 text-xs text-slate-200 outline-none uppercase placeholder:text-slate-650"
        />
      </div>

      {/* Grid container */}
      <div className="flex-1 overflow-y-auto pr-0.5 custom-scrollbar space-y-4">
        
        {/* Pinned section */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-1 leading-none select-none">
              <PinIcon className="w-3 h-3 text-cyan-650" /> Pinned Storage Blocks
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pinnedNotes.map(n => (
                <div 
                  key={n.id} 
                  className={`border rounded-lg p-3 flex flex-col gap-2 relative transition-all group ${n.color || PRESET_COLORS[0].bg}`}
                >
                  <button 
                    onClick={() => togglePin(n)}
                    className="p-1 hover:bg-black/20 rounded absolute top-2 right-2 text-cyan-400 cursor-pointer"
                  >
                    <PinIcon className="w-3 h-3 fill-cyan-400" />
                  </button>
                  <h4 className="text-xs font-bold text-slate-100 tracking-wider truncate pr-5 select-text uppercase leading-none">{n.title}</h4>
                  <p className="text-[11px] text-slate-300 font-sans break-words whitespace-pre-wrap select-text pr-1">{n.body}</p>
                  
                  {/* Labels list */}
                  {n.labels && n.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 select-none text-[7px] text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 px-1.5 py-0.5 rounded w-fit uppercase font-bold tracking-widest">
                      {n.labels.join(', ')}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button 
                      onClick={() => handleDeleteNote(n.id, n.title)}
                      className="p-1 text-slate-600 hover:text-red-500 rounded hover:bg-black/20 cursor-pointer transition-all"
                      title="Delete note"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular list section */}
        <div className="space-y-1.5">
          {pinnedNotes.length > 0 && (
            <span className="text-[9px] text-slate-650 font-bold uppercase tracking-widest leading-none select-none">
              Other Memo Entries
            </span>
          )}
          
          {regularNotes.length === 0 && pinnedNotes.length === 0 ? (
            <div className="py-20 text-center text-slate-600 text-xs border border-dashed border-slate-900 rounded-lg flex flex-col gap-2 justify-center items-center font-bold">
              <BookOpenIcon className="w-8 h-8 opacity-10 mb-1" />
              <span>STORAGE LEDGER IS EMPTY</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fadeIn">
              {regularNotes.map(n => (
                <div 
                  key={n.id} 
                  className={`border rounded-lg p-3 flex flex-col gap-2 relative transition-all group ${n.color || PRESET_COLORS[0].bg}`}
                >
                  <button 
                    onClick={() => togglePin(n)}
                    className="p-1 hover:bg-black/20 rounded absolute top-2 right-2 text-slate-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 cursor-pointer transition-all"
                  >
                    <PinIcon className="w-3 h-3" />
                  </button>
                  <h4 className="text-xs font-bold text-slate-100 tracking-wider truncate pr-5 select-text uppercase leading-none">{n.title}</h4>
                  <p className="text-[11px] text-slate-300 font-sans break-words whitespace-pre-wrap select-text pr-1">{n.body}</p>
                  
                  {/* Labels list */}
                  {n.labels && n.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 select-none text-[7px] text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 px-1.5 py-0.5 rounded w-fit uppercase font-bold tracking-widest">
                      {n.labels.join(', ')}
                    </div>
                  )}

                  <div className="flex justify-end pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteNote(n.id, n.title)}
                      className="p-1 text-slate-650 hover:text-red-500 rounded hover:bg-black/20 cursor-pointer transition-colors"
                      title="Delete note"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
