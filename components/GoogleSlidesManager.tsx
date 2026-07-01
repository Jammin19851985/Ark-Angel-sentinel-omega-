import React, { useState, useEffect, useCallback } from 'react';
import { 
  PresentationIcon, 
  PlusIcon, 
  SearchIcon, 
  RefreshCwIcon, 
  ExternalLinkIcon,
  Loader2Icon,
  BookOpenIcon,
  LayoutGridIcon,
  VideoIcon,
  TvIcon
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface GoogleSlidesManagerProps {
  token: string;
}

interface SlideFile {
  id: string;
  name: string;
  createdTime?: string;
  webViewLink?: string;
}

interface SlideItemDetail {
  objectId: string;
  pageType: string;
  revisionId?: string;
}

export const GoogleSlidesManager: React.FC<GoogleSlidesManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  // Lists & loader
  const [presentations, setPresentations] = useState<SlideFile[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected presentation detail states
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [slides, setSlides] = useState<SlideItemDetail[]>([]);
  const [isLoadingDeck, setIsLoadingDeck] = useState(false);

  // Creator state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // List presentations files from Drive API using query fields
  const listPresentations = useCallback(async () => {
    if (!token) return;
    setIsLoadingList(true);
    try {
      let query = `mimeType = 'application/vnd.google-apps.presentation' and trashed = false`;
      if (searchQuery.trim() !== '') {
        query += ` and name contains '${searchQuery.replace(/'/g, "\\'")}'`;
      }
      
      const fields = 'files(id, name, createdTime, webViewLink)';
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=20&orderBy=createdTime%20desc`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error(`List presentation returned ${response.status}`);
      const data = await response.json();
      setPresentations(data.files || []);
    } catch (err: any) {
      console.error('[G_SLIDES] List failed:', err);
      addLog('ERROR', `Google Slides deck synchronization failed: ${err.message}`);
    } finally {
      setIsLoadingList(false);
    }
  }, [token, searchQuery, addLog]);

  useEffect(() => {
    listPresentations();
  }, [token, listPresentations]);

  // Read presentation details, slide count, structural object ID lists
  const fetchPresentationDetails = async (id: string, name: string) => {
    setSelectedId(id);
    setSelectedTitle(name);
    setSlides([]);
    setIsLoadingDeck(true);

    try {
      const response = await fetch(`https://slides.googleapis.com/v1/presentations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Fetch slides status returned: ${response.status}`);
      const data = await response.json();
      setSlides(data.slides || []);
      addLog('SYSTEM', `Analyzed structural slide layers for slide deck: ${name}`);
    } catch (err: any) {
      addLog('ERROR', `Slides structure parser issue: ${err.message}`);
    } finally {
      setIsLoadingDeck(false);
    }
  };

  // Create presentation
  const handleCreatePresentation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !token) return;

    setIsSubmitting(true);
    try {
      const createResponse = await fetch('https://slides.googleapis.com/v1/presentations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
      });

      if (!createResponse.ok) throw new Error(`Docs Creation status: ${createResponse.status}`);
      const newDeckObj = await createResponse.json();

      addLog('SYSTEM', `Structured presentations slide deck: ${newTitle} [ID: ${newDeckObj.presentationId}]`);
      setNewTitle('');
      setIsCreating(false);
      listPresentations();

      // Auto load details of newly created slide decks
      fetchPresentationDetails(newDeckObj.presentationId, newTitle);
    } catch (err: any) {
      addLog('ERROR', `Slides deck construction aborted: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
      
      {/* Left List Pane: Slide deck documents */}
      <div className="w-full md:w-80 flex flex-col min-h-0 bg-black/40 border border-slate-900 rounded p-3 font-mono">
        
        {/* Search header & tools */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative flex items-center bg-[#050507] border border-slate-900 focus-within:border-cyan-500/60 rounded">
            <SearchIcon className="w-3 h-3 absolute left-2.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Find Slide Deck..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-xs text-slate-200 bg-transparent outline-none font-mono uppercase"
            />
          </div>
          <button 
            onClick={listPresentations}
            className="p-1 text-slate-400 hover:text-cyan-400 border border-slate-900 rounded bg-[#010102]"
            title="Refresh List"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            className={`p-1 flex items-center justify-center rounded border transition-colors ${isCreating ? 'border-orange-500 text-orange-400 bg-orange-950/20' : 'border-slate-800 text-slate-400 hover:text-orange-400 bg-[#010102]'}`}
            title="Create Slide Deck"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Create Slide Deck Form Inline */}
        {isCreating && (
          <form onSubmit={handleCreatePresentation} className="mb-3 bg-[#1e0e05]/30 border border-orange-500/35 p-2.5 rounded font-mono flex flex-col gap-2 animate-fadeIn">
            <span className="text-[9px] text-orange-400 font-bold tracking-wider uppercase flex items-center gap-1">
              <PlusIcon className="w-3 h-3" /> // STRUCTURE PRESENTATION
            </span>
            <input 
              type="text"
              placeholder="PRESENTATION TITLE..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="bg-black border border-slate-900 text-slate-200 text-xs px-2 py-1.5 rounded outline-none focus:border-orange-500 font-mono uppercase"
            />
            <div className="flex justify-end gap-1.5 text-[9px] mt-1">
              <button 
                type="button" 
                onClick={() => { setIsCreating(false); setNewTitle(''); }}
                className="px-2 py-1 border border-slate-800 hover:bg-slate-900 rounded text-slate-400 uppercase font-bold"
              >
                Abort
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-3 py-1 bg-orange-900/40 border border-orange-500 hover:bg-orange-850/50 text-orange-300 rounded uppercase font-bold flex items-center gap-1"
              >
                {isSubmitting && <Loader2Icon className="w-2.5 h-2.5 animate-spin" />}
                Publish
              </button>
            </div>
          </form>
        )}

        {/* Existing slide decks collection */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-[10px] gap-2 font-mono">
              <Loader2Icon className="w-5 h-5 animate-spin text-orange-400" />
              <span>SYNCING SCHED PRESENTATION BLOCKS...</span>
            </div>
          ) : presentations.length === 0 ? (
            <div className="text-center py-6 text-slate-600 text-[9px] uppercase font-mono">
              No Presentations found.
            </div>
          ) : (
            presentations.map((deck) => (
              <button
                key={deck.id}
                onClick={() => fetchPresentationDetails(deck.id, deck.name)}
                className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 border rounded transition-all ${selectedId === deck.id ? 'border-orange-500 bg-orange-950/15' : 'border-slate-900 hover:border-slate-800 bg-[#050507]/40'}`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-1.5">
                  <PresentationIcon className={`w-3.5 h-3.5 flex-shrink-0 ${selectedId === deck.id ? 'text-orange-400' : 'text-slate-500'}`} />
                  <span className={`text-[11px] font-mono uppercase truncate ${selectedId === deck.id ? 'text-orange-400 font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {deck.name}
                  </span>
                </div>
                <BookOpenIcon className={`w-3 h-3 text-orange-500/80 ${selectedId === deck.id ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Content Sheet: Slides layout and deck details visualizer */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#000000]/65 border border-slate-900 rounded p-4 font-mono">
        {selectedId ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header section & Open in Workspace option */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-900 mb-3.5">
              <div className="flex items-center gap-2">
                <PresentationIcon className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-slate-200 uppercase tracking-widest">{selectedTitle}</span>
              </div>
              
              {presentations.find(p => p.id === selectedId)?.webViewLink && (
                <a 
                  href={presentations.find(p => p.id === selectedId)?.webViewLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[9px] font-bold text-orange-400 hover:text-orange-300 uppercase bg-orange-950/10 px-2 py-1 rounded border border-orange-800/40"
                >
                  <span>Open presentation</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Slides visual representation grids */}
            <div className="flex-1 overflow-y-auto bg-black/45 border border-slate-900 p-4 rounded custom-scrollbar">
              {isLoadingDeck ? (
                <div className="flex h-full flex-col items-center justify-center gap-2.5 text-slate-500 text-[10px]">
                  <Loader2Icon className="w-5 h-5 animate-spin text-orange-400" />
                  <span>DECODING VECTOR SLIDE OBJECT BLOCKS...</span>
                </div>
              ) : slides.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-600 text-[10px] uppercase text-center p-8 border border-dashed border-slate-900 rounded">
                  Blank Presentation slide count or structure. Open slide deck to configure elements.
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block mb-1">PRESENTATION LAYOUT SLIDES ({slides.length})</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {slides.map((slide, slotIdx) => (
                      <div 
                        key={slide.objectId}
                        className="border border-slate-900 hover:border-orange-500/50 rounded bg-[#010101] shadow flex flex-col min-h-[120px] justify-between p-3 select-text"
                      >
                        <div className="flex justify-between items-start text-[9px] text-slate-600 font-bold uppercase select-none">
                          <span>PAGE #{slotIdx + 1}</span>
                          <LayoutGridIcon className="w-3.5 h-3.5 text-slate-700" />
                        </div>
                        
                        <div className="flex flex-col items-center justify-center flex-1 py-3 text-center">
                          <TvIcon className="w-6 h-6 text-orange-500/20 mb-1" />
                          <span className="text-[9px] text-slate-400 font-bold uppercase border-t border-slate-950 mt-1 pt-1 break-all w-full select-all">
                            {slide.objectId}
                          </span>
                        </div>

                        <div className="text-[8px] text-slate-500 uppercase tracking-widest text-right mt-1.5 font-bold select-none">
                          {slide.pageType || 'SLIDE'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 p-8">
            <PresentationIcon className="w-12 h-12 text-slate-900 mb-2 animate-pulse" />
            <span className="text-[10px] tracking-widest font-mono uppercase">Select a slide presentation deck to visualize vector layouts.</span>
          </div>
        )}
      </div>

    </div>
  );
};
