import React, { useState } from 'react';
import { 
  VideoIcon, 
  PlusIcon, 
  ExternalLinkIcon, 
  CopyIcon, 
  CheckIcon, 
  Loader2Icon,
  ClockIcon,
  ShieldCheckIcon,
  CalendarIcon
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface GoogleMeetManagerProps {
  token: string | null;
}

interface MeetSpaceInstance {
  name: string; // "spaces/abc-defg-hij"
  meetingUri: string; // "https://meet.google.com/abc-defg-hij"
  meetingCode: string; // "abc-defg-hij"
  config?: {
    accessType?: string;
  };
}

export const GoogleMeetManager: React.FC<GoogleMeetManagerProps> = ({ token }) => {
  const { addLog } = useAppContext();
  
  const [meetingSpaces, setMeetingSpaces] = useState<MeetSpaceInstance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Custom configurations
  const [meetAccessType, setMeetAccessType] = useState<'OPEN' | 'TRUSTED' | 'RESTRICTED'>('OPEN');

  const createMeetingSpace = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Endpoint: POST https://meet.googleapis.com/v2/spaces
      const response = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config: {
            accessType: meetAccessType
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Google Meet API failed with status code ${response.status}`);
      }

      const rawData = await response.json();
      
      const newSpace: MeetSpaceInstance = {
        name: rawData.name || 'spaces/unknown',
        meetingUri: rawData.meetingUri || `https://meet.google.com/${rawData.meetingCode}`,
        meetingCode: rawData.meetingCode || rawData.name?.replace('spaces/', '') || 'unknown',
        config: rawData.config
      };

      setMeetingSpaces(prev => [newSpace, ...prev]);
      addLog('SYSTEM', `Generated Google Meet Meeting Room. Space Code: ${newSpace.meetingCode}`);
    } catch (err: any) {
      console.error('[G_MEET] Creation failed:', err);
      addLog('ERROR', `Google Meet workspace session generation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    addLog('SYSTEM', `Copied meeting coordinate string to clipboard: ${code}`);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 animate-fadeIn font-mono">
      
      {/* Left Column: Creator panel */}
      <div className="flex-1 bg-[#010103]/65 border border-slate-900 rounded p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 border-b border-slate-900 pb-2">
          <VideoIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">// CONTEXT CONSTRUCT</span>
        </div>

        <p className="text-[11px] text-slate-500 font-sans leading-relaxed uppercase tracking-wider">
          Provision direct, high-fidelity secure video relays on Google's global conference backbone. Create meeting links with access constraints and coordinate visual calls instantly.
        </p>

        {/* Configurations block */}
        <div className="bg-[#040406]/65 border border-slate-950 p-3 rounded-lg flex flex-col gap-3">
          <span className="text-[9px] text-cyan-400 uppercase tracking-widest font-bold">// ACCESS CONFIG</span>
          
          <div className="space-y-2">
            <label className="text-[9px] text-slate-400 font-mono block uppercase">Access Restriction Level:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['OPEN', 'TRUSTED', 'RESTRICTED'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setMeetAccessType(lvl)}
                  style={{ cursor: 'pointer' }}
                  className={`px-2.5 py-2.5 text-[9px] rounded uppercase font-bold tracking-wider border transition-all duration-120 ${meetAccessType === lvl ? 'bg-cyan-950/20 border-cyan-500 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]' : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-slate-300'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-600 uppercase font-sans mt-1">
              {meetAccessType === 'OPEN' && 'Anyone with the meeting code can join without requesting consent.'}
              {meetAccessType === 'TRUSTED' && 'Only organizers and users in the same enterprise workspace domains pass automatically.'}
              {meetAccessType === 'RESTRICTED' && 'Only explicitly invited attendees or internal security nodes can access.'}
            </p>
          </div>
        </div>

        {/* Generate Trigger Button */}
        <button
          onClick={createMeetingSpace}
          disabled={isLoading || !token}
          style={{ cursor: 'pointer' }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-950/20 hover:bg-cyan-900/45 border border-cyan-500/40 hover:border-cyan-500 text-cyan-300 text-xs tracking-widest font-bold uppercase rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <Loader2Icon className="w-4 h-4 animate-spin" />
              <span>PROVISIONING SPACE RELAY...</span>
            </>
          ) : (
            <>
              <PlusIcon className="w-4 h-4" />
              <span>PROVISION GOOGLE MEET RELAY</span>
            </>
          )}
        </button>
      </div>

      {/* Right Column: History panel of generated meets */}
      <div className="w-full md:w-80 bg-[#000000]/65 border border-slate-900 rounded p-4 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>ACTIVE GENERATED REFRESHES</span>
          </span>
          <span className="text-[8px] bg-cyan-950/20 border border-cyan-500/30 px-1.5 py-0.5 rounded text-cyan-400 font-bold">
            {meetingSpaces.length}
          </span>
        </div>

        {/* History records list scroll view */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
          {meetingSpaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-900 rounded-lg text-slate-650 h-full">
              <VideoIcon className="w-6 h-6 opacity-10 mb-1" />
              <span className="text-[9px] uppercase tracking-wide">Relay logs are currently clear.</span>
            </div>
          ) : (
            meetingSpaces.map((space) => (
              <div 
                key={space.meetingCode} 
                className="p-3 bg-[#050508] border border-slate-900 rounded-lg flex flex-col gap-2 relative animate-fadeIn group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 select-all tracking-wide">{space.meetingCode}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(space.meetingUri, space.meetingCode)}
                      style={{ cursor: 'pointer' }}
                      className="p-1 text-slate-500 hover:text-cyan-400 rounded transition-colors"
                      title="Copy join URL"
                    >
                      {copiedCode === space.meetingCode ? (
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <CopyIcon className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={space.meetingUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-500 hover:text-cyan-400 rounded transition-colors"
                      title="Launch meeting relay"
                    >
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[8px] text-slate-500 uppercase">
                  <ShieldCheckIcon className="w-3 h-3 text-cyan-500" />
                  <span>Config: {space.config?.accessType || 'OPEN'} Access</span>
                </div>

                {/* Simulated telemetry fields to mimic actual server state logs */}
                <div className="h-[1px] bg-slate-950 my-1" />
                <div className="flex justify-between items-center text-[7px] text-slate-600 font-mono uppercase">
                  <span className="flex items-center gap-1"><CalendarIcon className="w-2.5 h-2.5" /> Launch Spot:</span>
                  <span className="truncate max-w-[120px] select-all font-bold">{space.meetingUri}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
