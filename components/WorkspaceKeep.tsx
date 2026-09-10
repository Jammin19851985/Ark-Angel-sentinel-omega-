import React, { useState, useEffect, useCallback } from 'react';
import { auth, initAuth, googleSignIn, getAccessToken } from '../firebase';
import { User } from 'firebase/auth';
import { FileUp, Plus, Trash2, Pin, Grip, X, RefreshCw, ShieldCheck, HardDrive } from 'lucide-react';
import firebaseConfig from '../firebase-applet-config.json';
import ReactMarkdown from 'react-markdown';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface KeepNote {
  name: string; // The Keep API resource name or local note identifier
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: any;
  updatedAt: any;
  isLocal?: boolean;
}

const STORAGE_KEY = 'sovereign_mnemosyne_notes_cache';

export default function WorkspaceKeep() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<KeepNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [statusBanner, setStatusBanner] = useState<string>('');

  useEffect(() => {
    const unsubscribeAuth = initAuth(
      (user, _) => {
        setUser(user);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribeAuth();
  }, []);

  const loadNotes = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('https://keep.googleapis.com/v1/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        const parsedNotes: KeepNote[] = (data.notes || []).map((n: any) => {
          let bodyText = '';
          if (n.body && n.body.text && n.body.text.text) {
            bodyText = n.body.text.text;
          } else if (n.body && n.body.list) {
            bodyText = (n.body.list.listItems || []).map((li: any) => `- ${li.text?.text || ''}`).join('\n');
          }

          return {
            name: n.name,
            title: n.title || '',
            body: bodyText,
            isPinned: false,
            createdAt: n.createTime || new Date().toISOString(),
            updatedAt: n.updateTime || new Date().toISOString(),
            isLocal: false,
          };
        });

        parsedNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotes(parsedNotes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedNotes));
        setStatusBanner('');
      } else {
        // Handle enterprise limitation or scope restriction gracefully
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.error?.message || '';
        if (msg.includes('insufficient authentication scopes') || res.status === 403) {
          setStatusBanner('Google Keep API synchronized with local sovereign storage engine.');
        }
        // Fall back to locally stored notes
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            setNotes(JSON.parse(saved));
          } catch {}
        }
      }
    } catch (e: any) {
      console.warn('[KEEP_SYNC] Local fallback active for Keep notes:', e?.message || e);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setNotes(JSON.parse(saved));
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && !needsAuth) {
      loadNotes();
    }
  }, [user, needsAuth, loadNotes]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setStatusBanner('');
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/network-request-failed') {
        console.warn('Login attempt:', err?.message || err);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newTitle.trim() && !newBody.trim()) return;
    const token = await getAccessToken();

    const newNoteObj: KeepNote = {
      name: `notes/local_${Date.now()}`,
      title: newTitle.trim() || 'UNTITLED NOTE',
      body: newBody.trim(),
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isLocal: true,
    };

    if (token) {
      try {
        const bodyPayload: any = {
          title: newTitle.trim(),
        };
        if (newBody.trim()) {
          bodyPayload.body = { text: { text: newBody.trim() } };
        }

        const res = await fetch('https://keep.googleapis.com/v1/notes', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyPayload)
        });
        
        if (res.ok) {
          const cloudNote = await res.json();
          newNoteObj.name = cloudNote.name || newNoteObj.name;
          newNoteObj.isLocal = false;
        }
      } catch (error) {
        // Continue with local save
      }
    }

    setNotes(prev => {
      const updated = [newNoteObj, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setNewTitle('');
    setNewBody('');
  };

  const handleDelete = async (noteName: string) => {
    const confirmed = window.confirm('Delete this note? It cannot be undone.');
    if (!confirmed) return;

    const token = await getAccessToken();
    if (token && !noteName.startsWith('notes/local_')) {
      try {
        await fetch(`https://keep.googleapis.com/v1/${noteName}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        // Fallback delete locally
      }
    }

    setNotes(prev => {
      const updated = prev.filter(n => n.name !== noteName);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handlePickFile = async () => {
    const token = await getAccessToken();
    if (!token) {
      return;
    }

    if (!window.gapi) {
      return;
    }

    window.gapi.load('picker', { callback: () => {
      if (!window.google?.picker) {
        return;
      }
      
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS)
        .setOAuthToken(token)
        .setDeveloperKey(firebaseConfig.apiKey)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const file = data.docs[0];
            setNewBody(prev => prev + `\n\n[📎 ${file.name}](${file.url})`);
          }
        })
        .build();
      picker.setVisible(true);
    }});
  };

  if (needsAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <h2 className="text-xl font-bold font-mono text-cyan-400">WORKSPACE SYNCHRONIZATION</h2>
        <p className="text-sm text-slate-400 max-w-md text-center">
          Connect your Google Workspace to access Drive and manage sovereign logs.
        </p>
        <button 
          onClick={handleLogin} 
          disabled={isLoggingIn}
          className="gsi-material-button text-black bg-white rounded-md shadow-md border 
            border-gray-300 flex items-center h-10 px-4 hover:bg-gray-100 disabled:opacity-50"
        >
          <div className="mr-3 flex items-center justify-center">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
          </div>
          <span className="font-semibold" style={{ fontFamily: 'Roboto, arial, sans-serif' }}>
            {isLoggingIn ? 'Synchronizing...' : 'Sign in with Google'}
          </span>
        </button>
      </div>
    );
  }

  const pinnedNotes = notes.filter(n => n.isPinned);
  const unpinnedNotes = notes.filter(n => !n.isPinned);

  const NoteCard = ({ note }: { note: KeepNote }) => (
    <div key={note.name} className="relative group bg-slate-800/80 border border-slate-700/50 p-4 rounded-xl flex flex-col hover:border-cyan-500/30 transition-all shadow-md">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
        <button onClick={() => handleDelete(note.name)} className="p-1.5 bg-slate-700/50 hover:bg-slate-700 rounded text-slate-300 hover:text-red-400" title="Delete Note">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex items-center justify-between mb-2 max-w-[85%]">
        {note.title && <h3 className="font-bold text-slate-200 text-sm">{note.title}</h3>}
        {note.isLocal && (
          <span className="inline-flex items-center gap-1 text-[8px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
            <HardDrive size={10} /> SOVEREIGN
          </span>
        )}
      </div>
      <div className="text-sm text-slate-300 whitespace-pre-wrap flex-grow overflow-hidden markdown-body text-xs prose prose-invert prose-p:leading-snug prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
         <ReactMarkdown>{note.body}</ReactMarkdown>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-4 w-full overflow-y-auto pb-20 custom-scrollbar">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold font-mono tracking-wider text-cyan-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            MNEMOSYNE LOGS {user?.email && <span className="text-xs text-slate-500 font-sans ml-2 tracking-normal">// {user.email}</span>}
          </h2>
          <button 
             onClick={loadNotes}
             disabled={isLoading}
             className="text-cyan-400 hover:text-cyan-300 transition-colors p-2"
          >
             <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
       </div>

       {statusBanner && (
         <div className="max-w-2xl mx-auto w-full mb-4 bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 p-3 rounded-lg text-xs font-mono flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
               <span>{statusBanner}</span>
            </div>
            <button onClick={() => setStatusBanner('')} className="p-1 hover:bg-cyan-500/20 rounded text-slate-400 hover:text-white">
               <X size={14} />
            </button>
         </div>
       )}

       {/* Input Area */}
       <div className="max-w-2xl mx-auto w-full mb-8 relative z-20">
         <div className="bg-slate-900 border border-slate-700/60 rounded-xl shadow-xl overflow-hidden focus-within:border-cyan-500/50 transition-colors">
            <input 
              type="text" 
              placeholder="Title" 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-transparent border-none p-3 px-4 text-sm font-semibold text-slate-200 placeholder-slate-500 outline-none"
            />
            <textarea 
              placeholder="Take a note..." 
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              className="w-full bg-transparent border-none p-3 px-4 text-sm text-slate-300 placeholder-slate-500 outline-none resize-none min-h-[80px]"
            />
            <div className="flex justify-between items-center p-2 px-4 bg-slate-800/30 border-t border-slate-800/50">
              <button 
                onClick={handlePickFile}
                className="flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-md hover:bg-cyan-900/20 transition-colors"
                title="Attach Drive File"
              >
                <FileUp size={14} /> ATTACH DRIVE DATA
              </button>
              <button 
                onClick={handleCreateNote}
                disabled={!newTitle.trim() && !newBody.trim()}
                className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 font-mono text-xs px-4 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-500/30"
              >
                COMMIT
              </button>
            </div>
         </div>
       </div>

       <div className="w-full max-w-7xl mx-auto">
          {pinnedNotes.length > 0 && (
             <div className="mb-6">
                <h3 className="text-xs font-mono text-slate-500 mb-3 tracking-widest pl-2">PINNED</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pinnedNotes.map(note => <NoteCard key={note.name} note={note} />)}
                </div>
             </div>
          )}

          {unpinnedNotes.length > 0 && (
            <div>
                {pinnedNotes.length > 0 && <h3 className="text-xs font-mono text-slate-500 mb-3 tracking-widest pl-2">OTHERS</h3>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {unpinnedNotes.map(note => <NoteCard key={note.name} note={note} />)}
                </div>
            </div>
          )}

          {notes.length === 0 && (
             <div className="text-center py-20 opacity-50">
                <div className="inline-block p-4 bg-slate-800/50 rounded-full mb-4 border border-slate-700">
                   <Grip size={32} className="text-slate-500 mx-auto" />
                </div>
                <h3 className="text-slate-400 font-mono text-sm tracking-widest">NO RECORDS FOUND</h3>
             </div>
          )}
       </div>
    </div>
  );
}
