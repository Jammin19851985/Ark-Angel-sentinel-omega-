import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalendarIcon, 
  PlusIcon, 
  Trash2Icon, 
  SearchIcon, 
  RefreshCwIcon, 
  Loader2Icon,
  ClockIcon,
  MapPinIcon,
  PlusCircleIcon,
  ChevronRightIcon
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface GoogleCalendarManagerProps {
  token: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export const GoogleCalendarManager: React.FC<GoogleCalendarManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  // Lists state & loaders
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Event Scheduler form states
  const [isScheduling, setIsScheduling] = useState(false);
  const [eventSummary, setEventSummary] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Destructive safety confirmation modal
  const [destructiveEvent, setDestructiveEvent] = useState<CalendarEvent | null>(null);
  const [isProcessingRemoval, setIsProcessingRemoval] = useState(false);

  // Sync / query calendar events
  const loadCalendarEvents = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Fetch upcoming events from active user calendar epoch bound
      const todayIso = new Date().toISOString();
      let url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${todayIso}&maxResults=20&orderBy=startTime&singleEvents=true`;
      
      if (searchQuery.trim() !== '') {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Google Calendar API list error: ${response.status}`);
      const data = await response.json();
      setEvents(data.items || []);
    } catch (err: any) {
      addLog('ERROR', `Google Calendar synchronization failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token, searchQuery, addLog]);

  useEffect(() => {
    loadCalendarEvents();
  }, [token, loadCalendarEvents]);

  // Schedule / Post calendar event
  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !eventSummary.trim() || !eventStart || !eventEnd) return;

    setIsSubmitting(true);
    try {
      const eventData = {
        summary: eventSummary,
        description: eventDesc,
        location: eventLocation,
        start: { dateTime: new Date(eventStart).toISOString() },
        end: { dateTime: new Date(eventEnd).toISOString() }
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);
      addLog('SYSTEM', `Scheduled calendar event: ${eventSummary} for ${new Date(eventStart).toLocaleString()}`);
      
      // Cleanup inputs
      setEventSummary('');
      setEventDesc('');
      setEventLocation('');
      setEventStart('');
      setEventEnd('');
      setIsScheduling(false);
      
      // Reload timeline
      loadCalendarEvents();
    } catch (err: any) {
      addLog('ERROR', `Failed to allocate chronological event node: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe Deletion request trigger
  const requestDeletion = (ev: CalendarEvent) => {
    setDestructiveEvent(ev);
  };

  // Perform absolute deletion
  const executeEventPurge = async () => {
    if (!destructiveEvent || !token) return;
    setIsProcessingRemoval(true);
    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${destructiveEvent.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`Delete status ${response.status}`);
      addLog('SYSTEM', `Sovereign event schedule node purged: ${destructiveEvent.summary}`);
      setDestructiveEvent(null);
      loadCalendarEvents();
    } catch (err: any) {
      addLog('ERROR', `Failed to clear event frame: ${err.message}`);
    } finally {
      setIsProcessingRemoval(false);
    }
  };

  // Helper date formatting
  const formatEventTime = (ev: CalendarEvent) => {
    const rawStart = ev.start?.dateTime || ev.start?.date;
    const rawEnd = ev.end?.dateTime || ev.end?.date;
    if (!rawStart) return '--';
    
    const startObj = new Date(rawStart);
    const dateStr = startObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    
    // Check if simple all-day event
    if (ev.start?.date) {
      return `${dateStr} (all day)`;
    }

    const timeStr = startObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    if (rawEnd) {
      const endObj = new Date(rawEnd);
      const endTimeStr = endObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      return `${dateStr} @ ${timeStr} - ${endTimeStr}`;
    }
    return `${dateStr} @ ${timeStr}`;
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 relative">
      
      {/* Left List Pane: Upcoming agenda */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#000000]/65 border border-slate-900 rounded p-3 font-mono">
        
        {/* Search header & configuration */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative flex items-center bg-[#050507] border border-slate-900 focus-within:border-cyan-500/60 rounded">
            <SearchIcon className="w-3 h-3 absolute left-2.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Query Chronicle Timeline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-xs text-slate-200 bg-transparent outline-none font-mono uppercase"
            />
          </div>
          <button 
            onClick={loadCalendarEvents}
            className="p-1 text-slate-400 hover:text-cyan-400 border border-slate-900 rounded bg-[#010102]"
            title="Refresh Timeline"
          >
            <RefreshCwIcon className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsScheduling(!isScheduling)}
            className={`p-1 flex items-center justify-center rounded border transition-colors ${isScheduling ? 'border-amber-500 text-amber-400 bg-amber-950/20' : 'border-slate-800 text-slate-400 hover:text-amber-400 bg-[#010102]'}`}
            title="Allocate Chronos Frame"
          >
            <PlusIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chronological Event agenda timeline */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-[10px] gap-2 font-mono">
              <Loader2Icon className="w-5 h-5 animate-spin text-amber-400" />
              <span>SYNCHRONIZING CHRONOS TIMELISTS...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-slate-600 text-[10px] uppercase border border-dashed border-slate-900/40 rounded">
              No Chronos timeline events found.
            </div>
          ) : (
            events.map((ev) => (
              <div 
                key={ev.id}
                className="flex items-start justify-between p-3 border border-slate-950/80 bg-[#050507]/40 rounded hover:border-slate-800 transition duration-150 group"
              >
                <div className="min-w-0 pr-1.5 flex-1 select-text">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11.5px] font-mono font-bold text-slate-200 uppercase tracking-wide">
                      {ev.summary}
                    </span>
                    {ev.htmlLink && (
                      <a 
                        href={ev.htmlLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-slate-650 hover:text-cyan-400 pointer-events-auto transition opacity-0 group-hover:opacity-100"
                        title="Open in Workspace"
                      >
                        <ClockIcon className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  
                  <span className="text-[10px] text-amber-400 font-bold font-mono block mt-1">
                    {formatEventTime(ev)}
                  </span>
                  
                  {ev.location && (
                    <span className="text-[9px] text-slate-500 mt-1 flex items-center gap-1 uppercase font-semibold">
                      <MapPinIcon className="w-2.5 h-2.5 text-slate-600" />
                      {ev.location}
                    </span>
                  )}
                  
                  {ev.description && (
                    <p className="text-[10px] font-sans text-slate-400 mt-1.5 py-1 border-t border-slate-900/40 leading-relaxed font-sans max-w-2xl select-text">
                      {ev.description}
                    </p>
                  )}
                </div>

                <button 
                  onClick={() => requestDeletion(ev)}
                  className="text-slate-700 hover:text-danger p-1 hover:border hover:border-danger/20 rounded cursor-pointer self-start"
                  title="Purge Scheduled Sequence"
                >
                  <Trash2Icon className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Content Pane: Scheduler Allocation Drawer */}
      {isScheduling && (
        <div className="w-full md:w-85 bg-[#030304]/90 border border-slate-900 rounded p-4 font-mono flex flex-col min-h-[300px] animate-fadeIn">
          <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase block mb-3 border-b border-slate-900 pb-1.5 flex items-center gap-1.5">
            <PlusCircleIcon className="w-3.5 h-3.5 animate-pulse" /> // ALLOCATE CHRONOS EVENT
          </span>
          <form onSubmit={handleScheduleEvent} className="flex-1 flex flex-col gap-3">
            <div>
              <label className="block text-[8px] text-slate-500 uppercase tracking-wider mb-1">EVENT SUMMARY TITLE</label>
              <input 
                type="text"
                placeholder="e.g., Quantum reality sync..."
                value={eventSummary}
                onChange={(e) => setEventSummary(e.target.value)}
                required
                className="w-full bg-black border border-slate-900 focus:border-amber-500 text-slate-200 text-xs px-2.5 py-1.5 rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-[8px] text-slate-500 uppercase tracking-wider mb-1">CHRONOLOGICAL STARTSTAMP</label>
              <input 
                type="datetime-local"
                value={eventStart}
                onChange={(e) => setEventStart(e.target.value)}
                required
                className="w-full bg-black border border-slate-900 focus:border-amber-500 text-slate-200 text-xs px-2.5 py-1.5 rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-[8px] text-slate-500 uppercase tracking-wider mb-1">CHRONOLOGICAL ENDSTAMP</label>
              <input 
                type="datetime-local"
                value={eventEnd}
                onChange={(e) => setEventEnd(e.target.value)}
                required
                className="w-full bg-black border border-slate-900 focus:border-amber-500 text-slate-200 text-xs px-2.5 py-1.5 rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-[8px] text-slate-500 uppercase tracking-wider mb-1">LOCATION CODE</label>
              <input 
                type="text"
                placeholder="e.g., Secure Terminal Lab..."
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full bg-black border border-slate-900 focus:border-amber-500 text-slate-200 text-xs px-2.5 py-1.5 rounded outline-none"
              />
            </div>

            <div className="flex-1">
              <label className="block text-[8px] text-slate-500 uppercase tracking-wider mb-1">EVENT STRATEGY MEMO</label>
              <textarea 
                placeholder="Operational procedures details..."
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                rows={3}
                className="w-full bg-black border border-slate-900 focus:border-amber-500 text-slate-350 text-xs p-2 rounded outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-1.5 text-[9px] mt-2">
              <button 
                type="button" 
                onClick={() => { setIsScheduling(false); }}
                className="px-2.5 py-1.5 border border-slate-800 hover:bg-slate-900 rounded text-slate-400 uppercase font-bold"
              >
                Abort
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-3.5 py-1.5 bg-amber-900/40 border border-amber-500 hover:bg-amber-800/50 text-amber-300 rounded uppercase font-bold flex items-center justify-center gap-1.5"
              >
                {isSubmitting && <Loader2Icon className="w-3 h-3 animate-spin" />}
                Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Safety Destructive Dialog */}
      {destructiveEvent && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[999]">
          <div className="max-w-md w-full bg-slate-950 border border-amber-500/40 rounded-lg p-5 shadow-[0_0_30px_rgba(245,158,11,0.15)] font-mono flex flex-col gap-4 relative">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-950/20 rounded border border-amber-500/40 text-amber-500 flex items-center justify-center">
                <Trash2Icon className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-500 tracking-wider">CHRONOLOGICAL CANCELLATION SENTINEL</h4>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">Confirm that you wish to delete the following event element?</p>
              </div>
            </div>

            <div className="bg-[#0a0806] border border-amber-950 rounded p-3 text-slate-300 text-xs">
              <span className="text-[9px] text-slate-500 uppercase">IDENTIFIED EVENT COMPLIMENT:</span>
              <div className="font-bold text-slate-200 mt-0.5">{destructiveEvent.summary}</div>
              <div className="text-[10px] text-amber-400 mt-1 font-bold">{formatEventTime(destructiveEvent)}</div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button 
                onClick={() => setDestructiveEvent(null)}
                disabled={isProcessingRemoval}
                className="px-3.5 py-1.5 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded hover:text-white transition uppercase font-bold"
              >
                Abort
              </button>
              <button 
                onClick={executeEventPurge}
                disabled={isProcessingRemoval}
                className="px-4 py-1.5 bg-[#4c1e05] border border-amber-500 hover:bg-[#833813] text-amber-100 rounded transition flex items-center gap-1.5 uppercase font-bold"
              >
                {isProcessingRemoval ? (
                  <div className="w-3 h-3 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                ) : null}
                <span>Purge Schedule Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
